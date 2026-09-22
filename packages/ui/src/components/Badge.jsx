const TONES = {
  neutral: "bg-panel-muted dark:bg-white/5 text-ink-muted dark:text-ink-muted-dark border-line dark:border-line-dark",
  brand: "bg-brand/10 text-brand border-brand/25",
  ok: "bg-ok/10 text-ok border-ok/25",
  warn: "bg-warn/10 text-warn border-warn/25",
  danger: "bg-danger/10 text-danger border-danger/25",
  info: "bg-info/10 text-info border-info/25",
};

/** Small status pill. */
export function Badge({ tone = "neutral", icon: Icon, children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium ${TONES[tone]} ${className}`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
