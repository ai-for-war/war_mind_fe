import { LineChart } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { BacktestResult } from "@/features/backtests/types"
import { BacktestEquityChart } from "@/features/backtests/components/backtest-equity-chart"
import { BacktestKpiStrip } from "@/features/backtests/components/backtest-kpi-strip"
import { BacktestOverviewPanel } from "@/features/backtests/components/backtest-overview-panel"
import { BacktestTradesTable } from "@/features/backtests/components/backtest-trades-table"

type BacktestResultPanelProps = {
  isPending?: boolean
  result?: BacktestResult | null
}

const BacktestResultSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-[360px] w-full rounded-xl" />
    <Skeleton className="h-[260px] w-full rounded-xl" />
  </div>
)

export const BacktestResultPanel = ({
  isPending = false,
  result,
}: BacktestResultPanelProps) => {
  if (isPending && !result) {
    return <BacktestResultSkeleton />
  }

  if (!result) {
    return (
      <Empty className="min-h-[420px] border-border/60 bg-background/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LineChart className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No backtest result yet</EmptyTitle>
          <EmptyDescription>
            Configure a symbol, strategy, and date range, then run a backtest to inspect the result here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <BacktestKpiStrip result={result} />
      <BacktestEquityChart result={result} />
      <Tabs defaultValue="overview" className="min-w-0">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="min-w-0">
          <BacktestOverviewPanel result={result} />
        </TabsContent>
        <TabsContent value="trades" className="min-w-0">
          <BacktestTradesTable result={result} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
