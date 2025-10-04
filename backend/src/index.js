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

// --- PRODUCTION SECURITY FIX ---
// The CORS configuration is now more secure for a production environment.
// It will only allow requests from your specific Vercel frontend URL.
// You must set this URL in your Vercel environment variables.
const allowedOrigins = [process.env.FRONTEND_URL];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
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

