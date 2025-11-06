


import { container } from './dependency-injection';
import { Logger } from '@infrastructure/helpers';

// Repositories
import { UserRepositoryAdapter } from '@infrastructure/driven-adapters/database/user';
import { ProductRepositoryAdapter } from '@infrastructure/driven-adapters/database/product';

// Use Cases - User
import {
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
} from '@domain/usecase/user';

// Use Cases - Product
import {
    CreateProductUseCase,
    GetProductUseCase,
    GetProductsByCategoryUseCase,
    UpdateStockUseCase,
    ListProductsUseCase,
} from '@domain/usecase/product';

// Controllers
import { UserController } from '@infrastructure/entry-points/api-rest/user';
import { ProductController } from '@infrastructure/entry-points/api-rest/product';

const logger = new Logger('Bootstrap');

/**
 * Configura todas las dependencias de la aplicación
 * Este es el único lugar donde se crean las instancias concretas
 * Siguiendo el principio de Inversión de Dependencias
 */
export function setupDependencies(): void {
    logger.info('🔧 Setting up dependencies...');

    // ==================== REPOSITORIES ====================
    logger.debug('Registering repositories...');

    const userRepository = new UserRepositoryAdapter();
    const productRepository = new ProductRepositoryAdapter();

    container.register('userRepository', userRepository);
    container.register('productRepository', productRepository);

    logger.debug('✅ Repositories registered');

    // ==================== USE CASES - USER ====================
    logger.debug('Registering user use cases...');

    const createUserUseCase = new CreateUserUseCase(userRepository);
    const getUserUseCase = new GetUserUseCase(userRepository);
    const listUsersUseCase = new ListUsersUseCase(userRepository);
    const updateUserUseCase = new UpdateUserUseCase(userRepository);
    const deleteUserUseCase = new DeleteUserUseCase(userRepository);

    container.register('createUserUseCase', createUserUseCase);
    container.register('getUserUseCase', getUserUseCase);
    container.register('listUsersUseCase', listUsersUseCase);
    container.register('updateUserUseCase', updateUserUseCase);
    container.register('deleteUserUseCase', deleteUserUseCase);

    logger.debug('✅ User use cases registered');

    // ==================== USE CASES - PRODUCT ====================
    logger.debug('Registering product use cases...');

    const createProductUseCase = new CreateProductUseCase(
        productRepository,
        userRepository
    );
    const getProductUseCase = new GetProductUseCase(productRepository);
    const getProductsByCategoryUseCase = new GetProductsByCategoryUseCase(
        productRepository
    );
    const updateStockUseCase = new UpdateStockUseCase(productRepository);
    const listProductsUseCase = new ListProductsUseCase(productRepository);

    container.register('createProductUseCase', createProductUseCase);
    container.register('getProductUseCase', getProductUseCase);
    container.register('getProductsByCategoryUseCase', getProductsByCategoryUseCase);
    container.register('updateStockUseCase', updateStockUseCase);
    container.register('listProductsUseCase', listProductsUseCase);

    logger.debug('✅ Product use cases registered');

    // ==================== CONTROLLERS ====================
    logger.debug('Registering controllers...');

    const userController = new UserController(
        createUserUseCase,
        getUserUseCase,
        listUsersUseCase,
        updateUserUseCase,
        deleteUserUseCase
    );

    const productController = new ProductController(
        createProductUseCase,
        getProductUseCase,
        getProductsByCategoryUseCase,
        updateStockUseCase,
        listProductsUseCase
    );

    container.register('userController', userController);
    container.register('productController', productController);

    logger.debug('✅ Controllers registered');

    // ==================== SUMMARY ====================
    logger.info('✅ Dependencies configured successfully');
    logger.info(`📦 Total dependencies registered: ${container.list().length}`);

    if (process.env.NODE_ENV === 'development') {
        logger.debug('Registered dependencies:', container.list());
    }
}

/**
 * Limpia todas las dependencias
 * Útil para tests o para reiniciar la aplicación
 */
export function clearDependencies(): void {
    logger.info('Clearing all dependencies...');
    container.clear();
    logger.info('✅ Dependencies cleared');
}