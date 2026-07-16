import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  withWordmark?: boolean;
  wordmarkClassName?: string;
}

/**
 * NadiifiData brand mark — a 3x3 grid of rounded squares.
 * Left/middle columns are outlined; the right column is filled with the
 * primary blue and accented by a small emerald sparkle.
 */
export function Logo({
  className,
  size = 22,
  withWordmark = false,
  wordmarkClassName,
}: LogoProps) {
  const cells = [
    { x: 2, y: 2, filled: false },
    { x: 11, y: 2, filled: false },
    { x: 20, y: 2, filled: true },
    { x: 2, y: 11, filled: false },
    { x: 11, y: 11, filled: false },
    { x: 20, y: 11, filled: true },
    { x: 2, y: 20, filled: false },
    { x: 11, y: 20, filled: false },
    { x: 20, y: 20, filled: true },
  ];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {cells.map((c, i) =>
          c.filled ? (
            <rect
              key={i}
              x={c.x}
              y={c.y}
              width="7"
              height="7"
              rx="1.6"
              fill="hsl(var(--primary))"
            />
          ) : (
            <rect
              key={i}
              x={c.x + 0.6}
              y={c.y + 0.6}
              width="5.8"
              height="5.8"
              rx="1.3"
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-muted-foreground/60"
            />
          )
        )}
        {/* Sparkle accent */}
        <path
          d="M27.5 6.5 L28.4 8.1 L30 9 L28.4 9.9 L27.5 11.5 L26.6 9.9 L25 9 L26.6 8.1 Z"
          fill="hsl(158 64% 42%)"
        />
      </svg>
      {withWordmark && (
        <span
          className={cn(
            "text-[15px] font-semibold tracking-[-0.01em] leading-none",
            wordmarkClassName
          )}
        >
          Nadiifi<span className="text-primary">Data</span>
        </span>
      )}
    </span>
  );
}
