export function Progress({ value, total, showLabel = true }: { value: number; total: number; showLabel?: boolean }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="ds-progress">
      <div className="ds-progress-track">
        <div className="ds-progress-fill" style={{ "--progress": `${pct}%` } as React.CSSProperties} />
      </div>
      {showLabel && <span className="ds-progress-label">{value}/{total}</span>}
    </div>
  );
}
