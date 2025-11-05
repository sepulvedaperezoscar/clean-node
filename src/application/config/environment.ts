

import dotenv from 'dotenv';

dotenv.config();

export const config = {
    node_env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    apiPrefix: process.env.API_PREFIX || '/api/v1',
};