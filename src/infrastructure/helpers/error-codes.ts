
/*
 * Códigos de error estandarizados para la aplicación
 */

export enum ErrorCode {
    // Errores de validación (400)
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INVALID_INPUT = 'INVALID_INPUT',

    // Errores de autenticación (401)
    UNAUTHORIZED = 'UNAUTHORIZED',
    INVALID_TOKEN = 'INVALID_TOKEN',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',

    // Errores de autorización (403)
    FORBIDDEN = 'FORBIDDEN',
    INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

    // Errores de recursos no encontrados (404)
    NOT_FOUND = 'NOT_FOUND',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',

    // Errores de conflicto (409)
    CONFLICT = 'CONFLICT',
    EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
    DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',

    // Errores de lógica de negocio (422)
    BUSINESS_ERROR = 'BUSINESS_ERROR',
    INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',

    // Errores del servidor (500)
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
}

export class AppError extends Error {
    constructor(
        public readonly code: ErrorCode,
        public readonly message: string,
        public readonly statusCode: number,
        public readonly details?: any
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}