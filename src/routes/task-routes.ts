import express from 'express';
import { getTaskStatus, startTaskStatusWatcher } from '../services/db-service';

const router = express.Router();

startTaskStatusWatcher();


export default router;
