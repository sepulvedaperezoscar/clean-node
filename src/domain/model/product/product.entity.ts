

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export class ProductEntity implements Product {
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public price: number,
        public stock: number,
        public category: string,
        public userId: string,
        public createdAt: Date,
        public updatedAt: Date
    ) { }

    static create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): ProductEntity {
        const product = new ProductEntity(
            crypto.randomUUID(),
            data.name,
            data.description,
            data.price,
            data.stock,
            data.category,
            data.userId,
            new Date(),
            new Date()
        );
        product.validate();
        return product;
    }

    validate(): void {
        if (this.price <= 0) {
            throw new Error('Price must be greater than 0');
        }
        if (this.stock < 0) {
            throw new Error('Stock cannot be negative');
        }
        if (this.name.length < 3) {
            throw new Error('Name must be at least 3 characters');
        }
    }

    isAvailable(): boolean {
        return this.stock > 0;
    }

    reduceStock(quantity: number): void {
        if (quantity <= 0) {
            throw new Error('Quantity must be positive');
        }
        if (quantity > this.stock) {
            throw new Error('Insufficient stock');
        }
        this.stock -= quantity;
        this.updatedAt = new Date();
    }

    increaseStock(quantity: number): void {
        if (quantity <= 0) {
            throw new Error('Quantity must be positive');
        }
        this.stock += quantity;
        this.updatedAt = new Date();
    }

    updatePrice(newPrice: number): void {
        if (newPrice <= 0) {
            throw new Error('Price must be greater than 0');
        }
        this.price = newPrice;
        this.updatedAt = new Date();
    }
}