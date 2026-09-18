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
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-[#D9DDE4] bg-white p-0.5 dark:border-[#303643] dark:bg-[#141923]">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={label}
          aria-pressed={theme === value}
          className={`flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors duration-150 ${
            theme === value
              ? "bg-[#8055FF] text-white"
              : "text-[#687180] hover:text-[#101217] dark:text-[#A6AFBE] dark:hover:text-[#F6F7F9]"
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}