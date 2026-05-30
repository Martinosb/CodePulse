import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "success" | "error" | "thinking" | "grep" | "read" | "edit" | "done";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-strong text-ink",
  primary: "bg-primary/12 text-primary",
  success: "bg-success/15 text-success",
  error: "bg-error/12 text-error",
  thinking: "bg-tl-thinking/25 text-ink",
  grep: "bg-tl-grep/25 text-ink",
  read: "bg-tl-read/25 text-ink",
  edit: "bg-tl-edit/25 text-ink",
  done: "bg-tl-done/30 text-ink",
};

export function Badge({
  tone = "neutral",
  className,
  uppercase,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone; uppercase?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-caption font-medium leading-none",
        uppercase && "text-caption-upper uppercase",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
