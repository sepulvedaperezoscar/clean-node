

import { Request, Response, NextFunction } from 'express';
import { Logger } from '@infrastructure/helpers';
import { AppError, ErrorCode } from '@infrastructure/helpers';

const logger = new Logger('ErrorHandler');

export function errorHandler(
    error: Error | AppError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
): void {

    logger.error('Error caught by error handler', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
    });

    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                ...(process.env.NODE_ENV === 'development' && error.details && { details: error.details }),
            },
            timestamp: new Date().toISOString(),
        });
        return;
    }

    const statusCode = getStatusCode(error);
    const errorCode = getErrorCode(error);

    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message: process.env.NODE_ENV === 'production'
                ? getPublicMessage(error)
                : error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
        timestamp: new Date().toISOString(),
    });
}

function getStatusCode(error: Error): number {
    const message = error.message.toLowerCase();

    if (message.includes('not found')) return 404;
    if (message.includes('already exists')) return 409;
    if (message.includes('invalid') || message.includes('must be')) return 400;
    if (message.includes('unauthorized')) return 401;
    if (message.includes('forbidden')) return 403;
    if (message.includes('insufficient stock')) return 422;

    return 500;
}

function getErrorCode(error: Error): ErrorCode {
    const message = error.message.toLowerCase();

    if (message.includes('user not found')) return ErrorCode.USER_NOT_FOUND;
    if (message.includes('product not found')) return ErrorCode.PRODUCT_NOT_FOUND;
    if (message.includes('not found')) return ErrorCode.NOT_FOUND;
    if (message.includes('email already exists')) return ErrorCode.EMAIL_ALREADY_EXISTS;
    if (message.includes('already exists')) return ErrorCode.DUPLICATE_RESOURCE;
    if (message.includes('invalid') || message.includes('must be')) return ErrorCode.VALIDATION_ERROR;
    if (message.includes('insufficient stock')) return ErrorCode.INSUFFICIENT_STOCK;

    return ErrorCode.INTERNAL_ERROR;
}

function getPublicMessage(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('not found')) return 'Resource not found';
    if (message.includes('already exists')) return 'Resource already exists';
    if (message.includes('invalid')) return 'Invalid request';
    if (message.includes('insufficient')) return 'Insufficient resources';

    return 'Internal server error';
}