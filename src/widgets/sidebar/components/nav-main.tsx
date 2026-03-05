import { Bot, ChevronDown, Mic } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

const navItems = [
  {
    title: "Agents",
    url: "/multi-agent",
    items: [
      {
        title: "Multi-Agent",
        url: "/multi-agent",
        icon: Bot,
      },
    ],
  },
  {
    title: "Confidential report",
    url: "/voice-cloning",
    items: [
      {
        title: "Voice Cloning",
        url: "/voice-cloning",
        icon: Mic,
      },
    ],
  },

];

export const NavMain = () => {
  const location = useLocation();

  return (
    <SidebarGroup>
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <a href={item.url} className="font-medium">
              {item.title}
            </a>
          </SidebarMenuButton>
          {item.items?.length ? (
            <SidebarMenuSub>
              {item.items.map((item) => (
                <SidebarMenuSubItem key={item.title}>
                  <SidebarMenuSubButton asChild isActive={location.pathname === item.url}>
                    <a href={item.url}>{item.title}</a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          ) : null}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  </SidebarGroup>

    // <SidebarMenu>
    //   {navItems.map((item) => {
    //     const isActive = location.pathname === item.url
    //     const Icon = item.icon

    //     return (
    //       <SidebarMenuItem key={item.url}>
    //         <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
    //           <Link to={item.url}>
    //             <Icon />
    //             <span>{item.title}</span>
    //           </Link>
    //         </SidebarMenuButton>
    //       </SidebarMenuItem>
    //     )
    //   })}
    // </SidebarMenu>
  );
};
