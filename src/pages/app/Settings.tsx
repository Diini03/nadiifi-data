import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDatasetStore } from "@/store/useDatasetStore";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const clearAll = useDatasetStore((s) => s.clearAll);
  const datasets = useDatasetStore((s) => s.datasets);

  useEffect(() => {
    document.title = "Settings · NadiifiData";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <PageHeader title="Settings" description="Configure your NadiifiData experience." />

      <SectionCard title="Appearance" description="Match your OS theme or pick manually.">
        <Row label="Theme" hint="Choose light, dark, or match system preference.">
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="h-9 w-36" aria-label="Select theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </SectionCard>

      <SectionCard title="Workspace" description="Preferences for your local workspace.">
        <div className="space-y-5">
          <Row label="Auto-save" hint="Persist changes to your browser automatically.">
            <Switch defaultChecked disabled aria-label="Toggle auto-save" />
          </Row>
          <Row label="Language" hint="More languages coming soon.">
            <Select defaultValue="en">
              <SelectTrigger className="h-9 w-36" aria-label="Select language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Notifications" hint="Toast alerts for cleaning results.">
            <Switch defaultChecked aria-label="Toggle notifications" />
          </Row>
        </div>
      </SectionCard>

      <SectionCard
        title="Danger zone"
        description={`Delete all ${datasets.length} locally stored dataset${datasets.length === 1 ? "" : "s"} and history. This cannot be undone.`}
        className="border-destructive/30"
      >
        <Button
          variant="destructive"
          size="sm"
          className="h-9"
          onClick={async () => {
            if (confirm("Delete all datasets and history? This cannot be undone.")) {
              await clearAll();
              toast.success("All data cleared");
            }
          }}
        >
          Clear all data
        </Button>
      </SectionCard>
    </motion.div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <Label className="text-sm font-medium">{label}</Label>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
