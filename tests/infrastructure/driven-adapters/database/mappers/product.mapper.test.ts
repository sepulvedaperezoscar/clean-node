

import { ProductMapper } from '@infrastructure/driven-adapters/database/product/product.mapper';
import { ProductORM } from '@infrastructure/driven-adapters/database/product';

import { Product } from '@domain/model/product/product.entity';

describe('ProductMapper', () => {

    const mockProductORM: ProductORM = {
        id: 'p1',
        name: 'Laptop',
        description: 'A high-end gaming laptop',
        price: 999.99,
        stock: 50,
        category: 'Electronics',
        userId: 'u1',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
        user: undefined as any, // Ignorado en estos tests
    };

    const mockProductDomain: Product = {
        id: 'p1',
        name: 'Laptop',
        description: 'A high-end gaming laptop',
        price: 999.99,
        stock: 50,
        category: 'Electronics',
        userId: 'u1',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
    };

    describe('toDomain', () => {
        it('should map a ProductORM entity to a domain Product entity', () => {
            const domainProduct = ProductMapper.toDomain(mockProductORM);
            expect(domainProduct).toEqual(mockProductDomain);
            expect(domainProduct.createdAt).toBeInstanceOf(Date);
        });
    });

    describe('toORM', () => {
        it('should map a domain Product entity to a ProductORM entity', () => {
            const ormProduct = ProductMapper.toORM(mockProductDomain);
            expect(ormProduct).toEqual(mockProductORM);
            expect(ormProduct.createdAt).toBeInstanceOf(Date);
        });
    });

    describe('toDomainList', () => {
        it('should map an array of ProductORM entities to an array of domain Product entities', () => {
            const ormList = [mockProductORM, { ...mockProductORM, id: 'p2', name: 'Mouse' }];
            const domainListExpected = [mockProductDomain, { ...mockProductDomain, id: 'p2', name: 'Mouse' }];

            const domainList = ProductMapper.toDomainList(ormList);

            expect(domainList).toEqual(domainListExpected);
            expect(domainList.length).toBe(2);
        });
    });

    describe('updateORM', () => {
        it('should update an existing ORM entity with partial domain data', () => {
            const existingORM: ProductORM = { ...mockProductORM };
            const updateData: Partial<Product> = { price: 899.99, stock: 45 };

            const updatedORM = ProductMapper.updateORM(existingORM, updateData);

            expect(updatedORM.price).toBe(899.99);
            expect(updatedORM.stock).toBe(45);
            expect(updatedORM.id).toBe(existingORM.id); // ID should remain unchanged
        });

        it('should not change other fields when updating with partial data', () => {
            const existingORM: ProductORM = { ...mockProductORM };
            const updateData: Partial<Product> = { price: 899.99 };
            const updatedORM = ProductMapper.updateORM(existingORM, updateData);

            expect(updatedORM.name).toBe(existingORM.name);
            expect(updatedORM.category).toBe(existingORM.category);
        });
    });
});
