import logger from "../utils/logger";
import { Assertion } from "../models/workflow";
import { log } from "console";

// Function to validate assertions
// This function takes a response object and an array of assertions
// It checks if the response meets the conditions specified in the assertions
// It returns true if all assertions pass, otherwise throws an error
// Supported operators: equals, contains, greaterThan, lessThan
export const validateAssertions = (
  response: Record<string, any>,
  assertions: Assertion[]
): true => {
  for (const assertion of assertions) {
    const { property, operator, value } = assertion;   

    // Extract actual value from response
    const actualValue = property
      .split(".")
      .reduce((obj, key) => obj?.[key], response);   

    if (actualValue === undefined) {
      throw new Error(
        `Assertion failed: property '${property}' not found in response`
      );
    }

    logger.info(
      `Validating Assertion - Property: ${property}, Expected: ${value}, Actual: ${actualValue}`
    );

    // Validate based on the operator
    switch (operator) {
      case "equals":
        if (actualValue !== value) {
          throw new Error(
            `Assertion failed: '${property}' expected to equal '${value}', but got '${actualValue}'`
          );
        }
        break;
      case "contains":
        if (typeof actualValue !== "string" && !Array.isArray(actualValue)) {
          throw new Error(
            `Assertion failed: '${property}' expected to be a string or array, but got '${typeof actualValue}'`
          );
        }
        if (!actualValue.includes(value)) {
          throw new Error(
            `Assertion failed: '${property}' expected to contain '${value}', but got '${actualValue}'`
          );
        }
        break;
      case "greaterThan":       
        if (typeof actualValue !== "number" || typeof value !== "number") {
          throw new Error(
            `Assertion failed: 'greaterThan' requires number values. Got '${actualValue}' and '${value}'`
          );
        }
        if (!(actualValue > value)) {
          throw new Error(
            `Assertion failed: '${property}' expected to be greater than '${value}', but got '${actualValue}'`
          );
        }
        break;
      case "greaterThanOrEqualTo":
        if (typeof actualValue !== "number" || typeof value !== "number") {
          throw new Error(
            `Assertion failed: ${property} or ${value} is not a number`
          );
        }
        if (!(actualValue >= value)) {
          throw new Error(
            `Assertion failed: ${actualValue} is not greater than or equal to ${value}`
          );
        }
        break;
      case "lessThan":
        if (typeof actualValue !== "number" || typeof value !== "number") {
          throw new Error(
            `Assertion failed: 'lessThan' requires number values. Got '${actualValue}' and '${value}'`
          );
        }
        if (!(actualValue < value)) {
          throw new Error(
            `Assertion failed: '${property}' expected to be less than '${value}', but got '${actualValue}'`
          );
        }
        break;
      case "lessThanOrEqualTo":
        if (typeof actualValue !== "number" || typeof value !== "number") {
          throw new Error(
            `Assertion failed: ${property} or ${value} is not a number`
          );
        }
        if (!(actualValue <= value)) {
          throw new Error(
            `Assertion failed: ${actualValue} is not less than or equal to ${value}`
          );
        }
        break;
      default:
        logger.warn(`Unsupported operator: ${operator}`);
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
