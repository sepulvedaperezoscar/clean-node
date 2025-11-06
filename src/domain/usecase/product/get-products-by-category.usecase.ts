

import { ProductRepository } from '@domain/model/product/product.repository';
import { Product } from '@domain/model/product/product.entity';

/**
 * Caso de uso: Obtener Productos por Categoría
 * Opcionalmente solo los que tienen stock
 */
export class GetProductsByCategoryUseCase {
    constructor(private readonly productRepository: ProductRepository) { }

    async execute(category: string, onlyInStock = false): Promise<Product[]> {
        const products = await this.productRepository.findByCategory(category);

        if (onlyInStock) {
            return products.filter(product => product.stock > 0);
        }

        return products;
    }
}