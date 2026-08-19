"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  success?: string;
  children: ReactNode;
  htmlFor?: string;
}

function FieldWrapper({ label, required, helper, error, success, children, htmlFor }: FieldWrapperProps) {
  const state = error ? "has-error" : success ? "has-success" : "";
  return (
    <div className={`ds-field ${state}`}>
      <label htmlFor={htmlFor}>
        {label} {required && <span className="req">*</span>}
      </label>
      <div className="input-frame">
        {children}
        <i className="fb fb-tl" aria-hidden="true" />
        <i className="fb fb-tr" aria-hidden="true" />
        <i className="fb fb-bl" aria-hidden="true" />
        <i className="fb fb-br" aria-hidden="true" />
      </div>
      {(error || success || helper) && (
        <span className="field-helper">{error || success || helper}</span>
      )}
    </div>
  );
}

type InputFieldProps = Omit<FieldWrapperProps, "children"> &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & { id: string };

export function InputField({ label, required, helper, error, success, id, ...rest }: InputFieldProps) {
  return (
    <FieldWrapper label={label} required={required} helper={helper} error={error} success={success} htmlFor={id}>
      <input id={id} className="ds-input" {...rest} />
    </FieldWrapper>
  );
}

type TextareaFieldProps = Omit<FieldWrapperProps, "children"> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & { id: string };

export function TextareaField({ label, required, helper, error, success, id, ...rest }: TextareaFieldProps) {
  return (
    <FieldWrapper label={label} required={required} helper={helper} error={error} success={success} htmlFor={id}>
      <textarea id={id} className="ds-input" {...rest} />
    </FieldWrapper>
  );
}
