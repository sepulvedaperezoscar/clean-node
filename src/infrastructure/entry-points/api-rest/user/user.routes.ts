

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { UserController } from './user.controller';
import { container } from '@application/config/dependency-injection';
import { validationMiddleware } from '@application/middleware';

// Función para configurar las rutas de usuario
const configureUserRoutes = () => {
    const router = Router();
    const userController = container.resolve<UserController>('userController');

    /**
     * @route   POST /users
     * @desc    Crear un nuevo usuario
     * @access  Public
     */
    router.post(
        '/users',
        [
            body('name')
                .isString()
                .trim()
                .isLength({ min: 2, max: 255 })
                .withMessage('Name must be between 2 and 255 characters'),
            body('email')
                .isEmail()
                .normalizeEmail()
                .withMessage('Invalid email address'),
            body('password')
                .isString()
                .isLength({ min: 6 })
                .withMessage('Password must be at least 6 characters'),
            body('role')
                .optional()
                .isIn(['admin', 'user'])
                .withMessage('Role must be either admin or user'),
            validationMiddleware,
        ],
        (req: Request, res: Response, next: NextFunction) => userController.create(req, res, next)
    );

    /**
     * @route   GET /users/:id
     * @desc    Obtener usuario por ID
     * @access  Public
     */
    router.get(
        '/users/:id',
        [
            param('id').isUUID().withMessage('Invalid user ID format'),
            validationMiddleware,
        ],
        (req: Request, res: Response, next: NextFunction) => userController.getById(req, res, next)
    );

    /**
     * @route   GET /users
     * @desc    Listar usuarios con filtros opcionales
     * @access  Public
     */
    router.get(
        '/users',
        [
            query('role').optional().isIn(['admin', 'user']).withMessage('Invalid role'),
            query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
            validationMiddleware,
        ],
        (req: Request, res: Response, next: NextFunction) => userController.list(req, res, next)
    );

    /**
     * @route   PUT /users/:id
     * @desc    Actualizar usuario
     * @access  Public
     */
    router.put(
        '/users/:id',
        [
            param('id').isUUID().withMessage('Invalid user ID format'),
            body('name').optional().isString().trim().isLength({ min: 2, max: 255 }),
            body('email').optional().isEmail().normalizeEmail(),
            body('password').optional().isString().isLength({ min: 6 }),
            body('role').optional().isIn(['admin', 'user']),
            body('isActive').optional().isBoolean(),
            validationMiddleware,
        ],
        (req: Request, res: Response, next: NextFunction) => userController.update(req, res, next)
    );

    /**
     * @route   DELETE /users/:id
     * @desc    Eliminar usuario
     * @access  Public
     */
    router.delete(
        '/users/:id',
        [
            param('id').isUUID().withMessage('Invalid user ID format'),
            validationMiddleware,
        ],
        (req: Request, res: Response, next: NextFunction) => userController.delete(req, res, next)
    );

    return router;
};

export default configureUserRoutes;