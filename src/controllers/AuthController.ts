import { Request, Response, RequestHandler } from 'express';
import { authenticateUser } from '../services/auth-service';
import { NextFunction } from 'express-serve-static-core';
import { revokeToken } from '../store/data-store';


export const login: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;
        const token = authenticateUser(username, password);
    
        if (token) {
            res.json({ token });         
         } else {
            res.status(401).json({ message: 'Invalid credentials' });
         }        
    } catch (error) {
            next(error);
    }
};

export const logout:RequestHandler = (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        revokeToken(token);
        res.json({ message: 'Logout successfully' });
    } else {
        res.status(400).json({ message: 'Token is required' });
    }
};