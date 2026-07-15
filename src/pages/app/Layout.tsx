import { Outlet, useLocation, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { CommandPalette } from "@/components/app/CommandPalette";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ChevronRight, Search } from "lucide-react";
import { useDatasetStore } from "@/store/useDatasetStore";
import { useMemo } from "react";

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  upload: "Upload",
  datasets: "Datasets",
  history: "History",
  settings: "Settings",
  overview: "Overview",
  columns: "Columns",
  cleaning: "Cleaning",
  visualize: "Visualize",
  export: "Export",
};

function Breadcrumbs() {
  const { pathname } = useLocation();
  const datasets = useDatasetStore((s) => s.datasets);
  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const items: { label: string; href: string }[] = [];
    let acc = "";
    for (const part of parts) {
      acc += "/" + part;
      if (part === "app") continue;
      const ds = datasets.find((d) => d.id === part);
      const label = ds ? ds.name : TITLES[part] ?? decodeURIComponent(part);
      items.push({ label, href: acc });
    }
    return items;
  }, [pathname, datasets]);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-[13px] text-muted-foreground md:flex">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={c.href} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
            {last ? (
              <span className="truncate font-medium text-foreground">{c.label}</span>
            ) : (
              <Link to={c.href} className="truncate hover:text-foreground">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default function AppLayout() {
  const openPalette = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur">
            <SidebarTrigger aria-label="Toggle sidebar" />
            <div className="mx-1 hidden h-4 w-px bg-border md:block" />
            <Breadcrumbs />
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 rounded-md px-2.5 text-[13px] font-normal text-muted-foreground"
              onClick={openPalette}
              aria-label="Open command palette"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                ⌘K
              </kbd>
            </Button>
            <ThemeToggle />
          </header>
          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
              <Outlet />
            </div>
          </main>
        </div>
        <CommandPalette />
      </div>
    </SidebarProvider>
  );
}
