"use client";

import { useActionState, useState } from "react";
import { signIn, type AuthFormState } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-panel">
      <h1 className="auth-title">Entrar</h1>
      <p className="auth-sub">Acesse o painel operacional da TRIUS.</p>
      <form action={formAction} className="auth-form">
        {state.error && <div className="auth-error">{state.error}</div>}
        <div className="ds-field">
          <label htmlFor="email">Email</label>
          <div className="input-frame">
            <input id="email" name="email" type="email" required autoComplete="email" className="ds-input" placeholder="voce@empresa.com" />
          </div>
        </div>
        <div className="ds-field">
          <label htmlFor="password">Senha</label>
          <div className="input-frame">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="ds-input"
              style={{ paddingRight: "2.75rem" }}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 4.24A9.94 9.94 0 0112 4c5 0 9 4 10 8a10.6 10.6 0 01-3.29 4.53M6.53 6.53A10.6 10.6 0 002 12c1 4 5 8 10 8 1.36 0 2.65-.28 3.82-.79" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <Button type="submit" loading={pending} cornerDots>
          {pending ? "Entrando" : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
