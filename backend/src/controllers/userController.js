import { supabase, supabaseAdmin } from '../config/supabase.js';
import { getInitialTargets } from '../services/mlService.js';
import logger from '../utils/logger.js';

/**
 * Completes user registration by saving their profile data directly to the
 * user's metadata in Supabase Auth.
 */
export const registerUser = async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    const token = authorization.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ message: 'Authentication failed: Invalid or expired token.' });
    }
    const authUserId = user.id;

    const profileData = req.body;
    logger.info(`Fetching initial targets from ML service for user: ${authUserId}`);
    const nutritionalTargets = await getInitialTargets(profileData);
    if (!nutritionalTargets) {
      return res.status(500).json({ message: 'Could not calculate nutritional targets.' });
    }

    const userMetadata = { ...profileData, ...nutritionalTargets };

    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authUserId,
      { user_metadata: userMetadata }
    );

    if (updateError) { throw updateError; }

    logger.info(`Successfully saved metadata for user: ${authUserId}`);
    res.status(200).json({ message: 'User profile created successfully.', user: updatedUser });

  } catch (error) {
    logger.error('Error during user profile registration:', error.message);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

/**
 * Deletes the currently authenticated user's account.
 * This is a protected, administrative action.
 */
export const deleteCurrentUser = async (req, res) => {
  try {
    // 1. Authenticate the user to get their ID
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const token = authorization.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    const userIdToDelete = user.id;

    // 2. Use the powerful admin client to delete the user
    logger.info(`Attempting to delete user: ${userIdToDelete}`);
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);

    if (deleteError) {
      throw deleteError;
    }

    logger.info(`Successfully deleted user: ${userIdToDelete}`);
    res.status(200).json({ message: 'User account deleted successfully.' });

  } catch (error) {
    logger.error('Error deleting user account:', error.message);
    res.status(500).json({ message: 'Failed to delete user account.' });
  }
};

