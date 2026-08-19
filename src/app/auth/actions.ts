"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthFormState {
  error?: string;
}

export async function signUp(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const orgName = String(formData.get("orgName") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!orgName || !fullName || !email || !password) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (signUpError) {
    return { error: traduzErro(signUpError.message) };
  }
  if (!signUpData.user) {
    return { error: "Não foi possível criar a conta. Tente novamente." };
  }

  const { error: rpcError } = await supabase.rpc("create_organization_and_admin", {
    org_name: orgName,
    admin_user_id: signUpData.user.id,
  });

  if (rpcError) {
    return { error: "Conta criada, mas houve um erro ao configurar a organização: " + rpcError.message };
  }

  redirect("/gestao/dashboard");
}

export async function signIn(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe email e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: traduzErro(error.message) };
  }

  redirect("/gestao/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/gestao/login");
}

function traduzErro(message: string): string {
  if (message.includes("Invalid login credentials")) return "Email ou senha incorretos.";
  if (message.includes("already registered")) return "Este email já está cadastrado.";
  if (message.includes("User already registered")) return "Este email já está cadastrado.";
  return message;
}
