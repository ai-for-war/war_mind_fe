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
import {
  formatNullablePercent,
  formatNullableValue,
} from "@/features/stocks/components/stock-company-dialog.utils"
import { useStockCompanyAffiliate } from "@/features/stocks/hooks"
import type { StockListItem } from "@/features/stocks/types"

type StockCompanyAffiliatePanelProps = {
  isActive: boolean
  selectedStock: StockListItem | null
}

type AffiliateSortKey = "code" | "name" | "ownership"
type AffiliateSortDirection = "asc" | "desc"

type AffiliateSortState = {
  direction: AffiliateSortDirection
  key: AffiliateSortKey
}

const DEFAULT_AFFILIATE_SORT: AffiliateSortState = {
  direction: "desc",
  key: "ownership",
}

const AffiliateSkeleton = () => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/30 p-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-5 w-24" />
    </div>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`affiliate-summary-skeleton-${index}`}
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
            key={`affiliate-row-skeleton-${index}`}
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

type AffiliateSummaryCardProps = {
  label: string
  value: string
}

const AffiliateSummaryCard = ({ label, value }: AffiliateSummaryCardProps) => (
  <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-border/60 bg-background/30 p-5 text-center">
    <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</div>
    <div className="mt-3 text-xl font-semibold tracking-tight text-foreground">{value}</div>
  </div>
)

type SortableAffiliateHeaderProps = {
  isActive: boolean
  label: string
  onClick: () => void
}

const SortableAffiliateHeader = ({
  isActive,
  label,
  onClick,
}: SortableAffiliateHeaderProps) => (
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

const getAffiliateSortDefaultDirection = (key: AffiliateSortKey): AffiliateSortDirection =>
  key === "ownership" ? "desc" : "asc"

export const StockCompanyAffiliatePanel = ({
  isActive,
  selectedStock,
}: StockCompanyAffiliatePanelProps) => {
  const [affiliateSort, setAffiliateSort] = useState<AffiliateSortState>(DEFAULT_AFFILIATE_SORT)

  const affiliateQuery = useStockCompanyAffiliate({
    isEnabled: isActive,
    symbol: selectedStock?.symbol,
  })

  const affiliateItems = affiliateQuery.data?.items ?? []

  const sortedAffiliates = useMemo(() => {
    const decoratedItems = affiliateItems.map((item, index) => ({
      item,
      originalIndex: index,
    }))

    decoratedItems.sort((left, right) => {
      const directionFactor = affiliateSort.direction === "asc" ? 1 : -1

      if (affiliateSort.key === "ownership") {
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

      if (affiliateSort.key === "code") {
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
  }, [affiliateItems, affiliateSort.direction, affiliateSort.key])

  const affiliateSummary = useMemo(() => {
    const ownershipValues = affiliateItems
      .map((item) => item.ownership_percent)
      .filter((value): value is number => value != null)

    const highestOwnership = ownershipValues.length > 0 ? Math.max(...ownershipValues) : null
    const averageOwnership =
      ownershipValues.length > 0
        ? ownershipValues.reduce((sum, value) => sum + value, 0) / ownershipValues.length
        : null

    return {
      averageOwnership: formatNullablePercent(averageOwnership),
      highestOwnership: formatNullablePercent(highestOwnership),
      rowsWithOwnership: new Intl.NumberFormat("en-US").format(ownershipValues.length),
      totalAffiliates: new Intl.NumberFormat("en-US").format(affiliateItems.length),
    }
  }, [affiliateItems])

  const handleAffiliateSortChange = useCallback((key: AffiliateSortKey) => {
    setAffiliateSort((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "desc" ? "asc" : "desc",
        }
      }

      return {
        key,
        direction: getAffiliateSortDefaultDirection(key),
      }
    })
  }, [])

  if (affiliateQuery.isLoading) {
    return <AffiliateSkeleton />
  }

  if (affiliateQuery.isError) {
    return (
      <Empty className="border-destructive/30 bg-destructive/5">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="size-5 text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Unable to load affiliates</EmptyTitle>
          <EmptyDescription>
            Keep the selected stock context visible and retry the affiliate request when the
            company service is reachable.
          </EmptyDescription>
        </EmptyHeader>
        <Button type="button" variant="outline" onClick={() => void affiliateQuery.refetch()}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/30 p-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">Affiliates</h3>
          <p className="text-sm text-muted-foreground">
            Dense scan of related affiliate entities sorted by ownership by default.
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          {affiliateSummary.totalAffiliates} affiliates
        </div>
      </div>

      {affiliateItems.length === 0 ? (
        <Empty className="border-border/60 bg-background/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No affiliates found</EmptyTitle>
            <EmptyDescription>
              No affiliate rows are available for this company in the upstream dataset.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <AffiliateSummaryCard
              label="Total Affiliates"
              value={affiliateSummary.totalAffiliates}
            />
            <AffiliateSummaryCard
              label="Highest Ownership"
              value={affiliateSummary.highestOwnership}
            />
            <AffiliateSummaryCard
              label="Average Ownership"
              value={affiliateSummary.averageOwnership}
            />
            <AffiliateSummaryCard
              label="Rows With Ownership"
              value={affiliateSummary.rowsWithOwnership}
            />
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/30">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">Affiliate Table</h3>
                <p className="text-sm text-muted-foreground">
                  Dense relationship list with client-side ownership sorting.
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    <SortableAffiliateHeader
                      isActive={affiliateSort.key === "code"}
                      label="Code"
                      onClick={() => handleAffiliateSortChange("code")}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableAffiliateHeader
                      isActive={affiliateSort.key === "name"}
                      label="Affiliate Name"
                      onClick={() => handleAffiliateSortChange("name")}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableAffiliateHeader
                      isActive={affiliateSort.key === "ownership"}
                      label="Ownership %"
                      onClick={() => handleAffiliateSortChange("ownership")}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedAffiliates.map((item, index) => (
                  <TableRow key={`${item.id ?? "affiliate"}-${index}`}>
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
