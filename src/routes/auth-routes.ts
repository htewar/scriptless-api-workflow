import { Router } from 'express';
import  { login, logout } from '../controllers/AuthController';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/logout', logout);
// router.post('/submit', authenticateJWT, submitWorkflow);
export default authRouter;