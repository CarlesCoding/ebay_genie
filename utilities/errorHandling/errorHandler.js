/**
 * In main functions use "handleError()"
 * In all the functions try catches inside the main function use "throw new appError()"
 */

import { log } from "../../helpers.js";

// TODO: Add an error handler for captcha errors as they need to be treated like fatal errors. The program cant move forward if it cant pass the captcha

export const handleError = (err) => {
  const env = process.env.NODE_ENV || "development";

  // Check if the error is operational
  if (err.isOperational) {
    const errorType = extractErrorType(err);

    // Initialize error message with specific code
    let errorMessage = `${errorType} ERROR: ${err.message}`;

    // Append stack trace in development
    if (env === "development") {
      errorMessage += `\nStack Trace: ${err.stack}`;
    }

    // Log and display the operational error
    log(`${errorMessage}`, "error");
    console.error(`💥 ${errorMessage}`);

    // Exit process for fatal operational errors
    if (err.code === "E_FATAL") {
      process.exit(1);
    }
  } else {
    // Handle unexpected errors
    if (env === "development") {
      err.message += `\nStack Trace: ${err.stack}`;
    }

    log(`❔ Unexpected Error: ${err.message}`, "error");
    // console.error(`💥 ${errorMessage}`);

    // Exit process for unexpected errors
    process.exit(1);
  }
};

export default handleError;

// Extract the error type
const extractErrorType = (error) => {
  let errorType = "";
  let errorCode = error.code;
  if (!errorCode) return (errorType = `Operational`);
  errorType = errorCode.split("_")[1];
  if (errorType === "FATAL") errorType += ` Operational`;
  return errorType;
};

// ********** List of error codes **********
const errorCodeEnums = [
  "E_FATAL", // Fatal error that prevents the application from continuing
  "E_NETWORK", // Network-related issues
  "E_DATABASE", // Database-related issues
  "E_UNKNOWN", // Unknown or unspecified errors
  "E_AUTH", // Authentication errors
  "E_PERMISSION", // Permission-related errors
  "E_VALIDATION", // Validation errors for input data
  "E_TIMEOUT", // Timeout errors
  "E_FILE", // File-related errors
  "E_CONFIG", // Configuration errors
  "E_DEPENDENCY", // Dependency-related errors
  "E_STORAGE", // Storage-related errors (e.g., disk full, quota exceeded)
  "E_PARSE", // Parsing errors (e.g., JSON parsing issues)
  "E_FORMAT", // Formatting errors (e.g., invalid data format)
  "E_HTTP", // HTTP-related errors (e.g., 404 Not Found)
  "E_AUTHORIZATION", // Authorization errors (e.g., access denied)
  "E_SERVICE", // Service-related errors (e.g., external service failure)
  "E_RATE_LIMIT", // Rate limiting errors
  "E_MEMORY", // Memory-related issues (e.g., out of memory)
  "E_DEPRECATED", // Deprecated functionality usage
  "E_CONCURRENCY", // Concurrency or race condition issues
  "E_CORS", // Cross-Origin Resource Sharing errors
  "E_CRYPTO", // Cryptography-related errors
  "E_SCRIPT", // Script-related errors (e.g., syntax errors in scripts)
  "E_ASYNC", // Asynchronous operation errors (e.g., promise rejections)
  "E_EVENT", // Event handling errors
  "E_SYNC", // Synchronous operation errors
  "E_INTERNAL", // Internal application errors
  "E_EXTERNAL", // Errors from external systems or services
  "E_RETRY", // Errors indicating that an operation should be retried
  "E_DEPLOYMENT", // Deployment or release errors
  "E_NETWORK_TIMEOUT", // Network timeout specific error
  "E_PROTOCOL", // Protocol-related errors
  "E_FEATURE", // Errors related to missing or failed features
  "E_BROWSER", // Errors related to browser issues
  "E_CAPTCHA", // Errors related to CAPTCHA solving
  "E_FORM", // Errors related to form handling
  "E_BOTPROTECTION", // Errors related to bot protection
  "E_INTERACTION_FAILED", // Errors related to interaction failed
  "E_SIMULATE_CLICK", // Errors related to simulate click
];
