


import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { ProductController } from './product.controller';
import { container } from '@application/config/dependency-injection';
import { validationMiddleware } from '@application/middleware';

// Función para configurar las rutas de producto
const configureProductRoutes = () => {
    const router = Router();
    const productController = container.resolve<ProductController>('productController');

    /**
     * @route   POST /products
     * @desc    Crear un nuevo producto
     * @access  Public (en producción debería ser Private)
     */
    router.post(
        '/products',
        [
            body('name')
                .isString()
                .trim()
                .isLength({ min: 3, max: 255 })
                .withMessage('Name must be between 3 and 255 characters'),
            body('description')
                .isString()
                .trim()
                .notEmpty()
                .withMessage('Description is required'),
            body('price')
                .isFloat({ min: 0.01 })
                .withMessage('Price must be greater than 0'),
            body('stock')
                .isInt({ min: 0 })
                .withMessage('Stock must be a non-negative integer'),
            body('category')
                .isString()
                .trim()
                .notEmpty()
                .withMessage('Category is required'),
            body('userId')
                .optional()
                .isUUID()
                .withMessage('Invalid user ID format'),
            validationMiddleware,
        ],
        (req: Request, res: Response, next: NextFunction) => productController.create(req, res, next)
    );

    /**
     * @route   GET /products/:id
     * @desc    Obtener producto por ID
     * @access  Public
     */
    router.get(
        '/products/:id',
        [
            param('id').isUUID().withMessage('Invalid product ID format'),
            validationMiddleware,
        ],
        (req: Request, res: Response, next: NextFunction) => productController.getById(req, res, next)
    );

    /**
     * @route   GET /products/category/:category
     * @desc    Obtener productos por categoría
     * @access  Public
     */
    router.get(
        '/products/category/:category',
        [
            param('category').isString().notEmpty().withMessage('Category is required'),
            query('inStock').optional().isBoolean().withMessage('inStock must be boolean'),
            validationMiddleware,
        ],
        (req: Request, res: Response, next: NextFunction) => productController.getByCategory(req, res, next)
    );

    /**
     * @route   GET /products
     * @desc    Listar productos con filtros opcionales
     * @access  Public
     */
    router.get(
        '/products',
        [
            query('minPrice').optional().isFloat({ min: 0 }).withMessage('Invalid minPrice'),
            query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Invalid maxPrice'),
            query('category').optional().isString(),
            query('inStock').optional().isBoolean(),
            query('userId').optional().isUUID(),
            validationMiddleware,
        ],
        (req: Request, res: Response, next: NextFunction) => productController.list(req, res, next)
    );

    /**
     * @route   PATCH /products/:id/stock
     * @desc    Actualizar stock de producto
     * @access  Public (en producción debería ser Private)
     */
    router.patch(
        '/products/:id/stock',
        [
            param('id').isUUID().withMessage('Invalid product ID format'),
            body('quantity')
                .isInt()
                .notEmpty()
                .withMessage('Quantity must be an integer'),
            validationMiddleware,
        ],
        (req: Request, res: Response, next: NextFunction) => productController.updateStock(req, res, next)
    );

    return router;
};

export default configureProductRoutes;