"use client";

import { useEffect, useRef } from "react";

const SVGNS = "http://www.w3.org/2000/svg";

function bevelPath(w: number, h: number, c: number) {
  const r = 4;
  return (
    "M " + r + ",0 Q 0,0 0," + r +
    " L 0," + (h - c - r) + " Q 0," + (h - c - 1.4) + " 1.34," + (h - c) +
    " L " + c + "," + (h - 1.34) + " Q " + (c + 1.4) + "," + h + " " + (c + r) + "," + h +
    " L " + (w - r) + "," + h + " Q " + w + "," + h + " " + w + "," + (h - r) +
    " L " + w + "," + (c + r) + " Q " + w + "," + (c + 1.4) + " " + (w - 1.34) + "," + c +
    " L " + (w - c) + ",1.34 Q " + (w - c - 1.4) + ",0 " + (w - c - r) + ",0 Z"
  );
}

function drawBevel(box: HTMLElement, bevel: number) {
  const w = box.offsetWidth;
  const h = box.offsetHeight;
  if (!w || !h) return;
  const c = Math.min(bevel, h * 0.45);
  const d = bevelPath(w, h, c);
  let svg = box.querySelector<SVGSVGElement>(":scope > .border-svg");
  if (!svg) {
    svg = document.createElementNS(SVGNS, "svg") as SVGSVGElement;
    svg.setAttribute("class", "border-svg");
    svg.setAttribute("preserveAspectRatio", "none");
    const p = document.createElementNS(SVGNS, "path");
    svg.appendChild(p);
    box.appendChild(svg);
  }
  svg.setAttribute("viewBox", "0 0 " + w + " " + h);
  const path = svg.querySelector("path")!;
  path.setAttribute("d", d);
  const content = box.querySelector<HTMLElement>(":scope > .beveled-box-content");
  if (content) content.style.clipPath = 'path("' + d + '")';
}

export interface BeveledBoxProps {
  bevel?: number;
  className?: string;
  children: React.ReactNode;
  hasBorder?: boolean;
}

/**
 * Chanfro assinatura do design system: um canto cortado, desenhado via SVG
 * calculado no cliente (mesma lógica de bevelPath/drawBevel em index.html)
 * e reaplicado a cada resize do próprio box.
 */
export function BeveledBox({ bevel = 16, className = "", children, hasBorder = true }: BeveledBoxProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const redraw = () => drawBevel(box, bevel);
    redraw();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(redraw);
      ro.observe(box);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", redraw);
    return () => window.removeEventListener("resize", redraw);
  }, [bevel]);

  return (
    <span ref={ref} className={`beveled-box ${hasBorder ? "has-border" : ""} ${className}`}>
      <span className="beveled-box-content">{children}</span>
    </span>
  );
}
