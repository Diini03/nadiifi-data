import { Settings as SettingsIcon, Trash2, Languages, SunMoon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useDatasetStore } from "@/store/useDatasetStore";
import { toast } from "sonner";
import { LanguageSwitch } from "./LanguageSwitch";
import { ThemeToggle } from "@/components/app/ThemeToggle";

export function SettingsView() {
  const { t } = useI18n();
  const clearAll = useDatasetStore((s) => s.clearAll);

  return (
    <section className="mx-auto w-full max-w-3xl py-6">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <SettingsIcon className="h-5 w-5" />
        </span>
        <h2 className="font-display text-2xl leading-tight text-foreground">
          {t("settings.title")}
        </h2>
      </header>

      <div className="space-y-3">
        <SettingRow
          icon={<Languages className="h-4 w-4" />}
          title={t("settings.language")}
        >
          <LanguageSwitch />
        </SettingRow>

        <SettingRow
          icon={<SunMoon className="h-4 w-4" />}
          title={t("settings.theme")}
        >
          <ThemeToggle />
        </SettingRow>

        <SettingRow
          icon={<Trash2 className="h-4 w-4" />}
          title={t("settings.clearAll")}
          description={t("settings.clearAllDesc")}
        >
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-md border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={async () => {
              await clearAll();
              toast.success("All datasets cleared");
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("settings.clearAll")}
          </Button>
        </SettingRow>
      </div>
    </section>
  );
}

function SettingRow({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-card px-4 py-3.5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
          {icon}
        </span>
        <div>
          <p className="text-[13px] font-medium text-foreground">{title}</p>
          {description && (
            <p className="mt-0.5 max-w-md text-[11.5px] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
