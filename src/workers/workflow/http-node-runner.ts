import logger from '../../utils/logger';
import axios from 'axios';
import { WorkflowStateManager } from '../../services/workflow-state-manager';
import { validateAssertions } from '../../services/assertions-service';
import { Workflow, HTTPNode } from '../../models/workflow';
import { resolvePlaceholders, containsPlaceholderObject } from '../../services/placeholder-resolver';
import { buildAxiosRequestConfig } from '../../utils/http-request-builder';
import { storeCustomVariables } from '../../services/custom-variable-service';  



// Function to execute an HTTP node
export const executeHttpNode = async (workflow: Workflow, node: HTTPNode, workflowStateManager: WorkflowStateManager) => {
    try {
        // Ensure safe default values for headers, queryParams, and payload
        const headers = node.headers ?? {}; 
        const queryParams = node.queryParams ?? {}; 
        const payload = node.body?.payload ?? {};        
        
        // Only resolve placeholders if they exist
        //const resolvedUrl = containsPlaceholder(node.url) ? await resolvePlaceholders(node.url, workflowStateManager) : node.url;    
        const resolvedUrl = containsPlaceholderObject(node.url) ? (logger.info("Resolving URL with placeholder..."), await resolvePlaceholders(node.url, workflowStateManager)) : node.url;

        const resolvedHeaders = containsPlaceholderObject(headers) ? await resolvePlaceholders(headers ?? {}, workflowStateManager) : headers;
        const resolvedQueryParams = containsPlaceholderObject(queryParams) ? await resolvePlaceholders(queryParams ?? {}, workflowStateManager) : queryParams;
        const resolvedPayload = containsPlaceholderObject(payload) ? await resolvePlaceholders(payload ?? {}, workflowStateManager) : payload;
        
        // Update node progress after resolving placeholders
        await workflowStateManager.updateNodeStatus(node.id, node.type, 'in_progress', 25);        

        const axiosConfig = await buildAxiosRequestConfig(
            node,
            resolvedUrl,
            resolvedHeaders,
            resolvedQueryParams,
            resolvedPayload
          );          

         logger.info(`Axios Config: ${JSON.stringify(axiosConfig)}`); 
        // Make the external api request
        const response = await axios(axiosConfig);        
       
         // Update node progress afer making request
         await workflowStateManager.updateNodeStatus(node.id, node.type, 'in_progress', 50);         

         // Validate assertions
         validateAssertions(response, node.assertions)           

         // Update node progress after assertion
         await workflowStateManager.updateNodeStatus(node.id, node.type, 'in_progress', 75);       

         // Save response in state
         await workflowStateManager.setNodeState(node.id, { data: response.data , statusCode: response.status});     

        // Store custom variables in the state
        if (node.state?.customVars) {
            logger.info(`Storing custom variables: ${JSON.stringify(node.state.customVars)}`);
            await storeCustomVariables(node.state.customVars, workflowStateManager);  
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