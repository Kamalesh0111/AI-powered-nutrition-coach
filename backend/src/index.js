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

// --- CORS Configuration ---
const allowedOrigins = [
  "https://ai-powered-nutrition-coach.vercel.app", // production
  "https://ai-powered-nutrition-coach-git-main-kamaleshs-projects-fd0c8d3f.vercel.app", // preview branch deploy
  "http://localhost:5173", // local frontend dev (if using Vite)
  "http://localhost:3000"  // local frontend dev (if using React CRA/Next.js)
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
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

// --- Middleware ---
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
// For Vercel deployment, export the app
export default app;

// Optional: local server start for testing
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}
