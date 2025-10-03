/**
 * Initializes and exports a singleton Supabase client instance for the frontend.
 * This file is crucial for interacting with Supabase services (like authentication)
 * throughout the React application.
 */
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and Anon Key from Vite's environment variables.
// These variables must be prefixed with `VITE_` to be exposed to the browser.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// A critical check to ensure the environment variables are set.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are not defined. Please check your frontend/.env file.");
}

// Create and export the Supabase client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);