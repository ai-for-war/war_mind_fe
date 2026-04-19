"use client"

import { useMemo, useState } from "react"
import { AlertCircle, CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useBacktestSymbolSearch } from "@/features/backtests/hooks"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useScrollAreaInfiniteScroll } from "@/hooks/use-scroll-area-infinite-scroll"
import type { StockListItem } from "@/features/stocks/types"
import { cn } from "@/lib/utils"

type BacktestSymbolPickerProps = {
  disabled?: boolean
  onChange: (symbol: string) => void
  value?: string | null
}

const getSymbolButtonLabel = (selectedStock?: StockListItem | null, value?: string | null) => {
  if (selectedStock) {
    return `${selectedStock.symbol} · ${selectedStock.organ_name ?? "Unknown company"}`
  }

  if (value?.trim()) {
    return value.trim().toUpperCase()
  }

  return "Select symbol..."
}

const SearchResultsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="flex flex-col gap-2 p-2">
    {Array.from({ length: count }).map((_, index) => (
      <Skeleton key={`backtest-symbol-search-skeleton-${index}`} className="h-10 w-full" />
    ))}
  </div>
)

export const BacktestSymbolPicker = ({
  disabled = false,
  onChange,
  value,
}: BacktestSymbolPickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const debouncedSearch = useDebouncedValue(searchValue, 300)
  const symbolSearch = useBacktestSymbolSearch({
    isEnabled: isOpen,
    pageSize: 10,
    query: debouncedSearch,
  })
  const normalizedValue = value?.trim().toUpperCase() ?? ""
  const selectedStock = useMemo(
    () => symbolSearch.items.find((item) => item.symbol === normalizedValue) ?? null,
    [normalizedValue, symbolSearch.items],
  )
  const { scrollAreaRef, sentinelRef } = useScrollAreaInfiniteScroll({
    hasNextPage: Boolean(symbolSearch.hasNextPage),
    isEnabled:
      isOpen &&
      symbolSearch.hasSearchQuery &&
      !symbolSearch.isLoading &&
      !symbolSearch.isError &&
      symbolSearch.items.length > 0,
    isFetchingNextPage: symbolSearch.isFetchingNextPage,
    onLoadMore: () => {
      void symbolSearch.fetchNextPage()
    },
  })

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)

        if (open) {
          return
        }

        setSearchValue("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{getSymbolButtonLabel(selectedStock, value)}</span>
          <ChevronsUpDownIcon data-icon="inline-end" className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search symbol or company..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {!symbolSearch.hasSearchQuery ? (
              <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                Type a symbol or company name to search the stock catalog.
              </div>
            ) : null}

            {symbolSearch.hasSearchQuery && symbolSearch.isLoading ? <SearchResultsSkeleton /> : null}

            {symbolSearch.hasSearchQuery && symbolSearch.isError ? (
              <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
                <AlertCircle className="size-4 text-destructive" />
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">Unable to search symbols</div>
                  <div className="text-xs text-muted-foreground">
                    Keep this picker open and retry the current search.
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => void symbolSearch.refetch()}>
                  Retry
                </Button>
              </div>
            ) : null}

            {symbolSearch.hasSearchQuery &&
            !symbolSearch.isLoading &&
            !symbolSearch.isError &&
            symbolSearch.items.length === 0 ? (
              <CommandEmpty>
                <div className="flex flex-col items-center gap-2 py-2 text-center">
                  <SearchIcon className="size-4 text-muted-foreground" />
                  <span>No matching symbols found.</span>
                </div>
              </CommandEmpty>
            ) : null}

            {symbolSearch.hasSearchQuery &&
            !symbolSearch.isLoading &&
            !symbolSearch.isError &&
            symbolSearch.items.length > 0 ? (
              <ScrollArea ref={scrollAreaRef} className="h-64 min-h-0">
                <CommandGroup heading={`Symbols${symbolSearch.total > 0 ? ` (${symbolSearch.total})` : ""}`}>
                  {symbolSearch.items.map((item) => (
                    <CommandItem
                      key={item.symbol}
                      value={`${item.symbol} ${item.organ_name ?? ""}`}
                      onSelect={() => {
                        onChange(item.symbol)
                        setIsOpen(false)
                      }}
                    >
                      <CheckIcon className={cn(normalizedValue === item.symbol ? "opacity-100" : "opacity-0")} />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.symbol}</span>
                          {item.exchange ? (
                            <span className="text-xs text-muted-foreground">{item.exchange}</span>
                          ) : null}
                        </div>
                        <span className="truncate text-xs text-muted-foreground">
                          {item.organ_name ?? "Unknown company"}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                  {symbolSearch.isFetchingNextPage ? <SearchResultsSkeleton count={2} /> : null}
                  <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />
                </CommandGroup>
              </ScrollArea>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
