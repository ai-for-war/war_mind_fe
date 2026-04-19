import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { StockWatchlistItemResponse } from "@/features/stock-watchlists/types"
import { formatStockWatchlistValue } from "@/features/stock-watchlists/stock-watchlists.utils"
import { cn } from "@/lib/utils"
import { LineChart, MoreHorizontal, Trash2 } from "lucide-react"

type StockWatchlistItemsTableProps = {
  items: StockWatchlistItemResponse[]
  onBacktest?: ((item: StockWatchlistItemResponse) => void) | undefined
  onRemoveItem: (item: StockWatchlistItemResponse) => void
  onSelectItem?: ((item: StockWatchlistItemResponse) => void) | undefined
  selectedSymbol?: string | null
}

export const StockWatchlistItemsTableSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="space-y-2 p-4">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={`watchlist-item-skeleton-${index}`}
        className="grid grid-cols-[0.8fr_1.8fr_0.8fr_1.1fr_1fr_0.6fr] gap-3 rounded-xl border border-border/40 px-4 py-3"
      >
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    ))}
  </div>
)

export const StockWatchlistItemsTable = ({
  items,
  onBacktest,
  onRemoveItem,
  onSelectItem,
  selectedSymbol,
}: StockWatchlistItemsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Exchange</TableHead>
          <TableHead>Groups</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead className="w-16 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const isSelected = selectedSymbol === item.symbol
          const isRowInteractive = item.stock != null && onSelectItem != null
          const visibleGroups = item.stock?.groups.slice(0, 2) ?? []
          const remainingGroupCount = Math.max((item.stock?.groups.length ?? 0) - 2, 0)

          return (
            <TableRow
              key={item.id}
              data-state={isSelected ? "selected" : undefined}
              className={cn(
                isRowInteractive
                  ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-accent/35"
                  : null,
              )}
              onClick={isRowInteractive ? () => onSelectItem(item) : undefined}
              onKeyDown={
                isRowInteractive
                  ? (event) => {
                      if (event.key !== "Enter" && event.key !== " ") {
                        return
                      }

                      event.preventDefault()
                      onSelectItem(item)
                    }
                  : undefined
              }
              tabIndex={isRowInteractive ? 0 : undefined}
              aria-label={
                isRowInteractive
                  ? `Open company overview for ${item.symbol}`
                  : `Watchlist item ${item.symbol}`
              }
            >
              <TableCell>
                <div className="min-w-20 font-semibold tracking-[0.12em] text-foreground uppercase tabular-nums">
                  {item.symbol}
                </div>
              </TableCell>
              <TableCell>
                <div className="min-w-52 space-y-1">
                  <div className="font-medium text-foreground">
                    {item.stock ? formatStockWatchlistValue(item.stock.organ_name) : "Catalog unavailable"}
                  </div>
                  {item.stock ? (
                    <div className="text-xs text-muted-foreground">{item.stock.source}</div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="rounded-full border-amber-400/30 bg-amber-400/10 text-amber-200"
                    >
                      No active catalog data
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="rounded-full border-border/70 bg-background/40 text-xs">
                  {formatStockWatchlistValue(item.stock?.exchange)}
                </Badge>
              </TableCell>
              <TableCell>
                {visibleGroups.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {visibleGroups.map((group) => (
                      <Badge
                        key={`${item.id}-${group}`}
                        variant="secondary"
                        className="rounded-full bg-secondary/70 text-[11px] text-secondary-foreground"
                      >
                        {group}
                      </Badge>
                    ))}
                    {remainingGroupCount > 0 ? (
                      <Badge variant="outline" className="rounded-full text-[11px]">
                        +{remainingGroupCount}
                      </Badge>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">--</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatStockWatchlistValue(item.stock?.industry_name)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={(event) => {
                        event.stopPropagation()
                      }}
                      onKeyDown={(event) => {
                        event.stopPropagation()
                      }}
                      aria-label={`Open actions for ${item.symbol}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onClick={(event) => {
                      event.stopPropagation()
                    }}
                  >
                    {onBacktest ? (
                      <DropdownMenuItem
                        onClick={() => {
                          onBacktest(item)
                        }}
                      >
                        <LineChart className="size-4" />
                        Backtest
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => {
                        onRemoveItem(item)
                      }}
                    >
                      <Trash2 className="size-4" />
                      Remove from watchlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
