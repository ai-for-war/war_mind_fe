import { AlertCircle, ExternalLink, FileText, RefreshCw } from "lucide-react"
import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { parseDateValue } from "@/features/stocks/components/stock-company-dialog.utils"
import { useStockCompanyReports } from "@/features/stocks/hooks"
import type { StockCompanyReportItem, StockListItem } from "@/features/stocks/types"
import { formatAbsoluteDateTime } from "@/lib/date"

type StockCompanyReportsPanelProps = {
  isActive: boolean
  selectedStock: StockListItem | null
}

const ReportsSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={`report-row-skeleton-${index}`}
        className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background/30 p-4"
      >
        <Skeleton className="mt-1 size-10 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
    ))}
  </div>
)

const getReportSortTimestamp = (item: StockCompanyReportItem): number | null =>
  parseDateValue(item.date)

type ReportListItemProps = {
  item: StockCompanyReportItem
}

const ReportListItem = ({ item }: ReportListItemProps) => {
  const title = item.name?.trim() || "Untitled report"
  const description = item.description?.trim() || null
  const hasLink = Boolean(item.link?.trim())
  const reportDate = item.date?.trim() ? formatAbsoluteDateTime(item.date, item.date) : "Unknown date"

  const content = (
    <article
      className={`flex items-start gap-4 rounded-2xl border p-4 transition-colors ${
        hasLink
          ? "cursor-pointer border-border/60 bg-background/30 hover:border-cyan-400/20 hover:bg-cyan-400/8"
          : "border-border/50 bg-background/20"
      }`}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/30 text-cyan-100">
        <FileText className="size-5" />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{reportDate}</span>
          {!hasLink ? (
            <Badge variant="secondary" className="rounded-full bg-secondary/60 text-secondary-foreground">
              No link
            </Badge>
          ) : null}
        </div>
        {description ? (
          <p className="line-clamp-1 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {hasLink ? (
        <div className="hidden shrink-0 items-center md:flex">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-2 text-sm text-foreground">
            <ExternalLink className="size-4" />
            Open
          </div>
        </div>
      ) : null}
    </article>
  )

  if (!hasLink) {
    return content
  }

  return (
    <a href={item.link ?? undefined} className="block" target="_blank" rel="noreferrer">
      {content}
    </a>
  )
}

export const StockCompanyReportsPanel = ({
  isActive,
  selectedStock,
}: StockCompanyReportsPanelProps) => {
  const reportsQuery = useStockCompanyReports({
    isEnabled: isActive,
    symbol: selectedStock?.symbol,
  })

  const reportItems = reportsQuery.data?.items ?? []

  const sortedReportItems = useMemo(() => {
    const decoratedItems = reportItems.map((item, index) => ({
      item,
      originalIndex: index,
    }))

    decoratedItems.sort((left, right) => {
      const leftValue = getReportSortTimestamp(left.item)
      const rightValue = getReportSortTimestamp(right.item)

      if (leftValue == null && rightValue == null) {
        return left.originalIndex - right.originalIndex
      }

      if (leftValue == null) {
        return 1
      }

      if (rightValue == null) {
        return -1
      }

      if (leftValue !== rightValue) {
        return rightValue - leftValue
      }

      return left.originalIndex - right.originalIndex
    })

    return decoratedItems.map((entry) => entry.item)
  }, [reportItems])

  if (reportsQuery.isLoading) {
    return <ReportsSkeleton />
  }

  if (reportsQuery.isError) {
    return (
      <Empty className="border-destructive/30 bg-destructive/5">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="size-5 text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Unable to load reports</EmptyTitle>
          <EmptyDescription>
            Keep the selected stock context visible and retry the company reports request when the
            upstream service is reachable.
          </EmptyDescription>
        </EmptyHeader>
        <Button type="button" variant="outline" onClick={() => void reportsQuery.refetch()}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </Empty>
    )
  }

  if (sortedReportItems.length === 0) {
    return (
      <Empty className="border-border/60 bg-background/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No reports found</EmptyTitle>
          <EmptyDescription>
            No related company report rows are available for this symbol in the upstream dataset.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-3">
      {sortedReportItems.map((item, index) => (
        <ReportListItem key={`${item.name ?? "report"}-${item.date ?? "date"}-${index}`} item={item} />
      ))}
    </div>
  )
}
