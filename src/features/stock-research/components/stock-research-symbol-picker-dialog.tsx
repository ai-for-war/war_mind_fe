import { AlertCircle, Check, Search } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useStockSymbolSearch } from "@/features/stocks/hooks"
import { normalizeStockResearchSymbol } from "@/features/stock-research/types"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useScrollAreaInfiniteScroll } from "@/hooks/use-scroll-area-infinite-scroll"
import { cn } from "@/lib/utils"

type StockResearchSymbolPickerDialogProps = {
  onOpenChange: (open: boolean) => void
  onSelectSymbol: (symbol: string) => void
  open: boolean
  selectedSymbol?: string | null
}

type StockResearchSymbolPickerDialogBodyProps = Omit<
  StockResearchSymbolPickerDialogProps,
  "open"
>

const SearchResultsSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-2 p-2">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={`stock-research-picker-skeleton-${index}`}
        className="space-y-2 rounded-lg border border-border/50 bg-background/40 px-3 py-3"
      >
        <div className="h-4 w-16 animate-pulse rounded bg-accent" />
        <div className="h-4 w-40 animate-pulse rounded bg-accent" />
      </div>
    ))}
  </div>
)

const StockResearchSymbolPickerDialogBody = ({
  onOpenChange,
  onSelectSymbol,
  selectedSymbol,
}: StockResearchSymbolPickerDialogBodyProps) => {
  const [searchValue, setSearchValue] = useState(selectedSymbol ?? "")
  const debouncedSearch = useDebouncedValue(searchValue, 300)
  const symbolSearchQuery = useStockSymbolSearch({
    isEnabled: true,
    pageSize: 10,
    query: debouncedSearch,
  })
  const normalizedSelectedSymbol = normalizeStockResearchSymbol(selectedSymbol)
  const { scrollAreaRef, sentinelRef } = useScrollAreaInfiniteScroll({
    hasNextPage: Boolean(symbolSearchQuery.hasNextPage),
    isEnabled:
      symbolSearchQuery.hasSearchQuery &&
      !symbolSearchQuery.isLoading &&
      !symbolSearchQuery.isError &&
      symbolSearchQuery.items.length > 0,
    isFetchingNextPage: symbolSearchQuery.isFetchingNextPage,
    onLoadMore: () => {
      void symbolSearchQuery.fetchNextPage()
    },
  })

  const handleSelectSymbol = (symbol: string) => {
    onSelectSymbol(symbol)
    onOpenChange(false)
  }

  return (
    <DialogContent className="max-h-[min(85vh,40rem)] sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Choose symbol</DialogTitle>
        <DialogDescription>Search by symbol or company name, then pick one match.</DialogDescription>
      </DialogHeader>

      <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search FPT, VNM, Vietcombank..."
          autoCapitalize="characters"
          autoFocus
        />

        <div className="min-h-0 overflow-hidden rounded-xl border border-border/60 bg-background/70">
          <div className="flex items-center justify-between gap-3 border-b border-border/50 px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <Search className="size-3.5" />
              Matches
            </div>
            {symbolSearchQuery.hasSearchQuery && !symbolSearchQuery.isLoading ? (
              <div className="text-xs text-muted-foreground">
                {symbolSearchQuery.total > 0
                  ? `${symbolSearchQuery.items.length}/${symbolSearchQuery.total}`
                  : "0"}
              </div>
            ) : null}
          </div>

          {!symbolSearchQuery.hasSearchQuery ? (
            <div className="px-3 py-6 text-sm text-muted-foreground">
              Start typing to search the stock catalog.
            </div>
          ) : null}

          {symbolSearchQuery.isLoading ? (
            <div className="max-h-72">
              <SearchResultsSkeleton count={4} />
            </div>
          ) : null}

          {!symbolSearchQuery.isLoading && symbolSearchQuery.isError ? (
            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="size-4 text-destructive" />
                Unable to search the stock catalog.
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => void symbolSearchQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : null}

          {!symbolSearchQuery.isLoading &&
          !symbolSearchQuery.isError &&
          symbolSearchQuery.hasSearchQuery &&
          symbolSearchQuery.items.length === 0 ? (
            <div className="px-3 py-6 text-sm text-muted-foreground">
              No catalog symbols match this search.
            </div>
          ) : null}

          {!symbolSearchQuery.isLoading &&
          !symbolSearchQuery.isError &&
          symbolSearchQuery.items.length > 0 ? (
            <ScrollArea ref={scrollAreaRef} className="h-72 min-h-0 overflow-hidden">
              <div className="p-1.5">
                {symbolSearchQuery.items.map((item) => {
                  const isSelected = item.symbol.trim().toUpperCase() === normalizedSelectedSymbol

                  return (
                    <button
                      key={item.symbol}
                      type="button"
                      onClick={() => handleSelectSymbol(item.symbol)}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                        isSelected ? "bg-cyan-400/12 text-foreground" : "hover:bg-accent/60",
                      )}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold tracking-[0.12em] uppercase">
                            {item.symbol}
                          </span>
                          {item.exchange ? (
                            <span className="rounded-full border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground uppercase">
                              {item.exchange}
                            </span>
                          ) : null}
                        </div>
                        <div className="truncate text-sm text-foreground/85">
                          {item.organ_name ?? "Unknown company"}
                        </div>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-200">
                            <Check className="size-3" />
                            Selected
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Choose</span>
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
      </div>
    </DialogContent>
  )
}

export const StockResearchSymbolPickerDialog = ({
  onOpenChange,
  onSelectSymbol,
  open,
  selectedSymbol,
}: StockResearchSymbolPickerDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {open ? (
      <StockResearchSymbolPickerDialogBody
        onOpenChange={onOpenChange}
        onSelectSymbol={onSelectSymbol}
        selectedSymbol={selectedSymbol}
      />
    ) : null}
  </Dialog>
)
