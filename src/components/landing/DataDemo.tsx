import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DEMO_COLUMNS,
  DEMO_ROWS,
  DEMO_TYPES,
  cleanDemo,
  computeFlags,
  demoIssues,
  type DemoRow,
  type FlagKind,
} from "@/lib/demo/salesDemo";

type Step = "messy" | "issues" | "clean" | "charts";

const STEPS: { id: Step; label: string }[] = [
  { id: "messy", label: "Messy data" },
  { id: "issues", label: "Problems detected" },
  { id: "clean", label: "Clean data" },
  { id: "charts", label: "Charts" },
];

const FLAG_STYLE: Record<FlagKind, string> = {
  missing: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/30",
  duplicate: "bg-warning/10 text-warning ring-1 ring-inset ring-warning/30",
  whitespace: "bg-info/10 text-info ring-1 ring-inset ring-info/30",
  inconsistent: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/30",
  type: "bg-accent text-accent-foreground ring-1 ring-inset ring-primary/20",
};

const FLAG_MARK: Record<FlagKind, string> = {
  missing: "!",
  duplicate: "=",
  whitespace: "␣",
  inconsistent: "≠",
  type: "T",
};

function display(v: unknown) {
  if (v === null || v === undefined || String(v).trim() === "") return "—";
  return String(v);
}

export function DataDemo() {
  const [step, setStep] = useState<Step>("messy");
  const [focus, setFocus] = useState<FlagKind | null>(null);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const cleaned = useMemo(() => cleanDemo(DEMO_ROWS), []);
  const flags = useMemo(() => computeFlags(DEMO_ROWS), []);
  const issues = useMemo(() => demoIssues(DEMO_ROWS), []);

  const showClean = step === "clean" || step === "charts";
  const baseRows: DemoRow[] = showClean ? cleaned : DEMO_ROWS;

  const rows = useMemo(() => {
    if (!sortCol) return baseRows.map((r, i) => ({ row: r, index: i }));
    const withIndex = baseRows.map((r, i) => ({ row: r, index: i }));
    return withIndex.sort((a, b) => {
      const av = a.row[sortCol];
      const bv = b.row[sortCol];
      const an = typeof av === "number" ? av : Number(av);
      const bn = typeof bv === "number" ? bv : Number(bv);
      const cmp =
        Number.isFinite(an) && Number.isFinite(bn)
          ? an - bn
          : String(av ?? "").localeCompare(String(bv ?? ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [baseRows, sortCol, sortDir]);

  const revenueByRegion = useMemo(() => {
    const map = new Map<string, number>();
    cleaned.forEach((r) => {
      const k = String(r.Region ?? "Unknown");
      map.set(k, (map.get(k) ?? 0) + Number(r.Revenue ?? 0));
    });
    return [...map.entries()].map(([region, revenue]) => ({ region, revenue: Math.round(revenue) }));
  }, [cleaned]);

  const revenueOverTime = useMemo(() => {
    const map = new Map<string, number>();
    cleaned.forEach((r) => {
      const k = String(r["Order Date"] ?? "");
      map.set(k, (map.get(k) ?? 0) + Number(r.Revenue ?? 0));
    });
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({ date: date.slice(5), revenue: Math.round(revenue) }));
  }, [cleaned]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  return (
    <section id="product" className="relative">
      <div className="rounded-2xl border border-border bg-card shadow-elevated">
        {/* stepper */}
        <div className="flex flex-wrap items-center gap-1 border-b border-border/70 p-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                type="button"
                onClick={() => setStep(s.id)}
                aria-current={step === s.id ? "step" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-[12.5px] font-medium transition-colors",
                  step === s.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="mr-1.5 tabular-nums opacity-60">{i + 1}</span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <ArrowRight className="mx-0.5 h-3.5 w-3.5 text-border-strong" aria-hidden />
              )}
            </div>
          ))}
          <div className="ml-auto hidden items-center gap-2 pr-2 text-[12px] text-muted-foreground sm:flex">
            <span className="font-mono">sales_january.csv</span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{baseRows.length} rows</span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{DEMO_COLUMNS.length} cols</span>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
          {/* table / charts */}
          <div className="min-w-0 p-3 sm:p-4">
            {step === "charts" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <figure className="rounded-xl border border-border/70 p-3">
                  <figcaption className="mb-2 text-[12.5px] font-medium text-foreground">
                    Revenue by region
                    <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                      category + number → bar
                    </span>
                  </figcaption>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByRegion}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="region" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={40} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </figure>
                <figure className="rounded-xl border border-border/70 p-3">
                  <figcaption className="mb-2 text-[12.5px] font-medium text-foreground">
                    Revenue over time
                    <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                      date + number → line
                    </span>
                  </figcaption>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={40} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </figure>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border/70">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <caption className="sr-only">
                    Sample sales dataset {showClean ? "after" : "before"} cleaning
                  </caption>
                  <thead className="sticky top-0 bg-muted/60">
                    <tr>
                      {DEMO_COLUMNS.map((c) => (
                        <th key={c} scope="col" className="whitespace-nowrap px-3 py-2 align-bottom">
                          <button
                            type="button"
                            onClick={() => toggleSort(c)}
                            className="flex flex-col items-start gap-0.5 text-left hover:text-primary"
                            aria-label={`Sort by ${c}`}
                          >
                            <span className="flex items-center gap-1 text-[12px] font-semibold text-foreground">
                              {c}
                              <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />
                            </span>
                            <span className="font-mono text-[10px] uppercase text-muted-foreground">
                              {DEMO_TYPES[c]}
                            </span>
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ row, index }) => (
                      <tr key={index} className="border-t border-border/60">
                        {DEMO_COLUMNS.map((c) => {
                          const cellFlags = showClean ? undefined : flags.get(`${index}:${c}`);
                          const active =
                            cellFlags &&
                            (step === "issues" || focus) &&
                            (focus ? cellFlags.has(focus) : true);
                          const primaryFlag = focus && cellFlags?.has(focus)
                            ? focus
                            : cellFlags
                              ? [...cellFlags][0]
                              : null;
                          return (
                            <td
                              key={c}
                              className={cn(
                                "px-3 py-1.5 text-[12.5px] transition-colors",
                                c === "Quantity" || c === "Price" || c === "Revenue"
                                  ? "font-mono tabular-nums"
                                  : "",
                                active && primaryFlag
                                  ? cn("rounded", FLAG_STYLE[primaryFlag])
                                  : "text-foreground",
                              )}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                {display(row[c])}
                                {active && primaryFlag && (
                                  <span
                                    className="font-mono text-[10px] opacity-70"
                                    aria-label={`${primaryFlag} issue`}
                                  >
                                    {FLAG_MARK[primaryFlag]}
                                  </span>
                                )}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* side panel */}
          <aside className="border-t border-border/70 p-4 lg:border-l lg:border-t-0">
            {step === "messy" && (
              <div className="space-y-3">
                <h3 className="text-[13px] font-semibold text-foreground">
                  What is wrong with this data?
                </h3>
                <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                  This is a real January sales extract. It looks fine until you total it: the
                  revenue is overstated, two regions are actually four, and prices are text.
                </p>
                <Button size="sm" className="w-full" onClick={() => setStep("issues")}>
                  Detect problems
                </Button>
              </div>
            )}

            {step === "issues" && (
              <div className="space-y-2">
                <h3 className="text-[13px] font-semibold text-foreground">Problems detected</h3>
                <ul className="space-y-1.5">
                  {issues.map((issue) => (
                    <li key={issue.kind}>
                      <button
                        type="button"
                        onClick={() => setFocus(focus === issue.kind ? null : issue.kind)}
                        aria-pressed={focus === issue.kind}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                          focus === issue.kind
                            ? "border-primary bg-primary-soft"
                            : "border-border/70 hover:bg-muted",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block text-[12.5px] font-medium text-foreground">
                            {issue.label}
                          </span>
                          <span className="block truncate text-[11.5px] text-muted-foreground">
                            {issue.detail}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[12px] tabular-nums text-foreground">
                          {issue.count}
                          <span className="ml-1 text-[10px] text-muted-foreground">{issue.unit}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <Button size="sm" className="mt-2 w-full gap-1.5" onClick={() => setStep("clean")}>
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Clean data
                </Button>
              </div>
            )}

            {step === "clean" && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                  Cleaning summary
                </h3>
                <dl className="divide-y divide-border/60 rounded-lg border border-border/70">
                  {[
                    ["Rows", `${DEMO_ROWS.length} → ${cleaned.length}`],
                    ["Duplicates removed", String(DEMO_ROWS.length - cleaned.length)],
                    ["Missing values handled", String(issues[0].count)],
                    ["Values standardized", String(issues[2].count + issues[3].count)],
                    ["Columns retyped", "3"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between px-3 py-2">
                      <dt className="text-[12.5px] text-muted-foreground">{k}</dt>
                      <dd className="font-mono text-[12.5px] tabular-nums text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
                <Button size="sm" className="w-full" onClick={() => setStep("charts")}>
                  Visualize it
                </Button>
              </div>
            )}

            {step === "charts" && (
              <div className="space-y-3">
                <h3 className="text-[13px] font-semibold text-foreground">Charts, automatically</h3>
                <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                  NadiifiData reads each column type and recommends the chart that fits: dates get
                  a trend line, categories get bars, two numbers get a scatter plot.
                </p>
                <Button asChild size="sm" className="w-full gap-1.5">
                  <Link to="/app">
                    Try it with your own file
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </Button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
