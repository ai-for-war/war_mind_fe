import { Bot, Mic } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Multi-Agent",
    url: "/multi-agent",
    icon: Bot,
  },
  {
    title: "Voice Cloning",
    url: "/voice-cloning",
    icon: Mic,
  },
]

export const NavMain = () => {
  const location = useLocation()

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive = location.pathname === item.url
        const Icon = item.icon

        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
              <Link to={item.url}>
                <Icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
