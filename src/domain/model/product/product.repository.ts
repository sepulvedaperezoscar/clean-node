

import { Product } from './product.entity';


export interface ProductRepository {
    findById(id: string): Promise<Product | null>;
    findByCategory(category: string): Promise<Product[]>;
    findByUserId(userId: string): Promise<Product[]>;
    findAll(filters?: FindProductsFilters): Promise<Product[]>;
    save(product: Product): Promise<Product>;
    update(id: string, product: Partial<Product>): Promise<Product>;
    delete(id: string): Promise<void>;
    updateStock(id: string, quantity: number): Promise<Product>;
}

export interface FindProductsFilters {
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    inStock?: boolean;
    userId?: string;
}