

import { Router } from 'express';
import { HealthController } from './health.controller';

const router = Router();
const healthController = new HealthController();

/**
 * @route   GET /health
 * @desc    Health check completo
 * @access  Public
 */
router.get('/health', (req, res) => healthController.getHealth(req, res));

/**
 * @route   GET /health/ready
 * @desc    Readiness probe (Kubernetes)
 * @access  Public
 */
router.get('/health/ready', (req, res) => healthController.getReady(req, res));

/**
 * @route   GET /health/live
 * @desc    Liveness probe (Kubernetes)
 * @access  Public
 */
router.get('/health/live', (req, res) => healthController.getLive(req, res));

export default router;