import { ChartNoAxesCombined } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
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
    <div className="rounded-xl border border-border/60 bg-card/70">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entry</TableHead>
            <TableHead>Exit</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Invested</TableHead>
            <TableHead className="text-right">PnL</TableHead>
            <TableHead className="text-right">PnL %</TableHead>
            <TableHead>Exit Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tradeRows.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span>{trade.entry_time}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatBacktestCurrency(trade.entry_price)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span>{trade.exit_time}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatBacktestCurrency(trade.exit_price)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatBacktestNumber(trade.shares, { maximumFractionDigits: 0 })}
              </TableCell>
              <TableCell className="text-right">
                {formatBacktestCurrency(trade.invested_capital)}
              </TableCell>
              <TableCell className="text-right">{formatBacktestCurrency(trade.pnl)}</TableCell>
              <TableCell className="text-right">{formatBacktestPercent(trade.pnl_pct)}</TableCell>
              <TableCell>{trade.exit_reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
