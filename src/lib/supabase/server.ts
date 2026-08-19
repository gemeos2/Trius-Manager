import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { assertSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase para Server Components, Route Handlers e Server Actions.
 * Deve ser criado a cada request — nunca reaproveitado como singleton, pois
 * fecha sobre o `cookies()` da requisição atual.
 */
export async function createClient() {
  assertSupabaseConfigured();
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // chamado a partir de um Server Component — o proxy.ts cuida do
          // refresh de sessão, então é seguro ignorar aqui.
        }
      },
    },
  });
}
