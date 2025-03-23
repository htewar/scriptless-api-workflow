import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    nodeId: { type: String, required: true, unique: true },
    status: { type: String, required: true }
});

export const NodeCommunication = mongoose.model('Task', TaskSchema);
