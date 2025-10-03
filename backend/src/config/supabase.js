/**
 * Initializes and exports the Supabase clients for the backend.
 */
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;
const supabaseServiceKey = env.SUPABASE_SERVICE_KEY; // The secret service_role key

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error("Fatal Error: SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_KEY must be defined in your .env file.");
}

/**
 * The standard, public-facing Supabase client.
 * Uses the 'anon' key and is subject to RLS policies.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * A privileged, server-side-only Supabase client.
 * Uses the 'service_role' key to bypass RLS policies for administrative tasks.
 * IMPORTANT: This client should NEVER be used or exposed on the frontend.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

