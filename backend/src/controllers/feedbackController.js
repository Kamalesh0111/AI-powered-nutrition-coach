import { supabase } from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Handles the submission of a user's daily feedback and updates their streak.
 */
export const submitFeedback = async (req, res) => {
  // NOTE: In a real app, userId would come from auth middleware (req.user.id).
  const { userId, satiety, energy, adherence } = req.body;

  logger.info(`Received feedback submission from user ID: ${userId}`);

  // 1. Validate input
  if (!userId || satiety === undefined || energy === undefined || adherence === undefined) {
    return res.status(400).json({ error: 'Missing required feedback fields: userId, satiety, energy, adherence.' });
  }

  try {
    // 2. Check if the user has already submitted feedback today to prevent duplicates.
    // We get the current date in UTC to match Supabase's `now()` function.
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format

    const { data: existingFeedback, error: checkError } = await supabase
      .from('daily_feedback')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`);

    if (checkError) {
      logger.error(`Error checking for existing feedback for user ${userId}:`, checkError.message);
      return res.status(500).json({ error: 'Failed to check feedback history.' });
    }

    if (existingFeedback && existingFeedback.length > 0) {
      logger.warn(`User ${userId} has already submitted feedback today.`);
      return res.status(409).json({ error: 'Feedback has already been submitted for today.' });
    }

    // 3. Fetch the user's most recent feedback entry and current streak.
    const [
      { data: lastFeedback, error: lastFeedbackError },
      { data: user, error: userError }
    ] = await Promise.all([
      supabase
        .from('daily_feedback')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('users')
        .select('streak')
        .eq('id', userId)
        .single()
    ]);

    if (userError) {
        logger.error(`Could not find user ${userId} to update streak:`, userError.message);
        return res.status(404).json({ error: 'User not found.'});
    }

    // 4. Calculate the new streak.
    let newStreak = 1; // Default to 1 for the first entry or a broken streak.
    if (lastFeedback) {
      const lastFeedbackDate = new Date(lastFeedback.created_at);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if the last feedback was yesterday.
      if (lastFeedbackDate.toDateString() === yesterday.toDateString()) {
        newStreak = (user.streak || 0) + 1;
        logger.info(`Streak continued for user ${userId}. New streak: ${newStreak}`);
      } else {
        logger.info(`Streak broken for user ${userId}. Resetting to 1.`);
      }
    } else {
        logger.info(`First feedback entry for user ${userId}. Starting streak at 1.`);
    }

    // 5. Insert the new feedback and update the user's streak in parallel.
    const [{ error: insertError }, { error: updateError }] = await Promise.all([
      supabase.from('daily_feedback').insert({
        user_id: userId,
        satiety: satiety,
        energy: energy,
        adherence: adherence,
      }),
      supabase.from('users').update({ streak: newStreak }).eq('id', userId)
    ]);


    if (insertError || updateError) {
      logger.error('Error during feedback submission transaction.', { insertError, updateError });
      return res.status(500).json({ error: 'Failed to save feedback.' });
    }

    logger.info(`Successfully saved feedback and updated streak for user ${userId}.`);
    return res.status(201).json({
      message: 'Feedback submitted successfully!',
      newStreak: newStreak,
    });

  } catch (error) {
    logger.error(`An unexpected error occurred in submitFeedback for user ${userId}:`, error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
};

