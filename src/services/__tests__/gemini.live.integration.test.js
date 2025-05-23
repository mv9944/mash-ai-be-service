import { describe, it, expect } from '@jest/globals';
import { GoogleGenerativeAI } from '@google/generative-ai'; 
import 'dotenv/config'; 

// --- Zod Schema for basic structure check  ---
import { z } from 'zod';
const BasicCategoriesResponseSchema = z.object({
    categories: z.array(z.string())
}).strip();

const MODEL_NAME = "gemini-1.5-flash-latest"; // Use a fast model

describe('Live Gemini API Integration Test', () => {
    let genAI;

    beforeAll(() => {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY not found. Skipping live Gemini API tests.");
            if (typeof describe.skip === 'function') { // Check if skip is available
            } else {
                throw new Error("GEMINI_API_KEY is required for live Gemini API tests but was not found in the environment.");
            }
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    });

    const conditionToSkip = !process.env.GEMINI_API_KEY;
    const itOrSkip = conditionToSkip ? it.skip : it;

    itOrSkip('should receive a response that is valid JSON when asking for MASH categories', async () => {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                responseMimeType: "application/json", 
            },
            systemInstruction: "You are an assistant that provides JSON responses.",
        });

        const theme = "Simple Test Theme"; 
        const prompt = `
        Generate 2 MASH game category titles for the theme: "${theme}".
        Respond ONLY with a JSON object with a "categories" key, which is an array of strings.
        Example: {"categories": ["Category A", "Category B"]}
        `;

        let rawTextResponse;
        try {
            const result = await model.generateContent(prompt);
            const response = result.response;

            expect(response).toBeDefined();
            expect(response.text).toBeInstanceOf(Function);

            rawTextResponse = response.text(); // Get the raw text output
            expect(rawTextResponse).not.toBe(''); // Ensure it's not empty

            let parsedJson;
            expect(() => {
                parsedJson = JSON.parse(rawTextResponse);
            }).not.toThrow();

            // 2. Optional: Basic structure check with Zod (after confirming it's valid JSON)
            // This ensures it's not just *any* JSON, but something resembling our expected structure.
            if (parsedJson) {
                const validationResult = BasicCategoriesResponseSchema.safeParse(parsedJson);
                expect(validationResult.success).toBe(true);
                if (!validationResult.success) {
                    console.error("Zod validation failed for live API response:", validationResult.error.format());
                }
                // You could also check if validationResult.data.categories is an array of strings
                expect(Array.isArray(validationResult.data?.categories)).toBe(true);
                validationResult.data?.categories.forEach(cat => expect(typeof cat).toBe('string'));
            }

            console.log("Live Gemini API JSON Response (parsed):", parsedJson);

        } catch (error) {
            // If an error occurs, log it for debugging, but the test should fail.
            console.error("Error during live Gemini API call or processing:", error);
            console.error("Raw text response (if available):", rawTextResponse); // Log raw response on error
            throw error; // Re-throw to fail the test
        }
    }, 30000);
});