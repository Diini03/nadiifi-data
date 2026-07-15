import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  withWordmark?: boolean;
}

/**
 * CleanLab brand mark — a minimalist "data cube + spark":
 * rounded square with a 2x2 grid of dots and a single accent dot.
 * Uses currentColor for outline and --primary via CSS var for accent.
 */
export function Logo({ className, size = 20, withWordmark = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="2.5"
          y="2.5"
          width="19"
          height="19"
          rx="5.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" />
        <circle cx="15.5" cy="8.5" r="1.4" fill="currentColor" opacity="0.55" />
        <circle cx="8.5" cy="15.5" r="1.4" fill="currentColor" opacity="0.55" />
        <circle cx="15.5" cy="15.5" r="1.9" fill="hsl(var(--primary))" />
      </svg>
      {withWordmark && (
        <span className="text-[13px] font-semibold tracking-tight leading-none">
          cleanlab
        </span>
      )}
    </span>
  );
}
