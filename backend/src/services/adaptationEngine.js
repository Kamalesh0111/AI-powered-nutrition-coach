import logger from '../utils/logger.js';

// --- Configuration for the Adaptation Engine ---

// Define the thresholds for what is considered "low" or "high" for feedback scores (e.g., on a 1-5 scale)
const LOW_SCORE_THRESHOLD = 2.5; // Average score below this triggers an adjustment
const HIGH_SCORE_THRESHOLD = 4.0; // Average score above this is considered very good

// Define the magnitude of adjustments. These are kept small to ensure gradual changes.
const CALORIE_ADJUSTMENT_AMOUNT = 100; // Adjust calories by this amount (kcal)
const PROTEIN_ADJUSTMENT_AMOUNT = 15;  // Adjust protein by this amount (grams)

// The minimum number of feedback entries required to make an adaptive change.
const MINIMUM_FEEDBACK_DAYS = 3;

/**
 * The core Adaptation Engine. Analyzes recent user feedback to calculate adjustments
 * for their nutritional targets.
 *
 * @param {Array<object>} feedbackHistory - An array of recent feedback objects.
 * Expected format: [{ satiety: number, energy: number, adherence: number }, ...]
 * @returns {object} An object containing the calculated adjustments and a reason.
 * Example: { calorie_adjustment: 100, ..., reason: "Your energy has been low..." }
 */
export const calculateAdjustments = (feedbackHistory) => {
  logger.info('Adaptation Engine: Analyzing user feedback to calculate adjustments...');

  const noAdjustmentsPayload = {
    calorie_adjustment: 0,
    protein_adjustment: 0,
    carb_adjustment: 0,
    fat_adjustment: 0,
    reason: "Your plan is working well. We're keeping your targets consistent."
  };

  // 1. Handle cases with insufficient data
  if (!feedbackHistory || feedbackHistory.length < MINIMUM_FEEDBACK_DAYS) {
    logger.info(`Insufficient feedback data (${feedbackHistory?.length || 0} days). No adjustments will be made.`);
    noAdjustmentsPayload.reason = `We need at least ${MINIMUM_FEEDBACK_DAYS} days of feedback to make smart adjustments. Keep up the great work!`;
    return noAdjustmentsPayload;
  }

  // 2. Calculate the average scores from the recent feedback history
  const totalFeedback = feedbackHistory.length;
  const averageScores = feedbackHistory.reduce(
    (acc, current) => {
      acc.satiety += current.satiety;
      acc.energy += current.energy;
      acc.adherence += current.adherence;
      return acc;
    },
    { satiety: 0, energy: 0, adherence: 0 }
  );

  averageScores.satiety /= totalFeedback;
  averageScores.energy /= totalFeedback;
  averageScores.adherence /= totalFeedback;

  logger.debug('Calculated average feedback scores:', {
      satiety: averageScores.satiety.toFixed(2),
      energy: averageScores.energy.toFixed(2),
      adherence: averageScores.adherence.toFixed(2)
  });


  const adjustments = { ...noAdjustmentsPayload };

  // 3. Apply the adaptation rules based on the average scores
  if (averageScores.adherence < LOW_SCORE_THRESHOLD) {
    logger.info('Rule triggered: Low adherence. Holding targets steady to improve consistency.');
    adjustments.reason = "We've noticed sticking to the plan has been a challenge. To help build consistency, we're keeping your targets the same for now.";

  } else if (averageScores.energy < LOW_SCORE_THRESHOLD) {
    logger.info('Rule triggered: Low energy. Increasing calories.');
    adjustments.calorie_adjustment = CALORIE_ADJUSTMENT_AMOUNT;
    adjustments.reason = "Your energy levels seem a bit low. We're adding some calories to help fuel your day.";

  } else if (averageScores.satiety < LOW_SCORE_THRESHOLD) {
    logger.info('Rule triggered: Low satiety (high hunger). Increasing protein and calories.');
    adjustments.protein_adjustment = PROTEIN_ADJUSTMENT_AMOUNT;
    adjustments.calorie_adjustment = Math.round(PROTEIN_ADJUSTMENT_AMOUNT * 4);
    adjustments.reason = "To help with recent feelings of hunger, we've increased your protein and overall calories slightly.";

  } else if (averageScores.energy > HIGH_SCORE_THRESHOLD && averageScores.satiety > HIGH_SCORE_THRESHOLD) {
    logger.info('Rule triggered: Feedback is consistently positive. Maintaining current targets.');
    adjustments.reason = "You're doing great! Your feedback is consistently positive, so we're maintaining your current targets.";
  
  } else {
    logger.info('No negative feedback thresholds met. Maintaining current targets.');
    // The default reason is already set.
  }

  logger.info('Adaptation Engine finished. Final adjustments:', adjustments);
  return adjustments;
};

