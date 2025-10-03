import { Router } from 'express';
// --- THE FIX ---
// The functions in the import statement must be separated by commas.
import {
  generateTodaysPlan,
  getHistoricalPlans,
  updateMealCompletion,
} from '../controllers/planController.js';

const router = Router();

// POST /api/plans/generate - Generate a new plan for today
router.post('/generate', generateTodaysPlan);

// GET /api/plans/history - Fetch all of the user's past plans
router.get('/history', getHistoricalPlans);

// PATCH /api/plans/complete-meal - Update the completion status of a meal
router.patch('/complete-meal', updateMealCompletion);

export default router;

