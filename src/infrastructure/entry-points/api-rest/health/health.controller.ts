

import { Request, Response } from 'express';
import { AppDataSource } from '@application/config/datasource';

/**
 * Controlador para health checks
 */
export class HealthController {
    async getHealth(req: Request, res: Response): Promise<void> {
        try {
            await AppDataSource.query('SELECT 1');

            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV,
                database: 'connected',
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                    unit: 'MB',
                },
            });
        } catch (error) {
            res.status(503).json({
                status: 'ERROR',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    getReady(req: Request, res: Response): void {
        const isReady = AppDataSource.isInitialized;

        if (isReady) {
            res.status(200).json({ ready: true });
        } else {
            res.status(503).json({ ready: false });
        }
    }

    getLive(req: Request, res: Response): void {
        res.status(200).json({ live: true });
    }
}