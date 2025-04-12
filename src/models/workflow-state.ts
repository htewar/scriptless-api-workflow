import { NodeTypeString } from "./workflow";

// export interface NodeState { 
//     data: any;
//     statusCode?: number;  
// }

export type NodeProgressStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed";

export interface NodeProgress {
  type: NodeTypeString;
  status: NodeProgressStatus;
  progressPercentage?: number;
  errorMessage?: any;
}

export interface WorkflowState {
    state?: {
        [nodeId: string]: {
          data?: any;
        },
        };
      customVars?: Record<string, any>;
}

