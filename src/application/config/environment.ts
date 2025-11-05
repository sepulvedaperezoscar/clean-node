

import dotenv from 'dotenv';

dotenv.config();

export const config = {
    node_env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    apiPrefix: process.env.API_PREFIX || '/api/v1',

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        name: process.env.DB_NAME || 'rest_express_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },

    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    },
};