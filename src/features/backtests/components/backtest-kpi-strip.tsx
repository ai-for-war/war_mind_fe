import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatBacktestCurrency,
  formatBacktestNumber,
  formatBacktestPercent,
} from "@/features/backtests/backtest.utils"
import type { BacktestResult } from "@/features/backtests/types"

type BacktestKpiStripProps = {
  result: BacktestResult
}

type BacktestKpiItem = {
  label: string
  value: string
}

export const BacktestKpiStrip = ({ result }: BacktestKpiStripProps) => {
  const kpiItems: BacktestKpiItem[] = [
    {
      label: "Total Return",
      value: formatBacktestPercent(result.performance_metrics.total_return_pct),
    },
    {
      label: "Ann. Return",
      value: formatBacktestPercent(result.performance_metrics.annualized_return_pct),
    },
    {
      label: "Max Drawdown",
      value: formatBacktestPercent(result.performance_metrics.max_drawdown_pct),
    },
    {
      label: "Win Rate",
      value: formatBacktestPercent(result.performance_metrics.win_rate_pct),
    },
    {
      label: "Profit Factor",
      value: formatBacktestNumber(result.performance_metrics.profit_factor),
    },
    {
      label: "Expectancy",
      value: formatBacktestNumber(result.performance_metrics.expectancy),
    },
    {
      label: "End Equity",
      value: formatBacktestCurrency(result.summary_metrics.ending_equity),
    },
    {
      label: "Trades",
      value: formatBacktestNumber(result.summary_metrics.total_trades, {
        maximumFractionDigits: 0,
      }),
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpiItems.map((item) => (
        <Card key={item.label} className="gap-3 border-border/60 bg-card/70 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-lg font-semibold tracking-tight">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
