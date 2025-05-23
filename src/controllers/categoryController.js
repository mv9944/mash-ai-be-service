import {
    generateMashCategories as generateMashCategoriesService,
    generateMashCategoryOptions as generateMashCategoryOptionsService
} from '../services/geminiService.js';

// Controller to handle fetching AI-generated MASH category titles
export async function getMashCategories(req, res, next) {
    const { theme } = req.body;

    if (!theme || typeof theme !== 'string' || theme.trim() === '') {
        const error = new Error('Theme is required and must be a non-empty string.');
        error.statusCode = 400;
        return next(error);
    }

    console.log(`[CategoryController] Received request to generate MASH categories for theme: "${theme}"`);

    try {
        const categories = await generateMashCategoriesService(theme);
        res.json({ categories });
    } catch (error) {
        console.error(`[CategoryController] Error generating MASH categories for theme "${theme}":`, error.message);
        // Attach a statusCode if not already present, default to 500
        error.statusCode = error.statusCode || 500;
        // Pass the error to the centralized error handler
        next(error);
    }
}

// Controller to handle fetching AI-generated options for a specific MASH category
export async function getMashCategoryOptions(req, res, next) {
    const { categoryTitle, theme } = req.body;

    // Validate categoryTitle
    if (!categoryTitle || typeof categoryTitle !== 'string' || categoryTitle.trim() === '') {
        const error = new Error('categoryTitle is required and must be a non-empty string.');
        error.statusCode = 400;
        return next(error);
    }

    // Validate theme (important for context in option generation)
    if (!theme || typeof theme !== 'string' || theme.trim() === '') {
        const error = new Error('theme is required and must be a non-empty string to provide context for option generation.');
        error.statusCode = 400;
        return next(error);
    }

    console.log(`[CategoryController] Received request to generate options for category: "${categoryTitle}", with theme context: "${theme}"`);

    try {
        const options = await generateMashCategoryOptionsService(categoryTitle, theme);
        // Respond with the generated options, e.g., { "options": ["Option 1", "Option 2", ...] }
        res.json({ options });
    } catch (error) {
        console.error(`[CategoryController] Error generating options for category "${categoryTitle}" (theme: "${theme}"):`, error.message);
        error.statusCode = error.statusCode || 500;
        next(error);
    }
}