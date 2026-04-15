import { Clock3, RefreshCw } from "lucide-react"
import { useCallback, useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatNullableValue } from "@/features/stocks/components/stock-company-dialog.utils"
import {
  IntradayTableSkeleton,
  PricesErrorState,
} from "@/features/stocks/components/stock-company-prices-panel.shared"
import {
  dedupeIntradayItems,
  formatIntradayTimeLabel,
  formatMetricNumber,
  getIntradayItemKey,
  getVietnamTimestamp,
} from "@/features/stocks/components/stock-company-prices-panel.utils"
import { useStockPriceIntraday } from "@/features/stocks/hooks"
import { useScrollAreaInfiniteScroll } from "@/hooks/use-scroll-area-infinite-scroll"
import { DEFAULT_STOCK_PRICE_INTRADAY_PAGE_SIZE } from "@/features/stocks/types"

type StockCompanyPriceIntradayViewProps = {
  className?: string
  isActive: boolean
  symbol: string
}

export const StockCompanyPriceIntradayView = ({
  className,
  isActive,
  symbol,
}: StockCompanyPriceIntradayViewProps) => {
  const intradayQuery = useStockPriceIntraday({
    isEnabled: isActive,
    pageSize: DEFAULT_STOCK_PRICE_INTRADAY_PAGE_SIZE,
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
  const handleRefreshIntraday = useCallback(() => {
    void intradayQuery.refetch()
  }, [intradayQuery])

  const handleLoadOlderTrades = useCallback(() => {
    void intradayQuery.fetchPreviousPage()
  }, [intradayQuery])

  const { scrollAreaRef, sentinelRef } = useScrollAreaInfiniteScroll({
    hasNextPage: Boolean(intradayQuery.hasPreviousPage),
    isEnabled:
      isActive &&
      !intradayQuery.isLoading &&
      !intradayQuery.isError &&
      intradayItemsDescending.length > 0,
    isFetchingNextPage: intradayQuery.isFetchingPreviousPage,
    onLoadMore: handleLoadOlderTrades,
  })

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border/60 bg-background/30 p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <div className="text-sm font-semibold tracking-wide text-foreground uppercase">Intraday Tape</div>
            <div className="text-sm text-muted-foreground">
              Latest prints first. Older trades continue loading as you scroll.
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
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
          <div className="min-h-0 flex-1">
            <ScrollArea ref={scrollAreaRef} className="h-full min-h-0 pr-2">
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

              <div className="flex flex-col items-center gap-3 px-4 py-4">
                {intradayQuery.isFetchingPreviousPage ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="size-4 animate-spin" />
                    Loading older trades
                  </div>
                ) : null}

                {!intradayQuery.hasPreviousPage ? (
                  <div className="text-xs tracking-wide text-muted-foreground uppercase">
                    Loaded all available trades for this cursor chain
                  </div>
                ) : null}

                <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />
              </div>
            </ScrollArea>
          </div>
        ) : null}
      </div>
    </div>
  )
}
