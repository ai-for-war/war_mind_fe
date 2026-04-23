import { ExternalLink } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { badgeVariants } from "@/components/ui/badge"
import type { StockResearchReportSourceResponse } from "@/features/stock-research/types"
import { cn } from "@/lib/utils"

type StockResearchCitationLinkProps = {
  children?: ReactNode
  className?: string
  source: StockResearchReportSourceResponse | null
  sourceId: string
} & Omit<ComponentProps<"a">, "children" | "className" | "href">

const getSourceHostname = (url: string): string => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export const StockResearchCitationLink = ({
  children,
  className,
  source,
  sourceId,
  ...props
}: StockResearchCitationLinkProps) => {
  const citationLabel = typeof children === "string" && children.trim().length > 0
    ? children
    : sourceId

  if (source == null) {
    return (
      <span
        className={cn(
          badgeVariants({ variant: "outline" }),
          "mx-0.5 inline-flex align-middle border-dashed border-border/60 bg-muted/30 text-muted-foreground no-underline",
        )}
      >
        {citationLabel}
      </span>
    )
  }

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <a
          {...props}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open source ${sourceId}: ${source.title}`}
          className={cn(
            badgeVariants({ variant: "outline" }),
            "mx-0.5 inline-flex align-middle border-primary/25 bg-primary/5 text-primary no-underline transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:no-underline",
            className,
          )}
        >
          {citationLabel}
        </a>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80 space-y-3 p-3">
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="block space-y-3 rounded-md transition-colors hover:bg-accent/40 focus-visible:outline-hidden"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm font-semibold leading-5 text-foreground">
              {source.title}
            </div>
            <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </div>

          <div className="text-xs text-muted-foreground">
            {getSourceHostname(source.url)}
          </div>
        </a>
      </HoverCardContent>
    </HoverCard>
  )
}
