// src/routes/categoryRoutes.js
import express from 'express';
import { getMashCategories, getMashCategoryOptions } from '../controllers/categoryController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: API operations related to MASH game categories and their options.
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Generate MASH category titles based on a theme
 *     tags: [Categories]
 *     description: Accepts a theme in the request body and responds with a list of AI-generated MASH category titles suitable for that theme.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ThemeRequest'
 *     responses:
 *       200:
 *         description: Successfully generated category titles.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriesResponse'
 *       400:
 *         description: Bad Request - Invalid input, such as a missing or empty theme.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error - An issue occurred while trying to generate categories (e.g., AI service error).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', getMashCategories);

/**
 * @swagger
 * /api/categories/options:
 *   post:
 *     summary: Generate options for a specific MASH category title
 *     tags: [Categories]
 *     description: Accepts a category title and an overall game theme in the request body, then responds with AI-generated options suitable for that specific category within the given theme.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryTitle
 *               - theme
 *             properties:
 *               categoryTitle:
 *                 type: string
 *                 description: The title of the category for which to generate options.
 *                 example: "Your Magical Creature Companion"
 *               theme:
 *                 type: string
 *                 description: The overall game theme, providing context for option generation.
 *                 example: "Magical Forest Adventure"
 *     responses:
 *       200:
 *         description: Successfully generated options for the specified category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 options:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: An array of AI-generated option strings for the category.
 *                   example: ["Sparklehoof the Unicorn", "Whisperwind the Griffin", "Glimmerfang the Baby Dragon"]
 *       400:
 *         description: Bad Request - Invalid input, such as a missing categoryTitle or theme.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error - An issue occurred while trying to generate options (e.g., AI service error).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/options', getMashCategoryOptions);

export default router;