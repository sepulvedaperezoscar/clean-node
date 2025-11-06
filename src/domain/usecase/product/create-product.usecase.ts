
import { ProductRepository } from '@domain/model/product/product.repository';
import { Product, ProductEntity } from '@domain/model/product/product.entity';
import { UserRepository } from '@domain/model/user/user.repository';

export interface CreateProductCommand {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    userId: string;
}

/**
 * Caso de uso: Crear Producto
 * - Valida que el usuario exista
 * - Valida la entidad de producto
 * - Persiste el producto
 */
export class CreateProductUseCase {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly userRepository: UserRepository
    ) { }

    async execute(command: CreateProductCommand): Promise<Product> {

        const user = await this.userRepository.findById(command.userId);

        if (!user) {
            throw new Error('User not found');
        }

        const product = ProductEntity.create(command);

        product.validate();

        const savedProduct = await this.productRepository.save(product);

        return savedProduct;
    }
}