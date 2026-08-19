"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { BeveledBox } from "./BeveledBox";

type Variant = "solid-light" | "solid-dark" | "transparent";
type Size = "md" | "sm";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  bevel?: number;
  cornerDots?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

function Inner({ variant = "solid-light", size = "md", cornerDots, loading, children }: CommonProps) {
  return (
    <>
      <span className={`btn-inner ${variant} ${size === "sm" ? "btn-sm" : ""}`}>
        {loading && <span className="btn-spinner" aria-hidden="true" />}
        <span className="btn-label">{children}</span>
        {variant === "transparent" && <span className="transparent__background" aria-hidden="true" />}
      </span>
      {cornerDots && (
        <span className="corner-dots" aria-hidden="true">
          <i className="c-tl" /><i className="c-tr" /><i className="c-bl" /><i className="c-br" />
        </span>
      )}
    </>
  );
}

type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

export function Button({ variant, size, bevel = 16, cornerDots, loading, children, className = "", ...rest }: ButtonProps) {
  return (
    <button className={`ds-btn ${className}`} disabled={loading || rest.disabled} {...rest}>
      <BeveledBox bevel={bevel}>
        <Inner variant={variant} size={size} cornerDots={cornerDots} loading={loading}>
          {children}
        </Inner>
      </BeveledBox>
    </button>
  );
}

type ButtonLinkProps = CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & { href: string };

export function ButtonLink({ variant, size, bevel = 16, cornerDots, loading, children, className = "", href, ...rest }: ButtonLinkProps) {
  return (
    <Link href={href} className={`ds-btn ${className}`} {...rest}>
      <BeveledBox bevel={bevel}>
        <Inner variant={variant} size={size} cornerDots={cornerDots} loading={loading}>
          {children}
        </Inner>
      </BeveledBox>
    </Link>
  );
}
