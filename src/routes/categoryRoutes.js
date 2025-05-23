import express from 'express';
import { body } from 'express-validator'; // Import 'body' for validating request body
import { getMashCategories, getMashCategoryOptions } from '../controllers/categoryController.js';
import { handleValidationErrors } from '../middlewares/validationHandler.js'; // Import our handler

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
 *         description: Bad Request - Invalid input, such as a missing or empty theme, or theme too long.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' # Or a more specific validation error schema
 *       500:
 *         description: Internal Server Error - An issue occurred while trying to generate categories (e.g., AI service error).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/',
    // --- Validation Rules for this endpoint ---
    body('theme')
        .trim() // Remove leading/trailing whitespace
        .notEmpty().withMessage('Theme is required and cannot be empty.')
        .isString().withMessage('Theme must be a string.')
        .isLength({ min: 2, max: 100 }).withMessage('Theme must be between 2 and 100 characters long.'),
    // --- End of Validation Rules ---
    handleValidationErrors, // Our middleware to handle any validation errors found
    getMashCategories       // If validation passes, proceed to the controller
);

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
 *         description: Bad Request - Invalid input, such as a missing categoryTitle or theme, or values too long.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' # Or a more specific validation error schema
 *       500:
 *         description: Internal Server Error - An issue occurred while trying to generate options (e.g., AI service error).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/options',
    // --- Validation Rules for this endpoint ---
    body('categoryTitle')
        .trim()
        .notEmpty().withMessage('categoryTitle is required and cannot be empty.')
        .isString().withMessage('categoryTitle must be a string.')
        .isLength({ min: 2, max: 150 }).withMessage('categoryTitle must be between 2 and 150 characters long.'),
    body('theme')
        .trim()
        .notEmpty().withMessage('Theme is required and cannot be empty.')
        .isString().withMessage('Theme must be a string.')
        .isLength({ min: 2, max: 100 }).withMessage('Theme must be between 2 and 100 characters long.'),
    // --- End of Validation Rules ---
    handleValidationErrors, // Handle validation errors
    getMashCategoryOptions  // Proceed to controller if valid
);

export default router;