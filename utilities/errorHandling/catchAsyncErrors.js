/**
 *   Catch Errors Handler
  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchAsyncErrors(), catch any errors they throw, and pass it along to custom error handler
  
*/

import handleError from "./errorHandler.js";

// Wrapper function for async functions
export const catchAsyncErrors =
  (fn) =>
  async (...args) => {
    try {
      await fn(...args);
    } catch (error) {
      handleError(error); // Use your custom error handler here
    }
  };

export default catchAsyncErrors;
