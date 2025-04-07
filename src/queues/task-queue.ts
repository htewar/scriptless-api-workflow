import Queue from 'bull';
import { CONFIG, redisClient } from '../config/config';
import logger from '../utils/logger';


// Define Workflow Queue
export const workflowQueue = new Queue('workflowQueue', { 
    redis:  { host: CONFIG.REDIS.HOST, port: CONFIG.REDIS.PORT } 
});

// Log job events and store status in Redis
workflowQueue.on('waiting', async (jobId) => {
    logger.info(`Job waiting: ${jobId}`);
    await updateJobStatus(jobId.toString(), 'pending');
});

workflowQueue.on('active', async (job) => {
    logger.info(`Job started: ${job.id}, WorkflowID: ${job.data.workflow.id}`);
    await updateJobStatus(job.id.toString(), 'in_progress');
});

workflowQueue.on('completed', async (job) => {
    logger.info(`Job completed: ${job.id}, WorkflowID: ${job.data.workflow.id}`);
    await updateJobStatus(job.id.toString(), 'completed');
});

workflowQueue.on('failed', async(job, err) => {
    logger.error(`Job failed: ${job.id}, WorkflowID: ${job.data.workflow.id}, Error: ${err}`);
    await updateJobStatus(job.id.toString(), 'failed');
});

// Store JobStatus in Redis
export const updateJobStatus = async (jobId: string, status: string) => {
    await redisClient.set(`job:${jobId}:status`, status);
}








