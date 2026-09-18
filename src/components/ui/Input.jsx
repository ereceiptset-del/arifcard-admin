import { forwardRef } from "react";

const Input = forwardRef(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-[7px] border border-[#D5DAE1] bg-white px-3 text-sm text-[#101217] placeholder:text-[#9AA2AF] transition-colors duration-150 focus:border-[#8055FF] focus:outline-none focus:ring-2 focus:ring-[#8055FF]/20 ${className}`}
      {...props}
    />
  );
});

export default Input;