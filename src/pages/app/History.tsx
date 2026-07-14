import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDatasetStore } from "@/store/useDatasetStore";
import { formatRelative } from "@/lib/format";
import { Download, History as HistoryIcon } from "lucide-react";

export default function History() {
  const exports = useDatasetStore((s) => s.exports);

  useEffect(() => {
    document.title = "History · CleanLab AI";
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">Recent exports across all datasets.</p>
      </div>

      <Card className="p-5 shadow-soft">
        {exports.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <HistoryIcon className="h-5 w-5" />
            </div>
            <h3 className="font-medium">No history yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Exports and reports will show up here.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {exports.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Download className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{e.datasetName}</div>
                    <div className="text-xs text-muted-foreground">Exported as {e.format.toUpperCase()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="uppercase">{e.format}</Badge>
                  <span className="text-xs text-muted-foreground">{formatRelative(e.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
