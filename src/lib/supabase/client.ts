import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);
export const supabase = isSupabaseConfigured
  ? createClient(url, publishableKey, {
      auth: {
        flowType: "pkce",
        // The /auth/callback page owns the PKCE code exchange. Disabling the
        // automatic URL detection prevents the same one-time code being
        // exchanged twice.
        detectSessionInUrl: false,
      },
    })
  : null;

export const supabaseUrl = url ?? "";
