
import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment';
import { setupDependencies } from './config/bootstrap';
import { initDatabase, closeDatabase } from './config/database';
import {
    errorHandler,
    loggerMiddleware,
    notFoundMiddleware,
} from './middleware';
import routes from '@infrastructure/entry-points/api-rest';
import { Logger } from '@infrastructure/helpers';

const logger = new Logger('Server');

/**
 * Clase principal del servidor
 * Maneja la configuración, inicialización y cierre de la aplicación
 */
class Server {
    private app: Application;
    private port: number;

    constructor() {
        this.app = express();
        this.port = config.port;
    }

    /**
     * Inicia el servidor
     */
    async start(): Promise<void> {
        try {
            logger.info('🚀 Starting server...');

            // 1. Inicializar base de datos
            logger.info('📊 Initializing database...');
            await initDatabase();

            // 2. Configurar dependencias
            logger.info('🔧 Setting up dependencies...');
            setupDependencies();

            // 3. Configurar middleware
            logger.info('⚙️  Configuring middleware...');
            this.configureMiddleware();

            // 4. Configurar rutas
            logger.info('🛣️  Configuring routes...');
            this.configureRoutes();

            // 5. Configurar manejo de errores
            logger.info('🛡️  Configuring error handling...');
            this.configureErrorHandling();

            // 6. Iniciar servidor HTTP
            await this.listen();

            // 7. Configurar graceful shutdown
            this.handleGracefulShutdown();

            logger.info('✅ Server started successfully');
        } catch (error: any) {
            logger.error('❌ Failed to start server', error);
            process.exit(1);
        }
    }

    /**
     * Configura los middleware de Express
     */
    private configureMiddleware(): void {
        // Security middleware
        this.app.use(helmet());

        // CORS
        this.app.use(cors(config.cors));

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging
        this.app.use(loggerMiddleware);

        // Trust proxy (importante para producción detrás de un load balancer)
        this.app.set('trust proxy', 1);
    }

    /**
     * Configura las rutas de la aplicación
     */
    private configureRoutes(): void {
        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                name: 'REST Express API',
                version: '1.0.0',
                description: 'Clean Architecture REST API with TypeORM and PostgreSQL',
                environment: config.node_env,
                endpoints: {
                    health: '/health',
                    api: config.apiPrefix,
                    docs: `${config.apiPrefix}/docs`,
                },
                timestamp: new Date().toISOString(),
            });
        });

        // API routes con prefijo
        this.app.use(config.apiPrefix, routes);

        // 404 handler - debe ser después de todas las rutas
        this.app.use(notFoundMiddleware);
    }

    /**
     * Configura el manejo centralizado de errores
     */
    private configureErrorHandling(): void {
        this.app.use(errorHandler);
    }

    /**
     * Inicia el servidor HTTP
     */
    private async listen(): Promise<void> {
        return new Promise((resolve) => {
            this.app.listen(this.port, () => {
                logger.info('═══════════════════════════════════════');
                logger.info(`🚀 Server running on port ${this.port}`);
                logger.info(`📝 Environment: ${config.node_env}`);
                logger.info(`🔗 API: http://localhost:${this.port}${config.apiPrefix}`);
                logger.info(`💚 Health: http://localhost:${this.port}/health`);
                logger.info('═══════════════════════════════════════');
                resolve();
            });
        });
    }

    /**
     * Maneja el cierre graceful de la aplicación
     */
    private handleGracefulShutdown(): void {
        const shutdown = async (signal: string) => {
            logger.info(`${signal} received. Starting graceful shutdown...`);

            try {
                // Cerrar conexión a la base de datos
                await closeDatabase();

                logger.info('✅ Graceful shutdown completed');
                process.exit(0);
            } catch (error: any) {
                logger.error('❌ Error during shutdown', error);
                process.exit(1);
            }
        };

        // Capturar señales de terminación
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // Capturar errores no manejados
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', { promise, reason });
        });

        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            process.exit(1);
        });
    }
}


const server = new Server();
server.start();

export default server;