import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatBacktestCurrency,
  formatBacktestNumber,
  formatBacktestPercent,
} from "@/features/backtests/backtest.utils"
import type { BacktestResult } from "@/features/backtests/types"

type BacktestOverviewPanelProps = {
  result: BacktestResult
}

const getBacktestOverviewNarrative = (result: BacktestResult) => {
  if (result.summary_metrics.total_trades === 0) {
    return "This configuration produced no closed trades in the selected date range."
  }

  if (result.performance_metrics.total_return_pct > 0 && result.performance_metrics.max_drawdown_pct > 20) {
    return "The run finished profitable, but drawdown stayed meaningfully elevated relative to return."
  }

  if (result.performance_metrics.total_return_pct > 0) {
    return "The run finished positive with closed trades and a readable equity trend."
  }

  if (result.performance_metrics.total_return_pct < 0) {
    return "The run finished negative, so trade-level review and drawdown context matter before changing parameters."
  }

  return "The run finished flat overall, so parameter sensitivity is likely more important than headline return."
}

export const BacktestOverviewPanel = ({ result }: BacktestOverviewPanelProps) => {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle>Run Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="text-xs tracking-wide text-muted-foreground uppercase">Symbol</div>
            <div className="font-medium">{result.summary_metrics.symbol}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs tracking-wide text-muted-foreground uppercase">Strategy</div>
            <div className="font-medium">{result.summary_metrics.template_id}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs tracking-wide text-muted-foreground uppercase">Date Range</div>
            <div className="font-medium">
              {result.summary_metrics.date_from} to {result.summary_metrics.date_to}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs tracking-wide text-muted-foreground uppercase">Initial Capital</div>
            <div className="font-medium">
              {formatBacktestCurrency(result.summary_metrics.initial_capital)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs tracking-wide text-muted-foreground uppercase">Ending Equity</div>
            <div className="font-medium">
              {formatBacktestCurrency(result.summary_metrics.ending_equity)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs tracking-wide text-muted-foreground uppercase">Closed Trades</div>
            <div className="font-medium">
              {formatBacktestNumber(result.summary_metrics.total_trades, {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle>Performance Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            {getBacktestOverviewNarrative(result)}
          </p>
          <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2">
              Avg Win: {formatBacktestPercent(result.performance_metrics.avg_win_pct)}
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2">
              Avg Loss: {formatBacktestPercent(result.performance_metrics.avg_loss_pct)}
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2">
              Win Rate: {formatBacktestPercent(result.performance_metrics.win_rate_pct)}
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2">
              Profit Factor: {formatBacktestNumber(result.performance_metrics.profit_factor)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
