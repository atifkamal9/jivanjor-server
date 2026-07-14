import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Supabase client initialised with the Service Role Key.
 * This bypasses Row Level Security so the backend can upload files
 * to any bucket without requiring a user session.
 * NEVER expose this client or its key to the frontend.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
