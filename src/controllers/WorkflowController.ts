import { Request, Response, NextFunction } from 'express';
import * as WorkflowService from '../services/workflow-service';

//Newly added for websocket
import { io } from '../server';

export const createWorkflow = (req: Request, res: Response, next: NextFunction ) => {
    try {
        const workflow = WorkflowService.createWorkflow(req.body);

        //new
        io.emit('workflowStatus', {
          id: workflow.id,
          status: 'created',
          message: `Workflow ${workflow.name} has been created.`
      });

        res.status(201).json({message: "Workflow created successfully", workflow});
    } catch (error) {
        next(error);
    }
};

export const getWorkflow = (req: Request, res: Response, next: NextFunction) => {
    try {
      const workflow = WorkflowService.getWorkflow(req.params.id);
      res.json(workflow);
    } catch (error) {
      next(error);
    }
  };

  export const updateWorkflow = (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedWorkflow = WorkflowService.updateWorkflow(req.params.id, req.body);
      res.json({ message: 'Workflow updated successfully', updatedWorkflow });
    } catch (error) {
      next(error);
    }
  };

  export const deleteWorkflow = (req: Request, res: Response, next: NextFunction) => {
    try {
      WorkflowService.deleteWorkflow(req.params.id);
      res.json({ message: 'Workflow deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
