import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  withWordmark?: boolean;
  wordmarkClassName?: string;
}

/**
 * Nadiifi brand mark — three broken/uneven strokes on the left resolving into
 * one clean solid stroke on the right: messy data becoming clean data.
 * Set inside a charcoal squircle so it works as favicon and app icon.
 */
export function Logo({ className, size = 26, withWordmark = false, wordmarkClassName }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Nadiifi"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="9" fill="hsl(var(--foreground))" />
        {/* messy strokes */}
        <rect x="7" y="9" width="7" height="2.4" rx="1.2" fill="hsl(var(--background))" opacity="0.45" />
        <rect x="7" y="14.8" width="4.5" height="2.4" rx="1.2" fill="hsl(var(--background))" opacity="0.45" />
        <rect x="7" y="20.6" width="8.5" height="2.4" rx="1.2" fill="hsl(var(--background))" opacity="0.45" />
        {/* clean resolved stroke */}
        <rect x="18.5" y="7.5" width="3" height="17" rx="1.5" fill="hsl(var(--primary))" />
        {/* clarity dot */}
        <circle cx="24.6" cy="9.2" r="1.9" fill="hsl(var(--cyan))" />
      </svg>
      {withWordmark && (
        <span
          className={cn(
            "font-display text-[16px] font-semibold leading-none tracking-[-0.03em]",
            wordmarkClassName,
          )}
        >
          Nadiifi
        </span>
      )}
    </span>
  );
}
