import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const TONE_STYLES = {
  success: { icon: CheckCircle2, ring: "border-ok/30 bg-ok/10", color: "text-ok" },
  error: { icon: AlertCircle, ring: "border-danger/30 bg-danger/10", color: "text-danger" },
  info: { icon: Info, ring: "border-info/30 bg-info/10", color: "text-info" },
};

let nextId = 0;

/**
 * Toast host. Messages are announced politely rather than interrupting,
 * and each one can be dismissed by keyboard.
 */
export function ToastProvider({ children, duration = 5000 }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = ++nextId;
    setToasts((current) => [...current, { id, tone: "info", ...toast }]);
    return id;
  }, []);

  const value = useMemo(
    () => ({
      push,
      dismiss,
      success: (message, title) => push({ tone: "success", message, title }),
      error: (message, title) => push({ tone: "error", message, title }),
      info: (message, title) => push({ tone: "info", message, title }),
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} duration={duration} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, duration, onDismiss }) {
  const { icon: Icon, ring, color } = TONE_STYLES[toast.tone] || TONE_STYLES.info;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-panel border ${ring} bg-panel dark:bg-panel-dark px-4 py-3 shadow-raised opacity-100 translate-y-0 transition-[opacity,transform] duration-200 starting:opacity-0 starting:-translate-y-2`}
    >
      <Icon size={16} className={`mt-px shrink-0 ${color}`} />
      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className="text-[13px] font-semibold text-ink dark:text-ink-dark">{toast.title}</p>
        )}
        <p className="text-[13px] text-ink-soft dark:text-ink-muted-dark">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 text-ink-faint hover:text-ink dark:hover:text-ink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside a ToastProvider");
  return context;
}
