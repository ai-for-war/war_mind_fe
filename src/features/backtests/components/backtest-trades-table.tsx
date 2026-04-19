import { ChartNoAxesCombined } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  buildBacktestTradeRows,
  formatBacktestCurrency,
  formatBacktestNumber,
  formatBacktestPercent,
} from "@/features/backtests/backtest.utils"
import type { BacktestResult } from "@/features/backtests/types"

type BacktestTradesTableProps = {
  result: BacktestResult
}

export const BacktestTradesTable = ({ result }: BacktestTradesTableProps) => {
  const tradeRows = buildBacktestTradeRows(result.trade_log)

  if (tradeRows.length === 0) {
    return (
      <Empty className="min-h-[260px] border-border/60 bg-background/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChartNoAxesCombined className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No closed trades</EmptyTitle>
          <EmptyDescription>
            This setup completed without any closed trades in the selected window.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="min-w-0 overflow-x-auto rounded-xl border border-border/60 bg-card/70">
      <div className="min-w-full w-max">
        <table data-slot="table" className="w-full caption-bottom text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[13rem] whitespace-nowrap">Entry</TableHead>
            <TableHead className="min-w-[13rem] whitespace-nowrap">Exit</TableHead>
            <TableHead className="whitespace-nowrap text-right">Shares</TableHead>
            <TableHead className="whitespace-nowrap text-right">Invested</TableHead>
            <TableHead className="whitespace-nowrap text-right">PnL</TableHead>
            <TableHead className="whitespace-nowrap text-right">PnL %</TableHead>
            <TableHead className="min-w-[16rem] whitespace-nowrap">Exit Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tradeRows.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell className="whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <span>{trade.entry_time}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatBacktestCurrency(trade.entry_price)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <span>{trade.exit_time}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatBacktestCurrency(trade.exit_price)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-right">
                {formatBacktestNumber(trade.shares, { maximumFractionDigits: 0 })}
              </TableCell>
              <TableCell className="whitespace-nowrap text-right">
                {formatBacktestCurrency(trade.invested_capital)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-right">{formatBacktestCurrency(trade.pnl)}</TableCell>
              <TableCell className="whitespace-nowrap text-right">{formatBacktestPercent(trade.pnl_pct)}</TableCell>
              <TableCell className="min-w-[16rem] whitespace-nowrap">{trade.exit_reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        </table>
      </div>
    </div>
  )
}
