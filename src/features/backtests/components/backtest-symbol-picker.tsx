"use client"

import { useState } from "react"
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react"

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
import { Skeleton } from "@/components/ui/skeleton"
import { useBacktestSymbolSearch } from "@/features/backtests/hooks"
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

export const BacktestSymbolPicker = ({
  disabled = false,
  onChange,
  value,
}: BacktestSymbolPickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const symbolSearch = useBacktestSymbolSearch(searchValue)
  const selectedStock =
    symbolSearch.items.find((item) => item.symbol === value?.trim().toUpperCase()) ?? null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
            {symbolSearch.isLoading ? (
              <div className="flex flex-col gap-2 p-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : null}
            {!symbolSearch.isLoading ? (
              <>
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 py-2 text-center">
                    <SearchIcon className="size-4 text-muted-foreground" />
                    <span>No matching symbols found.</span>
                  </div>
                </CommandEmpty>
                <CommandGroup heading="Symbols">
                  {symbolSearch.items.map((item) => (
                    <CommandItem
                      key={item.symbol}
                      value={`${item.symbol} ${item.organ_name ?? ""}`}
                      onSelect={() => {
                        onChange(item.symbol)
                        setIsOpen(false)
                        setSearchValue("")
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          value?.trim().toUpperCase() === item.symbol ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="font-medium">{item.symbol}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {item.organ_name ?? "Unknown company"}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
