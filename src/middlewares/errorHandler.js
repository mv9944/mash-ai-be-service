export default function errorHandler(err, req, res, next) { // Can be default export
    console.error("-------------------- ERROR --------------------");
    console.error("Timestamp:", new Date().toISOString());
    console.error("Route:", req.method, req.originalUrl);
    if (req.body && Object.keys(req.body).length > 0) {
        console.error("Request Body:", JSON.stringify(req.body, null, 2));
    }
    console.error("Error Message:", err.message);
    if (err.stack && process.env.NODE_ENV !== 'production') {
        console.error("Stack Trace:", err.stack);
    }
    if (err.statusCode && err.originalError) {
        console.error("Original Error Status:", err.originalError.status);
        console.error("Original Error Data:", JSON.stringify(err.originalError.data, null, 2));
    }
    console.error("---------------------------------------------");

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'An unexpected error occurred. Please try again later.'
            : message,
        ...(process.env.NODE_ENV !== 'production' && err.stack && { stack: err.stack }),
    });
}