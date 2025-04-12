import { WorkflowState, NodeProgress, NodeProgressStatus } from '../models/workflow-state';
import { redisClient } from '../config/config';
import { NodeTypeString } from '../models/workflow';
import { emitNodeProgress } from '../sockets/socket-handler';
import logger from '../utils/logger';


// This class manages the state of the workflow, including node states and custom variables
// It provides methods to get and set the state of individual nodes and custom variables
// It also provides a method to get the entire state of the workflow

export class WorkflowStateManager {
    private workflowState: WorkflowState;
    private jobId: string;     

    constructor(jobId: string) {
        this.jobId = jobId;
        this.workflowState = { state: {} };
    }

    // Load state from Redis
    async loadState(): Promise<void> {
        const stateJson = await redisClient.get(`job:${this.jobId}:workflowState`);
        if (stateJson) {
            logger.info(`[WorkflowStateManager] Loading state from Redis for jobId: ${this.jobId}`);
            this.workflowState = JSON.parse(stateJson);
        } 
    }

    // Save state to Redis
    async saveState(): Promise<void> {
        try {            
            await redisClient.set(`job:${this.jobId}:workflowState`, JSON.stringify(this.workflowState));
            logger.info(`[WorkflowStateManager] Saving state to Redis for jobId: ${this.jobId}`);            
        } catch(error) {
            logger.error(`[WorkflowStateManager] Error saving state to Redis for jobId: ${this.jobId}`, error);
        }        
    }   

    // Get state for a specific node
    getNodeState(nodeId: string): any {
        return this.workflowState.state?.[nodeId] ?? {};
    }

    // Set state for a specific node
    async setNodeState(nodeId: string, response: any): Promise<void> {
        this.workflowState.state = this.workflowState.state || {};
        this.workflowState.state[nodeId] = { data: response.data };        
        await this.saveState();
    }

    // Set custom variable under workflow state
    async setCustomVar(key: string, value: any): Promise<void> {         
        this.workflowState.customVars = this.workflowState.customVars || {};
        this.workflowState.customVars[key] = (value);       
        await this.saveState();
    }

    // Get custom variables
    getCustomVar(key: string): any {
        return this.workflowState.customVars?.[key];
    }   

    // Get entire state
    getState(): WorkflowState {
        // Load state from Redis if not already loaded
        if (!this.workflowState || !this.workflowState.state) {
            this.loadState();
        }
        return this.workflowState;
    }
  
    async updateNodeStatus(id: string, type: NodeTypeString, status: NodeProgressStatus, progressPercentage?: number, errorMessage?: any): Promise<void> { 
        const nodeProgress: NodeProgress = { type, status, progressPercentage, errorMessage };    
        logger.info(`[WorkflowStateManager] Updating node progress for jobId: ${this.jobId}, nodeId: ${id}`);
        await redisClient.hSet(`job:${this.jobId}:nodeProgress`, id, JSON.stringify(nodeProgress));  
        
        const nodeState = this.getNodeState(id);
        
        // emit node progress
        emitNodeProgress(this.jobId, {
            nodeId: id,
            type, 
            status, 
            progressPercentage: progressPercentage || 0, 
            response: nodeState?.data || null,
            errorMessage: errorMessage || null,
        }            
        );
    }

    async getAllNodeProgress(): Promise<Record<string, NodeProgress>> {
        const raw = await redisClient.hGetAll(`job:${this.jobId}:nodeProgress`);
        const parsed: Record<string, NodeProgress> = {};

        for (const [ nodeId, nodeProgress] of Object.entries(raw)) {
            parsed[nodeId] = JSON.parse(nodeProgress);
        }
        return parsed;
    };
}
