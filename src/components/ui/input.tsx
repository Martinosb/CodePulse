import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border bg-surface-card px-4 text-body-md text-ink",
        "placeholder:text-muted-soft transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary/50",
        invalid ? "border-error/60" : "border-hairline-strong",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("mb-1.5 block text-title-sm text-ink", className)}
      {...props}
    />
  ),
);
Label.displayName = "Label";

export const FieldHint = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("mt-1.5 text-caption text-muted", className)} {...props} />
);

export const FieldError = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("mt-1.5 text-caption text-error", className)} {...props} />
);
