import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong bg-canvas-soft px-6 py-12 text-center",
        className,
      )}
    >
      <span className="mb-4 grid size-12 place-items-center rounded-xl bg-surface-strong text-muted">
        <Icon className="size-6" />
      </span>
      <p className="text-title-md text-ink">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-body-sm text-body">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
