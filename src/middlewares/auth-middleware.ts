import jwt from 'jsonwebtoken';
import { Request, Response, RequestHandler, NextFunction } from 'express';
import { revokedTokens } from '../store/data-store';
import {CONFIG} from '../config/config';


// Middleware to authenticate JWT tokens
// This middleware checks if the token is valid and not revoked
// If valid, it adds the decoded user information to the request object
// If invalid or revoked, it sends a 401 Unauthorized response
// and a 403 Forbidden response for invalid tokens
export const authenticateJWT: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1] as string;
    if (!token || revokedTokens.has(token)) {
        res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, CONFIG.JWT_SECRET_KEY);
        req.user = decoded;
        next(); // to call next middleware, if any
    } catch (error) {
         res.status(403).json({ message: 'Invalid token' });
    }    
};
