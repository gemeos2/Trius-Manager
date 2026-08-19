type DotStyle = "solid" | "hollow" | "cross" | "positive" | "arrow-up" | "arrow-down";

interface BadgeProps {
  label: string;
  dot?: DotStyle;
}

const DOT_CLASS: Record<Exclude<DotStyle, "cross" | "arrow-up" | "arrow-down">, string> = {
  solid: "dot-solid",
  hollow: "dot-hollow",
  positive: "dot-positive",
};

export function Badge({ label, dot = "hollow" }: BadgeProps) {
  return (
    <span className="badge-status">
      {dot === "cross" ? (
        <span className="dot dot-cross" aria-hidden="true">×</span>
      ) : dot === "arrow-up" || dot === "arrow-down" ? (
        <svg className={`dot dot-arrow ${dot === "arrow-up" ? "dot-arrow-up" : "dot-arrow-down"}`} width="8" height="8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <span className={`dot ${DOT_CLASS[dot]}`} aria-hidden="true" />
      )}
      {label}
    </span>
  );
}
