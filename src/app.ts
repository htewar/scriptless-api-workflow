import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth-routes';
import workflowRouter from './routes/workflow-routes';
import errorHandler from './middlewares/error-handler';
import { connectRedis } from './config/config';
import logger from './utils/logger';
import { startWorker } from './queues/workflow-worker';


const app: Application = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect Redis before starting the server
connectRedis().catch((error) => {
    logger.error(`Error connecting to Redis: ${error}`);
    process.exit(1); // Exit the process if Redis connection fails
});

// Start the workflow worker
startWorker();

// Routest setup
app.use('/api/auth', authRouter);
app.use('/api/workflow', workflowRouter);

// Error handling
app.use(errorHandler);

export default app;