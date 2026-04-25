import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getBrowserClient(): SupabaseClient {
  if (!url || !anon) throw new Error("Supabase public env not set");
  return createClient(url, anon);
}

export function getServerClient(): SupabaseClient {
  if (!url || !service) throw new Error("Supabase server env not set");
  return createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
