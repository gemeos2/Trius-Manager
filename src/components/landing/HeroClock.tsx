"use client";

import { useEffect, useState } from "react";

function formatClock() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} UTC-3`;
}

/**
 * Texto inicial neutro para não causar mismatch de hidratação — o horário
 * real só é aplicado depois do mount, no client.
 */
export function HeroClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatClock());
    const id = setInterval(tick, 1000 * 30);
    tick();
    return () => clearInterval(id);
  }, []);

  return <span>{time ?? "--:-- UTC-3"}</span>;
}
