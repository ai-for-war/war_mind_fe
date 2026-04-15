import { Clock3, RefreshCw } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNullableValue } from "@/features/stocks/components/stock-company-dialog.utils"
import {
  IntradayTableSkeleton,
  PriceSummaryMetric,
  PricesErrorState,
} from "@/features/stocks/components/stock-company-prices-panel.shared"
import {
  dedupeIntradayItems,
  formatIntradayTimeLabel,
  formatMetricNumber,
  formatMetricSignedValue,
  getIntradayItemKey,
  getMetricAccent,
  getVietnamTimestamp,
  INTRADAY_PAGE_SIZE_OPTIONS,
} from "@/features/stocks/components/stock-company-prices-panel.utils"
import { useStockPriceIntraday } from "@/features/stocks/hooks"
import { DEFAULT_STOCK_PRICE_INTRADAY_PAGE_SIZE } from "@/features/stocks/types"

type StockCompanyPriceIntradayViewProps = {
  isActive: boolean
  symbol: string
}

export const StockCompanyPriceIntradayView = ({
  isActive,
  symbol,
}: StockCompanyPriceIntradayViewProps) => {
  const [intradayPageSize, setIntradayPageSize] = useState<number>(DEFAULT_STOCK_PRICE_INTRADAY_PAGE_SIZE)

  const intradayQuery = useStockPriceIntraday({
    isEnabled: isActive,
    pageSize: intradayPageSize,
    symbol,
  })

  const intradayItemsAscending = useMemo(() => {
    const items = intradayQuery.data?.pages.flatMap((page) => page.items) ?? []
    const dedupedItems = dedupeIntradayItems(items)

    return dedupedItems.sort((left, right) => {
      const leftTimestamp = getVietnamTimestamp(left.time)
      const rightTimestamp = getVietnamTimestamp(right.time)

      if (leftTimestamp == null && rightTimestamp == null) {
        return (left.id ?? 0) - (right.id ?? 0)
      }

      if (leftTimestamp == null) {
        return -1
      }

      if (rightTimestamp == null) {
        return 1
      }

      return leftTimestamp - rightTimestamp
    })
  }, [intradayQuery.data?.pages])

  const intradayItemsDescending = useMemo(
    () => [...intradayItemsAscending].reverse(),
    [intradayItemsAscending],
  )

  const latestIntradayItem = intradayItemsAscending.at(-1) ?? null
  const previousIntradayItem = intradayItemsAscending.at(-2) ?? null
  const intradayPriceChange =
    latestIntradayItem?.price != null && previousIntradayItem?.price != null
      ? latestIntradayItem.price - previousIntradayItem.price
      : null
  const intradayTotalVolume = useMemo(
    () => intradayItemsAscending.reduce((sum, item) => sum + (item.volume ?? 0), 0),
    [intradayItemsAscending],
  )
  const intradayFirstTime = intradayItemsAscending[0]?.time ?? null
  const intradayLastTime = latestIntradayItem?.time ?? null

  const handleRefreshIntraday = useCallback(() => {
    void intradayQuery.refetch()
  }, [intradayQuery])

  const handleLoadOlderTrades = useCallback(() => {
    void intradayQuery.fetchPreviousPage()
  }, [intradayQuery])

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Intraday Slice
            </div>
            <div className="text-sm text-muted-foreground">
              Latest tape first in the table. Load older trades with the provider cursor.
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Select
              value={`${intradayPageSize}`}
              onValueChange={(value) => setIntradayPageSize(Number(value))}
            >
              <SelectTrigger className="min-w-36">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {INTRADAY_PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={`${option}`}>
                    {option} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={handleRefreshIntraday}
              disabled={intradayQuery.isFetching}
            >
              <RefreshCw className={intradayQuery.isFetching ? "size-4 animate-spin" : "size-4"} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {intradayQuery.isLoading ? <IntradayTableSkeleton /> : null}

      {!intradayQuery.isLoading && intradayQuery.isError ? (
        <PricesErrorState
          title="Unable to load intraday prints"
          description="Retry the intraday request when the upstream provider is reachable again."
          onRetry={handleRefreshIntraday}
        />
      ) : null}

      {!intradayQuery.isLoading && !intradayQuery.isError && intradayItemsDescending.length === 0 ? (
        <Empty className="border-border/60 bg-background/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Clock3 className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No intraday trades found</EmptyTitle>
            <EmptyDescription>
              The intraday endpoint returned no trade rows for the selected symbol and current cursor slice.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {!intradayQuery.isLoading && !intradayQuery.isError && intradayItemsDescending.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <PriceSummaryMetric label="Latest Price" value={formatMetricNumber(latestIntradayItem?.price)} />
            <PriceSummaryMetric
              accent={getMetricAccent(intradayPriceChange)}
              label="Last Tick Change"
              value={formatMetricSignedValue(intradayPriceChange)}
            />
            <PriceSummaryMetric label="Volume Loaded" value={formatMetricNumber(intradayTotalVolume, 0)} />
            <PriceSummaryMetric
              label="Trades Loaded"
              value={formatMetricNumber(intradayItemsAscending.length, 0)}
            />
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
                Source {intradayQuery.data?.pages[0]?.source ?? "VCI"}
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-secondary/70">
                Page size {intradayPageSize}
              </Badge>
              <Badge variant="outline" className="rounded-full border-border/60 bg-background/20">
                {intradayQuery.data?.pages[0]?.cache_hit ? "Cache hit" : "Fresh fetch"}
              </Badge>
              {intradayFirstTime ? (
                <Badge variant="outline" className="rounded-full border-border/60 bg-background/20">
                  {formatIntradayTimeLabel(intradayFirstTime)} to {formatIntradayTimeLabel(intradayLastTime)}
                </Badge>
              ) : null}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead>Match Type</TableHead>
                  <TableHead className="text-right">ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intradayItemsDescending.map((item, index) => (
                  <TableRow key={getIntradayItemKey(item, index)}>
                    <TableCell className="font-medium text-foreground tabular-nums">
                      {formatIntradayTimeLabel(item.time)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatMetricNumber(item.price)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMetricNumber(item.volume, 0)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full border-border/60 bg-background/20">
                        {formatNullableValue(item.match_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.id == null ? "--" : item.id}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleLoadOlderTrades}
                disabled={!intradayQuery.hasPreviousPage || intradayQuery.isFetchingPreviousPage}
              >
                <RefreshCw
                  className={intradayQuery.isFetchingPreviousPage ? "size-4 animate-spin" : "size-4"}
                />
                {intradayQuery.isFetchingPreviousPage ? "Loading older trades" : "Load older trades"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
