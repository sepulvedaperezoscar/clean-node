
import { ProductRepository } from '@domain/model';
import { Product } from '@domain/model';

/**
 * Caso de uso: Obtener Producto por ID
 */
export class GetProductUseCase {
    constructor(private readonly productRepository: ProductRepository) { }

    async execute(productId: string): Promise<Product> {
        const product = await this.productRepository.findById(productId);

        if (!product) {
            throw new Error('Product not found');
        }

        return product;
    }
}