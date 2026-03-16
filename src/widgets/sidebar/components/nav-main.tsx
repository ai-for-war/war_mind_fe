import { AudioLines, Bot, ImagePlus, Mic } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

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
        title: "Interview Lab",
        url: "/interview-lab",
        icon: AudioLines,
      },
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
]

export const NavMain = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <div onClick={() => navigate(item.items[0].url)} className="cursor-pointer font-medium">
                {item.title}
              </div>
            </SidebarMenuButton>
            {item.items?.length ? (
              <SidebarMenuSub>
                {item.items.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild isActive={location.pathname === subItem.url}>
                      <div
                        onClick={() => navigate(subItem.url)}
                        className="flex cursor-pointer items-center gap-2 font-medium"
                      >
                        <subItem.icon className="size-4" />
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
  )
}
