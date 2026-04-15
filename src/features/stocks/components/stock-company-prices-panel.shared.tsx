import { AlertCircle, RefreshCw, TrendingDown, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

type PriceSummaryMetricProps = {
  accent?: "negative" | "neutral" | "positive"
  label: string
  value: string
}

type PricesErrorStateProps = {
  description: string
  onRetry: () => void
  title: string
}

export const PricePanelSkeleton = () => (
  <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`prices-summary-skeleton-${index}`}
          className="rounded-2xl border border-border/60 bg-background/30 p-5"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-4 h-7 w-32" />
        </div>
      ))}
    </div>

    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <Skeleton className="h-[28rem] w-full rounded-xl" />
    </div>
  </div>
)

export const IntradayTableSkeleton = () => (
  <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`intraday-summary-skeleton-${index}`}
          className="rounded-2xl border border-border/60 bg-background/30 p-5"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-4 h-7 w-32" />
        </div>
      ))}
    </div>

    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="space-y-3 px-2 pt-1">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={`intraday-row-skeleton-${index}`}
            className="grid grid-cols-[minmax(10rem,1fr)_minmax(8rem,0.8fr)_minmax(8rem,0.8fr)_minmax(8rem,0.8fr)_minmax(6rem,0.6fr)] gap-3"
          >
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const PriceSummaryMetric = ({
  accent = "neutral",
  label,
  value,
}: PriceSummaryMetricProps) => {
  const accentClasses =
    accent === "positive"
      ? "border-emerald-400/20 bg-emerald-400/8"
      : accent === "negative"
        ? "border-red-400/20 bg-red-400/8"
        : "border-border/60 bg-background/20"

  const accentIcon =
    accent === "positive" ? (
      <TrendingUp className="size-4 text-emerald-300" />
    ) : accent === "negative" ? (
      <TrendingDown className="size-4 text-red-300" />
    ) : null

  return (
    <div className={`rounded-2xl border p-5 ${accentClasses}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</div>
        {accentIcon}
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
    </div>
  )
}

export const PricesErrorState = ({
  description,
  onRetry,
  title,
}: PricesErrorStateProps) => (
  <Empty className="border-destructive/30 bg-destructive/5">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <AlertCircle className="size-5 text-destructive" />
      </EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
    </EmptyHeader>
    <Button type="button" variant="outline" onClick={onRetry}>
      <RefreshCw className="size-4" />
      Retry
    </Button>
  </Empty>
)
