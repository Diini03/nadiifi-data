import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function InspectingOverlay() {
  const { t } = useI18n();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="relative h-1 w-64 overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 w-1/2 animate-scan" />
      </div>
      <div className="mt-4 flex items-center gap-2 text-[13px] text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>{t("inspect.title")}</span>
      </div>
      <p className="text-[11.5px] text-muted-foreground/80">{t("inspect.subtitle")}</p>
    </div>
  );
}
