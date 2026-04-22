import { FileSearch } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useStockResearchWorkspace } from "@/features/stock-research/hooks"

export const StockResearchPage = () => {
  const { activeReportSummary, reportsQuery } = useStockResearchWorkspace()

  return (
    <section className="flex h-full min-h-0 min-w-0 max-h-[calc(100dvh-6rem)] flex-1 flex-col gap-4 overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
              Markets
            </Badge>
            <Badge variant="secondary" className="rounded-full bg-secondary/70">
              {reportsQuery.items.length} reports
            </Badge>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Stock Research
            </h1>
            <p className="text-sm text-muted-foreground">
              Review queued and completed research reports for the active organization.
            </p>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/60 bg-background/45 p-6">
        <Empty className="border-border/60 bg-background/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSearch className="size-5" />
            </EmptyMedia>
            <EmptyTitle>
              {activeReportSummary
                ? `Selected report: ${activeReportSummary.symbol}`
                : "No research report selected"}
            </EmptyTitle>
            <EmptyDescription>
              {activeReportSummary
                ? "Use the dedicated workspace to inspect report content and source references for the selected research run."
                : reportsQuery.items.length > 0
                  ? "Select a report to inspect its content and sources for the active organization."
                  : "Queued reports will appear here once they are created from Stocks, Watchlists, or this workspace."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </section>
  )
}
