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
          "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "text-sm px-3 py-1.5": size === "sm",
            "text-sm px-4 py-2.5": size === "md",
            "text-base px-6 py-3": size === "lg",
          },
          {
            // Primary: green background
            "bg-brand-green text-black hover:bg-brand-green/80 active:bg-brand-green/70":
              variant === "primary",
            // Secondary: border with theme-aware colors
            "bg-transparent border border-line text-foreground hover:border-brand-green hover:text-brand-green":
              variant === "secondary",
            // Ghost
            "bg-transparent text-muted hover:text-foreground":
              variant === "ghost",
            // Outline
            "bg-transparent border border-brand-green text-brand-green hover:bg-brand-green hover:text-black":
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
