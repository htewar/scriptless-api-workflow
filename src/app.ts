import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth-routes';
import workflowRouter from './routes/workflow-routes';
import errorHandler from './middlewares/error-handler';
import nodeRoutes from './routes/task-routes';
import configNodeRoutes from './routes/node-routes';

const app: Application = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routest setup
app.use('/api/auth', authRouter);
app.use('/api/workflows', workflowRouter);

// new to test websocket
app.use('/api/socketmessage', nodeRoutes);

// New
app.use('/api', configNodeRoutes); // ✅ will register /api/save

// Error handling
app.use(errorHandler);

export default app;
