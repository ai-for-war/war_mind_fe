import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  buildBacktestEquityChartData,
  formatBacktestCurrency,
  formatBacktestPercent,
} from "@/features/backtests/backtest.utils"
import type { BacktestResult } from "@/features/backtests/types"
import { formatAbsoluteDateTime } from "@/lib/date"

type BacktestEquityChartProps = {
  result: BacktestResult
}

const backtestChartConfig = {
  equity: {
    label: "Equity",
    color: "hsl(var(--primary))",
  },
  drawdownPct: {
    label: "Drawdown %",
    color: "hsl(var(--destructive))",
  },
} as const

export const BacktestEquityChart = ({ result }: BacktestEquityChartProps) => {
  const chartData = buildBacktestEquityChartData(result.equity_curve)

  return (
    <Card className="border-border/60 bg-card/70">
      <CardHeader>
        <CardTitle>Equity Curve</CardTitle>
        <CardDescription>
          Daily equity snapshots across the selected backtest window.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[320px] w-full" config={backtestChartConfig}>
          <AreaChart accessibilityLayer data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="backtest-equity-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-equity)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-equity)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              minTickGap={48}
              tickFormatter={(value) => formatAbsoluteDateTime(value, value)}
            />
            <YAxis
              tickFormatter={(value) =>
                formatBacktestCurrency(Number(value), {
                  maximumFractionDigits: 0,
                })
              }
              yAxisId="equity"
            />
            <YAxis
              dataKey="drawdownPct"
              domain={["auto", "auto"]}
              hide
              yAxisId="drawdown"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "drawdownPct") {
                      return (
                        <>
                          <span className="text-muted-foreground">Drawdown</span>
                          <span className="font-mono font-medium">
                            {formatBacktestPercent(Number(value))}
                          </span>
                        </>
                      )
                    }

                    return (
                      <>
                        <span className="text-muted-foreground">
                          {name === "equity" ? "Equity" : String(name)}
                        </span>
                        <span className="font-mono font-medium">
                          {formatBacktestCurrency(Number(value))}
                        </span>
                      </>
                    )
                  }}
                  labelFormatter={(value, payload) => {
                    const chartPoint = payload?.[0]?.payload as
                      | { cash?: number; marketValue?: number; positionSize?: number }
                      | undefined

                    return (
                      <div className="grid gap-1">
                        <div>{formatAbsoluteDateTime(String(value), String(value))}</div>
                        {chartPoint ? (
                          <div className="grid gap-0.5 text-[11px] text-muted-foreground">
                            <div>Cash: {formatBacktestCurrency(chartPoint.cash ?? 0)}</div>
                            <div>
                              Market value: {formatBacktestCurrency(chartPoint.marketValue ?? 0)}
                            </div>
                            <div>Position size: {chartPoint.positionSize ?? 0}</div>
                          </div>
                        ) : null}
                      </div>
                    )
                  }}
                />
              }
            />
            <Area
              dataKey="equity"
              fill="url(#backtest-equity-fill)"
              fillOpacity={1}
              stroke="var(--color-equity)"
              strokeWidth={2}
              type="monotone"
              yAxisId="equity"
            />
            <Line
              dataKey="drawdownPct"
              dot={false}
              opacity={0.9}
              stroke="var(--color-drawdownPct)"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              type="monotone"
              yAxisId="drawdown"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
