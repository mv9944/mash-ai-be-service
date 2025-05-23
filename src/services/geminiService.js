import genAI from '../config/geminiConfig.js';
import { z } from 'zod';

// --- Zod Schema Definition for Categories Response ---
const MashCategoriesResponseSchema = z.object({
    categories: z.array(z.string().min(1, { message: "Category title cannot be empty." })).min(1, { message: "Categories array must contain at least one category." })
}).strict();

// --- Zod Schema for Category Options Response ---
const MashCategoryOptionsResponseSchema = z.object({
    options: z.array(z.string().min(1, {message: "Option string cannot be empty."})).min(3, {message: "Must generate at least 3 options."}).max(5, {message: "Should generate no more than 5 options."})
}).strict();


// --- Gemini Model Configuration ---
const MODEL_NAME = "gemini-2.5-flash-preview-05-20"; 

// --- System Instruction (shared or can be specialized) ---
const systemInstructionForContentGeneration = `
You are a creative and helpful assistant specialized in generating content for children's games.
Your primary goal is to provide structured data in JSON format as requested.
You must strictly adhere to the JSON output format specified in the user's prompt, ensuring your entire response is only the valid JSON object requested, with no additional text, commentary, or markdown.
All content generated should be child-friendly and appropriate for a young audience.
Focus on creativity and relevance to the given themes.
`;

async function generateMashCategories(theme) {
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
            responseMimeType: "application/json",
            // temperature: 0.7, // Optional: Adjust creativity
        },
        systemInstruction: systemInstructionForContentGeneration,
    });

    const userPromptForCategories = `
You are an assistant helping to generate content for a children's game called "MASH" (Mansion, Apartment, Shack, House).
The goal is to create 4 to 5 creative and distinct category titles for this game based on a user-provided theme.
These categories will later be filled with options by the user.

Theme: "${theme}"

Instructions for your response:
1.  Generate 4 to 5 category titles.
2.  The category titles must be suitable and appropriate for children.
3.  The category titles should be distinct from each other and relevant to the provided theme.
4.  You MUST respond ONLY with a JSON object.
5.  This JSON object must contain a single key: "categories".
6.  The value of the "categories" key must be an array of strings. Each string in the array is one category title.
7.  Do NOT include any other text, explanations, markdown formatting (like \`\`\`json), or introductory/concluding sentences outside of the JSON object itself. Your entire response should be *only* the JSON object.

Example for theme "Pirate Adventure":
{
  "categories": ["Your Pirate Ship Name", "Secret Treasure Location", "Your Role on the Crew", "Name of Your Parrot Sidekick", "Mysterious Island to Explore"]
}

Example for theme "Magical Forest":
{
  "categories": ["Your Magical Creature Companion", "Type of Enchanted Treehouse", "Your Special Magical Power", "Hidden Forest Glade to Discover", "Quest Given by the Forest King/Queen"]
}

Example for theme "Outer Space Explorer":
{
  "categories": ["Planet You Will Live On", "Your Alien Best Friend's Species", "Model of Your Spaceship", "Coolest Space Gadget You Own", "Your First Intergalactic Mission"]
}

Example for theme "Underwater Kingdom":
{
  "categories": ["Your Royal Merman/Mermaid Title", "Type of Coral Castle", "Your Sea Creature Best Friend", "Lost Sunken Treasure to Find", "Job in the Underwater Palace"]
}

Now, generate the JSON object for the theme: "${theme}"
`;

    try {
        console.log(`[GeminiService] Generating categories for theme: ${theme}`);
        const generationResult = await model.generateContent(userPromptForCategories);
        const response = generationResult.response;

        if (!response) {
            console.error("[GeminiService] Category generation: Gemini API did not return a response object.");
            throw new Error("Gemini API did not return a response for categories.");
        }

        const rawText = response.text();
        console.log("[GeminiService] Category generation: Raw Response Text:", rawText);

        if (!rawText) {
            if (response.promptFeedback && response.promptFeedback.blockReason) {
                console.error("[GeminiService] Category generation: Content generation blocked. Reason:", response.promptFeedback.blockReason, "Details:", response.promptFeedback.safetyRatings);
                throw new Error(`Content generation for categories blocked by Gemini due to: ${response.promptFeedback.blockReason}`);
            }
            throw new Error("Gemini returned an empty text response for categories.");
        }
        
        let jsonData;
        try {
            jsonData = JSON.parse(rawText);
        } catch (parseError) {
            console.error("[GeminiService] Category generation: Failed to parse response as JSON:", parseError.message, "Raw text:", rawText);
            throw new Error(`Gemini response for categories was not valid JSON: ${parseError.message}`);
        }

        const validationResult = MashCategoriesResponseSchema.safeParse(jsonData);
        if (!validationResult.success) {
            console.error("[GeminiService] Category generation: Zod validation failed:", validationResult.error.format());
            throw new Error(`Gemini response for categories failed schema validation. Issues: ${validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
        }
        return validationResult.data.categories;

    } catch (error) {
        console.error('[GeminiService] Error in generateMashCategories:', error.message);
        if (error.message.includes("API key not valid")) {
             throw new Error(`Gemini API Error: API key not valid. Please check your GEMINI_API_KEY or service account setup.`);
        }
        throw new Error(`Failed to generate MASH categories from Gemini: ${error.message}`);
    }
}


async function generateMashCategoryOptions(categoryTitle, theme) {
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
            responseMimeType: "application/json",
            // temperature: 0.75, // Options might benefit from slightly higher creativity
        },
        systemInstruction: systemInstructionForContentGeneration, // Can use the same system instruction
    });

    const userPromptForOptions = `
    You are an assistant helping to generate content for a children's MASH game.
    The user has already defined a category and needs 3 to 4 creative and distinct options for it.
    The options should be relevant to the given category title and the overall game theme.
    All options must be child-friendly.

    Overall Game Theme: "${theme}"
    Category Title to Generate Options For: "${categoryTitle}"

    Instructions for your response:
    1. Generate 3 to 4 distinct options for the category: "${categoryTitle}".
    2. Ensure the options are appropriate for children and fit the theme: "${theme}".
    3. You MUST respond ONLY with a JSON object.
    4. This JSON object must contain a single key: "options".
    5. The value of the "options" key must be an array of strings. Each string is one option.
    6. Do NOT include any other text, explanations, or markdown formatting outside the JSON object.

    Example:
    If Theme is "Pirate Adventure" and Category Title is "Your Pirate Ship Name", a good response would be:
    {
      "options": ["The Sea Serpent", "The Crimson Cutlass", "The Wandering Whale", "The Lucky Doubloon"]
    }

    Example:
    If Theme is "Magical Forest" and Category Title is "Your Magical Creature Companion", a good response would be:
    {
      "options": ["Sparklehoof the Unicorn", "Whisperwind the Griffin", "Glimmerfang the Baby Dragon", "Shadowpaw the Fox"]
    }
    
    Example:
    If Theme is "Outer Space" and Category Title is "Coolest Space Gadget You Own", a good response would be:
    {
      "options": ["Laser Lasso", "Gravity Boots", "Universal Translator Badge", "Pocket Black Hole Generator (safe version)"]
    }

    Now, generate the JSON object with options for the category "${categoryTitle}" within the theme "${theme}".
    `;

    try {
        console.log(`[GeminiService] Generating options for category: "${categoryTitle}", theme: "${theme}"`);
        const generationResult = await model.generateContent(userPromptForOptions);
        const response = generationResult.response;

        if (!response) {
            console.error("[GeminiService] Option generation: Gemini API did not return a response object.");
            throw new Error("Gemini API did not return a response for options.");
        }

        const rawText = response.text();
        console.log("[GeminiService] Option generation: Raw Response Text:", rawText);

        if (!rawText) {
            if (response.promptFeedback && response.promptFeedback.blockReason) {
                console.error("[GeminiService] Option generation: Content generation blocked. Reason:", response.promptFeedback.blockReason, "Details:", response.promptFeedback.safetyRatings);
                throw new Error(`Content generation for options (category: ${categoryTitle}) blocked by Gemini due to: ${response.promptFeedback.blockReason}`);
            }
            throw new Error("Gemini returned an empty text response for options.");
        }
        
        let jsonData;
        try {
            jsonData = JSON.parse(rawText);
        } catch (parseError) {
            console.error("[GeminiService] Option generation: Failed to parse response as JSON:", parseError.message, "Raw text:", rawText);
            throw new Error(`Gemini response for options (category: ${categoryTitle}) was not valid JSON: ${parseError.message}`);
        }

        const validationResult = MashCategoryOptionsResponseSchema.safeParse(jsonData);
        if (!validationResult.success) {
            console.error("[GeminiService] Option generation: Zod validation failed:", validationResult.error.format());
            throw new Error(`Gemini response for options (category: ${categoryTitle}) failed schema validation. Issues: ${validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
        }
        return validationResult.data.options;

    } catch (error) {
        console.error(`[GeminiService] Error in generateMashCategoryOptions for category "${categoryTitle}":`, error.message);
        // Avoid re-throwing API key error if already specific
        if (!error.message.toLowerCase().includes("api key")) {
            throw new Error(`Failed to generate MASH options for category "${categoryTitle}" from Gemini: ${error.message}`);
        } else {
            throw error; // Re-throw the original API key error
        }
    }
}

export { generateMashCategories, generateMashCategoryOptions };