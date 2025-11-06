


import { Request, Response, NextFunction } from 'express';
import {
    CreateProductUseCase,
    GetProductUseCase,
    GetProductsByCategoryUseCase,
    UpdateStockUseCase,
    ListProductsUseCase,
} from '@domain/usecase/product';
import { Logger, ResponseFormatter } from '@infrastructure/helpers';

export class ProductController {
    private logger: Logger;

    constructor(
        private readonly createProductUseCase: CreateProductUseCase,
        private readonly getProductUseCase: GetProductUseCase,
        private readonly getProductsByCategoryUseCase: GetProductsByCategoryUseCase,
        private readonly updateStockUseCase: UpdateStockUseCase,
        private readonly listProductsUseCase: ListProductsUseCase
    ) {
        this.logger = new Logger('ProductController');
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.logger.info('Creating new product', { name: req.body.name });

            const productData = {
                ...req.body,
                userId: req.body.userId || 'system',
            };

            const product = await this.createProductUseCase.execute(productData);

            this.logger.info('Product created successfully', { productId: product.id });

            res.status(201).json(
                ResponseFormatter.created(product, 'Product created successfully')
            );
        } catch (error) {
            this.logger.error('Error creating product', error);
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            this.logger.info('Getting product by id', { productId: id });

            const product = await this.getProductUseCase.execute(id);

            res.status(200).json(ResponseFormatter.success(product));
        } catch (error) {
            this.logger.error('Error getting product', error);
            next(error);
        }
    }

    async getByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { category } = req.params;
            const onlyInStock = req.query.inStock === 'true';

            this.logger.info('Getting products by category', { category, onlyInStock });

            const products = await this.getProductsByCategoryUseCase.execute(category, onlyInStock);

            res.status(200).json(
                ResponseFormatter.success(products, `Found ${products.length} products`)
            );
        } catch (error) {
            this.logger.error('Error getting products', error);
            next(error);
        }
    }

    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = {
                minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
                category: req.query.category as string | undefined,
                inStock: req.query.inStock === 'true' ? true : undefined,
                userId: req.query.userId as string | undefined,
            };

            this.logger.info('Listing products', filters);

            const products = await this.listProductsUseCase.execute(filters);

            res.status(200).json(
                ResponseFormatter.success(products, `Found ${products.length} products`)
            );
        } catch (error) {
            this.logger.error('Error listing products', error);
            next(error);
        }
    }

    async updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { quantity } = req.body;

            this.logger.info('Updating product stock', { productId: id, quantity });

            const product = await this.updateStockUseCase.execute(id, quantity);

            res.status(200).json(
                ResponseFormatter.success(product, 'Stock updated successfully')
            );
        } catch (error) {
            this.logger.error('Error updating stock', error);
            next(error);
        }
    }
}