import { Request, Response, NextFunction } from  'express';

const errorHandler =  (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    const statusCode = err.status && Number.isInteger(err.status) ? err.status : 500;
    const message = typeof err.message === "string" ? err.message : "Internal Server Error";
    
    res.status(statusCode).json({ message });
}

export default errorHandler;

