class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // sets message property to the incoming message

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // All errors made with this AppError class will be operational errors
    this.isOperational = true; // used to test if error is operational (a error we know) in errorController.js

    Error.captureStackTrace(this, this.constructor); // cleans the appError call from the stacktrace
  }
}

export default AppError;

/**
 * captureStackTrace: returns a string that represents the location of that particular error in the call.
 *  It gives a stack that helps to find the location of that error in the code at which new Error() was called.
 *  This will help us to find the exact error in the code.
 *
 * this.constructor: is the options to be filtered out
 */
