import { avatarGradient, initials, cn } from "@/lib/utils";

export function Avatar({
  name,
  src,
  seed,
  size = 40,
  className,
  ring,
}: {
  name: string;
  src?: string | null;
  seed?: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const dim = { width: size, height: size };
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-on-primary",
        ring && "ring-2 ring-surface-card",
        className,
      )}
      style={dim}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <span
          className="grid size-full place-items-center font-medium"
          style={{
            background: avatarGradient(seed ?? name),
            fontSize: size * 0.38,
          }}
        >
          {initials(name) || "?"}
        </span>
      )}
    </span>
  );
}
