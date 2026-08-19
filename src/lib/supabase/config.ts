const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseUrl = url ?? "";
export const supabaseAnonKey = anonKey ?? "";

export const isSupabaseConfigured =
  Boolean(url) && Boolean(anonKey) && !url!.includes("YOUR_") && !anonKey!.includes("YOUR_");

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase não configurado. Copie app-web/.env.example para .env.local e preencha " +
        "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY com as credenciais do seu projeto Supabase."
    );
  }
}
