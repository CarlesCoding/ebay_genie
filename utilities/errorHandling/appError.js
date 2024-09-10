class AppError extends Error {
  constructor(message, code) {
    super(message, code); // sets message property to the incoming message

    this.code = code;
    // All errors made with this AppError class will be operational errors
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
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
