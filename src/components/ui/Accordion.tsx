"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Accordion({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [maxHeight, setMaxHeight] = useState(defaultOpen ? undefined : 0);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    setMaxHeight(open ? bodyRef.current.scrollHeight : 0);
  }, [open, children]);

  return (
    <div className={`accordion-item ${open ? "is-open" : ""}`}>
      <button type="button" className="accordionButton" onClick={() => setOpen((o) => !o)}>
        <span className="acc-title">{title}</span>
        <span className="acc-icon" aria-hidden="true" />
      </button>
      <div className="accordion-body" style={{ maxHeight }}>
        <div ref={bodyRef} className="accordion-body-inner">
          {children}
        </div>
      </div>
    </div>
  );
}
