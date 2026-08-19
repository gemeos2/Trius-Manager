"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { parsePeriod, toPeriodParam } from "@/lib/financeiro/period";

const MONTH_LABEL = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

export function PeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = parsePeriod(searchParams.get("period"));

  function goTo(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("period", value);
    router.push(`?${params.toString()}`);
  }

  function shiftMonth(delta: number) {
    const base = period === "all" ? new Date() : period;
    const next = new Date(base.getFullYear(), base.getMonth() + delta, 1);
    goTo(toPeriodParam(next));
  }

  return (
    <div className="finance-period-selector">
      {period !== "all" && (
        <>
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Mês anterior">←</button>
          <span className="finance-period-label">{MONTH_LABEL.format(period)}</span>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="Próximo mês">→</button>
        </>
      )}
      <button type="button" className={period === "all" ? "is-active" : ""} onClick={() => goTo(period === "all" ? toPeriodParam(new Date()) : "all")}>
        {period === "all" ? "Ver mês atual" : "Ver tudo"}
      </button>
    </div>
  );
}
