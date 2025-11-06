

/**
 * Utilidad para formatear respuestas HTTP de forma consistente
 */
export class ResponseFormatter {
    static success<T>(data: T, message?: string) {
        return {
            success: true,
            data,
            ...(message && { message }),
            timestamp: new Date().toISOString(),
        };
    }

    static error(message: string, details?: any) {
        return {
            success: false,
            error: {
                message,
                ...(process.env.NODE_ENV === 'development' && details && { details }),
            },
            timestamp: new Date().toISOString(),
        };
    }

    static paginated<T>(
        data: T[],
        page: number,
        limit: number,
        total: number
    ) {
        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            },
            timestamp: new Date().toISOString(),
        };
    }

    static created<T>(data: T, message = 'Resource created successfully') {
        return {
            success: true,
            data,
            message,
            timestamp: new Date().toISOString(),
        };
    }

    static noContent() {
        return {
            success: true,
            message: 'Operation completed successfully',
            timestamp: new Date().toISOString(),
        };
    }
}