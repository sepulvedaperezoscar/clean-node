// product.repository.adapter.test.ts

import { Repository, SelectQueryBuilder, DeleteResult } from 'typeorm';

import { ProductRepositoryAdapter } from '@infrastructure/driven-adapters/database/product';
import { ProductMapper } from '@infrastructure/driven-adapters/database/product';
import { ProductORM } from '@infrastructure/driven-adapters/database/product';

import { Product } from '@domain/model/product';
import { FindProductsFilters } from '@domain/model/product';

import { AppDataSource } from '@application/config/datasource';


jest.mock('@application/config/datasource');
jest.mock('@infrastructure/driven-adapters/database/mappers/product.mapper');

const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
} as unknown as Repository<ProductORM>;

const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
} as unknown as SelectQueryBuilder<ProductORM>;

const mockProductDomain: Product = {
    id: 'p1',
    name: 'Test Product',
    description: 'A product for testing',
    price: 10.50,
    stock: 50,
    category: 'Electronics',
    userId: 'u1',
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockProductORM: ProductORM = {
    id: 'p1',
    name: 'Test Product',
    description: 'A product for testing',
    price: 10.50,
    stock: 50,
    category: 'Electronics',
    userId: 'u1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: undefined as any, // Relación no necesaria para los tests
};


describe('ProductRepositoryAdapter', () => {
    let adapter: ProductRepositoryAdapter;

    beforeEach(() => {
        jest.clearAllMocks();

        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
        (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

        (ProductMapper.toDomain as jest.Mock).mockReturnValue(mockProductDomain);
        (ProductMapper.toDomainList as jest.Mock).mockReturnValue([mockProductDomain]);
        (ProductMapper.toORM as jest.Mock).mockReturnValue(mockProductORM);
        (ProductMapper.updateORM as jest.Mock).mockReturnValue(mockProductORM);

        adapter = new ProductRepositoryAdapter();
    });

    describe('findById', () => {
        it('should return a product if found', async () => {
            (mockRepository.findOne as jest.Mock).mockResolvedValue(mockProductORM);
            await expect(adapter.findById('p1')).resolves.toEqual(mockProductDomain);
        });

        it('should return null if product not found', async () => {
            (mockRepository.findOne as jest.Mock).mockResolvedValue(null);
            await expect(adapter.findById('p99')).resolves.toBeNull();
        });

        it('should wrap and throw an error on database failure during findOne', async () => {
            const mockError = new Error('DB connection lost');
            (mockRepository.findOne as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.findById('p1')).rejects.toThrow('Failed to find product: Error: DB connection lost');
            expect(console.error).toHaveBeenCalled(); // Verifica que el error fue logueado
        });
    });

    describe('findByCategory', () => {
        it('should return products for a given category', async () => {
            (mockRepository.find as jest.Mock).mockResolvedValue([mockProductORM]);
            await expect(adapter.findByCategory('Electronics')).resolves.toEqual([mockProductDomain]);
        });

        it('should return an empty array if no products are found in category', async () => {
            (mockRepository.find as jest.Mock).mockResolvedValue([]);
            (ProductMapper.toDomainList as jest.Mock).mockReturnValue([]);
            await expect(adapter.findByCategory('NonExistent')).resolves.toEqual([]);
        });

        it('should wrap and throw an error on database failure during findByCategoryId', async () => {
            const mockError = new Error('Syntax error in SQL');
            (mockRepository.find as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.findByCategory('Electronics')).rejects.toThrow('Failed to find products: Error: Syntax error in SQL');
        });
    });

    describe('findByUserId', () => {
        it('should return products for a given user ID', async () => {
            (mockRepository.find as jest.Mock).mockResolvedValue([mockProductORM]);
            await expect(adapter.findByUserId('u1')).resolves.toEqual([mockProductDomain]);
        });

        it('should wrap and throw an error on database failure during findByUserId', async () => {
            const mockError = new Error('Server offline');
            (mockRepository.find as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.findByUserId('u1')).rejects.toThrow('Failed to find products: Error: Server offline');
        });
    });

    describe('findAll', () => {
        it('should return all products without filters', async () => {
            (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([mockProductORM]);
            await expect(adapter.findAll()).resolves.toEqual([mockProductDomain]);
        });

        it('should apply all filters correctly and return results', async () => {
            (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([mockProductORM]);
            const filters: FindProductsFilters = { minPrice: 1, maxPrice: 100, inStock: true };
            await adapter.findAll(filters);
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
        });

        it('should handle database errors during queryBuilder execution', async () => {
            const mockError = new Error('Query execution failed');
            (mockQueryBuilder.getMany as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.findAll()).rejects.toThrow('Failed to find products: Error: Query execution failed');
        });

        it('should handle errors if createQueryBuilder returns undefined/fails', async () => {
            (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(undefined);

            await expect(adapter.findAll()).rejects.toThrow(/Failed to find products/);
        });
    });

    describe('save', () => {
        it('should save a product and return the domain entity', async () => {
            (mockRepository.save as jest.Mock).mockResolvedValue(mockProductORM);
            await expect(adapter.save(mockProductDomain)).resolves.toEqual(mockProductDomain);
        });

        it('should handle generic database errors during save', async () => {
            const mockError = new Error('Disk full error');
            (mockRepository.save as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.save(mockProductDomain)).rejects.toThrow('Failed to save product: Disk full error');
        });

        it('should verify ProductMapper.toORM is called before save', async () => {
            (mockRepository.save as jest.Mock).mockResolvedValue(mockProductORM);
            await adapter.save(mockProductDomain);
            expect(ProductMapper.toORM).toHaveBeenCalledWith(mockProductDomain);
        });
    });

    describe('update', () => {
        it('should update a product and return the updated domain entity', async () => {
            (mockRepository.findOne as jest.Mock).mockResolvedValue(mockProductORM);
            (mockRepository.save as jest.Mock).mockResolvedValue(mockProductORM);
            await expect(adapter.update('p1', { price: 15.00 })).resolves.toEqual(mockProductDomain);
        });

        it('should throw "Product not found" if product does not exist before update attempt', async () => {
            (mockRepository.findOne as jest.Mock).mockResolvedValue(null);
            await expect(adapter.update('p99', {})).rejects.toThrow('Product not found');
            expect(mockRepository.save).not.toHaveBeenCalled();
        });

        it('should re-throw "Product not found" error if caught inside try/catch', async () => {
            (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

            await expect(adapter.update('p99', {})).rejects.toThrow('Product not found');
        });


        it('should handle generic database errors during save after finding the product', async () => {
            (mockRepository.findOne as jest.Mock).mockResolvedValue(mockProductORM);
            const mockError = new Error('Optimistic locking error');
            (mockRepository.save as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.update('p1', {})).rejects.toThrow('Failed to update product: Optimistic locking error');
        });
    });

    describe('delete', () => {
        it('should delete a product successfully', async () => {
            const mockDeleteResult: DeleteResult = { affected: 1, raw: {} };
            (mockRepository.delete as jest.Mock).mockResolvedValue(mockDeleteResult);
            await expect(adapter.delete('p1')).resolves.toBeUndefined();
        });

        it('should throw "Product not found" if no rows are affected (id does not exist)', async () => {
            const mockDeleteResult: DeleteResult = { affected: 0, raw: {} };
            (mockRepository.delete as jest.Mock).mockResolvedValue(mockDeleteResult);
            await expect(adapter.delete('p99')).rejects.toThrow('Product not found');
        });

        it('should re-throw "Product not found" error if caught inside try/catch', async () => {
            const mockDeleteResult: DeleteResult = { affected: 0, raw: {} };
            (mockRepository.delete as jest.Mock).mockResolvedValue(mockDeleteResult);

            await expect(adapter.delete('p99')).rejects.toThrow('Product not found');
        });

        it('should handle generic database errors during delete operation', async () => {
            const mockError = new Error('Permission denied');
            (mockRepository.delete as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.delete('p1')).rejects.toThrow('Failed to delete product: Permission denied');
        });
    });

    describe('updateStock', () => {
        it('should successfully update stock when quantity is valid', async () => {
            (mockRepository.findOne as jest.Mock).mockResolvedValue({ ...mockProductORM, stock: 60 });
            (mockRepository.save as jest.Mock).mockResolvedValue({ ...mockProductORM, stock: 70 });
            (ProductMapper.toDomain as jest.Mock).mockReturnValue({ ...mockProductDomain, stock: 70 });

            const result = await adapter.updateStock('p1', 10);
            expect(result.stock).toBe(70);
        });

        it('should throw "Product not found" if product does not exist during stock update', async () => {
            (mockRepository.findOne as jest.Mock).mockResolvedValue(null);
            await expect(adapter.updateStock('p99', 10)).rejects.toThrow('Product not found');
            expect(mockRepository.save).not.toHaveBeenCalled();
        });

        it('should throw "Stock cannot be negative" error if resulting stock is negative', async () => {
            (mockRepository.findOne as jest.Mock).mockResolvedValue({ ...mockProductORM, stock: 5 }); // Current stock is 5

            await expect(adapter.updateStock('p1', -10)).rejects.toThrow('Stock cannot be negative'); // Trying to remove 10
            expect(mockRepository.save).not.toHaveBeenCalled();
        });

        it('should handle generic database errors during stock update findOne stage', async () => {
            const mockError = new Error('Find failed');
            (mockRepository.findOne as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.updateStock('p1', 10)).rejects.toThrow('Find failed');
        });

        it('should handle generic database errors during stock update save stage', async () => {
            (mockRepository.findOne as jest.Mock).mockResolvedValue({ ...mockProductORM, stock: 50 });
            const mockError = new Error('Save failed');
            (mockRepository.save as jest.Mock).mockRejectedValue(mockError);

            await expect(adapter.updateStock('p1', 10)).rejects.toThrow('Save failed');
        });
    });
});
