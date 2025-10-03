import { env } from '../config/env.js';

// ANSI color codes for console output to make logs more readable
const colors = {
  info: '\x1b[36m',    // Cyan
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
  debug: '\x1b[35m',   // Magenta
  reset: '\x1b[0m',     // Resets the color
};

/**
 * Formats a log message with a timestamp and log level.
 * In development, it adds colors for better readability.
 * @param {('info'|'warn'|'error'|'debug')} level - The log level.
 * @param {string} message - The message to log.
 * @param {any[]} args - Additional arguments to log.
 */
const log = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  
  // Use colors only in development environment for cleaner production logs
  if (env.NODE_ENV === 'development') {
    const color = colors[level] || colors.info;
    console[level](
      `${color}[${timestamp}] [${level.toUpperCase()}]${colors.reset}`,
      message,
      ...args
    );
  } else {
    // In production, log without colors
    console[level](
      `[${timestamp}] [${level.toUpperCase()}]`,
      message,
      ...args
    );
  }
};

const logger = {
  info: (message, ...args) => log('info', message, ...args),
  warn: (message, ...args) => log('warn', message, ...args),
  error: (message, ...args) => log('error', message, ...args),
  debug: (message, ...args) => {
    // Debug logs only appear in development mode to avoid verbose production logs
    if (env.NODE_ENV === 'development') {
      log('debug', message, ...args);
    }
  },
};

export default logger;

