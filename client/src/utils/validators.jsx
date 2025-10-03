/**
 * A utility file containing validation functions for common form inputs.
 * These helpers can be used across the application for client-side validation.
 */

/**
 * Validates an email address against a standard regular expression.
 * @param {string} email The email address to validate.
 * @returns {boolean} True if the email format is valid, false otherwise.
 */
export const isValidEmail = (email) => {
  if (typeof email !== 'string' || !email) {
    return false;
  }
  // A common and reasonably effective regex for email validation.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

/**
 * Validates a password to ensure it meets a minimum length requirement.
 * @param {string} password The password to validate.
 * @param {number} [minLength=6] The minimum required length. This aligns with Supabase's default.
 * @returns {boolean} True if the password meets the minimum length, false otherwise.
 */
export const isStrongPassword = (password, minLength = 6) => {
  if (typeof password !== 'string' || !password) {
    return false;
  }
  return password.length >= minLength;
};

