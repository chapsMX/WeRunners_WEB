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
            "bg-surface-alt border border-line hover:border-brand-blue":
              variant === "default",
            "bg-brand-green/5 border border-brand-green/30 hover:border-brand-green":
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
