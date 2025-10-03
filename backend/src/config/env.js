// src/config/env.js
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Walk up directories from startDir until a .env file is found or root reached.
 * Returns the resolved path to the found .env or null if none found.
 */
function findDotenv(startDir = __dirname) {
  let dir = path.resolve(startDir);
  while (true) {
    const candidate = path.join(dir, '.env');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null; // reached filesystem root
    dir = parent;
  }
}

// attempt to locate .env
const dotenvPath = findDotenv();
if (dotenvPath) {
  dotenv.config({ path: dotenvPath });
  // optional debug - remove or guard in production
  console.log(`Loaded .env from: ${dotenvPath}`);
} else {
  // If you want to require .env to exist, throw here. Otherwise keep warning.
  console.warn('Warning: .env file not found when walking up from', __dirname);
}

// Exported environment object (sensible defaults included)
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 8000,

  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,

  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001',

  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  VAPID_SUBJECT: process.env.VAPID_SUBJECT,
};

// Optional: validate required keys and throw a helpful error
function checkRequired() {
  const missing = [];
  if (!env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!env.SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');
  if (!env.SUPABASE_SERVICE_KEY) missing.push('SUPABASE_SERVICE_KEY');
  if (missing.length) {
    throw new Error(
      `Fatal Error: the following environment variables are missing: ${missing.join(
        ', '
      )}. Make sure your .env (found at ${dotenvPath || 'N/A'}) contains them.`
    );
  }
}

// Call validation in development/startup (comment out if you want non-fatal)
checkRequired();
