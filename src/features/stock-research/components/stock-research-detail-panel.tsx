import {
  AlertCircle,
  CircleAlert,
  Clock3,
  FileSearch,
  PanelRight,
  RefreshCw,
} from "lucide-react"
import { Streamdown } from "streamdown"
import { useState } from "react"

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
  getStockResearchStatusBadgeClassName,
  getStockResearchStatusLabel,
} from "@/features/stock-research/components/stock-research-page.utils"
import { StockResearchCitationLink } from "@/features/stock-research/components/stock-research-citation-link"
import { StockResearchRuntimeChip } from "@/features/stock-research/components/stock-research-runtime-chip"
import { StockResearchSourcesSidebar } from "@/features/stock-research/components/stock-research-sources-sidebar"
import type { StockResearchReportResponse, StockResearchReportSummary } from "@/features/stock-research/types"
import {
  buildStockResearchSourcesById,
  getStockResearchCitationSourceIdFromHref,
  replaceStockResearchCitationMarkers,
} from "@/features/stock-research/stock-research-citations.utils"
import { cn } from "@/lib/utils"

type StockResearchDetailPanelProps = {
  activeReport: StockResearchReportResponse | null
  activeReportSummary: StockResearchReportSummary | null
  className?: string
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
  className,
  hasError = false,
  isLoading,
  onRefresh,
}: StockResearchDetailPanelProps) => {
  const [isSourcesCollapsed, setIsSourcesCollapsed] = useState(false)

  if (activeReportSummary == null) {
    return (
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45 p-6",
          className,
        )}
      >
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
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45",
          className,
        )}
      >
        <ScrollArea className="min-h-0 flex-1">
          <StockResearchDetailPanelSkeleton />
        </ScrollArea>
      </div>
    )
  }

  if (hasError || activeReport == null) {
    return (
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45 p-6",
          className,
        )}
      >
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
  const markdownContent = hasMarkdownContent
    ? replaceStockResearchCitationMarkers(activeReport.content)
    : undefined
  const sourcesById = buildStockResearchSourcesById(activeReport.sources)

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45",
        className,
      )}
    >
      <div className="border-b border-border/60 px-5 py-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
              <StockResearchRuntimeChip runtimeConfig={activeReport.runtime_config} />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden lg:inline-flex"
              aria-expanded={!isSourcesCollapsed}
              onClick={() => setIsSourcesCollapsed((current) => !current)}
            >
              <PanelRight data-icon="inline-start" />
              {isSourcesCollapsed ? "Show Sources" : "Hide Sources"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <ScrollArea className="min-h-0 min-w-0 flex-1">
          <div className="flex min-w-0 flex-col gap-6 p-5">
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
              <div className="flex min-w-0 flex-col gap-4">
                <Streamdown
                  components={{
                    a: ({ children, href, node, ...props }) => {
                      void node
                      const citationSourceId = getStockResearchCitationSourceIdFromHref(href)

                      if (citationSourceId) {
                        return (
                          <StockResearchCitationLink
                            {...props}
                            sourceId={citationSourceId}
                            source={sourcesById[citationSourceId] ?? null}
                          >
                            {children}
                          </StockResearchCitationLink>
                        )
                      }

                      return (
                        <a href={href} {...props}>
                          {children}
                        </a>
                      )
                    },
                  }}
                  className="flex min-w-0 max-w-full flex-col gap-4 text-sm leading-7 text-foreground [overflow-wrap:anywhere] [&>*]:max-w-full [&>*]:min-w-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:break-words [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_code]:break-words [&_code]:rounded-sm [&_code]:bg-background/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:break-words [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:break-words [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:break-words [&_h3]:text-lg [&_h3]:font-medium [&_li]:ml-5 [&_li]:break-words [&_p]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_ul]:list-disc"
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
          </div>
        </ScrollArea>

        <div
          className={cn(
            "min-h-0 overflow-hidden will-change-[flex-basis,max-width,max-height,opacity,transform] transition-[flex-basis,max-width,max-height,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:shrink-0",
            isSourcesCollapsed
              ? "max-h-0 -translate-y-2 opacity-0 lg:max-h-none lg:basis-0 lg:max-w-0 lg:translate-x-6 lg:translate-y-0"
              : "max-h-80 translate-y-0 opacity-100 lg:max-h-none lg:basis-[22rem] lg:max-w-[22rem] lg:translate-x-0",
          )}
        >
          <StockResearchSourcesSidebar
            className={cn(
              "h-full transition-[opacity,transform] duration-200 ease-out",
              isSourcesCollapsed
                ? "pointer-events-none translate-x-3 opacity-0"
                : "translate-x-0 opacity-100",
            )}
            sources={activeReport.sources}
          />
        </div>
      </div>
    </div>
  )
}
