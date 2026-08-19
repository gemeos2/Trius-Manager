"use client";

import "./globals.css";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="auth-shell">
          <div style={{ maxWidth: "32rem", width: "100%" }} className="ds-card">
            <div className="empty-state">
              <div className="es-title">Algo deu errado</div>
              <p className="es-desc">{error.message}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
