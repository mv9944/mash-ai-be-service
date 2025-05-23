import { validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Log the detailed errors for debugging on the server
        console.warn('[Validation Error]', JSON.stringify(errors.array(), null, 2));

        // Respond with a 400 status and the validation errors
        // You can choose to send all errors or just the first one,
        // or a more generic message.
        return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'Validation failed. Please check your input.', // Generic message
            errors: errors.array().map(err => ({ // Map to a simpler structure if desired
                field: err.type === 'field' ? err.path : undefined, // err.path for field errors
                location: err.type === 'field' ? err.location : undefined,
                message: err.msg,
                value: err.type === 'field' ? err.value : undefined,
            })),
        });
    }
    next();
};