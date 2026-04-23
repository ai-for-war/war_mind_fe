import { ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { StockResearchReportSourceResponse } from "@/features/stock-research/types"
import { cn } from "@/lib/utils"

type StockResearchSourcesSidebarProps = {
  className?: string
  sources: StockResearchReportSourceResponse[]
}

export const StockResearchSourcesSidebar = ({
  className,
  sources,
}: StockResearchSourcesSidebarProps) => {
  return (
    <aside
      className={cn(
        "flex min-h-0 min-w-0 flex-col overflow-hidden border-t border-border/60 lg:border-t-0 lg:border-l",
        className,
      )}
    >
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex min-w-0 flex-col gap-3 p-4">
          {sources.length > 0 ? (
            sources.map((source) => (
              <a
                key={source.source_id}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 max-w-full items-start justify-between gap-4 rounded-2xl border border-border/50 bg-background/30 px-4 py-4 transition-colors hover:border-border hover:bg-background/55"
              >
                <div className="flex min-w-0 max-w-full flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-border/60">
                      {source.source_id}
                    </Badge>
                  </div>
                  <div className="max-w-full break-words text-sm font-medium text-foreground">
                    {source.title}
                  </div>
                  <div className="max-w-full break-all text-xs text-muted-foreground">
                    {source.url}
                  </div>
                </div>
                <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              </a>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">
              No cited sources were persisted for this report snapshot.
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
