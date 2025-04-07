import express from 'express';
import {
  createWorkflow,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getWorkflowStatus,
  getAllWorkflowIds,
} from '../controllers/WorkflowController';

const router = express.Router();

router.post("/create", createWorkflow);
router.get("/ids", getAllWorkflowIds);
router.get("/:id", getWorkflow);
router.put("/:id", updateWorkflow);
router.delete("/:id", deleteWorkflow);
router.post("/execute/:workflowId", executeWorkflow);
router.get("/status/:jobId", getWorkflowStatus);


export default router;