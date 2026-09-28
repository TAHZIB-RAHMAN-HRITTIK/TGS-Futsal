"use client";

import { createClient } from "@supabase/supabase-js";

// Single browser client, reused across client components that need
// realtime subscriptions (live score / stat updates).
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
