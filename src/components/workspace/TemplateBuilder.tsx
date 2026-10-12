import { useEffect, useState } from "react";
import { Palette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type FontChoice = "sans" | "display" | "mono" | "serif";
export type LayoutChoice = "auto" | "one" | "two" | "three";
export type DensityChoice = "compact" | "comfortable" | "airy";

export interface CustomTemplate {
  enabled: boolean;
  font: FontChoice;
  /** HSL triplet, e.g. "76 92% 48%" */
  accent: string;
  layout: LayoutChoice;
  density: DensityChoice;
  rounded: boolean;
}

export const DEFAULT_CUSTOM: CustomTemplate = {
  enabled: false,
  font: "display",
  accent: "76 92% 48%",
  layout: "auto",
  density: "comfortable",
  rounded: true,
};

const KEY = "nadiifi:custom-template";

export function useCustomTemplate() {
  const [tpl, setTpl] = useState<CustomTemplate>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT_CUSTOM, ...JSON.parse(raw) } : DEFAULT_CUSTOM;
    } catch {
      return DEFAULT_CUSTOM;
    }
  });
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(tpl));
  }, [tpl]);
  return [tpl, setTpl] as const;
}

export const FONT_CLASS: Record<FontChoice, string> = {
  sans: "font-sans",
  display: "font-display",
  mono: "font-mono",
  serif: "font-serif",
};
export const LAYOUT_CLASS: Record<LayoutChoice, string | null> = {
  auto: null,
  one: "grid gap-4 grid-cols-1",
  two: "grid gap-4 lg:grid-cols-2",
  three: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
};
export const DENSITY_CLASS: Record<DensityChoice, string> = {
  compact: "space-y-3 p-4",
  comfortable: "space-y-5 p-6",
  airy: "space-y-8 p-10",
};

const ACCENTS = [
  { name: "Lime", v: "76 92% 48%" },
  { name: "Cyan", v: "190 90% 45%" },
  { name: "Blue", v: "221 83% 53%" },
  { name: "Violet", v: "262 70% 58%" },
  { name: "Rose", v: "346 77% 55%" },
  { name: "Amber", v: "38 92% 50%" },
  { name: "Emerald", v: "158 64% 40%" },
  { name: "Graphite", v: "220 16% 20%" },
];

function Seg<T extends string>({ value, options, onChange }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={cn(
            "rounded-md border px-2 py-1 text-[12px]",
            value === o.v ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function TemplateBuilder({ value, onChange }: { value: CustomTemplate; onChange: (t: CustomTemplate) => void }) {
  const set = (p: Partial<CustomTemplate>) => onChange({ ...value, ...p, enabled: true });
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant={value.enabled ? "default" : "outline"} className="gap-1.5">
          <Palette className="h-3.5 w-3.5" />
          {value.enabled ? "Custom style on" : "Customize"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-4">
        <div>
          <div className="font-display text-sm font-semibold">Template builder</div>
          <p className="text-[12px] text-muted-foreground">Your style is saved and applied on top of any template and dataset.</p>
        </div>
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Font</div>
          <Seg value={value.font} onChange={(font) => set({ font })} options={[{ v: "display", l: "Display" }, { v: "sans", l: "Sans" }, { v: "serif", l: "Serif" }, { v: "mono", l: "Mono" }]} />
        </div>
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Accent color</div>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.v}
                type="button"
                title={a.name}
                aria-label={`Accent ${a.name}`}
                onClick={() => set({ accent: a.v })}
                className={cn("h-7 w-7 rounded-full border-2", value.accent === a.v ? "border-foreground" : "border-transparent")}
                style={{ background: `hsl(${a.v})` }}
              />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Chart columns</div>
          <Seg value={value.layout} onChange={(layout) => set({ layout })} options={[{ v: "auto", l: "Template" }, { v: "one", l: "1" }, { v: "two", l: "2" }, { v: "three", l: "3" }]} />
        </div>
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Spacing</div>
          <Seg value={value.density} onChange={(density) => set({ density })} options={[{ v: "compact", l: "Compact" }, { v: "comfortable", l: "Comfortable" }, { v: "airy", l: "Airy" }]} />
        </div>
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Corners</div>
          <Seg value={value.rounded ? "r" : "s"} onChange={(v) => set({ rounded: v === "r" })} options={[{ v: "r", l: "Rounded" }, { v: "s", l: "Square" }]} />
        </div>
        <div className="flex justify-between border-t pt-3">
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => onChange(DEFAULT_CUSTOM)}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button size="sm" variant="outline" onClick={() => onChange({ ...value, enabled: !value.enabled })}>
            {value.enabled ? "Turn off" : "Turn on"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
