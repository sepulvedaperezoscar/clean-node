

import { Repository } from 'typeorm';

import { ProductRepository, FindProductsFilters } from '@domain/model/product/product.repository';
import { Product } from '@domain/model/product/product.entity';

import { AppDataSource } from '@application/config/datasource';

import { ProductORM } from '../entities/product.entity.orm';
import { ProductMapper } from '../mappers/product.mapper';


export class ProductRepositoryAdapter implements ProductRepository {
    private repository: Repository<ProductORM>;

    constructor() {
        this.repository = AppDataSource.getRepository(ProductORM);
    }

    async findById(id: string): Promise<Product | null> {
        try {
            const productORM = await this.repository.findOne({ where: { id } });
            return productORM ? ProductMapper.toDomain(productORM) : null;
        } catch (error) {
            console.error('Error finding product by id:', error);
            throw new Error(`Failed to find product: ${error}`);
        }
    }

    async findByCategory(category: string): Promise<Product[]> {
        try {
            const productsORM = await this.repository.find({
                where: { category },
                order: { createdAt: 'DESC' },
            });
            return ProductMapper.toDomainList(productsORM);
        } catch (error) {
            console.error('Error finding products by category:', error);
            throw new Error(`Failed to find products: ${error}`);
        }
    }

    async findByUserId(userId: string): Promise<Product[]> {
        try {
            const productsORM = await this.repository.find({
                where: { userId },
                order: { createdAt: 'DESC' },
            });
            return ProductMapper.toDomainList(productsORM);
        } catch (error) {
            console.error('Error finding products by user id:', error);
            throw new Error(`Failed to find products: ${error}`);
        }
    }

    async findAll(filters?: FindProductsFilters): Promise<Product[]> {
        try {
            const queryBuilder = this.repository.createQueryBuilder('product');

            if (filters?.minPrice !== undefined) {
                queryBuilder.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
            }

            if (filters?.maxPrice !== undefined) {
                queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
            }

            if (filters?.category) {
                queryBuilder.andWhere('product.category = :category', { category: filters.category });
            }

            if (filters?.inStock) {
                queryBuilder.andWhere('product.stock > 0');
            }

            if (filters?.userId) {
                queryBuilder.andWhere('product.userId = :userId', { userId: filters.userId });
            }

            queryBuilder.orderBy('product.createdAt', 'DESC');

            const productsORM = await queryBuilder.getMany();
            return ProductMapper.toDomainList(productsORM);
        } catch (error) {
            console.error('Error finding all products:', error);
            throw new Error(`Failed to find products: ${error}`);
        }
    }

    async save(product: Product): Promise<Product> {
        try {
            const productORM = ProductMapper.toORM(product);
            const savedProductORM = await this.repository.save(productORM);
            return ProductMapper.toDomain(savedProductORM);
        } catch (error: any) {
            console.error('Error saving product:', error);
            throw new Error(`Failed to save product: ${error.message}`);
        }
    }

    async update(id: string, productData: Partial<Product>): Promise<Product> {
        try {
            const productORM = await this.repository.findOne({ where: { id } });

            if (!productORM) {
                throw new Error('Product not found');
            }

            const updatedProductORM = ProductMapper.updateORM(productORM, productData);
            const savedProductORM = await this.repository.save(updatedProductORM);

            return ProductMapper.toDomain(savedProductORM);
        } catch (error: any) {
            console.error('Error updating product:', error);

            if (error.message === 'Product not found') {
                throw error;
            }

            throw new Error(`Failed to update product: ${error.message}`);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const result = await this.repository.delete(id);

            if (result.affected === 0) {
                throw new Error('Product not found');
            }
        } catch (error: any) {
            console.error('Error deleting product:', error);

            if (error.message === 'Product not found') {
                throw error;
            }

            throw new Error(`Failed to delete product: ${error.message}`);
        }
    }

    async updateStock(id: string, quantity: number): Promise<Product> {
        try {
            const productORM = await this.repository.findOne({ where: { id } });

            if (!productORM) {
                throw new Error('Product not found');
            }

            productORM.stock += quantity;

            if (productORM.stock < 0) {
                throw new Error('Stock cannot be negative');
            }

            productORM.updatedAt = new Date();
            const savedProductORM = await this.repository.save(productORM);

            return ProductMapper.toDomain(savedProductORM);
        } catch (error: any) {
            console.error('Error updating product stock:', error);
            throw error;
        }
    }
}