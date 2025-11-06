


import { GetProductUseCase } from '@domain/usecase/product/get-product.usecase';
import { ProductRepository } from '@domain/model/product/product.repository';
import { Product } from '@domain/model/product/product.entity';

describe('GetProductUseCase', () => {
    let useCase: GetProductUseCase;
    let productRepository: ProductRepository;

    const mockProductId = 'p123';

    const mockProductDomain: Product = {
        id: mockProductId,
        name: 'Test Product',
        description: 'A product for testing',
        price: 99.99,
        stock: 50,
        category: 'Electronics',
        userId: 'u1',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        productRepository = {
            findById: jest.fn().mockResolvedValue(mockProductDomain), // Por defecto, encuentra el producto
            findByCategory: jest.fn(),
            findByUserId: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            updateStock: jest.fn(),
        };

        useCase = new GetProductUseCase(productRepository);
    });

    it('should return the product entity if found', async () => {
        const result = await useCase.execute(mockProductId);

        expect(productRepository.findById).toHaveBeenCalledWith(mockProductId);

        expect(result).toEqual(mockProductDomain);
    });

    it('should throw an error if the product is not found', async () => {

        (productRepository.findById as jest.Mock).mockResolvedValue(null);

        await expect(useCase.execute('p999')).rejects.toThrow('Product not found');

        await expect((productRepository.findById as jest.Mock).mock.results[0].value).resolves.toBeNull();
    });

    it('should handle repository errors gracefully during findById', async () => {
        const mockError = new Error('Database connection failed');
        (productRepository.findById as jest.Mock).mockRejectedValue(mockError);

        await expect(useCase.execute(mockProductId)).rejects.toThrow('Database connection failed');
    });
});