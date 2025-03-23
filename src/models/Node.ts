import mongoose from 'mongoose';

const NodeSchema = new mongoose.Schema({
    entityUUID: { type: String, required: true, unique: true },
    entityName: { type: String, required: true },
    entityDescription: { type: String, required: true },
    entityType: { type: String, required: true },
    nodeConfig: { type: String, required: true }
}, { timestamps: true });

export const NodeEntity = mongoose.model('Node', NodeSchema);
