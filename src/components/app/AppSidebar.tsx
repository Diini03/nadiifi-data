import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  Wand2,
  BarChart3,
  FileText,
  History,
  Settings,
  Sliders,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useDatasetStore } from "@/store/useDatasetStore";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

const primary = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Upload", url: "/app/upload", icon: Upload },
];

const workspace = [
  { title: "Cleaning Studio", url: "cleaning", icon: Wand2 },
  { title: "Visualization", url: "visualize", icon: BarChart3 },
  { title: "Reports", url: "export", icon: FileText },
];

const secondary = [
  { title: "History", url: "/app/history", icon: History },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const currentId = useDatasetStore((s) => s.currentId);
  const datasets = useDatasetStore((s) => s.datasets);

  const activeDsId = currentId ?? datasets[0]?.id;
  const dsLink = (tab: string) =>
    activeDsId ? `/app/datasets/${activeDsId}/${tab}` : "/app/upload";

  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-3 py-3">
        <NavLink
          to="/"
          className="flex items-center gap-2.5 rounded-md px-1.5 py-1 text-foreground transition-colors hover:bg-accent/50"
          aria-label="NadiifiData home"
        >
          <Logo size={22} withWordmark={!collapsed} wordmarkClassName="text-[13px]" />
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-1.5 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {primary.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="h-8 rounded-md text-[13px] font-medium"
                  >
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" strokeWidth={1.75} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {workspace.map((item) => {
                const disabled = !activeDsId;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      tooltip={disabled ? `${item.title} — upload a dataset first` : item.title}
                      isActive={!!activeDsId && pathname.endsWith("/" + item.url)}
                      className="h-8 rounded-md text-[13px] font-medium"
                    >
                      <NavLink
                        to={dsLink(item.url)}
                        className={cn(
                          disabled && "pointer-events-none opacity-45",
                        )}
                        aria-disabled={disabled}
                      >
                        <item.icon className="h-4 w-4" strokeWidth={1.75} />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {datasets.length > 0 && !collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
              Recent datasets
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {datasets.slice(0, 5).map((d) => (
                  <SidebarMenuItem key={d.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.includes(d.id)}
                      tooltip={d.name}
                      className="h-8 rounded-md text-[13px]"
                    >
                      <NavLink to={`/app/datasets/${d.id}`}>
                        <FileText className="h-4 w-4" strokeWidth={1.75} />
                        <span className="truncate">{d.name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t px-1.5 py-2">
        <SidebarMenu className="gap-0.5">
          {secondary.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                tooltip={item.title}
                className="h-8 rounded-md text-[13px] font-medium"
              >
                <NavLink to={item.url}>
                  <item.icon className="h-4 w-4" strokeWidth={1.75} />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
