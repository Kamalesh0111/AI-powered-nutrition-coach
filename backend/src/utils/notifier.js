import webpush from 'web-push';
import { env } from '../config/env.js';
import logger from './logger.js';

// --- Web Push Configuration ---

// VAPID (Voluntary Application Server Identification) keys are a security measure
// that allows a push service to verify that your application server is the one
// sending the push notifications. You MUST generate these keys once for your project.
//
// HOW TO GENERATE VAPID KEYS:
// 1. Install web-push globally: `npm install -g web-push`
// 2. Run the command: `web-push generate-vapid-keys`
// 3. Copy the generated Public Key and Private Key into your `backend/.env` file.

const vapidPublicKey = env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = env.VAPID_PRIVATE_KEY;

// Check if VAPID keys are configured. If not, the service cannot start.
if (!vapidPublicKey || !vapidPrivateKey) {
  logger.error(
    'VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are not set in the .env file.'
  );
  logger.error(
    'Please generate them by running: npx web-push generate-vapid-keys'
  );
  // In a real application, you might want to gracefully exit if this fails.
  // For now, we log a critical error.
} else {
  // Set the VAPID details for web-push. The mailto: address is for the push
  // service to contact you if there are issues.
  webpush.setVapidDetails(
    'mailto:your-email@example.com', // Replace with your contact email
    vapidPublicKey,
    vapidPrivateKey
  );
  logger.info('Web push service configured successfully.');
}

/**
 * Sends a web push notification to a single user subscription.
 *
 * @param {object} subscription - The push subscription object from the user's browser.
 * @param {object} payload - The data to send in the notification.
 * @returns {Promise<boolean>} - A promise that resolves to true if successful, false otherwise.
 */
export const sendNotification = async (subscription, payload) => {
  // Ensure the payload is a string. The client-side service worker will parse it.
  const payloadString = JSON.stringify(payload);

  try {
    logger.debug(`Attempting to send notification to endpoint: ${subscription.endpoint}`);
    await webpush.sendNotification(subscription, payloadString);
    logger.info(`Successfully sent notification to endpoint: ${subscription.endpoint}`);
    return true;
  } catch (error) {
    // Web-push throws an error object with details.
    // A 410 status code means the subscription is no longer valid and should be deleted.
    if (error.statusCode === 410) {
      logger.warn(`Subscription has expired or is no longer valid: ${subscription.endpoint}`);
      // Here, you would typically add logic to remove this expired subscription from your database.
    } else {
      logger.error('Error sending push notification:', {
        statusCode: error.statusCode,
        body: error.body,
        endpoint: subscription.endpoint,
      });
    }
    return false;
  }
};

