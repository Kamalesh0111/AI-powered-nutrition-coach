import { supabase } from '../config/supabase.js';
import { sendNotification } from '../utils/notifier.js';
import logger from '../utils/logger.js';

// The payload for the push notification.
const notificationPayload = JSON.stringify({
  title: 'Daily Check-in Reminder',
  body: "Don't forget to log your feedback for today to keep your plan adapting!",
  //icon: '/icon-192x192.png',  Optional: path to an icon in your frontend's public folder
});

/**
 * Main function to fetch all user subscriptions and send them a reminder notification.
 * This script is intended to be run by a cron job.
 */
const sendEveningReminders = async () => {
  logger.info('Starting evening reminder cron job...');

  // 1. Fetch all push notification subscriptions from the database.
  const { data: subscriptions, error } = await supabase
    .from('user_subscriptions')
    .select('subscription_object');

  if (error) {
    logger.error('Error fetching user subscriptions:', error);
    return; // Exit the job if we can't fetch data.
  }

  if (!subscriptions || subscriptions.length === 0) {
    logger.info('No user subscriptions found. Reminder job complete.');
    return;
  }

  logger.info(`Found ${subscriptions.length} subscriptions to notify.`);

  // 2. Create an array of promises, one for each notification to be sent.
  const notificationPromises = subscriptions.map((sub) =>
    sendNotification(sub.subscription_object, notificationPayload)
  );

  // 3. Use Promise.allSettled to attempt sending all notifications.
  // This ensures that even if some promises fail (e.g., an expired subscription),
  // the others will still be processed.
  const results = await Promise.allSettled(notificationPromises);

  let successCount = 0;
  let failureCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successCount++;
    } else {
      failureCount++;
      // Log the specific reason for the failure.
      // This is useful for cleaning up expired or invalid subscriptions.
      logger.error(`Failed to send notification to subscription #${index + 1}:`, result.reason?.message || result.reason);
    }
  });

  logger.info('Evening reminder cron job finished.');
  logger.info(`Successfully sent: ${successCount}, Failed: ${failureCount}`);
};

// Execute the main function.
sendEveningReminders();

