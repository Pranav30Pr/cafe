/**
 * Supabase Client placeholder.
 * Per phased plan, Supabase initialization and table provisioning occurs in Phase 3.
 */

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};
