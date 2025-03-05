import jwt from 'jsonwebtoken';
import { Request, Response, RequestHandler, NextFunction } from 'express';
import { revokedTokens } from '../store/data-store';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY as string; // temporary

export const authenticateJWT: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1] as string;

    if (!token || revokedTokens.has(token)) {
        res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next(); // to call next middleware, if any
    } catch (error) {
         res.status(403).json({ message: 'Invalid token' });
    }    
};
