import { AlertCircle, ArrowUpDown, RefreshCw, Users } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useStockCompanyShareholders } from "@/features/stocks/hooks"
import type { StockListItem } from "@/features/stocks/types"
import {
  formatNullableNumber,
  formatNullablePercent,
  formatNullableValue,
  parseDateValue,
} from "@/features/stocks/components/stock-company-dialog.utils"
import { formatAbsoluteDateTime } from "@/lib/date"

type StockCompanyShareholdersPanelProps = {
  isActive: boolean
  selectedStock: StockListItem | null
}

type ShareholderSortKey = "name" | "ownership" | "quantity"
type ShareholderSortDirection = "asc" | "desc"

type ShareholderSortState = {
  direction: ShareholderSortDirection
  key: ShareholderSortKey
}

const DEFAULT_SHAREHOLDER_SORT: ShareholderSortState = {
  direction: "desc",
  key: "ownership",
}

const ShareholdersSkeleton = () => (
  <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`shareholders-summary-skeleton-${index}`}
          className="rounded-2xl border border-border/60 bg-background/30 p-5"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-7 w-28" />
        </div>
      ))}
    </div>

    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="flex items-center justify-between gap-4 border-b border-border/60 px-2 pb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="space-y-3 px-2 pt-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={`shareholder-row-skeleton-${index}`}
            className="grid grid-cols-[3rem_minmax(16rem,1.8fr)_minmax(10rem,0.9fr)_minmax(10rem,0.9fr)_minmax(10rem,0.8fr)] gap-3"
          >
            <Skeleton className="h-5 w-6" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

type ShareholderSummaryCardProps = {
  label: string
  value: string
}

const ShareholderSummaryCard = ({ label, value }: ShareholderSummaryCardProps) => (
  <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-border/60 bg-background/30 p-5 text-center">
    <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</div>
    <div className="mt-3 text-xl font-semibold tracking-tight text-foreground">{value}</div>
  </div>
)

type SortableShareholderHeaderProps = {
  isActive: boolean
  label: string
  onClick: () => void
}

const SortableShareholderHeader = ({
  isActive,
  label,
  onClick,
}: SortableShareholderHeaderProps) => (
  <Button
    type="button"
    variant="ghost"
    className={`h-auto px-0 py-0 text-xs font-semibold tracking-wide uppercase ${
      isActive ? "text-cyan-100" : "text-muted-foreground hover:text-foreground"
    }`}
    onClick={onClick}
  >
    {label}
    <ArrowUpDown className="size-3.5" />
  </Button>
)

export const StockCompanyShareholdersPanel = ({
  isActive,
  selectedStock,
}: StockCompanyShareholdersPanelProps) => {
  const [shareholderSort, setShareholderSort] =
    useState<ShareholderSortState>(DEFAULT_SHAREHOLDER_SORT)

  const shareholdersQuery = useStockCompanyShareholders({
    isEnabled: isActive,
    symbol: selectedStock?.symbol,
  })

  const shareholderItems = shareholdersQuery.data?.items ?? []

  const sortedShareholders = useMemo(() => {
    const decoratedItems = shareholderItems.map((item, index) => ({
      item,
      originalIndex: index,
    }))

    decoratedItems.sort((left, right) => {
      const directionFactor = shareholderSort.direction === "asc" ? 1 : -1

      if (shareholderSort.key === "ownership") {
        const leftValue = left.item.share_own_percent
        const rightValue = right.item.share_own_percent

        if (leftValue == null && rightValue == null) {
          const leftQuantity = left.item.quantity ?? Number.NEGATIVE_INFINITY
          const rightQuantity = right.item.quantity ?? Number.NEGATIVE_INFINITY

          if (leftQuantity !== rightQuantity) {
            return (leftQuantity - rightQuantity) * directionFactor
          }

          return left.originalIndex - right.originalIndex
        }

        if (leftValue == null) {
          return 1
        }

        if (rightValue == null) {
          return -1
        }

        if (leftValue !== rightValue) {
          return (leftValue - rightValue) * directionFactor
        }

        const leftQuantity = left.item.quantity ?? Number.NEGATIVE_INFINITY
        const rightQuantity = right.item.quantity ?? Number.NEGATIVE_INFINITY

        if (leftQuantity !== rightQuantity) {
          return (leftQuantity - rightQuantity) * directionFactor
        }

        return left.originalIndex - right.originalIndex
      }

      if (shareholderSort.key === "quantity") {
        const leftValue = left.item.quantity
        const rightValue = right.item.quantity

        if (leftValue == null && rightValue == null) {
          return left.originalIndex - right.originalIndex
        }

        if (leftValue == null) {
          return 1
        }

        if (rightValue == null) {
          return -1
        }

        if (leftValue !== rightValue) {
          return (leftValue - rightValue) * directionFactor
        }

        return left.originalIndex - right.originalIndex
      }

      const leftName = left.item.share_holder?.trim() ?? ""
      const rightName = right.item.share_holder?.trim() ?? ""
      const nameComparison = leftName.localeCompare(rightName)

      if (nameComparison !== 0) {
        return nameComparison * directionFactor
      }

      return left.originalIndex - right.originalIndex
    })

    return decoratedItems.map((entry) => entry.item)
  }, [shareholderItems, shareholderSort.direction, shareholderSort.key])

  const shareholdersSummary = useMemo(() => {
    const topHolder = sortedShareholders[0] ?? null
    const highestOwnership = sortedShareholders.find(
      (item) => item.share_own_percent != null,
    )?.share_own_percent

    const datedRows = shareholderItems
      .map((item) => ({
        parsedTime: parseDateValue(item.update_date),
        rawValue: item.update_date,
      }))
      .filter((item) => item.rawValue != null)

    const latestUpdatedAt = datedRows.reduce<{
      parsedTime: number | null
      rawValue: string | null
    } | null>((currentLatest, currentItem) => {
      if (currentLatest == null) {
        return currentItem
      }

      if (currentItem.parsedTime == null || currentLatest.parsedTime == null) {
        return currentLatest
      }

      return currentItem.parsedTime > currentLatest.parsedTime ? currentItem : currentLatest
    }, null)

    return {
      highestOwnership:
        highestOwnership != null ? formatNullablePercent(highestOwnership) : "--",
      latestUpdate:
        latestUpdatedAt?.rawValue != null
          ? formatAbsoluteDateTime(latestUpdatedAt.rawValue, latestUpdatedAt.rawValue)
          : "--",
      topHolder: formatNullableValue(topHolder?.share_holder),
      totalHolders: new Intl.NumberFormat("en-US").format(shareholderItems.length),
    }
  }, [shareholderItems, sortedShareholders])

  const handleShareholderSortChange = (key: ShareholderSortKey) => {
    setShareholderSort((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "desc" ? "asc" : "desc",
        }
      }

      return {
        key,
        direction: key === "name" ? "asc" : "desc",
      }
    })
  }

  if (shareholdersQuery.isLoading) {
    return <ShareholdersSkeleton />
  }

  if (shareholdersQuery.isError) {
    return (
      <Empty className="border-destructive/30 bg-destructive/5">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="size-5 text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Unable to load shareholders</EmptyTitle>
          <EmptyDescription>
            Keep the selected stock context visible and retry the shareholders request when the
            company service is reachable.
          </EmptyDescription>
        </EmptyHeader>
        <Button type="button" variant="outline" onClick={() => void shareholdersQuery.refetch()}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </Empty>
    )
  }

  if (shareholderItems.length === 0) {
    return (
      <Empty className="border-border/60 bg-background/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No shareholder data yet</EmptyTitle>
          <EmptyDescription>
            This symbol does not currently have any large-shareholder rows in the upstream dataset.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ShareholderSummaryCard label="Top Shareholders" value={shareholdersSummary.totalHolders} />
        <ShareholderSummaryCard label="Largest Holder" value={shareholdersSummary.topHolder} />
        <ShareholderSummaryCard
          label="Highest Ownership"
          value={shareholdersSummary.highestOwnership}
        />
        <ShareholderSummaryCard label="Latest Update" value={shareholdersSummary.latestUpdate} />
      </div>

      <div className="rounded-2xl border border-border/60 bg-background/30">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Major Shareholders</h3>
            <p className="text-sm text-muted-foreground">
              Sorted client-side for fast ownership scanning.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={shareholderSort.key === "ownership" ? "secondary" : "outline"}
              className="rounded-full"
              onClick={() => handleShareholderSortChange("ownership")}
            >
              Ownership %
            </Button>
            <Button
              type="button"
              variant={shareholderSort.key === "quantity" ? "secondary" : "outline"}
              className="rounded-full"
              onClick={() => handleShareholderSortChange("quantity")}
            >
              Quantity
            </Button>
            <Button
              type="button"
              variant={shareholderSort.key === "name" ? "secondary" : "outline"}
              className="rounded-full"
              onClick={() => handleShareholderSortChange("name")}
            >
              Shareholder
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>
                <SortableShareholderHeader
                  isActive={shareholderSort.key === "name"}
                  label="Shareholder"
                  onClick={() => handleShareholderSortChange("name")}
                />
              </TableHead>
              <TableHead>
                <SortableShareholderHeader
                  isActive={shareholderSort.key === "ownership"}
                  label="Ownership %"
                  onClick={() => handleShareholderSortChange("ownership")}
                />
              </TableHead>
              <TableHead>
                <SortableShareholderHeader
                  isActive={shareholderSort.key === "quantity"}
                  label="Quantity"
                  onClick={() => handleShareholderSortChange("quantity")}
                />
              </TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedShareholders.map((item, index) => (
              <TableRow key={`${item.id ?? "shareholder"}-${index}`}>
                <TableCell className="font-semibold text-muted-foreground">{index + 1}</TableCell>
                <TableCell>
                  <div className="max-w-[24rem] truncate font-medium text-foreground">
                    {formatNullableValue(item.share_holder)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="font-semibold text-foreground">
                      {formatNullablePercent(item.share_own_percent)}
                    </div>
                    {item.share_own_percent != null ? (
                      <div className="h-1.5 w-full rounded-full bg-border/60">
                        <div
                          className="h-1.5 rounded-full bg-cyan-400/80"
                          style={{
                            width: `${Math.min(item.share_own_percent, 100)}%`,
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="font-medium tabular-nums text-foreground">
                  {formatNullableNumber(item.quantity)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.update_date
                    ? formatAbsoluteDateTime(item.update_date, item.update_date)
                    : "--"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
