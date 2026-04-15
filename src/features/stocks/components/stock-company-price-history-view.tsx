import { Activity, AlertCircle, DatabaseZap, RefreshCw } from "lucide-react"
import {
  CandlestickSeries,
  HistogramSeries,
  createChart,
} from "lightweight-charts"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PricePanelSkeleton,
  PriceSummaryMetric,
  PricesErrorState,
} from "@/features/stocks/components/stock-company-prices-panel.shared"
import {
  buildParsedCandles,
  buildVolumeData,
  createDefaultRangeDraft,
  formatHistoryTimeLabel,
  formatMetricNumber,
  formatMetricSignedPercent,
  formatMetricSignedValue,
  getMetricAccent,
  type HistoryQueryMode,
  LOOKBACK_LENGTH_OPTIONS,
} from "@/features/stocks/components/stock-company-prices-panel.utils"
import { useStockPriceHistory } from "@/features/stocks/hooks"
import {
  DEFAULT_STOCK_PRICE_LOOKBACK_LENGTH,
  STOCK_PRICE_HISTORY_INTERVALS,
  type StockPriceHistoryInterval,
  type StockPriceHistoryItem,
} from "@/features/stocks/types"

type StockCompanyPriceHistoryViewProps = {
  isActive: boolean
  symbol: string
}

type OhlcvChartProps = {
  items: StockPriceHistoryItem[]
}

const OhlcvChart = ({ items }: OhlcvChartProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { resolvedTheme } = useTheme()

  const parsedCandles = useMemo(() => buildParsedCandles(items), [items])
  const volumeData = useMemo(() => buildVolumeData(parsedCandles), [parsedCandles])

  useEffect(() => {
    if (!containerRef.current || parsedCandles.length === 0) {
      return undefined
    }

    const isDarkTheme = (resolvedTheme ?? "dark") === "dark"
    const chart = createChart(containerRef.current, {
      crosshair: {
        horzLine: {
          color: isDarkTheme ? "rgba(148, 163, 184, 0.28)" : "rgba(51, 65, 85, 0.25)",
        },
        vertLine: {
          color: isDarkTheme ? "rgba(148, 163, 184, 0.28)" : "rgba(51, 65, 85, 0.25)",
        },
      },
      grid: {
        horzLines: {
          color: isDarkTheme ? "rgba(148, 163, 184, 0.08)" : "rgba(15, 23, 42, 0.08)",
        },
        vertLines: {
          color: isDarkTheme ? "rgba(148, 163, 184, 0.05)" : "rgba(15, 23, 42, 0.05)",
        },
      },
      height: 448,
      layout: {
        attributionLogo: false,
        background: {
          color: "transparent",
        },
        textColor: isDarkTheme ? "rgba(226, 232, 240, 0.88)" : "rgba(15, 23, 42, 0.82)",
      },
      localization: {
        locale: "en-US",
      },
      rightPriceScale: {
        borderColor: isDarkTheme ? "rgba(148, 163, 184, 0.18)" : "rgba(51, 65, 85, 0.18)",
      },
      timeScale: {
        borderColor: isDarkTheme ? "rgba(148, 163, 184, 0.18)" : "rgba(51, 65, 85, 0.18)",
        timeVisible: true,
      },
      width: containerRef.current.clientWidth,
    })

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      borderDownColor: "#f87171",
      borderUpColor: "#34d399",
      downColor: "#ef4444",
      priceLineVisible: true,
      upColor: "#10b981",
      wickDownColor: "#f87171",
      wickUpColor: "#34d399",
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "volume",
    })

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        bottom: 0,
        top: 0.78,
      },
    })

    candlestickSeries.setData(parsedCandles)
    volumeSeries.setData(volumeData)
    chart.timeScale().fitContent()

    const resizeObserver = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width

      if (!nextWidth) {
        return
      }

      chart.resize(nextWidth, 448)
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [parsedCandles, resolvedTheme, volumeData])

  if (parsedCandles.length === 0) {
    return (
      <Empty className="border-border/60 bg-background/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Activity className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No chartable candles</EmptyTitle>
          <EmptyDescription>
            The current history response does not contain enough OHLC values to render a candlestick chart.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return <div ref={containerRef} className="h-[28rem] w-full rounded-xl" />
}

export const StockCompanyPriceHistoryView = ({
  isActive,
  symbol,
}: StockCompanyPriceHistoryViewProps) => {
  const [historyInterval, setHistoryInterval] = useState<StockPriceHistoryInterval>("1D")
  const [historyQueryMode, setHistoryQueryMode] = useState<HistoryQueryMode>("lookback")
  const [lookbackLength, setLookbackLength] = useState<number>(DEFAULT_STOCK_PRICE_LOOKBACK_LENGTH)
  const [rangeDraft, setRangeDraft] = useState(createDefaultRangeDraft)
  const [appliedRange, setAppliedRange] = useState(createDefaultRangeDraft)

  const historyRangeError = useMemo(() => {
    if (historyQueryMode !== "range") {
      return null
    }

    if (!rangeDraft.start.trim()) {
      return "Choose a start date before applying a custom range."
    }

    if (rangeDraft.end && rangeDraft.end < rangeDraft.start) {
      return "End date must be on or after the selected start date."
    }

    return null
  }, [historyQueryMode, rangeDraft.end, rangeDraft.start])

  const historyRequest = useMemo(
    () =>
      historyQueryMode === "lookback"
        ? {
            interval: historyInterval,
            length: lookbackLength,
          }
        : {
            interval: historyInterval,
            ...(appliedRange.end ? { end: appliedRange.end } : {}),
            start: appliedRange.start,
          },
    [appliedRange.end, appliedRange.start, historyInterval, historyQueryMode, lookbackLength],
  )

  const historyQuery = useStockPriceHistory({
    isEnabled: isActive,
    query: historyRequest,
    symbol,
  })

  const historyItems = useMemo(() => historyQuery.data?.items ?? [], [historyQuery.data?.items])
  const parsedHistoryCandles = useMemo(() => buildParsedCandles(historyItems), [historyItems])
  const lastHistoryCandle = parsedHistoryCandles.at(-1) ?? null
  const previousHistoryCandle = parsedHistoryCandles.at(-2) ?? null

  const historyPriceChange =
    lastHistoryCandle && previousHistoryCandle
      ? lastHistoryCandle.close - previousHistoryCandle.close
      : null
  const historyPriceChangePercent =
    lastHistoryCandle && previousHistoryCandle && previousHistoryCandle.close !== 0
      ? ((lastHistoryCandle.close - previousHistoryCandle.close) / previousHistoryCandle.close) * 100
      : null

  const historyHigh = useMemo(
    () =>
      parsedHistoryCandles.length > 0
        ? parsedHistoryCandles.reduce((maxValue, item) => Math.max(maxValue, item.high), parsedHistoryCandles[0].high)
        : null,
    [parsedHistoryCandles],
  )

  const historyLow = useMemo(
    () =>
      parsedHistoryCandles.length > 0
        ? parsedHistoryCandles.reduce((minValue, item) => Math.min(minValue, item.low), parsedHistoryCandles[0].low)
        : null,
    [parsedHistoryCandles],
  )

  const historyTotalVolume = useMemo(
    () => parsedHistoryCandles.reduce((sum, item) => sum + (item.volume ?? 0), 0),
    [parsedHistoryCandles],
  )

  const handleApplyRange = useCallback(() => {
    if (historyRangeError) {
      return
    }

    setAppliedRange(rangeDraft)
  }, [historyRangeError, rangeDraft])

  const handleRefreshHistory = useCallback(() => {
    void historyQuery.refetch()
  }, [historyQuery])

  const handleHistoryModeChange = useCallback((value: string) => {
    if (value !== "lookback" && value !== "range") {
      return
    }

    setHistoryQueryMode(value)
  }, [])

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Interval</div>
            <div className="flex flex-wrap gap-2">
              {STOCK_PRICE_HISTORY_INTERVALS.map((interval) => (
                <Button
                  key={interval}
                  type="button"
                  size="sm"
                  variant={historyInterval === interval ? "secondary" : "outline"}
                  className={
                    historyInterval === interval
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15"
                      : "border-border/60 bg-background/10"
                  }
                  onClick={() => setHistoryInterval(interval)}
                >
                  {interval}
                </Button>
              ))}
            </div>
          </div>

          <div className="h-6 w-px bg-border/50" />

          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Query Mode</div>
            <Tabs className="gap-0" onValueChange={handleHistoryModeChange} value={historyQueryMode}>
              <TabsList variant="line" className="rounded-full border border-border/60 bg-background/10 p-1">
                <TabsTrigger
                  value="lookback"
                  className="rounded-full px-3 data-[state=active]:border-cyan-400/30 data-[state=active]:bg-cyan-400/10 data-[state=active]:text-cyan-100"
                >
                  Lookback
                </TabsTrigger>
                <TabsTrigger
                  value="range"
                  className="rounded-full px-3 data-[state=active]:border-cyan-400/30 data-[state=active]:bg-cyan-400/10 data-[state=active]:text-cyan-100"
                >
                  Custom Range
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleRefreshHistory}
              disabled={historyQuery.isFetching}
            >
              <RefreshCw className={historyQuery.isFetching ? "size-4 animate-spin" : "size-4"} />
              Refresh
            </Button>
          </div>
        </div>

        {historyQueryMode === "lookback" ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {LOOKBACK_LENGTH_OPTIONS.map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant={lookbackLength === option ? "secondary" : "outline"}
                className={
                  lookbackLength === option
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15"
                    : "border-border/60 bg-background/10"
                }
                onClick={() => setLookbackLength(option)}
              >
                {option} bars
              </Button>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,14rem)_minmax(0,14rem)_auto] md:items-end">
              <label className="space-y-2 text-sm">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Start Date
                </span>
                <Input
                  type="date"
                  value={rangeDraft.start}
                  onChange={(event) =>
                    setRangeDraft((current) => ({
                      ...current,
                      start: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  End Date
                </span>
                <Input
                  type="date"
                  value={rangeDraft.end}
                  onChange={(event) =>
                    setRangeDraft((current) => ({
                      ...current,
                      end: event.target.value,
                    }))
                  }
                />
              </label>

              <Button type="button" onClick={handleApplyRange} disabled={historyRangeError != null}>
                Apply Range
              </Button>
            </div>

            {historyRangeError ? (
              <Alert className="border-amber-400/25 bg-amber-400/8 text-amber-50">
                <AlertCircle className="text-amber-300" />
                <AlertTitle>Invalid custom range</AlertTitle>
                <AlertDescription>{historyRangeError}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        )}
      </div>

      {historyQuery.isLoading ? <PricePanelSkeleton /> : null}

      {!historyQuery.isLoading && historyQuery.isError ? (
        <PricesErrorState
          title="Unable to load price history"
          description="Keep the selected symbol visible and retry this history query when the upstream service is reachable."
          onRetry={handleRefreshHistory}
        />
      ) : null}

      {!historyQuery.isLoading && !historyQuery.isError && historyItems.length === 0 ? (
        <Empty className="border-border/60 bg-background/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <DatabaseZap className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No history candles found</EmptyTitle>
            <EmptyDescription>
              This history query returned an empty item list for the current interval and range selection.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {!historyQuery.isLoading && !historyQuery.isError && historyItems.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <PriceSummaryMetric label="Last Close" value={formatMetricNumber(lastHistoryCandle?.close)} />
            <PriceSummaryMetric
              accent={getMetricAccent(historyPriceChange)}
              label="Change"
              value={
                historyPriceChange == null
                  ? "--"
                  : `${formatMetricSignedValue(historyPriceChange)} (${formatMetricSignedPercent(historyPriceChangePercent)})`
              }
            />
            <PriceSummaryMetric
              label="Range"
              value={
                historyHigh == null || historyLow == null
                  ? "--"
                  : `${formatMetricNumber(historyLow)} - ${formatMetricNumber(historyHigh)}`
              }
            />
            <PriceSummaryMetric label="Total Volume" value={formatMetricNumber(historyTotalVolume, 0)} />
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
            <OhlcvChart items={historyItems} />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
                Source {historyQuery.data?.source ?? "VCI"}
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-secondary/70">
                Interval {historyQuery.data?.interval ?? historyInterval}
              </Badge>
              <Badge variant="outline" className="rounded-full border-border/60 bg-background/20">
                {historyItems.length} candles
              </Badge>
              <Badge variant="outline" className="rounded-full border-border/60 bg-background/20">
                {historyQuery.data?.cache_hit ? "Cache hit" : "Fresh fetch"}
              </Badge>
              <Badge variant="outline" className="rounded-full border-border/60 bg-background/20">
                {formatHistoryTimeLabel(historyItems[0]?.time)} to {formatHistoryTimeLabel(historyItems.at(-1)?.time)}
              </Badge>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold tracking-wide text-foreground uppercase">Raw Candles</div>
                <div className="text-sm text-muted-foreground">
                  Inspect the raw response rows returned by the history endpoint.
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                  <TableHead className="text-right">High</TableHead>
                  <TableHead className="text-right">Low</TableHead>
                  <TableHead className="text-right">Close</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyItems
                  .slice()
                  .reverse()
                  .slice(0, 20)
                  .map((item, index) => (
                    <TableRow key={`${item.time ?? "history"}-${index}`}>
                      <TableCell className="font-medium text-foreground">
                        {formatHistoryTimeLabel(item.time)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatMetricNumber(item.open)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMetricNumber(item.high)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMetricNumber(item.low)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMetricNumber(item.close)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMetricNumber(item.volume, 0)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
