import { AlertCircle, ArrowUpDown, Building2, RefreshCw } from "lucide-react"
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
  formatNullablePercent,
  formatNullableValue,
} from "@/features/stocks/components/stock-company-dialog.utils"
import { useStockCompanySubsidiaries } from "@/features/stocks/hooks"
import type {
  StockCompanySubsidiariesFilter,
  StockListItem,
} from "@/features/stocks/types"

type StockCompanySubsidiariesPanelProps = {
  isActive: boolean
  selectedStock: StockListItem | null
}

type SubsidiarySortKey = "code" | "name" | "ownership"
type SubsidiarySortDirection = "asc" | "desc"

type SubsidiarySortState = {
  direction: SubsidiarySortDirection
  key: SubsidiarySortKey
}

const SUBSIDIARIES_FILTER_OPTIONS: Array<{
  label: string
  value: StockCompanySubsidiariesFilter
}> = [
  { value: "all", label: "All" },
  { value: "subsidiary", label: "Subsidiary" },
]

const DEFAULT_SUBSIDIARY_SORT: SubsidiarySortState = {
  direction: "desc",
  key: "ownership",
}

const SubsidiariesSkeleton = () => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton
            key={`subsidiaries-filter-skeleton-${index}`}
            className="h-9 w-28 rounded-full"
          />
        ))}
      </div>
      <Skeleton className="h-5 w-24" />
    </div>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`subsidiaries-summary-skeleton-${index}`}
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
            key={`subsidiary-row-skeleton-${index}`}
            className="grid grid-cols-[3rem_minmax(10rem,0.8fr)_minmax(18rem,1.7fr)_minmax(12rem,1fr)] gap-3"
          >
            <Skeleton className="h-5 w-6" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

type SubsidiarySummaryCardProps = {
  label: string
  value: string
}

const SubsidiarySummaryCard = ({ label, value }: SubsidiarySummaryCardProps) => (
  <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-border/60 bg-background/30 p-5 text-center">
    <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</div>
    <div className="mt-3 text-xl font-semibold tracking-tight text-foreground">{value}</div>
  </div>
)

type SortableSubsidiaryHeaderProps = {
  isActive: boolean
  label: string
  onClick: () => void
}

const SortableSubsidiaryHeader = ({
  isActive,
  label,
  onClick,
}: SortableSubsidiaryHeaderProps) => (
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

const getSubsidiarySortDefaultDirection = (
  key: SubsidiarySortKey,
): SubsidiarySortDirection => (key === "ownership" ? "desc" : "asc")

export const StockCompanySubsidiariesPanel = ({
  isActive,
  selectedStock,
}: StockCompanySubsidiariesPanelProps) => {
  const [filterBy, setFilterBy] = useState<StockCompanySubsidiariesFilter>("all")
  const [subsidiarySort, setSubsidiarySort] =
    useState<SubsidiarySortState>(DEFAULT_SUBSIDIARY_SORT)

  const subsidiariesQuery = useStockCompanySubsidiaries({
    filterBy,
    isEnabled: isActive,
    symbol: selectedStock?.symbol,
  })

  const subsidiaryItems = subsidiariesQuery.data?.items ?? []

  const sortedSubsidiaries = useMemo(() => {
    const decoratedItems = subsidiaryItems.map((item, index) => ({
      item,
      originalIndex: index,
    }))

    decoratedItems.sort((left, right) => {
      const directionFactor = subsidiarySort.direction === "asc" ? 1 : -1

      if (subsidiarySort.key === "ownership") {
        const leftValue = left.item.ownership_percent
        const rightValue = right.item.ownership_percent

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

      if (subsidiarySort.key === "code") {
        const leftValue = formatNullableValue(left.item.sub_organ_code)
        const rightValue = formatNullableValue(right.item.sub_organ_code)
        const comparison = leftValue.localeCompare(rightValue)

        if (comparison !== 0) {
          return comparison * directionFactor
        }

        return left.originalIndex - right.originalIndex
      }

      const leftValue = formatNullableValue(left.item.organ_name)
      const rightValue = formatNullableValue(right.item.organ_name)
      const comparison = leftValue.localeCompare(rightValue)

      if (comparison !== 0) {
        return comparison * directionFactor
      }

      return left.originalIndex - right.originalIndex
    })

    return decoratedItems.map((entry) => entry.item)
  }, [subsidiaryItems, subsidiarySort.direction, subsidiarySort.key])

  const subsidiariesSummary = useMemo(() => {
    const ownershipValues = subsidiaryItems
      .map((item) => item.ownership_percent)
      .filter((value): value is number => value != null)

    const highestOwnership = ownershipValues.length > 0 ? Math.max(...ownershipValues) : null
    const averageOwnership =
      ownershipValues.length > 0
        ? ownershipValues.reduce((sum, value) => sum + value, 0) / ownershipValues.length
        : null
    const controlledEntities = subsidiaryItems.filter(
      (item) => (item.ownership_percent ?? 0) > 50,
    ).length

    return {
      averageOwnership: formatNullablePercent(averageOwnership),
      controlledEntities: new Intl.NumberFormat("en-US").format(controlledEntities),
      highestOwnership: formatNullablePercent(highestOwnership),
      totalEntities: new Intl.NumberFormat("en-US").format(subsidiaryItems.length),
    }
  }, [subsidiaryItems])

  const handleFilterChange = useCallback((nextValue: string) => {
    if (nextValue !== "all" && nextValue !== "subsidiary") {
      return
    }

    setFilterBy(nextValue)
    setSubsidiarySort(DEFAULT_SUBSIDIARY_SORT)
  }, [])

  const handleSubsidiarySortChange = useCallback((key: SubsidiarySortKey) => {
    setSubsidiarySort((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "desc" ? "asc" : "desc",
        }
      }

      return {
        key,
        direction: getSubsidiarySortDefaultDirection(key),
      }
    })
  }, [])

  if (subsidiariesQuery.isLoading) {
    return <SubsidiariesSkeleton />
  }

  if (subsidiariesQuery.isError) {
    return (
      <Empty className="border-destructive/30 bg-destructive/5">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="size-5 text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Unable to load subsidiaries</EmptyTitle>
          <EmptyDescription>
            Keep the selected stock context visible and retry the subsidiaries request when the
            company service is reachable.
          </EmptyDescription>
        </EmptyHeader>
        <Button type="button" variant="outline" onClick={() => void subsidiariesQuery.refetch()}>
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
          aria-label="Filter subsidiaries by relationship"
          className="flex flex-wrap gap-2"
        >
          {SUBSIDIARIES_FILTER_OPTIONS.map((filterOption) => (
            <ToggleGroupItem
              key={filterOption.value}
              value={filterOption.value}
              className="rounded-full border-border/70 px-4 data-[state=on]:border-cyan-400/30 data-[state=on]:bg-cyan-400/12 data-[state=on]:text-cyan-100"
              aria-label={`Show ${filterOption.label.toLowerCase()} entities`}
            >
              {filterOption.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="text-sm text-muted-foreground">
          {subsidiariesSummary.totalEntities} entities
        </div>
      </div>

      {subsidiaryItems.length === 0 ? (
        <Empty className="border-border/60 bg-background/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No subsidiaries found</EmptyTitle>
            <EmptyDescription>
              No related-entity rows are available for the current filter in the upstream dataset.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SubsidiarySummaryCard
              label="Total Entities"
              value={subsidiariesSummary.totalEntities}
            />
            <SubsidiarySummaryCard
              label="Controlled Entities"
              value={subsidiariesSummary.controlledEntities}
            />
            <SubsidiarySummaryCard
              label="Highest Ownership"
              value={subsidiariesSummary.highestOwnership}
            />
            <SubsidiarySummaryCard
              label="Average Ownership"
              value={subsidiariesSummary.averageOwnership}
            />
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/30">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">Entity Portfolio</h3>
                <p className="text-sm text-muted-foreground">
                  Sorted by ownership by default for fast relationship scanning.
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    <SortableSubsidiaryHeader
                      isActive={subsidiarySort.key === "code"}
                      label="Code"
                      onClick={() => handleSubsidiarySortChange("code")}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableSubsidiaryHeader
                      isActive={subsidiarySort.key === "name"}
                      label="Entity Name"
                      onClick={() => handleSubsidiarySortChange("name")}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableSubsidiaryHeader
                      isActive={subsidiarySort.key === "ownership"}
                      label="Ownership %"
                      onClick={() => handleSubsidiarySortChange("ownership")}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedSubsidiaries.map((item, index) => (
                  <TableRow key={`${item.id ?? "subsidiary"}-${index}`}>
                    <TableCell className="font-semibold text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium tabular-nums text-foreground">
                      {formatNullableValue(item.sub_organ_code)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[28rem] truncate font-medium text-foreground">
                        {formatNullableValue(item.organ_name)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="font-semibold text-foreground">
                          {formatNullablePercent(item.ownership_percent)}
                        </div>
                        {item.ownership_percent != null ? (
                          <div className="h-1.5 w-full rounded-full bg-border/60">
                            <div
                              className="h-1.5 rounded-full bg-cyan-400/80"
                              style={{
                                width: `${Math.min(item.ownership_percent, 100)}%`,
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
