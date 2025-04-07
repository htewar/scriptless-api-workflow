import { WorkflowState, NodeState, NodeStatus, NodeProgressStatus } from '../models/workflow-state';
import { redisClient } from '../config/config';
import { NodeTypeString } from '../models/workflow';
import { io } from '../server';
import { emitNodeProgress } from '../sockets/socket-handler';


// This class manages the state of the workflow, including node states and custom variables
// It provides methods to get and set the state of individual nodes and custom variables
// It also provides a method to get the entire state of the workflow

export class WorkflowStateManager {
    private workflowState: WorkflowState;
    private jobId: string;    

    constructor(jobId: string) {
        this.jobId = jobId;
        this.workflowState = { nodesState: {}, customVars: {} };
    }

    // Load state from Redis
    async loadState(): Promise<void> {
        const stateJson = await redisClient.get(`job:${this.jobId}:workflowState`);
        if (stateJson) {
            this.workflowState = JSON.parse(stateJson);
        }
    }

    // Save state to Redis
    async saveState(): Promise<void> {
        await redisClient.set(`job:${this.jobId}:workflowState`, JSON.stringify(this.workflowState));
    }   

    // Get state for a specific node
    getNodeState(nodeId: string): NodeState {
        return this.workflowState.nodesState[nodeId] || {};
    }

    // Set state for a specific node
    async setNodeState(nodeId: string, response: any): Promise<void> {
        this.workflowState.nodesState[nodeId] = { response };
        await this.saveState();
    }

    // Set custom variable
    async setCustomVar(key: string, value: any): Promise<void> {
        this.workflowState.customVars[key] = value;
        await this.saveState();
    }

    // Get custom variables
    getCustomVar(key: string): any {
        return this.workflowState.customVars[key];
    }    

    // Get entire state
    getState(): WorkflowState {
        return this.workflowState;
    }

    // async updateNodeProgress(id: string, type: NodeTypeString, status: NodeProgressStatus, percentage?: number): Promise<void> { 
    //     this.workflowState.nodesProgress[id] = { type, status, percentage };
    //     await this.saveState();       
    // }

    // getAllProgress(): Record<string, NodeProgress> {
    //     return this.workflowState.nodesProgress;
    // }
    async updateNodeStatus(id: string, type: NodeTypeString, status: NodeProgressStatus, progressPercentage?: number, errorMessage?: any): Promise<void> { 
        const nodeStatus: NodeStatus = { type, status, progressPercentage, errorMessage };    
        await redisClient.hSet(`job:${this.jobId}:nodesStatus`, id, JSON.stringify(nodeStatus));  
        
        const nodeState = this.getNodeState(id);
        
        // emi
        emitNodeProgress(this.jobId, {
            nodeId: id,
            type, 
            status, 
            progressPercentage: progressPercentage || 0, 
            response: nodeState?.response || null,
            errorMessage: errorMessage || null,
        }            
        );
    }

    async getAllNodeStatus(): Promise<Record<string, NodeStatus>> {
        const raw = await redisClient.hGetAll(`job:${this.jobId}:nodesStatus`);
        const parsed: Record<string, NodeStatus> = {};

        for (const [ nodeId, nodeStatus] of Object.entries(raw)) {
            parsed[nodeId] = JSON.parse(nodeStatus);
        }
        return parsed;
    };
}
