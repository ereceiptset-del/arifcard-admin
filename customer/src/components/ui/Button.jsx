import { forwardRef } from "react";

const VARIANT_CLASSES = {
  primary:
    "bg-[#8055FF] text-white hover:bg-[#7447F8] active:bg-[#6C3FE0] disabled:bg-[#A98FF5] disabled:cursor-not-allowed",
};

const Button = forwardRef(function Button(
  { variant = "primary", isLoading = false, className = "", children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`relative h-11 w-full rounded-lg text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8055FF]/30 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      <span className={isLoading ? "opacity-0" : "opacity-100"}>{children}</span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </span>
      )}
    </button>
  );
});

export default Button;