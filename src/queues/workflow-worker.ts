import { workflowQueue} from '../queues/task-queue';
import { Job } from 'bull';
import logger from '../utils/logger';
import axios from 'axios';
import { WorkflowStateManager } from '../services/workflow-manager';
import { validateAssertions } from '../services/assertions-service';
import { Workflow, HTTPNode, Node, StartNode } from '../models/workflow';


// Define JobData structure
interface JobData {
    workflow: Workflow;
}

// find the "start" node
const findStartNode = (nodes: Node[]): StartNode | undefined => {
    return nodes.find(node => node.type === 'start') as StartNode;
};

// Execute a node
const executeNode = async (workflow: Workflow, nodeId: string, workflowStateManager: WorkflowStateManager): Promise<void> => {
    try {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (!node) {           
            throw new Error(`Node ${node} not found in workflow ${workflow.id}`); 
        }

        logger.info(`Executing Node: ID:${node.id}, Name:${node.name}`);       

        if (node.type === 'http') {
            const httpNode = node as HTTPNode;   
            await workflowStateManager.updateNodeStatus(node.id, 'http', 'in_progress', 0);                 
            await executeHttpNode(workflow, httpNode, workflowStateManager);
        }

        // Process next nodes sequentially, 
        // it doesn't handle parallel execution for now
        for (const nextNodeId of node.wires) {
            await executeNode(workflow, nextNodeId, workflowStateManager);
        }        
    } catch (error) {       
        throw error;
    }    
};

// Function to execute an HTTP node
const executeHttpNode = async (workflow: Workflow, node: HTTPNode, workflowStateManager: WorkflowStateManager) => {
    try {
        // Ensure safe default values for headers, queryParams, and payload
        const headers = node.headers ?? {}; 
        const queryParams = node.queryParams ?? {}; 
        const payload = node.payload ?? {};      
        
        // Only resolve placeholders if they exist
        const resolvedUrl = containsPlaceholder(node.url) ? resolvePlaceholders(node.url, workflowStateManager) : node.url;
        const resolvedHeaders = containsPlaceholderObject(headers) ? resolvePlaceholders(headers ?? {}, workflowStateManager) : headers;
        const resolvedQueryParams = containsPlaceholderObject(queryParams) ? resolvePlaceholders(queryParams ?? {}, workflowStateManager) : queryParams;
        const resolvedPayload = containsPlaceholderObject(payload) ? resolvePlaceholders(payload ?? {}, workflowStateManager) : payload;
        
        logger.info(`Executing HTTP Node: ID:${node.id}, Name:${node.name}, URL: ${resolvedUrl}`);
       
        // Update node progress after resolving placeholders
        await workflowStateManager.updateNodeStatus(node.id, node.type, 'in_progress', 25);        

        // Make the HTTP request
        const response = await axios({
            method: node.method,
            url: resolvedUrl,
            headers: resolvedHeaders,
            params: resolvedQueryParams,
            data: resolvedPayload
        });
       
         // Update node progress afer making request
         await workflowStateManager.updateNodeStatus(node.id, node.type, 'in_progress', 50);         

         // Validate assertions
         if (!validateAssertions(response, node.assertions)) {
            throw new Error(`Assertion failed for node: ID:${node.id}, Name:${node.name}`);
        }

         // Update node progress after assertion
         await workflowStateManager.updateNodeStatus(node.id, node.type, 'in_progress', 75);       

         // Save response in state
         await workflowStateManager.setNodeState(node.id, { response: response.data , statusCode: response.status});        

        // Store custom variables in the state
        if (node.state?.customVariables) {
            for (const customKey of Object.keys(node.state.customVariables)) {
                const valuePath = node.state.customVariables[customKey]; // e.g., response.data.userId
                const resolvedValue = resolvePlaceholders(valuePath, workflowStateManager); // Resolve from response
                await workflowStateManager.setCustomVar(customKey, resolvedValue);
            }            
        }
        // Update node progress to completed
        await workflowStateManager.updateNodeStatus(node.id, node.type, 'completed', 100);        
        logger.info(`HTTP Node Execution Success: ID:${node.id},  Name:${node.name}, Response: ${JSON.stringify(response.data)}`);        
        return response.data;
    } catch (error) {       
        await workflowStateManager.updateNodeStatus(node.id, node.type, 'failed', undefined, error);
        throw error;
    }
};

// Function to resolve state variables in node properties e.g-> $state.http_1.response.data
const resolvePlaceholders = (data: any, workflowState: WorkflowStateManager): any => {
    if (typeof data === 'string' && data.startsWith('$state.')) {
        // Extract keys (e.g., ['http_1', 'response', 'data'])
        const keys = data.replace('$state.', '').split('.'); 

        // Start from the root state object
        let resolvedValue: any = workflowState.getState();
        for (const key of keys) {
            resolvedValue = resolvedValue?.[key];
            if (resolvedValue === undefined) return null;
        }
        return resolvedValue;
    }
    if (typeof data === 'object') {
        for (const key in data) {
            data[key] = resolvePlaceholders(data[key], workflowState);
        }
    }
    return data;
};

// Check if a string contains a placeholder ($state.)
const containsPlaceholder = (value: string): boolean => {
    return typeof value === "string" && value.includes("$state.");
};

// Check if an object has any placeholders in its values
const containsPlaceholderObject = (obj: Record<string, any>): boolean => {
    return Object.values(obj).some(value => containsPlaceholder(value));
};

// WorkflowQueue process function
export const startWorker = () => {
    workflowQueue.process(async (job: Job<JobData>) => {   
        try {
            if (!job.data || !job.data.workflow) {
                throw new Error(`Invalid job data received. Expected a workflow but got: ${JSON.stringify(job.data)}`);
            }

            logger.info(`Processing Workflow: ${job.data.workflow.name}`);

            // Initialize Workflow State Manager for this job
            const workflowStateManager = new WorkflowStateManager(job.id.toString());
            // await wait(10000); // Simulate some processing time
           
            const workflow = job.data.workflow;

            // Workflow logic...            
            // Find the start node
            const startNode = findStartNode(workflow.nodes);
            if (!startNode) {
                throw new Error(`No start node found in workflow ${workflow.id}`);
            }

            // Retrieve existing state from Redis or initialize a new one
            await workflowStateManager.loadState();           

            // Start execution 
            await executeNode(workflow, startNode.id, workflowStateManager);
            return;
        } catch (error) {  
             logger.error(`Workflow execution failed: WorkflowID:${job.data.workflow.id}, WorkflowName:${job.data.workflow.name}, Error: ${error}`)
             throw error;             
         }
    })
};
