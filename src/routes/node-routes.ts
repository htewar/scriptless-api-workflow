import express from 'express';
import { saveNode } from '../controllers/NodeController';
import { getAllNodes } from '../controllers/NodeController';
import { getNodeById } from '../controllers/NodeController';
import { updateNode } from '../controllers/NodeController';
import { deleteNodeById } from '../controllers/NodeController';

const router = express.Router();

router.post('/save', saveNode);
router.get('/all-nodes', getAllNodes);
router.get('/:nodeId', getNodeById);
router.put('/update', updateNode);
router.delete('/:nodeId', deleteNodeById);

export default router;
