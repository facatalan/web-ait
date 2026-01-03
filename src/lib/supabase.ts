import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During SSG build, return a dummy client that won't be used
    // The actual client calls happen client-side where env vars are available
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Export as a getter to ensure lazy initialization
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseClient() as any)[prop];
  },
});
