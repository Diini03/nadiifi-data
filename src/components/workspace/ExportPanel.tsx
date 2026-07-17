import { Download, ExternalLink, ArrowRight, FileSpreadsheet, FileJson, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Dataset } from "@/lib/cleanlab/types";
import { exportCSV, exportJSON, exportXLSX } from "@/lib/cleanlab/exporters";

interface Props {
  dataset: Dataset;
}

export function ExportPanel({ dataset }: Props) {
  const { t } = useI18n();

  return (
    <section className="mx-auto w-full max-w-3xl animate-fade-up py-8">
      <div className="mb-6 text-center">
        <h2 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
          {t("export.title")}
        </h2>
        <p className="mt-2 text-[13px] text-muted-foreground">{t("export.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Download className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h3 className="text-[15px] font-semibold text-foreground">
            {t("export.downloadTitle")}
          </h3>
          <p className="mt-1 flex-1 text-[12.5px] text-muted-foreground">
            {t("export.downloadDesc")}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="mt-4 h-9 gap-2 rounded-lg bg-primary text-[13px] font-medium text-primary-foreground hover:bg-primary/90">
                <Download className="h-4 w-4" />
                {t("action.download")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => exportCSV(dataset)}>
                <FileText className="mr-2 h-4 w-4" /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportXLSX(dataset)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportJSON(dataset)}>
                <FileJson className="mr-2 h-4 w-4" /> JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </article>

        <article className="flex flex-col rounded-2xl border border-border bg-gradient-to-br from-primary-soft/60 to-card p-5 shadow-soft">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h3 className="text-[15px] font-semibold text-foreground">
            {t("export.xogTitle")}
          </h3>
          <p className="mt-1 flex-1 text-[12.5px] text-muted-foreground">
            {t("export.xogDesc")}
          </p>
          <a
            href="https://xog-arag.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-primary bg-transparent px-4 text-[13px] font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {t("action.continueXogArag")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </article>
      </div>

      <p className="mt-5 text-center text-[11.5px] italic text-muted-foreground">
        {t("export.split")}
      </p>
    </section>
  );
}
