import type { Request, Response, NextFunction } from "express";


export class AppError extends Error{
    statusCode: number;

    constructor(message: string, statusCode = 500){
        super(message);
        this.statusCode = statusCode;
    }
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction){
    next(new AppError(`Route Not Found: ${req.method} ${req.originalUrl}`,404));
}

export function errorHandler(
    err : Error | AppError,
    req : Request,
    res : Response,
    next : NextFunction 
){
    const statusCode = err instanceof AppError ? err.statusCode : 500;

    res.status(statusCode).json({
        error: {
            message : err.message || "Internal Server Error",
            statusCode,
        },
    });
}