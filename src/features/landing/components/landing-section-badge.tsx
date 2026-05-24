import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

type LandingSectionBadgeProps = {
  className?: string
  label: string
  value: string
}

export const LandingSectionBadge = ({
  className,
  label,
  value,
}: LandingSectionBadgeProps) => (
  <div
    className={cn(
      "liquid-glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-[hsl(var(--landing-hero-sub))]",
      className,
    )}
  >
    <span>{label}</span>
    <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--landing-primary))]/10 px-2 py-1 text-xs font-medium text-[hsl(var(--landing-primary))]">
      {value}
      <ChevronRight aria-hidden="true" className="size-3" />
    </span>
  </div>
)
