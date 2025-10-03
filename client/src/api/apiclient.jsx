import axios from 'axios';
import { supabase } from '../lib/supabaseClient'; // Import the centralized Supabase client

// Get the backend API URL from the Vite environment variables.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "Fatal Error: VITE_API_BASE_URL is not defined. Please create a .env file in the /frontend directory."
  );
}

/**
 * A centralized Axios instance for making all API requests to the backend.
 * It is configured with an interceptor to automatically handle Supabase authentication.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Authentication Interceptor ---
// This interceptor runs before every request is sent. Its job is to
// get the latest auth token from Supabase and add it to the request headers.
apiClient.interceptors.request.use(
  async (config) => {
    // Get the current session from Supabase. The Supabase client library
    // automatically handles token refreshing in the background.
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting Supabase session:', error);
      return config; // Proceed without token if session fetch fails
    }

    const session = data.session;

    // If a user session exists, add the Authorization and ApiKey headers.
    // The backend's Supabase client will use these to authenticate the user.
    if (session) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
      // The anon key is also required by Supabase for API gateway authentication.
      config.headers['apikey'] = import.meta.env.VITE_SUPABASE_ANON_KEY;
    }

    return config;
  },
  (error) => {
    // Handle any errors that occur during the request setup
    return Promise.reject(error);
  }
);

export default apiClient;

