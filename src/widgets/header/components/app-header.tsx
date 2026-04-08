import { SidebarTrigger } from "@/components/ui/sidebar";
import { HeaderUserNav } from "@/widgets/header/components/header-user-nav";

export const AppHeader = () => {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <SidebarTrigger />
      <div className="flex-1" />
      <HeaderUserNav />
    </header>
  );
};
