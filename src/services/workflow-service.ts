import { Workflow, NodeType } from '../models/workflow';
import workflows from '../store/data-store';

// validate NodeType
const isValidNode = (node: NodeType): boolean => {
    return ['start', 'http', 'function'].includes(node.type);
}

// create new Workflow
export const createWorkflow = (workflowData: Workflow): Workflow => {
    const {id, name, nodes} = workflowData;

    if(!id || !name || !nodes || !Array.isArray(nodes) || nodes.length < 2) {
        throw new Error("Invalid workflow structure");
    }

    if (!nodes.every(isValidNode)) {
        throw new Error("Invalid node types in worklfow ");
    }

    workflows.set(id, workflowData);
    return workflowData;
}

// Retrieve a Workflow by ID
export const getWorkflow = (id: string): Workflow => {
    const workflow = workflows.get(id);

    if (!workflow) {
        throw new Error("Workflow not found");
    }
    return workflow;
}

// update an existing Worflow
export const updateWorkflow = (id: string, updateWorkflowData: Workflow): Workflow => {
    if (!workflows.has(id)) {
        throw new Error("Workflow not found");
    }

    if (!updateWorkflowData.nodes.every(isValidNode)) {
        throw new Error("Invalid node types in workflow");
    }

    workflows.set(id, updateWorkflowData);

    return updateWorkflowData;
}

// delete a Workflow
export const deleteWorkflow = (id: string) => {
    if (!workflows.has(id)) {
        throw new Error("Workflow not found");
    }

    workflows.delete(id);
}