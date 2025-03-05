import express from 'express';
import {
  createWorkflow,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from '../controllers/WorkflowController';

const router = express.Router();

router.post("/", createWorkflow);
router.get("/:id", getWorkflow);
router.put("/:id", updateWorkflow);
router.delete("/:id", deleteWorkflow);

export default router;