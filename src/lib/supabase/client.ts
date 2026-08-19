import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";
import type { Database } from "@/types/database";

export function createClient() {
  assertSupabaseConfigured();
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
