import {
    generateMashCategories as generateMashCategoriesService,
    generateMashCategoryOptions as generateMashCategoryOptionsService
} from '../services/geminiService.js';

export async function getMashCategories(req, res, next) {
    // Basic validation is now handled by express-validator middleware
    const { theme } = req.body;

    console.log(`[CategoryController] Received request to generate MASH categories for theme: "${theme}"`);

    try {
        const categories = await generateMashCategoriesService(theme);
        res.json({ categories });
    } catch (error) {
        console.error(`[CategoryController] Error generating MASH categories for theme "${theme}":`, error.message);
        error.statusCode = error.statusCode || 500;
        next(error);
    }
}

export async function getMashCategoryOptions(req, res, next) {
    // Basic validation is now handled by express-validator middleware
    const { categoryTitle, theme } = req.body;

    console.log(`[CategoryController] Received request to generate options for category: "${categoryTitle}", with theme context: "${theme}"`);

    try {
        const options = await generateMashCategoryOptionsService(categoryTitle, theme);
        res.json({ options });
    } catch (error) {
        console.error(`[CategoryController] Error generating options for category "${categoryTitle}" (theme: "${theme}"):`, error.message);
        error.statusCode = error.statusCode || 500;
        next(error);
    }
}