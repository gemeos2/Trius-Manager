import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { AppShell } from "@/components/shell/AppShell";
import { ToastProvider } from "@/components/ui/ToastProvider";

// Toda a área logada depende da sessão do usuário (cookies) — nunca deve
// ser pré-renderizada estaticamente no build.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/gestao/login");
  }

  return (
    <ToastProvider>
      <AppShell userName={user.fullName} orgName={user.organizationName}>
        {children}
      </AppShell>
    </ToastProvider>
  );
}
