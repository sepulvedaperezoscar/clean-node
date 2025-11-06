

import { GetProductsByCategoryUseCase } from '@domain/usecase/product/get-products-by-category.usecase';
import { ProductRepository } from '@domain/model/product/product.repository';
import { Product } from '@domain/model/product/product.entity';

describe('GetProductsByCategoryUseCase', () => {
    let useCase: GetProductsByCategoryUseCase;
    let productRepository: ProductRepository;

    const mockCategory = 'Electronics';

    const mockProducts: Product[] = [
        {
            id: 'p1',
            name: 'Laptop',
            description: 'A high-end laptop',
            price: 999.99,
            stock: 50,
            category: mockCategory,
            userId: 'u1',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'p2',
            name: 'Mouse',
            description: 'Wireless mouse',
            price: 19.99,
            stock: 0, // Este no está en stock
            category: mockCategory,
            userId: 'u1',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'p3',
            name: 'Keyboard',
            description: 'Mechanical keyboard',
            price: 45.00,
            stock: 10,
            category: mockCategory,
            userId: 'u1',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    // Lista esperada cuando se filtra por stock
    const mockProductsInStock: Product[] = [mockProducts[0], mockProducts[2]];

    beforeEach(() => {
        jest.clearAllMocks();

        productRepository = {
            findByCategory: jest.fn().mockResolvedValue(mockProducts), // Por defecto, devuelve la lista completa
            findById: jest.fn(), findByUserId: jest.fn(), findAll: jest.fn(),
            save: jest.fn(), update: jest.fn(), delete: jest.fn(), updateStock: jest.fn(),
        };

        useCase = new GetProductsByCategoryUseCase(productRepository);
    });

    it('should return all products in a category by default (onlyInStock = false)', async () => {
        const result = await useCase.execute(mockCategory);

        expect(productRepository.findByCategory).toHaveBeenCalledWith(mockCategory);

        expect(result).toEqual(mockProducts);
        expect(result.length).toBe(3);
    });

    it('should return only in-stock products when onlyInStock is true', async () => {
        const result = await useCase.execute(mockCategory, true); // Pasar true para filtrar

        expect(productRepository.findByCategory).toHaveBeenCalledWith(mockCategory);

        expect(result).toEqual(mockProductsInStock);
        expect(result.length).toBe(2);
        expect(result.every(p => p.stock > 0)).toBe(true);
    });


    it('should return an empty array if no products are found in the category', async () => {

        (productRepository.findByCategory as jest.Mock).mockResolvedValue([]);

        const result = await useCase.execute('NonExistentCategory');

        expect(result).toEqual([]);
    });

    it('should handle repository errors gracefully', async () => {
        const mockError = new Error('Database connection failed');

        (productRepository.findByCategory as jest.Mock).mockRejectedValue(mockError);

        await expect(useCase.execute(mockCategory)).rejects.toThrow('Database connection failed');
    });
});