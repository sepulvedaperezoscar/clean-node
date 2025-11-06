

import { CreateProductUseCase, CreateProductCommand } from '@domain/usecase/product/create-product.usecase';
import { ProductRepository } from '@domain/model/product/product.repository';
import { Product, ProductEntity } from '@domain/model/product/product.entity';
import { UserRepository } from '@domain/model/user/user.repository';
import { User } from '@domain/model/user/user.entity';

jest.mock('@domain/model/product/product.entity');

describe('CreateProductUseCase', () => {
    let useCase: CreateProductUseCase;
    let productRepository: ProductRepository;
    let userRepository: UserRepository;
    let productEntityMockInstance: any;

    const mockCommand: CreateProductCommand = {
        name: 'Laptop',
        description: 'A test laptop',
        price: 999.99,
        stock: 50,
        category: 'Electronics',
        userId: 'u123',
    };

    const mockUserDomain: User = {
        id: 'u123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword', role: 'user', isActive: true,
        createdAt: new Date(), updatedAt: new Date(),
    };

    const mockProductDomain: Product = {
        id: 'p1',
        ...mockCommand,
        createdAt: new Date(),
        updatedAt: new Date(),
    };


    beforeEach(() => {
        jest.clearAllMocks();

        userRepository = {
            findById: jest.fn().mockResolvedValue(mockUserDomain), // Por defecto, el usuario existe
            findByEmail: jest.fn(), save: jest.fn(), findAll: jest.fn(),
            update: jest.fn(), delete: jest.fn(), count: jest.fn(),
        };

        productRepository = {
            save: jest.fn().mockResolvedValue(mockProductDomain),
            findById: jest.fn(), findByCategory: jest.fn(), findByUserId: jest.fn(),
            findAll: jest.fn(), update: jest.fn(), delete: jest.fn(), updateStock: jest.fn(),
        };

        productEntityMockInstance = {
            ...mockProductDomain,
            validate: jest.fn(),
        };
        (ProductEntity.create as jest.Mock).mockReturnValue(productEntityMockInstance);
        jest.spyOn(ProductEntity.prototype, 'validate').mockImplementation(() => { });

        useCase = new CreateProductUseCase(productRepository, userRepository);
    });

    it('should create a product successfully and return the product entity', async () => {
        const result = await useCase.execute(mockCommand);

        expect(userRepository.findById).toHaveBeenCalledWith(mockCommand.userId);

        expect(ProductEntity.create).toHaveBeenCalledWith(mockCommand);

        expect(productEntityMockInstance.validate).toHaveBeenCalled();

        expect(productRepository.save).toHaveBeenCalledWith(productEntityMockInstance);

        expect(result).toEqual(mockProductDomain);
    });

    it('should throw an error if the user (seller) is not found', async () => {

        (userRepository.findById as jest.Mock).mockResolvedValue(null);

        await expect(useCase.execute(mockCommand)).rejects.toThrow('User not found');

        expect(ProductEntity.create).not.toHaveBeenCalled();
        expect(productRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if validation fails', async () => {
        const mockValidationError = new Error('Price cannot be negative');

        (productEntityMockInstance.validate as jest.Mock).mockImplementation(() => {
            throw mockValidationError;
        });

        await expect(useCase.execute(mockCommand)).rejects.toThrow('Price cannot be negative');

        expect(productRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors during save', async () => {
        const mockError = new Error('Database disconnected');
        (productRepository.save as jest.Mock).mockRejectedValue(mockError);

        await expect(useCase.execute(mockCommand)).rejects.toThrow('Database disconnected');
    });

    it('should handle repository errors during findById', async () => {
        const mockError = new Error('Database timeout');
        (userRepository.findById as jest.Mock).mockRejectedValue(mockError);

        await expect(useCase.execute(mockCommand)).rejects.toThrow('Database timeout');
        expect(productRepository.save).not.toHaveBeenCalled();
    });
});