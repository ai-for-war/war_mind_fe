import { AlertCircle, BarChart3, RefreshCw, Search, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  filterStockFinancialReportItems,
  formatStockFinancialReportCellValue,
  getStockFinancialReportCellValue,
  getStockFinancialReportPeriodColumns,
  getStockFinancialReportPeriodLabel,
  getStockFinancialReportTypeLabel,
  STOCK_FINANCIAL_REPORT_PERIOD_LABELS,
  STOCK_FINANCIAL_REPORT_TYPE_LABELS,
} from "@/features/stocks/components/stock-company-financials-panel.utils"
import { useStockFinancialReport } from "@/features/stocks/hooks"
import {
  DEFAULT_STOCK_FINANCIAL_REPORT_PERIOD,
  DEFAULT_STOCK_FINANCIAL_REPORT_TYPE,
  STOCK_FINANCIAL_REPORT_PERIODS,
  STOCK_FINANCIAL_REPORT_TYPES,
  normalizeStockFinancialReportPeriod,
  normalizeStockFinancialReportType,
  type StockFinancialReportCellValue,
  type StockFinancialReportItem,
  type StockFinancialReportPeriod,
  type StockFinancialReportType,
  type StockListItem,
} from "@/features/stocks/types"
import { cn } from "@/lib/utils"

type StockCompanyFinancialsPanelProps = {
  isActive: boolean
  selectedStock: StockListItem | null
}

type FinancialReportErrorState = {
  description: string
  title: string
  shouldToast: boolean
}

const EMPTY_FINANCIAL_REPORT_ITEMS: StockFinancialReportItem[] = []

const getFinancialReportErrorStatus = (error: unknown): number | null => {
  if (
    error != null &&
    typeof error === "object" &&
    "response" in error &&
    error.response != null &&
    typeof error.response === "object" &&
    "status" in error.response &&
    typeof error.response.status === "number"
  ) {
    return error.response.status
  }

  return null
}

const getFinancialReportErrorState = (error: unknown): FinancialReportErrorState => {
  const status = getFinancialReportErrorStatus(error)

  if (status === 404) {
    return {
      description:
        "No rows are available for this symbol, report type, and period in the upstream dataset.",
      shouldToast: false,
      title: "No financial report found",
    }
  }

  if (status === 502) {
    return {
      description:
        "The upstream financial report service did not return a usable response. Retry this report when the service is reachable.",
      shouldToast: true,
      title: "Financial report service unavailable",
    }
  }

  return {
    description:
      "Keep the selected stock context visible and retry the active financial report request.",
    shouldToast: true,
    title: "Unable to load financial report",
  }
}

const getFinancialReportRowKey = (itemId: string | number | null, item: string, index: number) =>
  `${itemId ?? "item"}-${item}-${index}`

const FinancialReportTableSkeleton = () => (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border/60 bg-background/20">
    <div className="border-b border-border/60 p-3">
      <div className="grid min-w-[52rem] grid-cols-[18rem_repeat(4,minmax(8rem,1fr))] gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={`financials-head-skeleton-${index}`} className="h-5 w-full" />
        ))}
      </div>
    </div>
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3">
      {Array.from({ length: 12 }).map((_, rowIndex) => (
        <div
          key={`financials-row-skeleton-${rowIndex}`}
          className="grid min-w-[52rem] grid-cols-[18rem_repeat(4,minmax(8rem,1fr))] gap-3"
        >
          {Array.from({ length: 5 }).map((__, columnIndex) => (
            <Skeleton
              key={`financials-cell-skeleton-${rowIndex}-${columnIndex}`}
              className={cn("h-5", columnIndex === 0 ? "w-4/5" : "w-full")}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
)

type FinancialReportEmptyStateProps = {
  action?: React.ReactNode
  description: string
  icon: React.ReactNode
  title: string
  variant?: "default" | "destructive"
}

const FinancialReportEmptyState = ({
  action,
  description,
  icon,
  title,
  variant = "default",
}: FinancialReportEmptyStateProps) => (
  <Empty
    className={cn(
      "min-h-[22rem] border-border/60 bg-background/20",
      variant === "destructive" && "border-destructive/30 bg-destructive/5",
    )}
  >
    <EmptyHeader>
      <EmptyMedia variant="icon">{icon}</EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
    </EmptyHeader>
    {action ? <EmptyContent>{action}</EmptyContent> : null}
  </Empty>
)

const getCellClassName = (value: StockFinancialReportCellValue | undefined) =>
  cn(
    "min-w-32 whitespace-nowrap border-l border-border/40 font-mono text-sm",
    typeof value === "number" ? "text-right tabular-nums" : "text-left",
    value == null && "text-muted-foreground",
  )

export const StockCompanyFinancialsPanel = ({
  isActive,
  selectedStock,
}: StockCompanyFinancialsPanelProps) => {
  const [reportType, setReportType] = useState<StockFinancialReportType>(
    DEFAULT_STOCK_FINANCIAL_REPORT_TYPE,
  )
  const [period, setPeriod] = useState<StockFinancialReportPeriod>(
    DEFAULT_STOCK_FINANCIAL_REPORT_PERIOD,
  )
  const [rowSearch, setRowSearch] = useState("")
  const lastToastKeyRef = useRef<string | null>(null)

  const financialReportQuery = useStockFinancialReport({
    isEnabled: isActive,
    period,
    reportType,
    symbol: selectedStock?.symbol,
  })

  const periodColumns = useMemo(
    () => getStockFinancialReportPeriodColumns(financialReportQuery.data),
    [financialReportQuery.data],
  )
  const reportItems = financialReportQuery.data?.items ?? EMPTY_FINANCIAL_REPORT_ITEMS
  const filteredReportItems = useMemo(
    () => filterStockFinancialReportItems(reportItems, rowSearch),
    [reportItems, rowSearch],
  )
  const hasRowSearch = rowSearch.trim().length > 0
  const selectedSymbol = financialReportQuery.symbol ?? selectedStock?.symbol ?? null
  const activeSource = financialReportQuery.data?.source ?? "KBS"
  const activeReportLabel = getStockFinancialReportTypeLabel(reportType)
  const activePeriodLabel = getStockFinancialReportPeriodLabel(period)

  useEffect(() => {
    if (!financialReportQuery.isError) {
      lastToastKeyRef.current = null
      return
    }

    const errorState = getFinancialReportErrorState(financialReportQuery.error)

    if (!errorState.shouldToast) {
      return
    }

    const status = getFinancialReportErrorStatus(financialReportQuery.error) ?? "unknown"
    const nextToastKey = `${selectedSymbol ?? "symbol"}-${reportType}-${period}-${status}`

    if (lastToastKeyRef.current === nextToastKey) {
      return
    }

    lastToastKeyRef.current = nextToastKey
    toast.error(errorState.title)
  }, [
    financialReportQuery.error,
    financialReportQuery.isError,
    period,
    reportType,
    selectedSymbol,
  ])

  const handleReportTypeChange = (value: string) => {
    if (!value) {
      return
    }

    setReportType(normalizeStockFinancialReportType(value))
  }

  const handlePeriodChange = (value: string) => {
    if (!value) {
      return
    }

    setPeriod(normalizeStockFinancialReportPeriod(value))
  }

  const handleRowSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowSearch(event.target.value)
  }

  const handleClearRowSearch = () => {
    setRowSearch("")
  }

  const handleRetry = () => {
    void financialReportQuery.refetch()
  }

  const renderTableContent = () => {
    if (!selectedSymbol) {
      return (
        <FinancialReportEmptyState
          description="Select a stock symbol before opening a financial statement table."
          icon={<BarChart3 />}
          title="No stock selected"
        />
      )
    }

    if (financialReportQuery.isLoading) {
      return <FinancialReportTableSkeleton />
    }

    if (financialReportQuery.isError) {
      const errorState = getFinancialReportErrorState(financialReportQuery.error)

      return (
        <FinancialReportEmptyState
          action={
            <Button
              type="button"
              variant="outline"
              disabled={financialReportQuery.isFetching}
              onClick={handleRetry}
            >
              <RefreshCw data-icon="inline-start" />
              Retry
            </Button>
          }
          description={errorState.description}
          icon={<AlertCircle className="text-destructive" />}
          title={errorState.title}
          variant={errorState.shouldToast ? "destructive" : "default"}
        />
      )
    }

    if (reportItems.length === 0 || periodColumns.length === 0) {
      return (
        <FinancialReportEmptyState
          description="The active financial report response does not contain rows or period columns."
          icon={<BarChart3 />}
          title="No financial rows found"
        />
      )
    }

    return (
      <ScrollArea
        scrollbars="both"
        className="min-h-0 flex-1 overflow-hidden rounded-md border border-border/60 bg-background/20 [&_[data-slot=table-container]]:overflow-visible"
      >
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="sticky top-0 left-0 z-30 min-w-72 bg-background shadow-[1px_0_0_0_var(--border)]">
                Item
              </TableHead>
              {periodColumns.map((periodColumn) => (
                <TableHead
                  key={periodColumn}
                  className="sticky top-0 z-20 min-w-32 whitespace-nowrap border-l border-border/40 bg-background text-right"
                >
                  {periodColumn}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReportItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={periodColumns.length + 1}
                  className="h-40 text-center text-sm text-muted-foreground"
                >
                  No matching rows. Clear the row search to restore all report items.
                </TableCell>
              </TableRow>
            ) : (
              filteredReportItems.map((item, index) => (
                <TableRow key={getFinancialReportRowKey(item.item_id, item.item, index)}>
                  <TableCell className="sticky left-0 z-10 min-w-72 bg-background font-medium shadow-[1px_0_0_0_var(--border)]">
                    <span className="line-clamp-2">{item.item}</span>
                  </TableCell>
                  {periodColumns.map((periodColumn) => {
                    const cellValue = getStockFinancialReportCellValue(item, periodColumn)

                    return (
                      <TableCell
                        key={`${item.item_id ?? item.item}-${periodColumn}`}
                        className={getCellClassName(cellValue)}
                      >
                        {formatStockFinancialReportCellValue(cellValue)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    )
  }

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex flex-col gap-3 rounded-md border border-border/60 bg-background/30 p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={reportType}
              onValueChange={handleReportTypeChange}
              aria-label="Financial report type"
              className="max-w-full overflow-x-auto"
            >
              {STOCK_FINANCIAL_REPORT_TYPES.map((type) => (
                <ToggleGroupItem key={type} value={type} aria-label={STOCK_FINANCIAL_REPORT_TYPE_LABELS[type]}>
                  {STOCK_FINANCIAL_REPORT_TYPE_LABELS[type]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={period}
              onValueChange={handlePeriodChange}
              aria-label="Financial report period"
            >
              {STOCK_FINANCIAL_REPORT_PERIODS.map((periodOption) => (
                <ToggleGroupItem
                  key={periodOption}
                  value={periodOption}
                  aria-label={STOCK_FINANCIAL_REPORT_PERIOD_LABELS[periodOption]}
                >
                  {STOCK_FINANCIAL_REPORT_PERIOD_LABELS[periodOption]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <InputGroup className="w-full xl:w-80">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search financial report rows"
              placeholder="Search rows"
              value={rowSearch}
              onChange={handleRowSearchChange}
            />
            {hasRowSearch ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Clear row search"
                  size="icon-xs"
                  onClick={handleClearRowSearch}
                >
                  <X data-icon="inline-start" />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Source {activeSource}</Badge>
          <Badge variant="outline">{activeReportLabel}</Badge>
          <Badge variant="outline">{activePeriodLabel}</Badge>
          <Badge variant="outline">
            {hasRowSearch ? `${filteredReportItems.length}/${reportItems.length}` : reportItems.length} rows
          </Badge>
          <Badge variant="outline">{periodColumns.length} periods</Badge>
        </div>
      </div>

      {renderTableContent()}
    </section>
  )
}
