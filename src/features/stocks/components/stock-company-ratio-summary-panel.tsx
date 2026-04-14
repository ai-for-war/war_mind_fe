import { AlertCircle, BarChart3, CalendarClock, RefreshCw, TrendingDown, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useStockCompanyRatioSummary } from "@/features/stocks/hooks"
import type { StockCompanyRatioSummaryItem, StockListItem } from "@/features/stocks/types"
import { formatAbsoluteDateTime } from "@/lib/date"

type StockCompanyRatioSummaryPanelProps = {
  isActive: boolean
  selectedStock: StockListItem | null
}

type RatioMetricCardProps = {
  accent?: "negative" | "neutral" | "positive"
  label: string
  value: string
}

type MetricGroupProps = {
  metrics: Array<{
    accent?: "negative" | "neutral" | "positive"
    label: string
    value: string
  }>
  title: string
}

const RatioSummarySkeleton = () => (
  <div className="space-y-4">
    <div className="rounded-2xl border border-border/60 bg-background/30 p-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`ratio-hero-skeleton-${index}`} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-36" />
          </div>
        ))}
      </div>
    </div>

    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`ratio-group-skeleton-${index}`}
          className="rounded-2xl border border-border/60 bg-background/30 p-6"
        >
          <Skeleton className="h-4 w-32" />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((__, metricIndex) => (
              <div key={`ratio-metric-skeleton-${index}-${metricIndex}`} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

const formatRatioNumber = (value: number | null | undefined): string =>
  value == null
    ? "--"
    : new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
      }).format(value)

const formatReportYear = (value: number | null | undefined): string =>
  value == null ? "--" : `${value}`

const formatRatioPercent = (value: number | null | undefined): string =>
  value == null ? "--" : `${formatRatioNumber(value)}%`

const getRatioAccent = (
  value: number | null | undefined,
): "negative" | "neutral" | "positive" => {
  if (value == null || value === 0) {
    return "neutral"
  }

  return value > 0 ? "positive" : "negative"
}

const formatReportPeriod = (lengthReport: number | null | undefined): string => {
  if (lengthReport == null) {
    return "--"
  }

  if (lengthReport >= 1 && lengthReport <= 4) {
    return `Q${lengthReport}`
  }

  return `Period ${lengthReport}`
}

const hasRatioSummaryContent = (item: StockCompanyRatioSummaryItem | null) =>
  item != null &&
  (item.year_report != null ||
    item.length_report != null ||
    item.update_date != null ||
    item.revenue != null ||
    item.revenue_growth != null ||
    item.net_profit != null ||
    item.net_profit_growth != null ||
    item.roe != null ||
    item.roa != null ||
    item.pe != null ||
    item.pb != null ||
    item.eps != null ||
    item.issue_share != null ||
    item.charter_capital != null ||
    item.dividend != null ||
    item.de != null)

const RatioMetricCard = ({ accent = "neutral", label, value }: RatioMetricCardProps) => {
  const accentClasses =
    accent === "positive"
      ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-100"
      : accent === "negative"
        ? "border-red-400/20 bg-red-400/8 text-red-100"
        : "border-border/60 bg-background/20 text-foreground"

  const trendIcon =
    accent === "positive" ? (
      <TrendingUp className="size-4 text-emerald-300" />
    ) : accent === "negative" ? (
      <TrendingDown className="size-4 text-red-300" />
    ) : null

  return (
    <div className={`rounded-2xl border p-4 ${accentClasses}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</div>
        {trendIcon}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  )
}

const MetricGroup = ({ metrics, title }: MetricGroupProps) => (
  <div className="rounded-2xl border border-border/60 bg-background/30 p-6">
    <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">{title}</h3>
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {metrics.map((metric) => (
        <RatioMetricCard
          key={metric.label}
          accent={metric.accent}
          label={metric.label}
          value={metric.value}
        />
      ))}
    </div>
  </div>
)

export const StockCompanyRatioSummaryPanel = ({
  isActive,
  selectedStock,
}: StockCompanyRatioSummaryPanelProps) => {
  const ratioSummaryQuery = useStockCompanyRatioSummary({
    isEnabled: isActive,
    symbol: selectedStock?.symbol,
  })

  const ratioSummaryItem = ratioSummaryQuery.data?.item ?? null

  if (ratioSummaryQuery.isLoading) {
    return <RatioSummarySkeleton />
  }

  if (ratioSummaryQuery.isError) {
    return (
      <Empty className="border-destructive/30 bg-destructive/5">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="size-5 text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Unable to load ratio summary</EmptyTitle>
          <EmptyDescription>
            Keep the selected stock context visible and retry the ratio summary request when the
            upstream service is reachable.
          </EmptyDescription>
        </EmptyHeader>
        <Button type="button" variant="outline" onClick={() => void ratioSummaryQuery.refetch()}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </Empty>
    )
  }

  if (!hasRatioSummaryContent(ratioSummaryItem)) {
    return (
      <Empty className="border-border/60 bg-background/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BarChart3 className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No ratio summary found</EmptyTitle>
          <EmptyDescription>
            This symbol does not currently have a usable ratio summary snapshot in the upstream dataset.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (!ratioSummaryItem) {
    return null
  }

  const performanceMetrics = [
    {
      label: "Revenue",
      value: formatRatioNumber(ratioSummaryItem.revenue),
    },
    {
      accent: getRatioAccent(ratioSummaryItem.revenue_growth),
      label: "Revenue Growth",
      value: formatRatioPercent(ratioSummaryItem.revenue_growth),
    },
    {
      label: "Net Profit",
      value: formatRatioNumber(ratioSummaryItem.net_profit),
    },
    {
      accent: getRatioAccent(ratioSummaryItem.net_profit_growth),
      label: "Net Profit Growth",
      value: formatRatioPercent(ratioSummaryItem.net_profit_growth),
    },
  ] as const

  const efficiencyMetrics = [
    {
      accent: getRatioAccent(ratioSummaryItem.roe),
      label: "ROE",
      value: formatRatioPercent(ratioSummaryItem.roe),
    },
    {
      accent: getRatioAccent(ratioSummaryItem.roa),
      label: "ROA",
      value: formatRatioPercent(ratioSummaryItem.roa),
    },
  ] as const

  const valuationMetrics = [
    {
      label: "P/E",
      value: formatRatioNumber(ratioSummaryItem.pe),
    },
    {
      label: "P/B",
      value: formatRatioNumber(ratioSummaryItem.pb),
    },
    {
      label: "EPS",
      value: formatRatioNumber(ratioSummaryItem.eps),
    },
  ] as const

  const capitalMetrics = [
    {
      label: "Issue Share",
      value: formatRatioNumber(ratioSummaryItem.issue_share),
    },
    {
      label: "Charter Capital",
      value: formatRatioNumber(ratioSummaryItem.charter_capital),
    },
    {
      accent: getRatioAccent(ratioSummaryItem.dividend),
      label: "Dividend",
      value: formatRatioNumber(ratioSummaryItem.dividend),
    },
    {
      accent: getRatioAccent(ratioSummaryItem.de),
      label: "D/E",
      value: formatRatioNumber(ratioSummaryItem.de),
    },
  ] as const

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-background/30 p-6">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Report Period
            </div>
            <div className="text-2xl font-semibold tracking-tight text-foreground">
              {formatReportPeriod(ratioSummaryItem.length_report)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Report Year
            </div>
            <div className="text-2xl font-semibold tracking-tight text-foreground">
              {formatReportYear(ratioSummaryItem.year_report)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <CalendarClock className="size-4 text-cyan-200" />
              Updated At
            </div>
            <div className="text-2xl font-semibold tracking-tight text-foreground">
              {ratioSummaryItem.update_date
                ? formatAbsoluteDateTime(ratioSummaryItem.update_date, ratioSummaryItem.update_date)
                : "--"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <MetricGroup title="Performance" metrics={[...performanceMetrics]} />
        <MetricGroup title="Efficiency" metrics={[...efficiencyMetrics]} />
        <MetricGroup title="Valuation" metrics={[...valuationMetrics]} />
        <MetricGroup title="Capital & Payout" metrics={[...capitalMetrics]} />
      </div>
    </div>
  )
}
