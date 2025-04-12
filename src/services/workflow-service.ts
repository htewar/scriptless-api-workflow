import { Workflow, Node } from "../models/workflow";
import { NodeProgress } from "../models/workflow-state";
import { workflows } from "../store/data-store";
import { workflowQueue } from "../queues/task-queue";
import logger from "../utils/logger";
import { updateJobStatus } from "../queues/task-queue";
import { redisClient } from "../config/config";

// validate NodeType
const isValidNode = (node: Node): boolean => {
  return ["start", "http", "function"].includes(node.type);
};

// create new Workflow
export const createWorkflow = (workflowData: Workflow): Workflow => {
  const { id, name, nodes } = workflowData;

  if (!id || !name || !nodes || !Array.isArray(nodes) || nodes.length < 2) {
    throw new Error("Invalid workflow structure");
  }

  if (!nodes.every(isValidNode)) {
    throw new Error("Invalid node types in worklfow ");
  }

  workflows.set(id, workflowData);
  return workflowData;
};

// Retrieve a Workflow by ID
export const getWorkflow = (id: string): Workflow => {
  const workflow = workflows.get(id);

  if (!workflow) {
    throw new Error("Workflow not found");
  }
  return workflow;
};

// update an existing Worflow
export const updateWorkflow = (
  id: string,
  updateWorkflowData: Workflow
): Workflow => {
  if (!workflows.has(id)) {
    throw new Error("Workflow not found");
  }

  if (!updateWorkflowData.nodes.every(isValidNode)) {
    throw new Error("Invalid node types in workflow");
  }

  workflows.set(id, updateWorkflowData);
  return updateWorkflowData;
};

// delete a Workflow
export const deleteWorkflow = (id: string) => {
  if (!workflows.has(id)) {
    throw new Error("Workflow not found");
  }
  workflows.delete(id);
};

// get all Workflow IDs
export const getAllWorkflowIds = async () => {
  try {
    if (!workflows || !(workflows instanceof Map)) {
      logger.warn("Workflows data structure is not initialized correctly.");
      return [];
    }
    const workflowIds = Array.from(workflows.keys());
    if (workflowIds.length === 0) {
      logger.info("No workflows found.");
    } else {
      logger.info(`Fetched ${workflowIds.length} workflow IDs`);
    }
    return workflowIds;
  } catch (error) {
    logger.error(`Error in fetching workflow IDs: ${error}`);
    throw error;
  }
};

// execute a Workflow
// This function adds a workflow to the queue and updates its status
export const executeWorkflow = async (workflowId: string) => {
  try {
    const workflow = workflows.get(workflowId);

    if (!workflow) {
      throw new Error(`WorkflowID: ${workflowId} not found`);
    }

    const job = await workflowQueue.add({ workflow });
    await updateJobStatus(job.id.toString(), "pending");
    logger.info(`Workflow ${workflowId} added to queue with JobID: ${job.id}`);
    return job.id;
  } catch (error) {
    logger.error(`Failed to enqueue workflow ${workflowId}: ${error}`);
    throw error;
  }
};

// get Workflow Status
// This function retrieves the status of a workflow by its job ID
export const getWorkflowStatus = async (jobId: string) => {
  try {   
     logger.info(`Fetching getWorkflowStatus for job ID: ${jobId}`);
    const [jobStatus, rawProgress] = await Promise.all([
      redisClient.get(`job:${jobId}:status`),
      redisClient.hGetAll(`job:${jobId}:nodeProgress`),
    ]);

    if (!jobStatus || !rawProgress || Object.keys(rawProgress).length === 0) {       
      return null;
    }

    const nodesStatus: Record<string, NodeProgress> = {};
    for (const [nodeId, json] of Object.entries(rawProgress)) {       
      const fullProgress = JSON.parse(json);     
      const { errorMessage, ...rest } = fullProgress;       

      nodesStatus[nodeId] = {
        ...rest,
        ...(errorMessage && {
          errorMessage:
            typeof errorMessage === "object" && errorMessage.message
              ? errorMessage.message
              : String(errorMessage),
        }),
      };
    }

    return { jobId, jobStatus, nodesStatus };

  } catch (error) {
    throw error;
  }
};
