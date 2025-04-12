import logger from '../../utils/logger';
import { WorkflowStateManager } from '../../services/workflow-state-manager';
import { Workflow, HTTPNode } from '../../models/workflow';
import { executeHttpNode } from './http-node-runner';

// Execute nodes
export const executor = async (workflow: Workflow, nodeId: string, workflowStateManager: WorkflowStateManager): Promise<void> => {
    try {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (!node) {           
            throw new Error(`Node ${node} not found in workflow ${workflow.id}`); 
        }

        logger.info(`Executing Node: ID:${node.id}, Name:${node.name}`);       

        if (node.type === 'http') {              
            await workflowStateManager.updateNodeStatus(node.id, 'http', 'in_progress', 0);                 
            await executeHttpNode(workflow, node as HTTPNode, workflowStateManager);
        }

        // Process next nodes sequentially, 
        // it doesn't handle parallel execution for now
        for (const nextNodeId of node.wires) {
            await executor(workflow, nextNodeId, workflowStateManager);
        }        
    } catch (error) {       
        throw error;
    }    
};