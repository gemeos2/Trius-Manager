"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { InputField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { currentMonthParam, shiftMonthParam } from "@/lib/relatorios/period";

const MONTH_LABEL = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

function monthLabel(period: string) {
  const [year, month] = period.split("-").map(Number);
  return MONTH_LABEL.format(new Date(year, month - 1, 1));
}

export function ReportPeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCustom = Boolean(searchParams.get("start") && searchParams.get("end"));
  const period = searchParams.get("period") ?? currentMonthParam();

  function goToMonth(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("period", value);
    params.delete("start");
    params.delete("end");
    router.push(`?${params.toString()}`);
  }

  function submitRange(formData: FormData) {
    const start = String(formData.get("start") ?? "");
    const end = String(formData.get("end") ?? "");
    if (!start || !end) return;
    const params = new URLSearchParams(searchParams);
    params.set("start", start);
    params.set("end", end);
    params.delete("period");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex" style={{ flexDirection: "column", gap: "1rem" }}>
      <div className="finance-period-selector">
        <button type="button" onClick={() => goToMonth(shiftMonthParam(period, -1))} aria-label="Mês anterior">←</button>
        <span className="finance-period-label">{monthLabel(period)}</span>
        <button type="button" onClick={() => goToMonth(shiftMonthParam(period, 1))} aria-label="Próximo mês">→</button>
        <button type="button" className={!isCustom ? "is-active" : ""} onClick={() => goToMonth(currentMonthParam())}>
          Mês atual
        </button>
      </div>

      <form action={submitRange} className="report-range-form">
        <InputField id="report-start" label="De" type="date" name="start" defaultValue={isCustom ? (searchParams.get("start") ?? "") : ""} />
        <InputField id="report-end" label="Até" type="date" name="end" defaultValue={isCustom ? (searchParams.get("end") ?? "") : ""} />
        <Button type="submit" variant="transparent" cornerDots size="sm">
          Aplicar período
        </Button>
      </form>
    </div>
  );
}
