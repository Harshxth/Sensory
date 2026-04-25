import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Supabase public env not set (check .env.local)");
  return createClient(url, anon);
}

export function getServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) throw new Error("Supabase server env not set (check .env.local)");
  return createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
