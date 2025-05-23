// src/controllers/healthController.js
export function checkHealth(req, res) {
    res.status(200).json({ status: 'ok', message: 'Service is healthy' });
}