import fs from 'fs';
import { io } from '../server';

const DB_FILE_PATH = "./tasks.db";

export const readTaskStatus = (): Record<string, string> => {
    try {
        const data = fs.readFileSync(DB_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading .db file:", error);
        return {};
    }
};

export const getTaskStatus = (taskId: string): string | null => {
    const tasks = readTaskStatus();
    return tasks[taskId] || null;
};

export const startTaskStatusWatcher = () => {
    setInterval(() => {
        const tasks = readTaskStatus();

        for (const taskId in tasks) {
            io.emit('taskStatus', { taskId, status: tasks[taskId] });
        }
    }, 10000); //10 seconds interval
};
