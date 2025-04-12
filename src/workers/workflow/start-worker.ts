import { workflowQueue} from '../../queues/task-queue';
import { Job } from 'bull';
import logger from '../../utils/logger';
import { Workflow, Node, StartNode } from '../../models/workflow';
import { WorkflowStateManager } from '../../services/workflow-state-manager';
import { executor } from './executor';

// Define JobData structure
interface JobData {
    workflow: Workflow;
}

// find the "start" node
const findStartNode = (nodes: Node[]): StartNode | undefined => {
    return nodes.find(node => node.type === 'start') as StartNode;
};

// WorkflowQueue process function
export const startWorkflowWorker = () => {
    workflowQueue.process(async (job: Job<JobData>) => {   
        try {
            if (!job.data || !job.data.workflow) {
                throw new Error(`Invalid job data received. Expected a workflow but got: ${JSON.stringify(job.data)}`);
            }

            logger.info(`Processing Workflow: ${job.data.workflow.name}`);

            // Initialize Workflow State Manager for this job
            const workflowStateManager = new WorkflowStateManager(job.id.toString());            
           
            const workflow = job.data.workflow;

            // Workflow execution logic...            
            // Find the start node
            const startNode = findStartNode(workflow.nodes);
            if (!startNode) {
                throw new Error(`No start node found in workflow ${workflow.id}`);
            }

            // Retrieve existing state from Redis or initialize a new one
            await workflowStateManager.loadState();           

            // Start execution 
            await executor(workflow, startNode.id, workflowStateManager);
            return;
        } catch (error) {  
             logger.error(`Workflow execution failed: WorkflowID:${job.data.workflow.id}, WorkflowName:${job.data.workflow.name}, Error: ${error}`)
             throw error;             
         }
    })
};