import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Criar organização — TRIUS" };

// Cadastro público desligado — só a organização já criada usa o painel.
// Para reabrir (ex: convidar mais alguém), defina ALLOW_SIGNUP=true no
// ambiente; não é preciso mexer neste arquivo.
export default function SignupPage() {
  if (process.env.ALLOW_SIGNUP !== "true") {
    notFound();
  }

  return <SignupForm />;
}
