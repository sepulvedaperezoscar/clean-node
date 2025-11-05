

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './environment';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    synchronize: config.node_env === 'development', // Solo en desarrollo
    logging: config.node_env === 'development',
    entities: ['src/infrastructure/driven-adapters/orm/entities/**/*.ts'],
    migrations: ['src/infrastructure/driven-adapters/orm/migrations/**/*.ts'],
    subscribers: [],
    // Configuración de pool
    extra: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
    },
});