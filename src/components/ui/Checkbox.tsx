"use client";

import type { InputHTMLAttributes } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
  label: string;
  radio?: boolean;
};

export function Checkbox({ label, radio, id, ...rest }: CheckboxProps) {
  return (
    <label className={`ds-check ${radio ? "is-radio" : ""}`} htmlFor={id}>
      <input type={radio ? "radio" : "checkbox"} id={id} {...rest} />
      <span className="box" aria-hidden="true" />
      {label}
    </label>
  );
}

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
  label: string;
};

export function Toggle({ label, id, ...rest }: ToggleProps) {
  return (
    <label className="ds-toggle" htmlFor={id}>
      <input type="checkbox" id={id} {...rest} />
      <span className="track" aria-hidden="true"><span className="knob" /></span>
      {label}
    </label>
  );
}
