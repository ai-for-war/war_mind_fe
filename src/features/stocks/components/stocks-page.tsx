import { AlertCircle, DatabaseZap, RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"

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
import { Skeleton } from "@/components/ui/skeleton"
import { StocksFilterBar } from "@/features/stocks/components/stocks-filter-bar"
import { StocksTable } from "@/features/stocks/components/stocks-table"
import { useStockCatalog } from "@/features/stocks/hooks"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useScrollAreaInfiniteScroll } from "@/hooks/use-scroll-area-infinite-scroll"
import type {
  StockCatalogFilters,
  StockExchangeOption,
  StockGroupOption,
  StockIndustryCode,
} from "@/features/stocks/types"
import { formatAbsoluteDateTime } from "@/lib/date"

const StockRowsSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="space-y-2 p-4">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={`stock-row-skeleton-${index}`}
        className="grid grid-cols-[0.8fr_1.8fr_0.8fr_1.2fr_1fr_1fr_1fr] gap-3 rounded-xl border border-border/40 px-4 py-3"
      >
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-28" />
      </div>
    ))}
  </div>
)

export const StocksPage = () => {
  const [filters, setFilters] = useState<StockCatalogFilters>({
    exchange: null,
    group: null,
    industryCode: null,
    q: "",
  })
  const debouncedSearch = useDebouncedValue(filters.q ?? "", 300)
  const debouncedFilters = useMemo(
    () => ({
      ...filters,
      q: debouncedSearch,
    }),
    [debouncedSearch, filters],
  )
  const stockCatalogQuery = useStockCatalog(debouncedFilters)

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        (filters.q?.trim() ?? "").length > 0 ||
          filters.exchange != null ||
          filters.group != null ||
          filters.industryCode != null,
      ),
    [filters.exchange, filters.group, filters.industryCode, filters.q],
  )

  const handleSearchChange = (value: string) => {
    setFilters((current) => ({
      ...current,
      q: value,
    }))
  }

  const handleExchangeChange = (value: StockExchangeOption | null) => {
    setFilters((current) => ({
      ...current,
      exchange: value,
    }))
  }

  const handleGroupChange = (value: StockGroupOption | null) => {
    setFilters((current) => ({
      ...current,
      group: value,
    }))
  }

  const handleIndustryCodeChange = (value: StockIndustryCode | null) => {
    setFilters((current) => ({
      ...current,
      industryCode: value,
    }))
  }

  const handleReset = () => {
    setFilters({
      exchange: null,
      group: null,
      industryCode: null,
      q: "",
    })
  }

  const freshnessLabel = stockCatalogQuery.snapshotAt
    ? formatAbsoluteDateTime(stockCatalogQuery.snapshotAt)
    : null
  const { scrollAreaRef, sentinelRef } = useScrollAreaInfiniteScroll({
    hasNextPage: Boolean(stockCatalogQuery.hasNextPage),
    isEnabled:
      !stockCatalogQuery.isLoading &&
      !stockCatalogQuery.isError &&
      stockCatalogQuery.items.length > 0,
    isFetchingNextPage: stockCatalogQuery.isFetchingNextPage,
    onLoadMore: () => {
      void stockCatalogQuery.fetchNextPage()
    },
  })

  return (
    <section className="flex h-full min-h-0 min-w-0 max-h-[calc(100dvh-6rem)] flex-1 flex-col gap-4 overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
              Markets
            </Badge>
            <Badge variant="secondary" className="rounded-full bg-secondary/70">
              {stockCatalogQuery.total} instruments
            </Badge>
            {freshnessLabel ? (
              <Badge
                variant="outline"
                className="rounded-full border-amber-400/30 bg-amber-400/10 text-amber-100"
              >
                Snapshot {freshnessLabel}
              </Badge>
            ) : null}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Stock Catalog</h1>
            <p className="text-sm text-muted-foreground">
              Browse persisted market symbols with fast search, exchange chips, and group filters.
            </p>
          </div>
        </div>
      </header>

      <StocksFilterBar
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onExchangeChange={handleExchangeChange}
        onGroupChange={handleGroupChange}
        onIndustryCodeChange={handleIndustryCodeChange}
        onReset={handleReset}
        onSearchChange={handleSearchChange}
      />

      <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl border border-border/60 bg-background/50 backdrop-blur">
        {stockCatalogQuery.isLoading ? <StockRowsSkeleton /> : null}

        {!stockCatalogQuery.isLoading && stockCatalogQuery.isError ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <Empty className="border-destructive/30 bg-destructive/5">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AlertCircle className="size-5 text-destructive" />
                </EmptyMedia>
                <EmptyTitle>Unable to load stock catalog</EmptyTitle>
                <EmptyDescription>
                  Keep the current filters and retry the request when the service is reachable.
                </EmptyDescription>
              </EmptyHeader>
              <Button type="button" variant="outline" onClick={() => void stockCatalogQuery.refetch()}>
                <RefreshCw className="size-4" />
                Retry
              </Button>
            </Empty>
          </div>
        ) : null}

        {!stockCatalogQuery.isLoading &&
        !stockCatalogQuery.isError &&
        stockCatalogQuery.items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <Empty className="border-border/60 bg-background/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <DatabaseZap className="size-5" />
                </EmptyMedia>
                <EmptyTitle>
                  {hasActiveFilters ? "No matching stocks" : "No stock catalog data yet"}
                </EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? "Adjust the search, exchange, or group filters to broaden the result set."
                    : "The stock catalog will appear here once data is available from the backend."}
                </EmptyDescription>
              </EmptyHeader>
              {hasActiveFilters ? (
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset filters
                </Button>
              ) : null}
            </Empty>
          </div>
        ) : null}

        {!stockCatalogQuery.isLoading &&
        !stockCatalogQuery.isError &&
        stockCatalogQuery.items.length > 0 ? (
          <ScrollArea ref={scrollAreaRef} className="h-full min-h-0 flex-1 pr-2">
            <div className="min-w-full">
              <StocksTable items={stockCatalogQuery.items} />

              <div className="flex flex-col items-center gap-3 px-4 py-4">
                {stockCatalogQuery.isFetchingNextPage ? <StockRowsSkeleton count={3} /> : null}

                {!stockCatalogQuery.hasNextPage ? (
                  <div className="text-xs tracking-wide text-muted-foreground uppercase">
                    All {stockCatalogQuery.total} instruments loaded
                  </div>
                ) : null}

                <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </div>
    </section>
  )
}
