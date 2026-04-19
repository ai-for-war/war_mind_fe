import {
  AudioLines,
  Bot,
  CircleDot,
  ImagePlus,
  Lightbulb,
  Mic,
  Plug,
  Sparkles,
  Waypoints,
  TrendingUp,
} from "lucide-react";
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
    items: [
      {
        title: "Multi-Agent",
        url: "/multi-agent",
        icon: Bot,
      },
      {
        title: "Super-Agent",
        url: "/super-agent",
        icon: Sparkles,
      }
    ],
  },
  {
    title: "Generative AI",
    items: [
      {
        title: "Interview Lab",
        url: "/interview-lab",
        icon: Lightbulb,
      },
      {
        title: "Meeting Recorder",
        url: "/meeting-recorder",
        icon: CircleDot,
      },
    ],
  },
  {
    title: "Plugins",
    items: [
      {
        title: "Skill",
        url: "/skill-plugins",
        icon: Plug,
      }
    ],
  },
  {
    title: "Markets",
    items: [
      {
        title: "Stock Catalog",
        url: "/stocks",
        icon: TrendingUp,
      },
      {
        title: "Backtest",
        url: "/backtests",
        icon: Waypoints,
      }
    ],
  },
  {
    title: "Confidential report",
    items: [
      {
        title: "Voice Cloning",
        url: "/voice-cloning",
        icon: Mic,
      },
      {
        title: "Text to Image",
        url: "/text-to-image",
        icon: ImagePlus,
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
              <div
                onClick={() => navigate(item.items[0].url)}
                className="cursor-pointer font-bold text-[15px]"
              >
                {item.title}
              </div>
            </SidebarMenuButton>
            {item.items?.length ? (
              <SidebarMenuSub>
                {item.items.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={location.pathname === subItem.url}
                    >
                      <div
                        onClick={() => navigate(subItem.url)}
                        className="flex cursor-pointer items-center gap-2 font-inter text-[15px]"
                      >
                        <subItem.icon className="size-5!" />
                        {subItem.title}
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
  );
};
