

// Configuración global para tests

beforeAll(() => {
    // Configurar variables de entorno para tests
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'test_db';
    process.env.DB_USER = 'postgres';
    process.env.DB_PASSWORD = 'postgres';
    process.env.JWT_SECRET = 'test-secret';
});

afterAll(() => {
    // Cleanup si es necesario
});

// Mock global de console para tests
global.console = {
    ...console,
    log: jest.fn(), // Silenciar logs en tests
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(), // Mantener errors visibles para debugging
};