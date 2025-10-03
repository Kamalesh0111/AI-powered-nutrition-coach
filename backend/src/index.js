import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import logger from './utils/logger.js';

// Import the route handlers
import userRoutes from './routes/users.js';
import planRoutes from './routes/plans.js';
import feedbackRoutes from './routes/feedback.js';

// --- Application Setup ---
const app = express();
const PORT = env.PORT;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- TEMPORARY DEBUGGING MIDDLEWARE ---
// This code will run for every single request that hits the server.
// It will help us see the exact URL the frontend is requesting.
app.use((req, res, next) => {
  logger.info(`[DEBUG] Request Received: ${req.method} ${req.originalUrl}`);
  next(); // This passes the request to the next handler (your API routes)
});
// --- END DEBUGGING MIDDLEWARE ---


// --- API Routes ---
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/feedback', feedbackRoutes);

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'AI Nutrition Coach Backend is running.',
  });
});

// --- Server Initialization ---
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
  logger.info(`Current environment: ${env.NODE_ENV}`);
});

