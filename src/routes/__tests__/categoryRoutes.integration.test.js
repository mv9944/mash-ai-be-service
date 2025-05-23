import { describe, it, expect, beforeAll, jest } from '@jest/globals'; 
import request from 'supertest';
import app from '../../app.js';
import { z } from 'zod';
import 'dotenv/config';

// --- Zod Schemas for API Response Validation ---
const ApiCategoriesResponseSchema = z.object({
    categories: z.array(z.string().min(1)).min(1, "API should return at least one category") // Expect at least one category
}).strict();

const ApiCategoryOptionsResponseSchema = z.object({
    options: z.array(z.string().min(1)).min(1, "API should return at least one option") // Expect at least one option
}).strict();

const ApiHealthResponseSchema = z.object({
    status: z.literal('ok'),
    message: z.string()
}).strict();

const API_KEY_PRESENT = !!process.env.GEMINI_API_KEY;
const describeOrSkip = API_KEY_PRESENT ? describe : describe.skip;
const itOrSkip = API_KEY_PRESENT ? it : it.skip;

// Increase Jest timeout for all tests in this file due to live API calls
jest.setTimeout(30000); // 30 seconds, adjust as needed

describeOrSkip('Category Routes API (Live Gemini Integration)', () => {

    // No beforeEach needed to clear mocks as we are not mocking the service layer.

    describe('POST /api/categories', () => {
        itOrSkip('should return 200 and categories conforming to schema on valid theme', async () => {
            const response = await request(app)
                .post('/api/categories')
                .send({ theme: 'Simple Test Theme for Categories' }) // Use a benign, simple theme
                .expect('Content-Type', /json/)
                .expect(200);

            console.log('[LIVE TEST] /api/categories response body:', JSON.stringify(response.body, null, 2));

            const validationResult = ApiCategoriesResponseSchema.safeParse(response.body);
            if (!validationResult.success) {
                console.error("Zod validation errors for live /api/categories:", validationResult.error.format());
            }
            expect(validationResult.success).toBe(true);
            // We can't assert specific categories, but we know they should be strings
            if (validationResult.success) {
                validationResult.data.categories.forEach(cat => {
                    expect(typeof cat).toBe('string');
                    expect(cat.length).toBeGreaterThan(0);
                });
                expect(validationResult.data.categories.length).toBeGreaterThanOrEqual(1); // Gemini should generate some
            }
        });

        // Tests for 400 (validation errors) will still work as they don't hit the Gemini service
        it('should return 400 and error object if theme is missing', async () => {
            const response = await request(app)
                .post('/api/categories')
                .send({})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.status).toBe('error');
            expect(response.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ field: 'theme', message: 'Theme is required and cannot be empty.' })
                ])
            );
        });

    });

    describe('POST /api/categories/options', () => {
        itOrSkip('should return 200 and options conforming to schema on valid categoryTitle and theme', async () => {
            const response = await request(app)
                .post('/api/categories/options')
                .send({ categoryTitle: 'A Cool Item', theme: 'Simple Test Theme for Options' })
                .expect('Content-Type', /json/)
                .expect(200);

            console.log('[LIVE TEST] /api/categories/options response body:', JSON.stringify(response.body, null, 2));

            const validationResult = ApiCategoryOptionsResponseSchema.safeParse(response.body);
            if (!validationResult.success) {
                console.error("Zod validation errors for live /api/categories/options:", validationResult.error.format());
            }
            expect(validationResult.success).toBe(true);

            if (validationResult.success) {
                validationResult.data.options.forEach(opt => {
                    expect(typeof opt).toBe('string');
                    expect(opt.length).toBeGreaterThan(0);
                });
                expect(validationResult.data.options.length).toBeGreaterThanOrEqual(1); // Gemini should generate some
            }
        });

        // Input validation tests (400 errors) remain the same
        it('should return 400 and error object if categoryTitle is missing', async () => {
            const response = await request(app)
                .post('/api/categories/options')
                .send({ theme: 'Valid Theme' })
                .expect('Content-Type', /json/)
                .expect(400);
            
            expect(response.body.status).toBe('error');
            expect(response.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ field: 'categoryTitle', message: 'categoryTitle is required and cannot be empty.' })
                ])
            );
        });
    });

    describe('GET /health', () => {
        it('should return 200 and health status conforming to schema', async () => {
            const response = await request(app)
                .get('/health')
                .expect('Content-Type', /json/)
                .expect(200);

            const validationResult = ApiHealthResponseSchema.safeParse(response.body);
            expect(validationResult.success).toBe(true);
            if (!validationResult.success) {
                console.error("Zod validation errors for /health:", validationResult.error.format());
            }
            expect(response.body).toEqual({ status: 'ok', message: 'Service is healthy' });
        });
    });
});