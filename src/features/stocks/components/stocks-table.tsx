import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { BookmarkPlus, FileSearch, LineChart, MoreHorizontal } from "lucide-react"
import { useCallback, useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { StockListItem } from "@/features/stocks/types"
import { cn } from "@/lib/utils"
import { formatAbsoluteDateTime } from "@/lib/date"

type StocksTableProps = {
  items: StockListItem[]
  onAddToWatchlist?: ((item: StockListItem) => void) | undefined
  onBacktest?: ((item: StockListItem) => void) | undefined
  onResearch?: ((item: StockListItem) => void) | undefined
  onRowSelect?: ((item: StockListItem) => void) | undefined
  selectedSymbol?: string | null
}

const formatNullableValue = (value: string | number | null | undefined): string =>
  value == null || `${value}`.trim().length === 0 ? "--" : `${value}`

const baseColumns: ColumnDef<StockListItem>[] = [
  {
    accessorKey: "symbol",
    header: "Symbol",
    cell: ({ row }) => (
      <div className="min-w-24 font-semibold tracking-[0.12em] text-foreground uppercase tabular-nums">
        {row.original.symbol}
      </div>
    ),
  },
  {
    accessorKey: "organ_name",
    header: "Company",
    cell: ({ row }) => (
      <div className="flex min-w-52 flex-col gap-1">
        <span className="font-medium text-foreground">
          {formatNullableValue(row.original.organ_name)}
        </span>
        <span className="text-xs text-muted-foreground">{row.original.source}</span>
      </div>
    ),
  },
  {
    accessorKey: "exchange",
    header: "Exchange",
    cell: ({ row }) => (
      <Badge variant="outline" className="rounded-full border-border/70 bg-background/40 text-xs">
        {formatNullableValue(row.original.exchange)}
      </Badge>
    ),
  },
  {
    accessorKey: "groups",
    header: "Groups",
    cell: ({ row }) => {
      const visibleGroups = row.original.groups.slice(0, 2)
      const hiddenGroups = row.original.groups.slice(2)
      const remainingCount = row.original.groups.length - visibleGroups.length

      if (row.original.groups.length === 0) {
        return <span className="text-sm text-muted-foreground">--</span>
      }

      return (
        <div className="flex flex-wrap gap-1.5">
          {visibleGroups.map((group) => (
            <Badge
              key={group}
              variant="secondary"
              className="rounded-full bg-secondary/70 text-[11px] text-secondary-foreground"
            >
              {group}
            </Badge>
          ))}
          {remainingCount > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help rounded-full text-[11px]">
                  +{remainingCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6} className="max-w-56">
                <div className="flex flex-wrap gap-1">
                  {hiddenGroups.map((group) => (
                    <span key={group}>{group}</span>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      )
    },
  },
  {
    accessorKey: "industry_name",
    header: "Industry",
    cell: ({ row }) => (
      <div className="min-w-32 text-sm text-muted-foreground">
        {formatNullableValue(row.original.industry_name)}
      </div>
    ),
  },
  {
    accessorKey: "snapshot_at",
    header: "Snapshot",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatAbsoluteDateTime(row.original.snapshot_at)}
      </span>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatAbsoluteDateTime(row.original.updated_at)}
      </span>
    ),
  },
]

export const StocksTable = ({
  items,
  onAddToWatchlist,
  onBacktest,
  onResearch,
  onRowSelect,
  selectedSymbol,
}: StocksTableProps) => {
  const columns = useMemo<ColumnDef<StockListItem>[]>(() => {
    if (!onAddToWatchlist && !onBacktest && !onResearch) {
      return baseColumns
    }

    return [
      ...baseColumns,
      {
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
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
                  aria-label={`Open actions for ${row.original.symbol}`}
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
                {onResearch ? (
                  <DropdownMenuItem
                    onClick={() => {
                      onResearch(row.original)
                    }}
                  >
                    <FileSearch className="size-4" />
                    Research
                  </DropdownMenuItem>
                ) : null}
                {onBacktest ? (
                  <DropdownMenuItem
                    onClick={() => {
                      onBacktest(row.original)
                    }}
                  >
                    <LineChart className="size-4" />
                    Backtest
                  </DropdownMenuItem>
                ) : null}
                {onAddToWatchlist ? (
                  <DropdownMenuItem
                    onClick={() => {
                      onAddToWatchlist(row.original)
                    }}
                  >
                    <BookmarkPlus className="size-4" />
                    Add to watchlist
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ]
  }, [onAddToWatchlist, onBacktest, onResearch])

  const table = useReactTable({
    columns,
    data: items,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleRowKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTableRowElement>, item: StockListItem) => {
      if (!onRowSelect) {
        return
      }

      if (event.key !== "Enter" && event.key !== " ") {
        return
      }

      event.preventDefault()
      onRowSelect(item)
    },
    [onRowSelect],
  )

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              aria-label={`Open company overview for ${row.original.symbol}`}
              className={cn(
                onRowSelect
                  ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-accent/35"
                  : null,
              )}
              data-state={selectedSymbol === row.original.symbol ? "selected" : undefined}
              onClick={onRowSelect ? () => onRowSelect(row.original) : undefined}
              onKeyDown={onRowSelect ? (event) => handleRowKeyDown(event, row.original) : undefined}
              tabIndex={onRowSelect ? 0 : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  )
}
