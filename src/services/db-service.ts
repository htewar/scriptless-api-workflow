import fs from 'fs';
import { io } from '../server';
import { NodeCommunication } from '../models/Task';

export const readTaskStatus = async (): Promise<Record<string, string>> => {
    try {
        const tasks = await NodeCommunication.find();
        const result: Record<string, string> = {};
        tasks.forEach(task => {
            result[task.nodeId] = task.status;
        });
        return result;
    } catch (error) {
        console.error('Error reading tasks from MongoDB:', error);
        return {};
    }
};

export const startTaskStatusWatcher = () => {
    setInterval(async () => {
        try {
            const tasks = await readTaskStatus();

            for (const nodeId in tasks) {
                io.emit('taskStatus', {
                    nodeId,
                    status: tasks[nodeId]
                });
            }

        } catch (error) {
            console.error('Error during task status watch:', error);
        }
    }, 10000);
};
