import { useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useDatasetStore } from "@/store/useDatasetStore";
import { formatRelative } from "@/lib/format";
import { Download, History as HistoryIcon } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { EmptyState } from "@/components/app/EmptyState";

export default function History() {
  const exports = useDatasetStore((s) => s.exports);

  useEffect(() => {
    document.title = "History · NadiifiData";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-8"
    >
      <PageHeader title="History" description="Recent exports across all datasets." />

      <SectionCard padded={exports.length === 0} contentClassName={exports.length > 0 ? "" : undefined}>
        {exports.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No history yet"
            description="Exports and cleaning reports will show up here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-6 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Dataset
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Format
                  </th>
                  <th className="px-6 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    When
                  </th>
                </tr>
              </thead>
              <tbody>
                {exports.map((e) => (
                  <tr key={e.id} className="border-b border-border/60 last:border-b-0 hover:bg-muted/40">
                    <td className="px-6 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                          <Download className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate font-medium" title={e.datasetName}>
                          {e.datasetName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="outline" className="uppercase text-[10px]">
                        {e.format}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-muted-foreground">
                      {formatRelative(e.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </motion.div>
  );
}
