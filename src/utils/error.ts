
//  Reuseable custom error handler
class customError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = process.env.NODE_ENV !== "production" &&
      process.env.NODE_ENV !== "deploy";

    Error.captureStackTrace(this, this.constructor);
  }
};

const createError = ({ statusCode, message }: { statusCode: number, message: string }): never => {
  throw new customError(statusCode, message);
};

export default createError;
