import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import setupSwagger from './config/swaggerConfig.js';
import requestLogger from './middlewares/requestLogger.js';
import mainRouter from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// --- Swagger UI Setup ---
// Placed before general rate limiting if you don't want to rate limit docs access,
// or after if you do. For now, let's assume docs don't need aggressive rate limiting.
setupSwagger(app);

// --- Core Security & CORS Middleware ---
app.use(helmet()); // Apply security headers

// Configure CORS (adjust origins for production)
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false)
        : '*', // Allow all for development or if VITE_ALLOWED_ORIGINS is not set
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle pre-flight requests

// --- Rate Limiting ---
// Apply rate limiting to all API requests.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 500 : 100,
    standardHeaders: true, 
    legacyHeaders: false, 
    message: {
        status: 'error',
        statusCode: 429, // Too Many Requests
        message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
});

app.use(apiLimiter);


// --- Body Parsers ---
app.use(express.json({ limit: '10kb' })); // Limit payload size for JSON
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Limit for URL-encoded

// --- HTTP Request Logging ---
app.use(requestLogger);

// --- API Routes ---
app.use('/', mainRouter); // Mount your main API routes

// --- Not Found Handler (404) ---
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// --- Centralized Error Handler ---
app.use(errorHandler);

export default app;