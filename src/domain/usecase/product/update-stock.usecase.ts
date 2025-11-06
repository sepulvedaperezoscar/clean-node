
import { ProductRepository } from '@domain/model';
import { Product, ProductEntity } from '@domain/model';

/**
 * Caso de uso: Actualizar Stock de Producto
 * Permite incrementar o decrementar el stock
 * quantity > 0: incrementa
 * quantity < 0: decrementa
 */
export class UpdateStockUseCase {
    constructor(private readonly productRepository: ProductRepository) { }

    async execute(productId: string, quantity: number): Promise<Product> {

        const product = await this.productRepository.findById(productId);

        if (!product) {
            throw new Error('Product not found');
        }

        const productEntity = new ProductEntity(
            product.id,
            product.name,
            product.description,
            product.price,
            product.stock,
            product.category,
            product.userId,
            product.createdAt,
            product.updatedAt
        );

        if (quantity > 0) {
            productEntity.increaseStock(quantity);
        } else if (quantity < 0) {
            productEntity.reduceStock(Math.abs(quantity));
        } else {
            throw new Error('Quantity cannot be zero');
        }

        const updatedProduct = await this.productRepository.updateStock(productId, quantity);

        return updatedProduct;
    }
}