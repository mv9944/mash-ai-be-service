// src/server.js
import 'dotenv/config'; // Load environment variables first
import http from 'http';
import app from './app.js'; // The configured Express app

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

function startServer() {
    server.listen(PORT, () => {
        console.log(`MASH Category Service listening on http://localhost:${PORT}`);
        console.log(`Current NODE_ENV: ${process.env.NODE_ENV || 'development (default)'}`);
        if (process.env.NODE_ENV === 'production' && process.env.ALLOWED_ORIGINS) {
            console.log(`CORS allowed origins: ${process.env.ALLOWED_ORIGINS}`);
        } else if (process.env.NODE_ENV !== 'production') {
            console.log(`CORS: Allowing all origins in non-production mode.`);
        }
    });
}

server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});

function gracefulShutdown(signal) {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();