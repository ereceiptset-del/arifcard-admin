import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const OPTIONS = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface-1 p-0.5">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={label}
          aria-pressed={theme === value}
          className={`flex h-7 w-7 items-center justify-center rounded-tag transition-colors duration-150 ${
            theme === value
              ? "bg-accent text-on-accent"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}