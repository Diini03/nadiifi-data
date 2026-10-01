import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Dataset } from "@/lib/cleanlab/types";
import { detectIssues } from "@/lib/cleanlab/issues";

function buildDigest(ds: Dataset) {
  return {
    name: ds.name,
    rows: ds.rows.length,
    columns: ds.columns.slice(0, 60).map((c) => ({
      name: c.name,
      type: c.type,
      missingPct: Math.round(c.stats.missingPct * 10) / 10,
      unique: c.stats.unique,
      ...(c.stats.mean !== undefined
        ? { min: c.stats.min, max: c.stats.max, mean: c.stats.mean, median: c.stats.median, outliers: c.stats.outliersIQR }
        : { top: c.stats.top.slice(0, 5).map((t) => ({ value: String(t.value).slice(0, 40), count: t.count })) }),
    })),
    issues: detectIssues(ds).slice(0, 15).map((i) => ({ title: i.title, severity: i.severity, column: i.column })),
  };
}

const cache = new Map<string, string>();

export function AiSummary({ dataset }: { dataset: Dataset }) {
  const key = `${dataset.id}:${dataset.updatedAt}:${dataset.rows.length}`;
  const [text, setText] = useState<string | null>(cache.get(key) ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(cache.get(key) ?? null);
    setError(null);
  }, [key]);

  const run = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.functions.invoke("ai-assist", {
      body: { mode: "summary", digest: buildDigest(dataset) },
    });
    setLoading(false);
    if (err || !data?.text) {
      let msg = data?.error as string | undefined;
      try {
        const ctx = (err as { context?: Response })?.context;
        if (ctx) msg = (await ctx.json())?.error ?? msg;
      } catch { /* ignore */ }
      setError(msg ?? "Couldn't generate a summary.");
      return;
    }
    cache.set(key, data.text);
    setText(data.text);
  };

  return (
    <section className="rounded-xl border border-border/70 bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[15px] font-semibold">AI briefing</h2>
          <p className="text-[12.5px] text-muted-foreground">
            Plain-English findings and next steps. Only column statistics are sent — never your rows.
          </p>
        </div>
        <Button size="sm" variant={text ? "outline" : "default"} className="h-8 text-[13px]" onClick={run} disabled={loading}>
          {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : text ? <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
          {loading ? "Thinking…" : text ? "Regenerate" : "Generate"}
        </Button>
      </div>
      {error && <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">{error}</p>}
      {text && (
        <div className="mt-4 space-y-1.5 text-[13.5px] leading-relaxed">
          {text.split("\n").filter((l) => l.trim()).map((line, i) =>
            line.trim().startsWith("- ") ? (
              <p key={i} className="flex gap-2 pl-1 text-muted-foreground">
                <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-foreground/60" />
                <span>{line.trim().slice(2)}</span>
              </p>
            ) : /:$/.test(line.trim()) ? (
              <p key={i} className="pt-2 text-[11px] font-semibold uppercase tracking-wider">{line.trim().replace(/:$/, "")}</p>
            ) : (
              <p key={i}>{line}</p>
            ),
          )}
        </div>
      )}
    </section>
  );
}
