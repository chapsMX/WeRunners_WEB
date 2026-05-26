import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "highlight";
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 transition-all duration-200",
          {
            "bg-slate-900/50 border border-slate-800 hover:border-slate-700":
              variant === "default",
            "bg-brand-lime/5 border border-brand-lime/30 hover:border-brand-lime":
              variant === "highlight",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
