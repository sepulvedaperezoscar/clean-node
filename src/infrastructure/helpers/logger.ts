

export class Logger {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    private formatMessage(level: string, message: string, data?: any): string {
        const timestamp = new Date().toISOString();
        const baseMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;

        if (data) {
            if (data instanceof Error) {
                return `${baseMessage} - Error: ${data.message}\nStack: ${data.stack}`;
            }
            return `${baseMessage} ${JSON.stringify(data)}`;
        }

        return baseMessage;
    }

    info(message: string, data?: any): void {
        console.log(this.formatMessage('INFO', message, data));
    }

    error(message: string, error?: any): void {
        console.error(this.formatMessage('ERROR', message, error));
    }

    warn(message: string, data?: any): void {
        console.warn(this.formatMessage('WARN', message, data));
    }

    debug(message: string, data?: any): void {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this.formatMessage('DEBUG', message, data));
        }
    }
}