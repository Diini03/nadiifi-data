import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  Wand2,
  BarChart3,
  FileText,
  History,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
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

  const dsLink = (tab: string) => (activeDsId ? `/app/datasets/${activeDsId}/${tab}` : "/app/upload");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-4">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold">CleanLab AI</span>
              <span className="text-[10px] text-muted-foreground">Data cleaning studio</span>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.url)} tooltip={item.title}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspace.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={pathname.endsWith(item.url)}>
                    <NavLink
                      to={dsLink(item.url)}
                      className={cn(!activeDsId && "pointer-events-none opacity-50")}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {datasets.length > 0 && !collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Recent datasets</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {datasets.slice(0, 5).map((d) => (
                  <SidebarMenuItem key={d.id}>
                    <SidebarMenuButton asChild isActive={pathname.includes(d.id)} tooltip={d.name}>
                      <NavLink to={`/app/datasets/${d.id}`}>
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{d.name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {secondary.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
