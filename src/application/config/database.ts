

import { AppDataSource } from './datasource';
import { Logger } from '@infrastructure/helpers';

const logger = new Logger('Database');

export async function initDatabase(): Promise<void> {
    try {
        await AppDataSource.initialize();
        logger.info('✅ Database connected successfully');
        logger.info(`📊 Database: ${AppDataSource.options.database}`);
    } catch (error: any) {
        logger.error('❌ Database connection failed', error);
        throw error;
    }
}

export async function closeDatabase(): Promise<void> {
    try {
        await AppDataSource.destroy();
        logger.info('Database connection closed');
    } catch (error: any) {
        logger.error('Error closing database connection', error);
    }
}

export { AppDataSource };