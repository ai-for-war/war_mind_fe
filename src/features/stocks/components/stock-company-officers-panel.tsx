import { AlertCircle, ArrowUpDown, BriefcaseBusiness, RefreshCw, Users } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  formatNullableNumber,
  formatNullablePercent,
  formatNullableValue,
  parseDateValue,
} from "@/features/stocks/components/stock-company-dialog.utils"
import { useStockCompanyOfficers } from "@/features/stocks/hooks"
import type {
  StockCompanyOfficerItem,
  StockCompanyOfficersFilter,
  StockListItem,
} from "@/features/stocks/types"
import { formatAbsoluteDateTime } from "@/lib/date"

type StockCompanyOfficersPanelProps = {
  isActive: boolean
  selectedStock: StockListItem | null
}

type OfficerSortKey = "name" | "position" | "ownership" | "quantity" | "updated"
type OfficerSortDirection = "asc" | "desc"

type OfficerSortState = {
  direction: OfficerSortDirection
  key: OfficerSortKey | null
}

const OFFICERS_FILTER_OPTIONS: Array<{
  label: string
  value: StockCompanyOfficersFilter
}> = [
  { value: "working", label: "Working" },
  { value: "resigned", label: "Resigned" },
  { value: "all", label: "All" },
]

const DEFAULT_OFFICER_SORT: OfficerSortState = {
  direction: "desc",
  key: null,
}

const OfficersSkeleton = () => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={`officers-filter-skeleton-${index}`} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-5 w-28" />
    </div>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`officers-summary-skeleton-${index}`}
          className="rounded-2xl border border-border/60 bg-background/30 p-5"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-7 w-28" />
        </div>
      ))}
    </div>

    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="space-y-3 px-2 pt-1">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={`officer-row-skeleton-${index}`}
            className="grid grid-cols-[3rem_minmax(16rem,1.5fr)_minmax(16rem,1.4fr)_minmax(9rem,0.8fr)_minmax(9rem,0.8fr)_minmax(10rem,0.9fr)] gap-3"
          >
            <Skeleton className="h-5 w-6" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

type OfficerSummaryCardProps = {
  label: string
  value: string
}

const OfficerSummaryCard = ({ label, value }: OfficerSummaryCardProps) => (
  <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-border/60 bg-background/30 p-5 text-center">
    <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</div>
    <div className="mt-3 text-xl font-semibold tracking-tight text-foreground">{value}</div>
  </div>
)

type SortableOfficerHeaderProps = {
  isActive: boolean
  label: string
  onClick: () => void
}

const SortableOfficerHeader = ({
  isActive,
  label,
  onClick,
}: SortableOfficerHeaderProps) => (
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

const getOfficerSortDefaultDirection = (key: OfficerSortKey): OfficerSortDirection => {
  if (key === "ownership" || key === "quantity" || key === "updated") {
    return "desc"
  }

  return "asc"
}

const getOfficerPositionLabel = (item: StockCompanyOfficerItem): string =>
  formatNullableValue(item.officer_position ?? item.position_short_name)

const getOfficerSecondaryLabel = (item: StockCompanyOfficerItem): string | null => {
  const shortPosition = item.position_short_name?.trim()
  const fullPosition = item.officer_position?.trim()

  if (!shortPosition) {
    return null
  }

  if (fullPosition && shortPosition.toLowerCase() === fullPosition.toLowerCase()) {
    return null
  }

  return shortPosition
}

export const StockCompanyOfficersPanel = ({
  isActive,
  selectedStock,
}: StockCompanyOfficersPanelProps) => {
  const [filterBy, setFilterBy] = useState<StockCompanyOfficersFilter>("working")
  const [officerSort, setOfficerSort] = useState<OfficerSortState>(DEFAULT_OFFICER_SORT)

  const officersQuery = useStockCompanyOfficers({
    filterBy,
    isEnabled: isActive,
    symbol: selectedStock?.symbol,
  })

  const officerItems = officersQuery.data?.items ?? []

  const sortedOfficers = useMemo(() => {
    const decoratedItems = officerItems.map((item, index) => ({
      item,
      originalIndex: index,
    }))

    if (officerSort.key == null) {
      return decoratedItems.map((entry) => entry.item)
    }

    decoratedItems.sort((left, right) => {
      const directionFactor = officerSort.direction === "asc" ? 1 : -1

      if (officerSort.key === "ownership") {
        const leftValue = left.item.officer_own_percent
        const rightValue = right.item.officer_own_percent

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

      if (officerSort.key === "quantity") {
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

      if (officerSort.key === "updated") {
        const leftValue = parseDateValue(left.item.update_date)
        const rightValue = parseDateValue(right.item.update_date)

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

      if (officerSort.key === "position") {
        const leftValue = getOfficerPositionLabel(left.item)
        const rightValue = getOfficerPositionLabel(right.item)
        const positionComparison = leftValue.localeCompare(rightValue)

        if (positionComparison !== 0) {
          return positionComparison * directionFactor
        }

        return left.originalIndex - right.originalIndex
      }

      const leftValue = formatNullableValue(left.item.officer_name)
      const rightValue = formatNullableValue(right.item.officer_name)
      const nameComparison = leftValue.localeCompare(rightValue)

      if (nameComparison !== 0) {
        return nameComparison * directionFactor
      }

      return left.originalIndex - right.originalIndex
    })

    return decoratedItems.map((entry) => entry.item)
  }, [officerItems, officerSort.direction, officerSort.key])

  const officerSummary = useMemo(() => {
    const uniqueRoles = new Set(
      officerItems
        .map((item) => item.officer_position?.trim() || item.position_short_name?.trim() || null)
        .filter((value): value is string => value != null && value.length > 0),
    )

    const latestUpdatedAt = officerItems.reduce<{
      parsedTime: number | null
      rawValue: string | null
    } | null>((currentLatest, currentItem) => {
      if (!currentItem.update_date) {
        return currentLatest
      }

      const nextDate = {
        parsedTime: parseDateValue(currentItem.update_date),
        rawValue: currentItem.update_date,
      }

      if (currentLatest == null) {
        return nextDate
      }

      if (nextDate.parsedTime == null || currentLatest.parsedTime == null) {
        return currentLatest
      }

      return nextDate.parsedTime > currentLatest.parsedTime ? nextDate : currentLatest
    }, null)

    const disclosedOwnershipCount = officerItems.filter(
      (item) => item.officer_own_percent != null || item.quantity != null,
    ).length

    return {
      latestUpdate:
        latestUpdatedAt?.rawValue != null
          ? formatAbsoluteDateTime(latestUpdatedAt.rawValue, latestUpdatedAt.rawValue)
          : "--",
      ownershipDisclosed: new Intl.NumberFormat("en-US").format(disclosedOwnershipCount),
      rolesCovered: new Intl.NumberFormat("en-US").format(uniqueRoles.size),
      totalOfficers: new Intl.NumberFormat("en-US").format(officerItems.length),
    }
  }, [officerItems])

  const handleFilterChange = useCallback((nextValue: string) => {
    if (nextValue !== "working" && nextValue !== "resigned" && nextValue !== "all") {
      return
    }

    setFilterBy(nextValue)
    setOfficerSort(DEFAULT_OFFICER_SORT)
  }, [])

  const handleOfficerSortChange = useCallback((key: OfficerSortKey) => {
    setOfficerSort((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "desc" ? "asc" : "desc",
        }
      }

      return {
        key,
        direction: getOfficerSortDefaultDirection(key),
      }
    })
  }, [])

  if (officersQuery.isLoading) {
    return <OfficersSkeleton />
  }

  if (officersQuery.isError) {
    return (
      <Empty className="border-destructive/30 bg-destructive/5">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="size-5 text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Unable to load officers</EmptyTitle>
          <EmptyDescription>
            Keep the selected stock context visible and retry the officers request when the company
            service is reachable.
          </EmptyDescription>
        </EmptyHeader>
        <Button type="button" variant="outline" onClick={() => void officersQuery.refetch()}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/30 p-4">
        <ToggleGroup
          type="single"
          value={filterBy}
          onValueChange={handleFilterChange}
          variant="outline"
          spacing={2}
          aria-label="Filter officers by status"
          className="flex flex-wrap gap-2"
        >
          {OFFICERS_FILTER_OPTIONS.map((filterOption) => (
            <ToggleGroupItem
              key={filterOption.value}
              value={filterOption.value}
              className="rounded-full border-border/70 px-4 data-[state=on]:border-cyan-400/30 data-[state=on]:bg-cyan-400/12 data-[state=on]:text-cyan-100"
              aria-label={`Show ${filterOption.label.toLowerCase()} officers`}
            >
              {filterOption.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="text-sm text-muted-foreground">
          {officerSummary.totalOfficers} officers
        </div>
      </div>

      {officerItems.length === 0 ? (
        <Empty className="border-border/60 bg-background/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No officers found</EmptyTitle>
            <EmptyDescription>
              No officer rows are available for the current filter in the upstream dataset.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <OfficerSummaryCard label="Total Officers" value={officerSummary.totalOfficers} />
            <OfficerSummaryCard label="Roles Covered" value={officerSummary.rolesCovered} />
            <OfficerSummaryCard
              label="Ownership Disclosed"
              value={officerSummary.ownershipDisclosed}
            />
            <OfficerSummaryCard label="Latest Update" value={officerSummary.latestUpdate} />
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/30">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">Leadership Directory</h3>
                <p className="text-sm text-muted-foreground">
                  Keep backend order by default and sort client-side when needed.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-sm text-muted-foreground">
                <BriefcaseBusiness className="size-4" />
                {filterBy === "working"
                  ? "Working officers"
                  : filterBy === "resigned"
                    ? "Resigned officers"
                    : "All officers"}
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    <SortableOfficerHeader
                      isActive={officerSort.key === "name"}
                      label="Officer"
                      onClick={() => handleOfficerSortChange("name")}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableOfficerHeader
                      isActive={officerSort.key === "position"}
                      label="Position"
                      onClick={() => handleOfficerSortChange("position")}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableOfficerHeader
                      isActive={officerSort.key === "ownership"}
                      label="Ownership %"
                      onClick={() => handleOfficerSortChange("ownership")}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableOfficerHeader
                      isActive={officerSort.key === "quantity"}
                      label="Quantity"
                      onClick={() => handleOfficerSortChange("quantity")}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableOfficerHeader
                      isActive={officerSort.key === "updated"}
                      label="Updated"
                      onClick={() => handleOfficerSortChange("updated")}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedOfficers.map((item, index) => {
                  const secondaryLabel = getOfficerSecondaryLabel(item)

                  return (
                    <TableRow key={`${item.id ?? "officer"}-${index}`}>
                      <TableCell className="font-semibold text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>
                        <div className="max-w-[18rem] space-y-1">
                          <div className="truncate font-medium text-foreground">
                            {formatNullableValue(item.officer_name)}
                          </div>
                          {secondaryLabel ? (
                            <div className="text-xs font-medium tracking-wide text-cyan-100 uppercase">
                              {secondaryLabel}
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[22rem] text-sm leading-6 text-foreground">
                          {getOfficerPositionLabel(item)}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatNullablePercent(item.officer_own_percent)}
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
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
