import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime disabled:opacity-50 disabled:cursor-not-allowed",
          // Size variants
          {
            "text-sm px-3 py-1.5": size === "sm",
            "text-sm px-4 py-2.5": size === "md",
            "text-base px-6 py-3": size === "lg",
          },
          // Color variants
          {
            // Primary: lime background
            "bg-brand-lime text-black hover:bg-lime-300 active:bg-lime-500":
              variant === "primary",
            // Secondary: dark border
            "bg-transparent border border-slate-600 text-foreground hover:border-brand-lime hover:text-brand-lime":
              variant === "secondary",
            // Ghost: no border
            "bg-transparent text-slate-400 hover:text-foreground":
              variant === "ghost",
            // Outline: brand-lime border
            "bg-transparent border border-brand-lime text-brand-lime hover:bg-brand-lime hover:text-black":
              variant === "outline",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
