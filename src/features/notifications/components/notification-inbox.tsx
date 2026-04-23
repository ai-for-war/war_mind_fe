"use client"

import type { ReactNode } from "react"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { NotificationInboxContent } from "@/features/notifications/components/notification-inbox-content"
import { useIsMobile } from "@/hooks/use-mobile"

type NotificationInboxProps = {
  children: ReactNode
  onOpenChange: (open: boolean) => void
  open: boolean
}

export const NotificationInbox = ({
  children,
  onOpenChange,
  open,
}: NotificationInboxProps) => {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="max-h-[85dvh] border-border/60 bg-background/95">
          <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
            <DrawerTitle className="sr-only">Notifications</DrawerTitle>
            <DrawerDescription className="sr-only">
              Review and act on internal notifications for the active organization.
            </DrawerDescription>
            <NotificationInboxContent isEnabled={open} onRequestClose={() => onOpenChange(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="flex h-[min(34rem,calc(100dvh-8rem))] w-[26rem] flex-col rounded-[1.5rem] border-border/60 bg-background/92 p-4 shadow-xl backdrop-blur-xl"
      >
        <NotificationInboxContent isEnabled={open} onRequestClose={() => onOpenChange(false)} />
      </PopoverContent>
    </Popover>
  )
}
