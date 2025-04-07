import { NodeTypeString } from './workflow';

export interface NodeState {
    response?: {
        data: any;
        statusCode?: number;
    };
}

export type NodeProgressStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface NodeStatus {    
    type: NodeTypeString;
    status: NodeProgressStatus;
    progressPercentage?: number; //optional     
    errorMessage: any;
}

export interface WorkflowState {
    nodesState: Record<string, NodeState>;
    customVars: Record<string, any>;     
}



