import { ChevronDown, RotateCcw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { STOCK_EXCHANGE_OPTIONS, STOCK_GROUP_OPTIONS } from "@/features/stocks/constants"
import type {
  StockCatalogFilters,
  StockExchangeOption,
  StockGroupOption,
} from "@/features/stocks/types"
import { cn } from "@/lib/utils"

type StocksFilterBarProps = {
  filters: StockCatalogFilters
  hasActiveFilters: boolean
  onExchangeChange: (value: StockExchangeOption | null) => void
  onGroupChange: (value: StockGroupOption | null) => void
  onReset: () => void
  onSearchChange: (value: string) => void
}

export const StocksFilterBar = ({
  filters,
  hasActiveFilters,
  onExchangeChange,
  onGroupChange,
  onReset,
  onSearchChange,
}: StocksFilterBarProps) => {
  const selectedGroupLabel =
    STOCK_GROUP_OPTIONS.find((option) => option.value === filters.group)?.label ?? "All groups"

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/40 p-4 backdrop-blur">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.q ?? ""}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm mã hoặc tên công ty"
          className="h-11 rounded-xl border-border/60 bg-background/60 pl-10"
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Exchange
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={filters.exchange == null ? "secondary" : "outline"}
                size="sm"
                onClick={() => onExchangeChange(null)}
                className="rounded-full"
              >
                All
              </Button>
              {STOCK_EXCHANGE_OPTIONS.map((option) => {
                const isActive = filters.exchange === option.value

                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isActive ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => onExchangeChange(option.value)}
                    className={cn(
                      "rounded-full",
                      isActive && "border-cyan-400/40 bg-cyan-400/15 text-cyan-50 hover:bg-cyan-400/20",
                    )}
                  >
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Group
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-40 justify-between rounded-full border-border/60 bg-background/60"
                >
                  {selectedGroupLabel}
                  <ChevronDown className="size-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-48">
                <DropdownMenuRadioGroup
                  value={filters.group ?? "ALL"}
                  onValueChange={(value) =>
                    onGroupChange(value === "ALL" ? null : (value as StockGroupOption))
                  }
                >
                  <DropdownMenuRadioItem value="ALL">All groups</DropdownMenuRadioItem>
                  {STOCK_GROUP_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="self-start lg:self-auto"
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  )
}
