import jwt from 'jsonwebtoken';
import { findUser } from '../store/data-store';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY as string; // temporary

export const authenticateUser = (username: string, password: string): string | null => {
    const user = findUser(username, password);
    if (!user) {
        return null;
    }
    return jwt.sign({username: user.username}, SECRET_KEY, {expiresIn: '24h'});
};



