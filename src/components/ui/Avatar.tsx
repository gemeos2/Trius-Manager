function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, title }: { name: string; title?: string }) {
  return (
    <span className="ds-avatar" title={title ?? name}>
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names, max = 4 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;

  return (
    <span className="ds-avatar-stack">
      {shown.map((name, i) => (
        <Avatar key={i} name={name} />
      ))}
      {extra > 0 && <span className="ds-avatar" title={`+${extra}`}>+{extra}</span>}
    </span>
  );
}
