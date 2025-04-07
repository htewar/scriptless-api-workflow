import jwt from 'jsonwebtoken';
import { findUser } from '../store/data-store';
import { CONFIG } from '../config/config';


// This function authenticates a user by checking the provided username and password
// against the stored user data. If the credentials are valid, it generates a JWT token
export const authenticateUser = (username: string, password: string): string | null => {
    const user = findUser(username, password);
    if (!user) {
        return null;
    }
    return jwt.sign({username: user.username}, CONFIG.JWT_SECRET_KEY, {expiresIn: '24h'});
};



