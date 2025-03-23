import { Request, Response, NextFunction } from 'express';
import { NodeEntity } from '../models/Node';
import { v4 as uuidv4 } from 'uuid';

export const saveNode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityName, entityDescription, entityType, nodeConfig } = req.body;

    if (!entityName || !entityDescription || !entityType || !nodeConfig) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    const newNode = new NodeEntity({
      entityUUID: uuidv4(),
      entityName,
      entityDescription,
      entityType,
      nodeConfig,
    });

    await newNode.save();

    res.status(201).json({
      message: 'Node saved successfully',
      entityUUID: newNode.entityUUID,
    });
  } catch (error) {
    console.error('Error saving node:', error);
    next(error);
  }
};

export const getAllNodes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const nodes = await NodeEntity.find({}, {
          entityUUID: 1,
          entityName: 1,
          entityDescription: 1,
          entityType: 1,
          _id: 0
      })
      .skip(skip)
      .limit(limit)
      .exec();

      res.status(200).json(nodes);
  } catch (error) {
      console.error('Error fetching all nodes:', error);
      next(error);
  }
};

export const getNodeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const { nodeId } = req.params;

      const node = await NodeEntity.findOne({ entityUUID: nodeId });

      if (!node) {
          res.status(404).json({ error: 'Node not found' });
          return;
      }

      res.status(200).json(node);
  } catch (error) {
      console.error('Error fetching node:', error);
      next(error);
  }
};

export const updateNode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const { entityUUID, entityName, entityDescription, entityType, nodeConfig } = req.body;

      if (!entityUUID || !entityName || !entityDescription || !entityType || !nodeConfig) {
          res.status(400).json({ error: 'All fields including entityUUID are required.' });
          return;
      }

      const result = await NodeEntity.updateOne(
          { entityUUID },
          {
              $set: {
                  entityName,
                  entityDescription,
                  entityType,
                  nodeConfig
              }
          }
      );

      if (result.modifiedCount === 0) {
          res.status(404).json({ error: 'Node not found or no changes detected' });
          return;
      }

      res.status(200).json({ message: 'Node updated successfully' });
  } catch (error) {
      console.error('Error updating node:', error);
      next(error);
  }
};

export const deleteNodeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const { nodeId } = req.params;

      const result = await NodeEntity.deleteOne({ entityUUID: nodeId });

      if (result.deletedCount === 0) {
          res.status(404).json({ error: 'Node not found' });
          return;
      }

      res.status(200).json({ message: 'Node deleted successfully' });
  } catch (error) {
      console.error('Error deleting node:', error);
      next(error);
  }
};
