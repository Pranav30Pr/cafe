import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Service role key or anon key fallback
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const getSupabaseServerClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured() || !supabaseKey || !supabaseUrl) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
};
