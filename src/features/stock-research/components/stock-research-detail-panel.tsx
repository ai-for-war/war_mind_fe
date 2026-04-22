import {
  AlertCircle,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileSearch,
  RefreshCw,
} from "lucide-react"
import { Streamdown } from "streamdown"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

import {
  formatStockResearchDateTime,
  getStockResearchStatusBadgeClassName,
  getStockResearchStatusLabel,
} from "@/features/stock-research/components/stock-research-page.utils"
import type { StockResearchReportResponse, StockResearchReportSummary } from "@/features/stock-research/types"

type StockResearchDetailPanelProps = {
  activeReport: StockResearchReportResponse | null
  activeReportSummary: StockResearchReportSummary | null
  hasError?: boolean
  isLoading: boolean
  onRefresh: () => void
}

const StockResearchDetailPanelSkeleton = () => (
  <div className="flex flex-col gap-6 p-5">
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[92%]" />
      <Skeleton className="h-4 w-[88%]" />
      <Skeleton className="h-4 w-[72%]" />
    </div>
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  </div>
)

export const StockResearchDetailPanel = ({
  activeReport,
  activeReportSummary,
  hasError = false,
  isLoading,
  onRefresh,
}: StockResearchDetailPanelProps) => {
  if (activeReportSummary == null) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45 p-6">
        <Empty className="border-border/60 bg-background/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSearch className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No report selected</EmptyTitle>
            <EmptyDescription>
              Select a report from the history rail to inspect its markdown content and sources.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45">
        <ScrollArea className="min-h-0 flex-1">
          <StockResearchDetailPanelSkeleton />
        </ScrollArea>
      </div>
    )
  }

  if (hasError || activeReport == null) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45 p-6">
        <Empty className="border-destructive/30 bg-destructive/5">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="size-5 text-destructive" />
            </EmptyMedia>
            <EmptyTitle>Unable to load report detail</EmptyTitle>
            <EmptyDescription>
              Keep this report selected and retry when the detail endpoint is reachable again.
            </EmptyDescription>
          </EmptyHeader>
          <Button type="button" variant="outline" onClick={onRefresh}>
            <RefreshCw data-icon="inline-start" />
            Retry
          </Button>
        </Empty>
      </div>
    )
  }

  const isWaitingState = activeReport.status === "queued" || activeReport.status === "running"
  const isFailedState = activeReport.status === "failed"
  const hasMarkdownContent = typeof activeReport.content === "string" && activeReport.content.trim().length > 0
  const markdownContent = hasMarkdownContent ? activeReport.content : undefined

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-6 p-5">
          <div className="flex flex-col gap-3 border-b border-border/60 pb-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {activeReport.symbol}
              </h2>
              <Badge
                variant="outline"
                className={getStockResearchStatusBadgeClassName(activeReport.status)}
              >
                {getStockResearchStatusLabel(activeReport.status)}
              </Badge>
            </div>

            <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
              <div>Created {formatStockResearchDateTime(activeReport.created_at)}</div>
              <div>Updated {formatStockResearchDateTime(activeReport.updated_at)}</div>
              <div>Started {formatStockResearchDateTime(activeReport.started_at)}</div>
              <div>Completed {formatStockResearchDateTime(activeReport.completed_at)}</div>
            </div>
          </div>

          {isWaitingState ? (
            <Alert>
              <Clock3 />
              <AlertTitle>Report is still processing</AlertTitle>
              <AlertDescription>
                This workspace shows persisted snapshots only. Use refresh to check for the
                latest queued or running state.
              </AlertDescription>
            </Alert>
          ) : null}

          {isFailedState ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>Report generation failed</AlertTitle>
              <AlertDescription>
                <p>
                  {activeReport.error?.message ??
                    "The report failed without a persisted error message."}
                </p>
              </AlertDescription>
            </Alert>
          ) : null}

          {markdownContent ? (
            <div className="flex flex-col gap-4">
              <div className="text-sm font-medium text-foreground">Report</div>
              <Streamdown
                className="flex flex-col gap-4 text-sm leading-7 text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_code]:rounded-sm [&_code]:bg-background/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-medium [&_li]:ml-5 [&_ul]:list-disc"
              >
                {markdownContent}
              </Streamdown>
            </div>
          ) : !isWaitingState && !isFailedState ? (
            <Empty className="border-border/60 bg-background/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileSearch className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No persisted report content</EmptyTitle>
                <EmptyDescription>
                  The selected research run does not currently contain persisted markdown content.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-border/60 pt-5">
            <div className="text-sm font-medium text-foreground">Sources</div>
            {activeReport.sources.length > 0 ? (
              <div className="flex flex-col gap-3">
                {activeReport.sources.map((source) => (
                  <a
                    key={source.source_id}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between gap-4 rounded-2xl border border-border/50 bg-background/30 px-4 py-4 transition-colors hover:border-border hover:bg-background/55"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full border-border/60">
                          {source.source_id}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-foreground">{source.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{source.url}</div>
                    </div>
                    <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No cited sources were persisted for this report snapshot.
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
