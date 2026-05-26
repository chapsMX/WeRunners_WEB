import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-lg bg-slate-900 border border-slate-700 text-foreground placeholder:text-slate-500",
          "px-4 py-3 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-brand-lime focus:border-transparent",
          "transition-colors duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
