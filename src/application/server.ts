
import express, { Application } from 'express';
import { config } from './config/environment';

class Server {

    private app: Application;
    private port: number;

    constructor() {
        this.app = express();
        this.port = config.port;
    }

    async start(): Promise<void> {


        // Start server
        this.app.listen(this.port, () => {
            console.log(`🚀 Server running on port ${this.port}`);
            console.log(`📝 Environment: ${config.node_env}`);
            console.log(`🔗 API available at: http://localhost:${this.port}${config.apiPrefix}`);
            console.log(`💚 Health check: http://localhost:${this.port}/health`);
        });

    }

}