import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

interface AppShellProps {
  userName: string;
  orgName: string;
  children: ReactNode;
}

export function AppShell({ userName, orgName, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <SiteHeader userName={userName} orgName={orgName} />
      <main className="app-main">{children}</main>
    </div>
  );
}
