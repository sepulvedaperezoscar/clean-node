

import { ListProductsUseCase } from '@domain/usecase/product/list-products.usecase';
import { ProductRepository, FindProductsFilters } from '@domain/model/product/product.repository';
import { Product } from '@domain/model/product/product.entity';

describe('ListProductsUseCase', () => {
    let useCase: ListProductsUseCase;
    let productRepository: ProductRepository;

    const mockProductDomain: Product = {
        id: 'p1',
        name: 'Laptop',
        description: 'A high-end gaming laptop',
        price: 999.99,
        stock: 50,
        category: 'Electronics',
        userId: 'u1',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockProductsList: Product[] = [mockProductDomain];

    beforeEach(() => {
        jest.clearAllMocks();

        productRepository = {
            findAll: jest.fn().mockResolvedValue(mockProductsList), // Por defecto, devuelve una lista con 1 producto
            findById: jest.fn(), findByCategory: jest.fn(), findByUserId: jest.fn(),
            save: jest.fn(), update: jest.fn(), delete: jest.fn(), updateStock: jest.fn(),
        };

        useCase = new ListProductsUseCase(productRepository);
    });

    it('should return a list of products when no filters are provided', async () => {
        const result = await useCase.execute();

        expect(productRepository.findAll).toHaveBeenCalledWith(undefined);

        expect(result).toEqual(mockProductsList);
        expect(result.length).toBe(1);
    });

    it('should pass all filters to the repository when provided', async () => {
        const filters: FindProductsFilters = {
            minPrice: 100,
            category: 'Electronics',
            inStock: true
        };

        await useCase.execute(filters);

        expect(productRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return an empty array if no products are found by the repository', async () => {

        (productRepository.findAll as jest.Mock).mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });

    it('should handle repository errors gracefully', async () => {
        const mockError = new Error('Database connection failed');
        (productRepository.findAll as jest.Mock).mockRejectedValue(mockError);

        await expect(useCase.execute()).rejects.toThrow('Database connection failed');
    });
});