import { AlertCircle, Check, Loader2, Search } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  useStockWatchlistSymbolSearch,
} from "@/features/stock-watchlists/hooks"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useScrollAreaInfiniteScroll } from "@/hooks/use-scroll-area-infinite-scroll"
import { cn } from "@/lib/utils"

type StockWatchlistAddSymbolDialogProps = {
  error: string | null
  isPending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  onSymbolChange: (value: string) => void
  open: boolean
  savedSymbols?: string[]
  symbolValue: string
  watchlistName: string
}

const SearchResultsSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-2 p-3">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={`stock-watchlist-search-skeleton-${index}`}
        className="space-y-2 rounded-xl border border-border/50 bg-background/40 px-3 py-3"
      >
        <div className="h-4 w-16 animate-pulse rounded bg-accent" />
        <div className="h-4 w-48 animate-pulse rounded bg-accent" />
        <div className="h-3 w-24 animate-pulse rounded bg-accent" />
      </div>
    ))}
  </div>
)

export const StockWatchlistAddSymbolDialog = ({
  error,
  isPending = false,
  onOpenChange,
  onSubmit,
  onSymbolChange,
  open,
  savedSymbols = [],
  symbolValue,
  watchlistName,
}: StockWatchlistAddSymbolDialogProps) => {
  const debouncedSearch = useDebouncedValue(symbolValue, 300)
  const symbolSearchQuery = useStockWatchlistSymbolSearch({
    isEnabled: open,
    pageSize: 10,
    query: debouncedSearch,
  })
  const normalizedSelectedSymbol = symbolValue.trim().toUpperCase()
  const savedSymbolSet = useMemo(
    () => new Set(savedSymbols.map((symbol) => symbol.trim().toUpperCase())),
    [savedSymbols],
  )
  const selectedSymbolIsAlreadySaved =
    normalizedSelectedSymbol.length > 0 && savedSymbolSet.has(normalizedSelectedSymbol)
  const { scrollAreaRef, sentinelRef } = useScrollAreaInfiniteScroll({
    hasNextPage: Boolean(symbolSearchQuery.hasNextPage),
    isEnabled:
      open &&
      symbolSearchQuery.hasSearchQuery &&
      !symbolSearchQuery.isLoading &&
      !symbolSearchQuery.isError &&
      symbolSearchQuery.items.length > 0,
    isFetchingNextPage: symbolSearchQuery.isFetchingNextPage,
    onLoadMore: () => {
      void symbolSearchQuery.fetchNextPage()
    },
  })

  const handleSearchResultSelect = (symbol: string) => {
    onSymbolChange(symbol)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Symbol</DialogTitle>
          <DialogDescription>
            Add a symbol directly to <span className="font-medium text-foreground">{watchlistName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <Field>
            <FieldLabel htmlFor="stock-watchlist-symbol">Symbol</FieldLabel>
            <FieldContent>
              <Input
                id="stock-watchlist-symbol"
                value={symbolValue}
                onChange={(event) => onSymbolChange(event.target.value)}
                placeholder="FPT"
                maxLength={32}
                aria-invalid={error ? "true" : undefined}
                autoCapitalize="characters"
                autoFocus
              />
              <FieldError>{error}</FieldError>
            </FieldContent>
          </Field>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/30">
            <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Search className="size-4 text-muted-foreground" />
                Stock catalog matches
              </div>
              {symbolSearchQuery.hasSearchQuery && !symbolSearchQuery.isLoading ? (
                <div className="text-xs text-muted-foreground">
                  {symbolSearchQuery.total > 0
                    ? `${symbolSearchQuery.items.length}/${symbolSearchQuery.total} loaded`
                    : "0 matches"}
                </div>
              ) : null}
            </div>

            {!symbolSearchQuery.hasSearchQuery ? (
              <div className="flex h-64 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                Type a symbol or company name to search the stock catalog before adding.
              </div>
            ) : null}

            {symbolSearchQuery.hasSearchQuery && symbolSearchQuery.isLoading ? (
              <div className="h-64">
                <SearchResultsSkeleton />
              </div>
            ) : null}

            {symbolSearchQuery.hasSearchQuery && symbolSearchQuery.isError ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
                <AlertCircle className="size-5 text-destructive" />
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    Unable to search the stock catalog
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Keep this dialog open and retry the current search.
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void symbolSearchQuery.refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : null}

            {symbolSearchQuery.hasSearchQuery &&
            !symbolSearchQuery.isLoading &&
            !symbolSearchQuery.isError &&
            symbolSearchQuery.items.length === 0 ? (
              <div className="flex h-64 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                No catalog symbols match this search yet.
              </div>
            ) : null}

            {symbolSearchQuery.hasSearchQuery &&
            !symbolSearchQuery.isLoading &&
            !symbolSearchQuery.isError &&
            symbolSearchQuery.items.length > 0 ? (
              <ScrollArea ref={scrollAreaRef} className="h-64 min-h-0">
                <div className="space-y-2 p-3">
                  {symbolSearchQuery.items.map((item) => {
                    const isSelected = item.symbol.trim().toUpperCase() === normalizedSelectedSymbol
                    const isAlreadySaved = savedSymbolSet.has(item.symbol.trim().toUpperCase())

                    return (
                      <button
                        key={item.symbol}
                        type="button"
                        disabled={isAlreadySaved}
                        onClick={() => handleSearchResultSelect(item.symbol)}
                        className={cn(
                          "flex w-full items-start justify-between gap-4 rounded-xl border px-3 py-3 text-left transition-colors",
                          isSelected
                            ? "border-cyan-400/50 bg-cyan-400/10"
                            : "border-border/50 bg-background/30 hover:border-border hover:bg-background/60",
                          isAlreadySaved && "cursor-not-allowed opacity-60",
                        )}
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold tracking-wide text-foreground">
                              {item.symbol}
                            </span>
                            {item.exchange ? (
                              <span className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                {item.exchange}
                              </span>
                            ) : null}
                          </div>
                          <div className="truncate text-sm text-foreground/90">
                            {item.organ_name ?? "Unknown company"}
                          </div>
                          <div className="text-xs text-muted-foreground">{item.source}</div>
                        </div>

                        <div className="shrink-0">
                          {isAlreadySaved ? (
                            <span className="rounded-full border border-border/60 px-2 py-1 text-[11px] text-muted-foreground">
                              Already added
                            </span>
                          ) : isSelected ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-[11px] text-cyan-100">
                              <Check className="size-3" />
                              Selected
                            </span>
                          ) : (
                            <span className="rounded-full border border-border/60 px-2 py-1 text-[11px] text-muted-foreground">
                              Select
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}

                  {symbolSearchQuery.isFetchingNextPage ? <SearchResultsSkeleton count={2} /> : null}
                  <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />
                </div>
              </ScrollArea>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || selectedSymbolIsAlreadySaved}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Add Symbol
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
