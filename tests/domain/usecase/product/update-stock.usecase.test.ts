


import { UpdateStockUseCase } from '@domain/usecase/product/update-stock.usecase';
import { ProductRepository } from '@domain/model/product/product.repository';
import { Product, ProductEntity } from '@domain/model/product/product.entity';

jest.mock('@domain/model/product/product.entity');

describe('UpdateStockUseCase', () => {
    let useCase: UpdateStockUseCase;
    let productRepository: ProductRepository;
    let productEntityMockInstance: any;

    const mockProductId = 'p123';
    const initialStock = 50;
    const mockUserDomain: any = { id: 'u1' };

    const mockExistingProductDomain: Product = {
        id: mockProductId,
        name: 'Laptop',
        description: 'A high-end gaming laptop',
        price: 999.99,
        stock: initialStock,
        category: 'Electronics',
        userId: mockUserDomain.id,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    };

    const mockUpdatedProductDomain: Product = {
        ...mockExistingProductDomain,
        stock: initialStock + 10,
        updatedAt: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        productRepository = {
            findById: jest.fn().mockResolvedValue(mockExistingProductDomain), // Por defecto, encuentra el producto existente
            updateStock: jest.fn().mockResolvedValue(mockUpdatedProductDomain), // Por defecto, updateStock devuelve el producto actualizado
            findByCategory: jest.fn(), findByUserId: jest.fn(), findAll: jest.fn(),
            save: jest.fn(), update: jest.fn(), delete: jest.fn(),
        };

        productEntityMockInstance = {
            ...mockExistingProductDomain,
            increaseStock: jest.fn(),
            reduceStock: jest.fn(),
        };

        (ProductEntity as unknown as jest.Mock).mockImplementation(() => productEntityMockInstance);

        useCase = new UpdateStockUseCase(productRepository);
    });

    it('should successfully increase stock when quantity is positive', async () => {
        const quantityToAdd = 10;

        const result = await useCase.execute(mockProductId, quantityToAdd);

        expect(productRepository.findById).toHaveBeenCalledWith(mockProductId);

        expect(productEntityMockInstance.increaseStock).toHaveBeenCalledWith(quantityToAdd);

        expect(productRepository.updateStock).toHaveBeenCalledWith(mockProductId, quantityToAdd);

        expect(result).toEqual(mockUpdatedProductDomain);
    });

    it('should successfully decrease stock when quantity is negative', async () => {
        const quantityToRemove = -10;

        await useCase.execute(mockProductId, quantityToRemove);

        expect(productEntityMockInstance.reduceStock).toHaveBeenCalledWith(10);

        expect(productRepository.updateStock).toHaveBeenCalledWith(mockProductId, quantityToRemove);
    });


    it('should throw an error if the product is not found', async () => {
        (productRepository.findById as jest.Mock).mockResolvedValue(null);

        await expect(useCase.execute('p999', 10)).rejects.toThrow('Product not found');

        expect(productEntityMockInstance.increaseStock).not.toHaveBeenCalled();
        expect(productRepository.updateStock).not.toHaveBeenCalled();
    });

    it('should throw an error if quantity is zero', async () => {
        await expect(useCase.execute(mockProductId, 0)).rejects.toThrow('Quantity cannot be zero');

        expect(productEntityMockInstance.increaseStock).not.toHaveBeenCalled();
        expect(productRepository.updateStock).not.toHaveBeenCalled();
    });

    it('should handle stock validation errors thrown by the entity methods', async () => {
        const mockValidationError = new Error('Stock cannot be negative');

        // Configurar reduceStock para que lance un error (simulando stock insuficiente)
        (productEntityMockInstance.reduceStock as jest.Mock).mockImplementation(() => {
            throw mockValidationError;
        });

        await expect(useCase.execute(mockProductId, -60)).rejects.toThrow('Stock cannot be negative');

        expect(productRepository.updateStock).not.toHaveBeenCalled();
    });

    it('should handle repository errors during findById', async () => {
        const mockError = new Error('Database timeout');
        (productRepository.findById as jest.Mock).mockRejectedValue(mockError);

        await expect(useCase.execute(mockProductId, 10)).rejects.toThrow('Database timeout');
        expect(productRepository.updateStock).not.toHaveBeenCalled();
    });

    it('should handle repository errors during updateStock', async () => {
        const mockError = new Error('Database disconnected during save');
        (productRepository.updateStock as jest.Mock).mockRejectedValue(mockError);

        await expect(useCase.execute(mockProductId, 10)).rejects.toThrow('Database disconnected during save');
    });
});