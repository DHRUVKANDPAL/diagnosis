"use client";
import {
  Bot,
  ClipboardPlusIcon,
  CreditCard,
  Heading1,
  LayoutDashboard,
  Plus,
  Presentation,
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
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import Image from "next/image";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
];


export function AppSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const {projects,project,projectId,setProjectId}=useProject();
  return (
    <Sidebar collapsible="icon" variant="floating" suppressHydrationWarning>
      <SidebarHeader suppressHydrationWarning>
        <div className="flex items-center justify-start gap-1">
          <Image src="/logo2.png" alt="logo" width={40} height={40}></Image>
          {open && <h1 className="text-2xl font-bold text-primary">Diagnosis</h1>}
        </div>
      </SidebarHeader>
      <SidebarContent suppressHydrationWarning>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn({
                        "!bg-primary !text-white": pathname === item.url,
                      })}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <div
                      onClick={() => setProjectId(item.id)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full border bg-white px-2 text-sm text-primary",
                          { "bg-primary text-white": item.id === projectId },
                        )}
                      >
                        {item.name[0]}
                      </div>
                      <span>{item.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <div className="h-2"></div>
              <SidebarMenuItem>
                <Link href="/create" className="flex items-center gap-2">
                  {open ? (
                    <Button size="sm" variant="outline" className="w-fit">
                      <Plus></Plus> Create Project
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-2">
                      <Plus></Plus>
                    </Button>
                  )}
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}