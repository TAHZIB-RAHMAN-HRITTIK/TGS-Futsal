import { createClient } from "@supabase/supabase-js";

// Server-side client. Uses the anon key by default (safe, RLS-protected reads).
// Admin API routes that need to write use SUPABASE_SERVICE_ROLE_KEY instead —
// see app/api/admin/* routes.
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
