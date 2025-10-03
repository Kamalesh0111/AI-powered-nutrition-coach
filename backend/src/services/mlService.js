import axios from 'axios';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

const ML_SERVICE_URL = env.ML_SERVICE_URL;

/**
 * Calls the Python ML service to get the initial nutritional targets for a user.
 *
 * @param {object} profileData - The user's profile from the onboarding form.
 * @returns {Promise<object|null>} A promise that resolves to the nutritional targets object, or null on error.
 */
export const getInitialTargets = async (profileData) => {
  if (!ML_SERVICE_URL) {
    logger.error('ML_SERVICE_URL is not defined in the environment variables.');
    return null;
  }

  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, profileData);

    // --- THE FIX ---
    // The Python service returns the data directly. We check for the presence of the 'calories'
    // key to validate that we received a valid targets object.
    if (response.data && typeof response.data.calories !== 'undefined') {
      logger.info('Successfully received targets from ML service.');
      // We return the entire response data object directly.
      return response.data;
    } else {
      // This error will be triggered if the response is empty or malformed.
      logger.error('ML service returned an unexpected response format.', response.data);
      return null;
    }

  } catch (error) {
    logger.error('Error calling ML service:', error.message);
    if (error.response) {
      logger.error('ML Service Response Data:', error.response.data);
    }
    return null;
  }
};

