import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const PORT = process.env.PORT || 3000; // Ensure PORT is accessible

const swaggerOptionsDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'MASH Category Service API',
        version: '1.0.0',
        description: 'API for generating MASH game categories using Google Gemini AI. This service provides endpoints to get category suggestions based on a theme and to check the health of the service.',
        contact: {
            name: 'Your Awesome Team/Name',
            url: 'https://your-project-website.com',
            email: 'contact@your-project-email.com',
        },
        license: { 
            name: 'MIT',
            url: 'https://spdx.org/licenses/MIT.html',
        },
    },
    servers: [
        {
            url: `http://localhost:${PORT}`,
            description: 'Development Server',
        },

    ],
    tags: [
        {
            name: 'Categories',
            description: 'Operations related to MASH game categories',
        },
        {
            name: 'Health',
            description: 'Service health check operations',
        },
    ],
    components: {
        schemas: {
            ThemeRequest: {
                type: 'object',
                required: ['theme'],
                properties: {
                    theme: {
                        type: 'string',
                        description: 'The theme for which to generate MASH categories (e.g., "Space Adventure", "Medieval Knights").',
                        example: 'Magical Forest Adventure',
                    },
                },
            },
            CategoriesResponse: {
                type: 'object',
                properties: {
                    categories: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        description: 'An array of AI-generated MASH category titles relevant to the provided theme.',
                        example: ['Magical Creature Companion', 'Enchanted Treehouse Type', 'Your Special Power'],
                    },
                },
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    status: { type: 'string', example: 'error', description: "Indicates the status of the response." },
                    statusCode: { type: 'integer', example: 500, description: "The HTTP status code." },
                    message: { type: 'string', example: 'An unexpected error occurred.', description: "A human-readable error message." },
                },
            },
            HealthResponse: {
                type: 'object',
                properties: {
                    status: { type: 'string', example: 'ok', description: "The operational status of the service component." },
                    message: { type: 'string', example: 'Service is healthy', description: "A message indicating the service is operating correctly." }
                }
            }
        },
  
    },

};

const swaggerOptions = {
    definition: swaggerOptionsDefinition,
    apis: ['./src/routes/*.js', './src/routes/**/*.js'], // Glob pattern to include files in subdirectories if any
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

function setupSwagger(app) {
    // Serve Swagger UI at /api-docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    }));
    console.log(`Swagger API documentation available at http://localhost:${PORT}/api-docs`);
}

export default setupSwagger;