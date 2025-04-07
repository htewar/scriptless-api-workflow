import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as WorkflowService from '../services/workflow-service';
import logger from '../utils/logger';
import { redisClient } from '../config/config';
import  { NodeStatus }  from '../models/workflow-state';

// Create a new workflow
// @route POST /api/workflow/create
export const createWorkflow = (req: Request, res: Response, next: NextFunction ) => {
    try {
        const workflow = WorkflowService.createWorkflow(req.body);
        res.status(201).json({message: "Workflow created successfully", workflow}); 
        return;       
    } catch (error) {
        next(error);
    }
};

// Get a workflows
// @route GET /api/workflow:id
export const getWorkflow = (req: Request, res: Response, next: NextFunction) => {
    try {
      const workflow = WorkflowService.getWorkflow(req.params.id);
      res.status(200).json(workflow);
      return;
    } catch (error) {
      next(error);
    }
};

// Update a workflow
// @route PUT /api/workflow/:id
export const updateWorkflow = (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedWorkflow = WorkflowService.updateWorkflow(req.params.id, req.body);
      res.status(200).json({ message: 'Workflow updated successfully', updatedWorkflow });
      return;
    } catch (error) {
      next(error);
    }
};

// Delete a workflow
// @route DELETE /api/workflow/:id
export const deleteWorkflow = (req: Request, res: Response, next: NextFunction) => {
    try {
      WorkflowService.deleteWorkflow(req.params.id);
      res.status(200).json({ message: 'Workflow deleted successfully' });
      return;
    } catch (error) {
      next(error);
    }
};

// Get all workflow IDs
// @route GET /api/workflow/ids
export const getAllWorkflowIds = async (req: Request, res: Response, next: NextFunction) => {
  logger.info("Fetching all workflow IDs");
    try {        
        const workflowIds = await WorkflowService.getAllWorkflowIds();
        res.status(200).json({ workflowIds });
        return;
    } catch (error) {
        logger.error(`Error in fetching workflow IDs: ${error}`);
        next(error);
    }
};

// Execute a workflow
// @route POST /api/workflow/execute/:workflowId
export const executeWorkflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check Redis connection
      if (!redisClient.isReady) {
        res.status(503).json({ message: 'Service Unavailable: Redis connection is not ready' });    
        return;    
      }

      // validating workflowId
      const {workflowId} = req.params;
      if (!workflowId) { 
        res.status(400).json({ message: 'Missing workflowId' });
        return;
      }

      // calling workflow service to get workflow
      const jobID = await WorkflowService.executeWorkflow(workflowId);
    
      res.status(202).json({ message: 'Workflow execution started', jobID });
      return;
    } catch (error) {
      logger.error(`Error starting workflow execution: ${error}`);
      next(error);
    }
  }

// Get workflow status
// @route GET /api/workflow/status/:jobId
export const getWorkflowStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { jobId } = req.params;    
      logger.info(`Fetching getWorkflowStatus for job ID: ${jobId}`);    
      const [jobStatus, rawProgress] = await Promise.all([
        redisClient.get(`job:${jobId}:status`),
        redisClient.hGetAll(`job:${jobId}:nodesStatus`)
      ]);
      
      if (!jobStatus || !rawProgress || Object.keys(rawProgress).length === 0) {
        res.status(404).json({ message: 'Job not found' });
        return;
      }

      const nodesStatus: Record<string, NodeStatus> = {};
      for (const [nodeId, json] of Object.entries(rawProgress)) {       
        const fullProgress = JSON.parse(json);
        // exclude errorMessage from the progress
        const{ errorMessage, ...stripped } = fullProgress;
        nodesStatus[nodeId] = stripped;
      }     
            
      res.json({ jobId, jobStatus, nodesStatus});
      return;
    } catch (error) {
      next(error);
    }
  };