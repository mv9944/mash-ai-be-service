// src/routes/index.js
import express from 'express';
import categoryRoutes from './categoryRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/api/categories', categoryRoutes);

export default router;