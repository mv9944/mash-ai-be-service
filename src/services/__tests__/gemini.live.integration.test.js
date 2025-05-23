// src/services/__tests__/gemini.live.integration.test.js
import { describe, it, expect } from '@jest/globals';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Import the actual SDK
import 'dotenv/config'; // Load .env variables for API_KEY

// --- Zod Schema for basic structure check (optional but good) ---
// We'll still use a very basic Zod schema to ensure the top-level key exists,
// but the main goal is to check if the raw response is parsable JSON.
import { z } from 'zod';
const BasicCategoriesResponseSchema = z.object({
    categories: z.array(z.string())
}).strip(); // .strip() will remove any extra properties not defined in the schema

const MODEL_NAME = "gemini-1.5-flash-latest"; // Use a fast model

// This test suite will make REAL API calls to Gemini.
// Ensure GEMINI_API_KEY is set in your environment or .env file.
describe('Live Gemini API Integration Test', () => {
    let genAI;

    beforeAll(() => {
        if (!process.env.GEMINI_API_KEY) {
            // Skip all tests in this suite if the API key is not set.
            // This prevents accidental runs without credentials.
            // Or, you could throw an error to fail the suite immediately.
            console.warn("GEMINI_API_KEY not found. Skipping live Gemini API tests.");
            // To make Jest skip, we can use a trick or just let tests fail if they run.
            // A more robust way is to use `describe.skipif` or conditional test registration,
            // but for simplicity, we'll just log and let it proceed (tests might fail if key is truly missing).
            // For Jest, you can use `test.skip` or `describe.skip`.
            // Let's make it fail explicitly if the key is missing to be safe.
            if (typeof describe.skip === 'function') { // Check if skip is available
                 // This will skip the entire describe block
                 // return describe.skip("GEMINI_API_KEY not found. Skipping live Gemini API tests.", () => {});
            } else {
                // If describe.skip is not available (older Jest or different runner), throw.
                // This will cause the test suite to fail if the key is missing.
                throw new Error("GEMINI_API_KEY is required for live Gemini API tests but was not found in the environment.");
            }
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    });

    // Use test.skipIf or similar if your Jest version supports it, or manage via environment variable
    const conditionToSkip = !process.env.GEMINI_API_KEY;
    const itOrSkip = conditionToSkip ? it.skip : it;

    itOrSkip('should receive a response that is valid JSON when asking for MASH categories', async () => {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                responseMimeType: "application/json", // Crucial instruction to Gemini
            },
            systemInstruction: "You are an assistant that provides JSON responses.",
        });

        const theme = "Simple Test Theme"; // A very benign theme
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

            // 1. The primary test: Can it be parsed as JSON?
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
    }, 30000); // Increase timeout for live API calls (e.g., 30 seconds)
});