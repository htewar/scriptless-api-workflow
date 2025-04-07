import logger from "../utils/logger";
import { Assertion } from "../models/workflow";
import { log } from "console";

// Function to validate assertions
// This function takes a response object and an array of assertions
// It checks if the response meets the conditions specified in the assertions
// It returns true if all assertions pass, false otherwise
// Supported operators: equals, contains, greaterThan, lessThan
export const validateAssertions = (response: Record<string, any>, assertions: Assertion[]): boolean => {
    for (const assertion of assertions) {
        const { property, operator, value } = assertion;

       // Extract actual value from response
        const actualValue = property.split('.').reduce((obj, key) => obj?.[key], response);
       
       if (actualValue === undefined) {
        logger.warn(`Property '${property}' not found in response`);
        return false;
        }

        logger.info(`Validating Assertion - Property: ${property}, Expected: ${value}, Actual: ${actualValue}`);

        // Validate based on the operator
        switch (operator) {
            case 'equals':
                if (actualValue !== value) return false;
                break;
            case 'contains':
                if (typeof actualValue !== 'string' && !Array.isArray(actualValue)) return false;  
                if (!actualValue.includes(value)) return false;
                break;  
            case 'greaterThan':
                if (typeof actualValue !== 'number' || typeof value !== 'number') return false;
                if (!(actualValue > value)) return false;
                break;
            case 'lessThan':
                if (typeof actualValue !== 'number' || typeof value !== 'number') return false;
                if (!(actualValue < value)) return false;
                break;
            default:
                logger.warn(`Unsupported operator: ${operator}`);
                return false;
        }
    }
    return true;
};

// // Function to execute custom assertion code
// // This function takes a string of code and executes it in the context of the response object
// // It returns true if the assertion passes, false otherwise
// // Note: Be cautious with eval or new Function as they can execute arbitrary code

// export const executeCustomAssertion = (code: string, response: Record<string, any>): boolean => {
//     try {
//         const assertionFunction = new Function('response', code);
//         return assertionFunction(response);
//     } catch (error) {
//         logger.error(`Error executing custom assertion: ${error}`);
//         return false;
//     }
// };