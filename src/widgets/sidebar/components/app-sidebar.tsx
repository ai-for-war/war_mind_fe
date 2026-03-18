import { useTheme } from "next-themes";
import darkLogo from "@/assets/images/darklogopng.png";
import lightLogo from "@/assets/images/lightlogopng.png";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "@/widgets/sidebar/components/nav-main";
import { OrgSwitcher } from "@/widgets/sidebar/components/org-switcher";
import { cn } from "@/lib/utils";

export const AppSidebar = () => {
  const { resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme ?? "dark";
  const logoSrc = currentTheme === "dark" ? darkLogo : lightLogo;
  const textColor =
    currentTheme === "dark"
      ? "bg-gradient-to-r  from-[#7EC8FF] via-[#4AA3FF] to-[#00E0FF]"
      : "bg-gradient-to-r from-[#0A1A2F] via-[#2A7FD1] to-[#6FD6FF]";

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-14 items-center justify-center rounded-lg">
                  {/* <BrainCircuit className="size-4" /> */}
                  <img
                    src={logoSrc}
                    alt="RecapAI Logo"
                    className="h-14 w-14 object-contain"
                  />
                </div>
                <h2 className={cn(textColor, "text-[25px] font-bold bg-clip-text text-transparent")}>RecapAI</h2>
                {/* <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold">WARMIND</span>
                  <span className="">v1.0.0</span>
                </div> */}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <OrgSwitcher />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
