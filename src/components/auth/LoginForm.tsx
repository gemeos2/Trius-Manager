"use client";

import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

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
            <input id="password" name="password" type="password" required autoComplete="current-password" className="ds-input" placeholder="••••••••" />
          </div>
        </div>
        <Button type="submit" loading={pending} cornerDots>
          {pending ? "Entrando" : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
