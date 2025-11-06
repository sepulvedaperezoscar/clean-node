

import { Product } from '@domain/model/product/product.entity';
import { ProductORM } from '../entities/product.entity.orm';


export class ProductMapper {

    static toDomain(ormEntity: ProductORM): Product {
        return {
            id: ormEntity.id,
            name: ormEntity.name,
            description: ormEntity.description,
            price: parseFloat(ormEntity.price.toString()), // Convertir Decimal a number
            stock: ormEntity.stock,
            category: ormEntity.category,
            userId: ormEntity.userId,
            createdAt: ormEntity.createdAt,
            updatedAt: ormEntity.updatedAt,
        };
    }

    static toORM(domainEntity: Product): ProductORM {
        const ormEntity = new ProductORM();
        ormEntity.id = domainEntity.id;
        ormEntity.name = domainEntity.name;
        ormEntity.description = domainEntity.description;
        ormEntity.price = domainEntity.price;
        ormEntity.stock = domainEntity.stock;
        ormEntity.category = domainEntity.category;
        ormEntity.userId = domainEntity.userId;
        ormEntity.createdAt = domainEntity.createdAt;
        ormEntity.updatedAt = domainEntity.updatedAt;
        return ormEntity;
    }

    static toDomainList(ormEntities: ProductORM[]): Product[] {
        return ormEntities.map(entity => this.toDomain(entity));
    }

    /**
     * Actualiza una entidad ORM con datos del dominio
     */
    static updateORM(ormEntity: ProductORM, domainData: Partial<Product>): ProductORM {
        if (domainData.name !== undefined) ormEntity.name = domainData.name;
        if (domainData.description !== undefined) ormEntity.description = domainData.description;
        if (domainData.price !== undefined) ormEntity.price = domainData.price;
        if (domainData.stock !== undefined) ormEntity.stock = domainData.stock;
        if (domainData.category !== undefined) ormEntity.category = domainData.category;
        if (domainData.userId !== undefined) ormEntity.userId = domainData.userId;
        ormEntity.updatedAt = new Date();
        return ormEntity;
    }
}