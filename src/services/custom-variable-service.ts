import { WorkflowStateManager } from '../services/workflow-state-manager';
import logger from '../utils/logger';
import { containsPlaceholderObject, resolvePlaceholders } from '../services/placeholder-resolver';


export const storeCustomVariables = async (
    customVars: Record<string, any>,
    workflowStateManager: WorkflowStateManager
): Promise<void> => {   
    for (const [key, value] of Object.entries(customVars)) {        
        let resolvedValue;     
       
        if (containsPlaceholderObject(value)) {
            logger.info(`Resolving customVar placeholder`);
          resolvedValue = await resolvePlaceholders(value, workflowStateManager);
        } else {
          resolvedValue = value;
        }
        logger.info(`Resolved customVar "${key}" = ${JSON.stringify(resolvedValue)}`);
        await workflowStateManager.setCustomVar(key, resolvedValue);
      }                

}