import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { Dialog } from "./Dialog.jsx";

/**
 * Trigger + dialog picker for long option lists.
 *
 * The dialog carries a search box and a keyboard-navigable listbox
 * (arrow keys move, Enter selects, Escape closes via Dialog). Used for the
 * occupation list, which is far too long for a plain select.
 */
export function SearchableSelect({
  label,
  hint,
  error,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  dialogTitle,
  searchPlaceholder = "Search…",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.toLowerCase().includes(needle));
  }, [options, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  // Keep the highlighted row in view as the user arrows through.
  useEffect(() => {
    const active = listRef.current?.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const commit = (option) => {
    onChange(option);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && filtered[activeIndex]) {
      event.preventDefault();
      commit(filtered[activeIndex]);
    }
  };

  return (
    <div>
      {label && (
        <span className="mb-1.5 block text-[13px] font-medium text-ink dark:text-ink-dark">
          {label}
        </span>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        aria-haspopup="dialog"
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-field border bg-panel dark:bg-[#141823] px-3 text-left text-[13.5px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-55 ${
          error ? "border-danger" : "border-line-strong dark:border-line-strong-dark"
        } ${value ? "text-ink dark:text-ink-dark" : "text-ink-faint"}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={16} className="shrink-0 text-ink-faint" />
      </button>

      {error ? (
        <p className="mt-1.5 text-[12px] text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-ink-faint">{hint}</p>
      ) : null}

      <Dialog open={open} onClose={() => setOpen(false)} title={dialogTitle || label} size="sm">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="text"
            value={query}
            autoFocus
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-10 w-full rounded-field border border-line-strong dark:border-line-strong-dark bg-panel dark:bg-[#141823] pl-9 pr-3 text-[13.5px] text-ink dark:text-ink-dark placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <ul
          ref={listRef}
          role="listbox"
          aria-label={dialogTitle || label}
          className="mt-3 max-h-[46vh] overflow-y-auto"
        >
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-[13px] text-ink-muted dark:text-ink-muted-dark">
              Nothing matches “{query}”.
            </li>
          )}
          {filtered.map((option, index) => {
            const selected = option === value;
            return (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  data-active={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(option)}
                  className={`flex w-full items-center justify-between gap-2 rounded-field px-3 py-2.5 text-left text-[13.5px] transition-colors ${
                    index === activeIndex
                      ? "bg-panel-muted dark:bg-white/5 text-ink dark:text-ink-dark"
                      : "text-ink-soft dark:text-ink-muted-dark"
                  }`}
                >
                  <span className="truncate">{option}</span>
                  {selected && <Check size={15} className="shrink-0 text-brand" />}
                </button>
              </li>
            );
          })}
        </ul>
      </Dialog>
    </div>
  );
}
