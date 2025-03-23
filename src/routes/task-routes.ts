import express from 'express';
import { readTaskStatus, startTaskStatusWatcher } from '../services/db-service';


const router = express.Router();

startTaskStatusWatcher();


export default router;
