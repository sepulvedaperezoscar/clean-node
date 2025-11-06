


import { Request, Response, NextFunction } from 'express';
import { ProductController } from '@infrastructure/entry-points/api-rest';
import {
    CreateProductUseCase,
    GetProductUseCase,
    GetProductsByCategoryUseCase,
    UpdateStockUseCase,
    ListProductsUseCase
} from '@domain/usecase/product';
import { ResponseFormatter } from '@infrastructure/helpers';

jest.mock('@infrastructure/helpers/response-formatter');

const mockCreateProductUseCase = { execute: jest.fn() } as unknown as CreateProductUseCase;
const mockGetProductUseCase = { execute: jest.fn() } as unknown as GetProductUseCase;
const mockGetProductsByCategoryUseCase = { execute: jest.fn() } as unknown as GetProductsByCategoryUseCase;
const mockUpdateStockUseCase = { execute: jest.fn() } as unknown as UpdateStockUseCase;
const mockListProductsUseCase = { execute: jest.fn() } as unknown as ListProductsUseCase;

let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;
const mockNext: NextFunction = jest.fn();

describe('ProductController', () => {
    let controller: ProductController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new ProductController(
            mockCreateProductUseCase,
            mockGetProductUseCase,
            mockGetProductsByCategoryUseCase,
            mockUpdateStockUseCase,
            mockListProductsUseCase
        );

        mockRequest = { body: {}, params: {}, query: {} };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    // --- Create Product Tests ---
    describe('create', () => {
        it('should create a product successfully and return 201 status', async () => {
            const mockProductData = { id: 'p1', name: 'Laptop' };
            (mockCreateProductUseCase.execute as jest.Mock).mockResolvedValue(mockProductData);
            (ResponseFormatter.created as jest.Mock).mockReturnValue({ data: mockProductData });

            mockRequest.body = { name: 'Laptop', price: 1000, category: 'Elec' };

            await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockCreateProductUseCase.execute).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 'system' }) // Default userId should be applied
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ data: mockProductData });
        });

        it('should use provided userId if available in body', async () => {
            const mockProductData = { id: 'p1', name: 'Laptop', userId: 'u123' };
            (mockCreateProductUseCase.execute as jest.Mock).mockResolvedValue(mockProductData);

            mockRequest.body = { name: 'Laptop', userId: 'u123' };
            await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockCreateProductUseCase.execute).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 'u123' })
            );
        });

        it('should call next function on error during creation', async () => {
            const mockError = new Error('User not found');
            (mockCreateProductUseCase.execute as jest.Mock).mockRejectedValue(mockError);

            await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });

    // --- Get Product By Id Tests ---
    describe('getById', () => {
        it('should get a product successfully and return 200 status', async () => {
            const mockProduct = { id: 'p1', name: 'Laptop' };
            (mockGetProductUseCase.execute as jest.Mock).mockResolvedValue(mockProduct);
            (ResponseFormatter.success as jest.Mock).mockReturnValue({ data: mockProduct });

            mockRequest.params = { id: 'p1' };

            await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockGetProductUseCase.execute).toHaveBeenCalledWith('p1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ data: mockProduct });
        });

        it('should call next function if product is not found', async () => {
            const mockError = new Error('Product not found');
            (mockGetProductUseCase.execute as jest.Mock).mockRejectedValue(mockError);

            await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });

    // --- Get Products By Category Tests ---
    describe('getByCategory', () => {
        it('should get products by category without stock filter by default', async () => {
            const mockProducts = [{ id: 'p1' }];
            (mockGetProductsByCategoryUseCase.execute as jest.Mock).mockResolvedValue(mockProducts);

            mockRequest.params = { category: 'Electronics' };
            // Default: req.query.inStock is undefined

            await controller.getByCategory(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockGetProductsByCategoryUseCase.execute).toHaveBeenCalledWith('Electronics', false);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(ResponseFormatter.success).toHaveBeenCalledWith(mockProducts, expect.any(String));
        });

        it('should get products by category filtering in stock when inStock=true query param is set', async () => {
            const mockProducts = [{ id: 'p1', stock: 10 }];
            (mockGetProductsByCategoryUseCase.execute as jest.Mock).mockResolvedValue(mockProducts);

            mockRequest.params = { category: 'Electronics' };
            mockRequest.query = { inStock: 'true' }; // Set query param

            await controller.getByCategory(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockGetProductsByCategoryUseCase.execute).toHaveBeenCalledWith('Electronics', true);
        });

        it('should call next function on error during getByCategory', async () => {
            const mockError = new Error('DB error');
            (mockGetProductsByCategoryUseCase.execute as jest.Mock).mockRejectedValue(mockError);

            await controller.getByCategory(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });

    // --- List Products Tests ---
    describe('list', () => {
        it('should list products with correct filters and return 200 status', async () => {
            const mockProducts = [{ id: 'p1' }, { id: 'p2' }];
            (mockListProductsUseCase.execute as jest.Mock).mockResolvedValue(mockProducts);

            // Simulate query parameters of Express
            mockRequest.query = { minPrice: '10.5', category: 'Elec', inStock: 'true' };

            await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

            const expectedFilters = { minPrice: 10.5, category: 'Elec', inStock: true, maxPrice: undefined, userId: undefined };
            expect(mockListProductsUseCase.execute).toHaveBeenCalledWith(expectedFilters);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });

        it('should handle missing query params gracefully', async () => {
            (mockListProductsUseCase.execute as jest.Mock).mockResolvedValue([]);
            mockRequest.query = {}; // Empty query
            await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

            const expectedFilters = { minPrice: undefined, category: undefined, inStock: undefined, maxPrice: undefined, userId: undefined };
            expect(mockListProductsUseCase.execute).toHaveBeenCalledWith(expectedFilters);
        });
    });

    // --- Update Stock Tests ---
    describe('updateStock', () => {
        it('should update product stock successfully and return 200 status', async () => {
            const mockUpdatedProduct = { id: 'p1', stock: 60 };
            (mockUpdateStockUseCase.execute as jest.Mock).mockResolvedValue(mockUpdatedProduct);

            mockRequest.params = { id: 'p1' };
            mockRequest.body = { quantity: 10 };

            await controller.updateStock(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockUpdateStockUseCase.execute).toHaveBeenCalledWith('p1', 10);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(ResponseFormatter.success).toHaveBeenCalledWith(mockUpdatedProduct, 'Stock updated successfully');
        });

        it('should call next function if validation fails during stock update', async () => {
            const mockError = new Error('Stock cannot be negative');
            (mockUpdateStockUseCase.execute as jest.Mock).mockRejectedValue(mockError);

            await controller.updateStock(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });
});