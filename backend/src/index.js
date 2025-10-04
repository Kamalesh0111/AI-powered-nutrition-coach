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

// --- THE FIX ---
// This more explicit CORS configuration is more reliable on serverless platforms
// like Vercel. It ensures that the correct headers are sent for all requests,
// including the preflight "OPTIONS" request that was causing the error.
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));

// Enable the Express JSON middleware
app.use(express.json());

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
// For Vercel, we export the app instead of listening. Vercel handles the listening part.
// The local `npm run start:backend` command will still work because of how Vercel's tools handle it.
export default app;

