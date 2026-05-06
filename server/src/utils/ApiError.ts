export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    if ('captureStackTrace' in Error) {
      (Error as unknown as { captureStackTrace: (t: object, f: Function) => void }).captureStackTrace(this, this.constructor);
    }
  }
}
