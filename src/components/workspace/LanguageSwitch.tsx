import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Lang } from "@/lib/i18n/dict";
import { Button } from "@/components/ui/button";

export function LanguageSwitch() {
  const { lang, setLang } = useI18n();
  const opts: { code: Lang; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "so", label: "SO" },
  ];
  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center rounded-full border border-border bg-card p-0.5 shadow-soft"
    >
      {opts.map((o) => {
        const active = lang === o.code;
        return (
          <Button
            key={o.code}
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setLang(o.code)}
            aria-pressed={active}
            className={
              "h-7 rounded-full px-3 text-[11px] font-semibold tracking-wide transition-colors " +
              (active
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {o.label}
          </Button>
        );
      })}
    </div>
  );
}
