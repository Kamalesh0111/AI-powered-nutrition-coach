import { Router } from 'express';
// Import the new delete function
import { registerUser, deleteCurrentUser } from '../controllers/userController.js';

const router = Router();

// Route for completing the user's profile after onboarding
router.post('/register', registerUser);

// Route for deleting the currently authenticated user
router.delete('/me', deleteCurrentUser);

export default router;

