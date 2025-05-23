// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import rateLimit from 'express-rate-limit'; // Still commented out as per your version

import setupSwagger from './config/swaggerConfig.js'; // Import the Swagger setup function
import requestLogger from './middlewares/requestLogger.js';
import mainRouter from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// --- Swagger UI Setup ---
setupSwagger(app);

// --- Core Middleware ---
app.use(helmet()); // Apply security headers
app.use(cors());   // Enable CORS (using basic setup from your version)

// --- Body Parsers ---
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// --- Request Logging ---
app.use(requestLogger); // Your request logger

// --- API Routes ---
app.use('/', mainRouter); // Mount your main API routes

// --- Not Found Handler (404) ---
// This should come AFTER your main API routes
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// --- Centralized Error Handler ---
// This MUST be the LAST piece of middleware
app.use(errorHandler);

export default app;