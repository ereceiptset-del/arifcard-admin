/**
 * A short trust note with its icon: "Secure sign-in", "Verified payment
 * workflow". Plain words carry the meaning; the icon only supports them.
 */
export function FeatureBadge({ icon: Icon, children }) {
  return (
    <li className="flex min-w-0 items-center gap-2 text-small text-ink-muted">
      <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-tag bg-info-tint text-info">
        <Icon size={14} strokeWidth={2.25} />
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** A small list of FeatureBadges, two per row from small screens up. */
export function FeatureBadgeList({ items, label, className = "" }) {
  return (
    <ul aria-label={label} className={`grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2 ${className}`}>
      {items.map(({ icon, text }) => (
        <FeatureBadge key={text} icon={icon}>
          {text}
        </FeatureBadge>
      ))}
    </ul>
  );
}

export default FeatureBadge;
