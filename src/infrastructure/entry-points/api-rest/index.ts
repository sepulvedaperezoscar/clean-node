

import { Router } from 'express';
import userRoutes from './user/user.routes';
import productRoutes from './product/product.routes';
import healthRoutes from './health/health.routes';

const router = Router();

// Health check routes
router.use(healthRoutes);

// API routes
router.use(userRoutes);
router.use(productRoutes);

export default router;