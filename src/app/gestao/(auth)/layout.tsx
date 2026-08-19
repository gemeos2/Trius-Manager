import type { ReactNode } from "react";
import { TriusMark } from "@/components/ui/TriusMark";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <TriusMark />
          <span>Trius</span>
        </div>
        {children}
      </div>
    </div>
  );
}
