import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

// Create client even with empty strings - will fail at runtime if not configured
// This prevents build-time errors when env vars are not set
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
