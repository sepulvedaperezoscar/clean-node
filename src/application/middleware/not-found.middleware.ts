


import { Request, Response } from 'express';

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export function notFoundMiddleware(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
        timestamp: new Date().toISOString(),
    });
}