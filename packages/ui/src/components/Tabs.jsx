/**
 * Underlined tab bar. The caller owns the active value so tabs can be
 * driven by a query parameter and stay linkable.
 */
export function Tabs({ tabs, value, onChange, ariaLabel = "Sections" }) {
  return (
    <div className="border-b border-line">
      <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => {
          const active = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              id={`tab-${tab.value}`}
              aria-selected={active}
              aria-controls={`panel-${tab.value}`}
              onClick={() => onChange(tab.value)}
              className={`inline-flex min-h-11 shrink-0 items-center border-b-2 px-3 text-small font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                active
                  ? "border-ink text-ink"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TabPanel({ value, children }) {
  return (
    <div role="tabpanel" id={`panel-${value}`} aria-labelledby={`tab-${value}`} className="mt-6">
      {children}
    </div>
  );
}
