import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

/** CodePulse wordmark — the dot on the "Pulse" carries the single brand orange. */
export function Logo({
  className,
  showText = true,
  size = 20,
}: {
  className?: string;
  showText?: boolean;
  size?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className="grid place-items-center rounded-md bg-primary text-on-primary"
        style={{ width: size + 8, height: size + 8 }}
        aria-hidden
      >
        <Activity style={{ width: size * 0.72, height: size * 0.72 }} strokeWidth={2.4} />
      </span>
      {showText && (
        <span className="text-[17px] font-semibold tracking-tight text-ink">
          Code<span className="text-primary">Pulse</span>
        </span>
      )}
    </span>
  );
}
