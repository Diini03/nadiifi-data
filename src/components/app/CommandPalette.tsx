import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { LayoutDashboard, Upload, History, Settings, FileText } from "lucide-react";
import { useDatasetStore } from "@/store/useDatasetStore";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const datasets = useDatasetStore((s) => s.datasets);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search datasets, pages, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/app/dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go("/app/upload")}>
            <Upload className="mr-2 h-4 w-4" /> Upload dataset
          </CommandItem>
          <CommandItem onSelect={() => go("/app/history")}>
            <History className="mr-2 h-4 w-4" /> History
          </CommandItem>
          <CommandItem onSelect={() => go("/app/settings")}>
            <Settings className="mr-2 h-4 w-4" /> Settings
          </CommandItem>
        </CommandGroup>
        {datasets.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Datasets">
              {datasets.map((d) => (
                <CommandItem key={d.id} onSelect={() => go(`/app/datasets/${d.id}`)}>
                  <FileText className="mr-2 h-4 w-4" /> {d.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
