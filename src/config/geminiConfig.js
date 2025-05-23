import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
        "FATAL ERROR: GEMINI_API_KEY or GOOGLE_APPLICATION_CREDENTIALS is not set. " +
        "Please set one in your .env file or environment."
    );
    process.exit(1);
}

// The SDK will automatically use GOOGLE_APPLICATION_CREDENTIALS if set and GEMINI_API_KEY is not.
// If GEMINI_API_KEY is set, it takes precedence for this direct initialization.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default genAI;