import { Workflow } from "../models/workflow";

export interface User {
    username: string;
    password: string;
};

export const revokedTokens = new Set<string>();

export const revokeToken = (token: string) => {
    revokedTokens.add(token);
};

export const isTokenRevoked = (token: string): boolean => {
    return revokedTokens.has(token);
}


// hardcoded user credentials
const users: User[] = [
    { username: 'admin', password: 'admin' },
];

export const findUser = (username: string, password: string): User | null => {
    return users.find(user => user.username === username && user.password === password) || null;
}

export const workflows = new Map<string, Workflow>();


