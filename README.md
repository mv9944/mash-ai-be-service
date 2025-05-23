# MASH Category AI Service

This backend service provides AI-generated category titles and options for the children's game "MASH" (Mansion, Apartment, Shack, House). It uses Google's Gemini API for content generation.

The service is built with Node.js and Express.js, using ES Modules.

## Features

*   **AI-Generated Category Titles:** Provide a theme, and the service returns a list of suitable MASH category titles.
*   **AI-Generated Category Options:** Provide a category title and a theme, and the service returns a list of suitable options for that category.
*   **JSON API:** Exposes a simple JSON-based HTTP API.
*   **Structured for Production:** Organized into routes, controllers, and services.
*   **Input Validation:** Basic validation for request bodies.
*   **Schema Validation:** Uses `zod` to validate the structure of AI responses.
*   **API Documentation:** Includes Swagger/OpenAPI documentation served via Swagger UI.
*   **Security & Stability:** Implements `helmet` for security headers, rate limiting, and graceful shutdown.

## Prerequisites

*   Node.js (v18.0.0 or later recommended - see `package.json` engines)
*   npm (or yarn/pnpm)
*   A Google Cloud Project with:
    *   Billing enabled.
    *   The **Vertex AI API** enabled.
*   A Google Generative AI API Key OR a Service Account JSON key file with appropriate permissions (e.g., "Vertex AI User" role).

## Project Structure

mash-category-service/
├── .env # Environment variables (PORT, GEMINI_API_KEY, etc.) - NOT COMMITTED
├── .gitignore
├── package-lock.json
├── package.json
├── README.md # This file
└── src/
├── app.js # Express app configuration, middleware, route mounting
├── server.js # HTTP server setup and startup
├── config/
│ ├── geminiConfig.js # Google Gemini client initialization
│ └── swaggerConfig.js # Swagger/OpenAPI documentation setup
├── controllers/
│ ├── categoryController.js
│ └── healthController.js
├── middlewares/
│ ├── errorHandler.js # Centralized error handling
│ └── requestLogger.js # Morgan HTTP request logger setup
├── routes/
│ ├── categoryRoutes.js
│ ├── healthRoutes.js
│ └── index.js # Main router to combine other route modules
└── services/
└── geminiService.js # Logic for interacting with Google Gemini API

## Getting Started Locally

1.  **Clone the repository (or create the files as described).**

2.  **Navigate to the service directory:**
    ```bash
    cd mash-category-service
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the root of the `mash-category-service` directory. See the `.env.example` (if provided) or use the following template:

    ```env
    # .env file
    PORT=3000
    NODE_ENV=development # or production

    # --- Gemini AI Configuration ---
    # Option 1: API Key (Simpler for local dev)
    GEMINI_API_KEY="your_gemini_api_key_here"

    # Option 2: Service Account (Recommended for production, comment out GEMINI_API_KEY if using this)
    # GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"

    # --- CORS Configuration (for production) ---
    # Comma-separated list of allowed origins for production
    # For development, CORS is typically open or configured for localhost by the frontend dev server.
    # ALLOWED_ORIGINS=https://your-frontend-domain.com,https://another-trusted-domain.com
    ```
    *   Replace `"your_gemini_api_key_here"` with your actual Gemini API key if using that method.
    *   If using a service account, set `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of your downloaded JSON key file and ensure `GEMINI_API_KEY` is commented out or removed.
    *   `ALLOWED_ORIGINS` is primarily for production deployments to restrict which frontend domains can access the API.

5.  **Start the service for development (with auto-reload):**
    ```bash
    npm run dev
    ```
    This uses `nodemon` to restart the server on file changes.

6.  **Start the service for production:**
    ```bash
    npm start
    ```

The service will typically be running at `http://localhost:3000` (or the port specified in your `.env` file).

## API Documentation (Swagger UI)

Once the service is running, API documentation is available via Swagger UI at:

**`http://localhost:PORT/api-docs`**

(e.g., `http://localhost:3000/api-docs`)

This interface allows you to explore all available endpoints, view their request/response schemas, and try them out directly from your browser.

## API Endpoints

### Health Check

*   **`GET /health`**
    *   **Description:** Checks the health status of the service.
    *   **Responses:**
        *   `200 OK`: `{ "status": "ok", "message": "Service is healthy" }`

### MASH Categories

*   **`POST /api/categories`**
    *   **Description:** Generates a list of MASH category titles based on a given theme.
    *   **Request Body:**
        ```json
        {
          "theme": "Your Desired Theme"
        }
        ```
    *   **Responses:**
        *   `200 OK`: `{ "categories": ["Category Title 1", "Category Title 2", ...] }`
        *   `400 Bad Request`: If the `theme` is missing or invalid.
        *   `500 Internal Server Error`: If AI generation fails or another server error occurs.

*   **`POST /api/categories/options`**
    *   **Description:** Generates a list of options for a specific MASH category title, given an overall theme for context.
    *   **Request Body:**
        ```json
        {
          "categoryTitle": "Specific Category Title",
          "theme": "Overall Game Theme"
        }
        ```
    *   **Responses:**
        *   `200 OK`: `{ "options": ["Option 1", "Option 2", ...] }`
        *   `400 Bad Request`: If `categoryTitle` or `theme` is missing/invalid.
        *   `500 Internal Server Error`: If AI generation fails or another server error occurs.

*(Refer to the Swagger UI at `/api-docs` for the most detailed and interactive documentation.)*

## Observability

*   **HTTP Request Logging:** Uses `morgan` to log incoming HTTP requests to the console (format depends on `NODE_ENV`).
*   **Application Logging:** `console.log` and `console.error` statements are used throughout the service, especially for AI interactions and error conditions. In a production environment, these logs should be collected and managed by a logging solution.
*   **Centralized Error Handling:** The `errorHandler.js` middleware ensures consistent error responses and logs error details.
*   **Health Check Endpoint:** The `/health` endpoint can be used by uptime monitoring services.

## Running in a Low-Traffic Production Environment

1.  **Hosting:**
    *   **PaaS (Platform as a Service):** Render, Fly.io, Heroku, Google Cloud Run. These platforms simplify deployment and management.
        *   Configure build command (e.g., `npm install` or `npm ci`).
        *   Configure start command (e.g., `npm start`).
        *   Set environment variables (`PORT`, `NODE_ENV=production`, `GEMINI_API_KEY` or `GOOGLE_APPLICATION_CREDENTIALS` path (if supported by PaaS for file uploads), `ALLOWED_ORIGINS`) through the PaaS dashboard.
    *   **VPS (Virtual Private Server):** DigitalOcean, Linode, AWS EC2/Lightsail. Requires more manual setup (OS, Node.js, process manager, reverse proxy).

2.  **Process Manager (if using a VPS):**
    *   Use `pm2` to keep the Node.js application running, manage logs, and enable restarts on crashes.
      ```bash
      sudo npm install pm2 -g
      pm2 start src/server.js --name mash-ai-service
      pm2 startup # To ensure pm2 restarts on server reboot
      pm2 save
      ```

3.  **Environment Variables:**
    *   **CRITICAL:** Never hardcode API keys or sensitive data. Use the hosting platform's mechanism for setting environment variables.
    *   Set `NODE_ENV=production`. This often enables optimizations in Express and other libraries, and affects logging/error detail.
    *   Set `ALLOWED_ORIGINS` to a comma-separated list of your frontend domain(s) to restrict CORS.

4.  **HTTPS:**
    *   Most PaaS providers offer managed SSL/TLS.
    *   On a VPS, use a reverse proxy like Nginx or Caddy with Let's Encrypt for free SSL certificates.

5.  **Logging in Production:**
    *   Configure your hosting platform to collect `stdout` and `stderr` logs.
    *   Consider structured logging (e.g., outputting logs as JSON) for easier parsing by log management systems (e.g., Logtail, Datadog, Sentry, ELK stack).

6.  **Monitoring:**
    *   Use the `/health` endpoint with an uptime monitoring service (e.g., UptimeRobot, Better Uptime).
    *   Monitor application logs for error rates and unexpected behavior.

## Future Considerations / Potential Enhancements

*   Caching responses from the AI for common themes/categories to reduce API calls and latency (with appropriate cache invalidation).
*   Adding authentication/authorization if the API needs to be secured.
*   Implementing more detailed metrics collection (e.g., using Prometheus).

