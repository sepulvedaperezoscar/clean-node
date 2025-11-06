

import { ProductRepository, FindProductsFilters } from '@domain/model';
import { Product } from '@domain/model';

/**
 * Caso de uso: Listar Productos
 * Permite filtrar por precio, categoría, stock, etc.
 */
export class ListProductsUseCase {
    constructor(private readonly productRepository: ProductRepository) { }

    async execute(filters?: FindProductsFilters): Promise<Product[]> {
        const products = await this.productRepository.findAll(filters);
        return products;
    }
}