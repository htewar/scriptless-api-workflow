import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth-routes';
import workflowRouter from './routes/workflow-routes';
import errorHandler from './middlewares/error-handler';


const app: Application = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routest setup
app.use('/api/auth', authRouter);
app.use('/api/workflows', workflowRouter);

// Error handling
app.use(errorHandler);

export default app;