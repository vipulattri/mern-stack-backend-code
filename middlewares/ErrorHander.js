// ErrorHandler.js

class ErrorHandler extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
  
      // Capturing the stack trace helps with debugging
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export default ErrorHandler;
  