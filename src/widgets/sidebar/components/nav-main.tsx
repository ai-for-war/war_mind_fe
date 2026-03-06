import { AudioLines, Bot, Mic } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

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
      {
        title: "Text to Speech",
        url: "/tts",
        icon: AudioLines,
      },
    ],
  },

];

export const NavMain = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarGroup>
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <div onClick={() => navigate(item.url)} className="cursor-pointer font-medium">
              {item.title}
            </div>
          </SidebarMenuButton>
          {item.items?.length ? (
            <SidebarMenuSub>
              {item.items.map((item) => (
                <SidebarMenuSubItem key={item.title}>
                  <SidebarMenuSubButton asChild isActive={location.pathname === item.url}>
                    <div onClick={() => navigate(item.url)} className="flex cursor-pointer items-center gap-2 font-medium">
                      <item.icon className="size-4" />
                      {item.title}
                    </div>
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
