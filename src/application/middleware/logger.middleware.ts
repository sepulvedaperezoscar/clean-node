


import { Request, Response, NextFunction } from 'express';
import { Logger } from '@infrastructure/helpers/logger';

const logger = new Logger('HTTP');

/**
 * Middleware para logging de requests HTTP
 */
export function loggerMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const start = Date.now();

    // Capturar cuando la respuesta termine
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        };

        if (res.statusCode >= 400) {
            logger.error('HTTP Request Error', logData);
        } else {
            logger.info('HTTP Request', logData);
        }
    });

    next();
}