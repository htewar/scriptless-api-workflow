import { WorkflowStateManager } from "./workflow-state-manager";
import logger from "../utils/logger";

// Function to resolve state variables in node properties e.g-> $state.http_1.response.data or $state.customVars.data
export const resolvePlaceholders = async (
  data: any,
  workflowState: WorkflowStateManager
): Promise<any> => {
  const fullState = workflowState.getState();
  logger.info(`resolving placeholder:, ${data}`);

  if (typeof data === "string") {
    const placeholderRegex = /\${state\.([a-zA-Z0-9_\.]+)}/g;
    const result = data.replace(placeholderRegex, (_, pathString) => {
      const pathKeys = pathString.split(".");
      let resolvedValue: any;

      try {
        if (pathKeys[0] === "customVars") {
          resolvedValue = fullState.customVars;
          pathKeys.shift();
        } else {
          resolvedValue = fullState.state;
        }

        for (const key of pathKeys) {
          resolvedValue = resolvedValue?.[key];
          if (resolvedValue === undefined) {
            throw new Error(
              `Resolved value is undefined for placeholder: \${state.${pathString}}`
            );
          }
        }

        logger.info(
          `Resolved placeholder \${state.${pathString}} with ${resolvedValue}`
        );
        return resolvedValue;
      } catch (err) {
        logger.error((err as Error).message);
        throw err; 
      }
    });

    return result;
  }

  if (typeof data === "object" && data !== null) {
    const resolvedObject: any = Array.isArray(data) ? [] : {};
    for (const key in data) {
      try {
        resolvedObject[key] = await resolvePlaceholders(
          data[key],
          workflowState
        );
      } catch (err) {
        throw err;
      }
    }
    return resolvedObject;
  }

  return data;
};

// Check if a string contains a placeholder ($state.)
const containsPlaceholder = (value: string): boolean => {
  return typeof value === "string" && value.includes("${state.");
};

// Check if an object has any placeholders in its values
export const containsPlaceholderObject = (obj: any): boolean => {
  if (typeof obj === "string") {
    return containsPlaceholder(obj);
  }

  if (Array.isArray(obj)) {
    return obj.some(containsPlaceholderObject);
  }

  if (typeof obj === "object" && obj !== null) {
    return Object.values(obj).some(containsPlaceholderObject);
  }
  return false;
};
