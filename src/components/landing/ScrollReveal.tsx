"use client";

import { useEffect } from "react";

/**
 * Dispara o reveal-on-scroll de .reveal-fade (mesmo padrão de design_system.html
 * e do script inline original de index.html). Sem markup próprio — só liga
 * o IntersectionObserver aos elementos já renderizados pelo servidor.
 */
export function ScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll(".reveal-fade");

    if (reduced) {
      els.forEach((el) => el.classList.add("is-inview"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
