import { Bot, ImagePlus, Mic } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

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
    ],
  },
]

export const NavMain = () => {
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navItems.map((item) => {
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <div className="font-medium">{item.title}</div>
              </SidebarMenuButton>
              <SidebarMenuSub>
                {item.items.map((subItem) => {
                  const isActive = location.pathname === subItem.url
                  const Icon = subItem.icon

                  return (
                    <SidebarMenuSubItem key={subItem.url}>
                      <SidebarMenuSubButton asChild isActive={isActive}>
                        <Link to={subItem.url}>
                          <Icon />
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
