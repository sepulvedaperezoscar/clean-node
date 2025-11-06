

import { Router } from 'express';
import { userRoutes } from './user';
import { productRoutes } from './product';
import { healthRoutes } from './health';

const router = Router();


// Health check routes (sin prefijo /api/v1)
// Accesible desde: /health, /health/ready, /health/live
router.use(healthRoutes);

// User routes
// Accesible desde: /api/v1/users
router.use(userRoutes);

// Product routes
// Accesible desde: /api/v1/products
router.use(productRoutes);

export default router;