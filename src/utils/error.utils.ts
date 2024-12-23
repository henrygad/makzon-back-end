
type errorProps = {
  statusCode: number;
  message: string;
};

class customError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
      
    Error.captureStackTrace(this, this.constructor);
  };
  
};

 const createError = ({statusCode, message}: errorProps) => {
   throw new customError(statusCode, message);
 };

export default createError;
