import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
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
import { formatAbsoluteDateTime } from "@/lib/date"

type StocksTableProps = {
  items: StockListItem[]
}

const formatNullableValue = (value: string | number | null | undefined): string =>
  value == null || `${value}`.trim().length === 0 ? "--" : `${value}`

const columns: ColumnDef<StockListItem>[] = [
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

export const StocksTable = ({ items }: StocksTableProps) => {
  const table = useReactTable({
    columns,
    data: items,
    getCoreRowModel: getCoreRowModel(),
  })

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
            <TableRow key={row.id}>
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
