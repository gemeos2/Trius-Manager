"use client";

import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <div className="auth-panel">
      <h1 className="auth-title">Criar organização</h1>
      <p className="auth-sub">O primeiro usuário vira administrador da organização.</p>
      <form action={formAction} className="auth-form">
        {state.error && <div className="auth-error">{state.error}</div>}
        <div className="ds-field">
          <label htmlFor="orgName">Nome da organização</label>
          <div className="input-frame">
            <input id="orgName" name="orgName" type="text" required className="ds-input" placeholder="Minha Empresa" />
          </div>
        </div>
        <div className="ds-field">
          <label htmlFor="fullName">Seu nome</label>
          <div className="input-frame">
            <input id="fullName" name="fullName" type="text" required autoComplete="name" className="ds-input" placeholder="Nome completo" />
          </div>
        </div>
        <div className="ds-field">
          <label htmlFor="email">Email</label>
          <div className="input-frame">
            <input id="email" name="email" type="email" required autoComplete="email" className="ds-input" placeholder="voce@empresa.com" />
          </div>
        </div>
        <div className="ds-field">
          <label htmlFor="password">Senha</label>
          <div className="input-frame">
            <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="ds-input" placeholder="Mínimo 8 caracteres" />
          </div>
        </div>
        <Button type="submit" loading={pending} cornerDots>
          {pending ? "Criando" : "Criar organização"}
        </Button>
      </form>
      <p className="auth-footer">
        Já tem conta? <a href="/gestao/login">Entrar</a>
      </p>
    </div>
  );
}
