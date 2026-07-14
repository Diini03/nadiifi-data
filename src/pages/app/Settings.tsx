import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
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

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const clearAll = useDatasetStore((s) => s.clearAll);

  useEffect(() => {
    document.title = "Settings · CleanLab AI";
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your CleanLab AI experience.
        </p>
      </div>

      <Card className="p-6 shadow-soft">
        <h2 className="mb-4 font-semibold">Appearance</h2>
        <div className="space-y-4">
          <Row label="Theme" hint="Match your OS or pick manually.">
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </div>
      </Card>

      <Card className="p-6 shadow-soft">
        <h2 className="mb-4 font-semibold">Workspace</h2>
        <div className="space-y-4">
          <Row label="Auto-save" hint="Persist changes to your browser automatically.">
            <Switch defaultChecked disabled />
          </Row>
          <Row label="Language" hint="More languages coming soon.">
            <Select defaultValue="en">
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="en">English</SelectItem></SelectContent>
            </Select>
          </Row>
          <Row label="Notifications" hint="Toast alerts for cleaning results.">
            <Switch defaultChecked />
          </Row>
        </div>
      </Card>

      <Card className="border-destructive/30 p-6 shadow-soft">
        <h2 className="mb-2 font-semibold text-destructive">Danger zone</h2>
        <p className="text-sm text-muted-foreground">
          Delete all locally stored datasets and history. This cannot be undone.
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="mt-4"
          onClick={async () => {
            if (confirm("Delete all datasets and history?")) {
              await clearAll();
              toast.success("All data cleared");
            }
          }}
        >
          Clear all data
        </Button>
      </Card>
    </motion.div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label className="text-sm">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
