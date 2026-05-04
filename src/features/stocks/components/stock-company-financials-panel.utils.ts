import {
  normalizeStockFinancialReportPeriod,
  normalizeStockFinancialReportType,
  type StockFinancialReportCellValue,
  type StockFinancialReportItem,
  type StockFinancialReportPeriod,
  type StockFinancialReportResponse,
  type StockFinancialReportType,
} from "@/features/stocks/types"

export const STOCK_FINANCIAL_REPORT_TYPE_LABELS: Record<StockFinancialReportType, string> = {
  "balance-sheet": "Balance Sheet",
  "cash-flow": "Cash Flow",
  "income-statement": "Income",
  ratio: "Ratios",
}

export const STOCK_FINANCIAL_REPORT_PERIOD_LABELS: Record<StockFinancialReportPeriod, string> = {
  quarter: "Quarter",
  year: "Year",
}

const FINANCIAL_REPORT_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
})

export const getStockFinancialReportTypeLabel = (
  reportType?: string | null,
): string => STOCK_FINANCIAL_REPORT_TYPE_LABELS[normalizeStockFinancialReportType(reportType)]

export const getStockFinancialReportPeriodLabel = (
  period?: string | null,
): string => STOCK_FINANCIAL_REPORT_PERIOD_LABELS[normalizeStockFinancialReportPeriod(period)]

export const normalizeStockFinancialReportSearch = (
  value?: string | null,
): string => value?.trim().replace(/\s+/g, " ").toLowerCase() ?? ""

export const filterStockFinancialReportItems = (
  items: StockFinancialReportItem[],
  search: string,
): StockFinancialReportItem[] => {
  const normalizedSearch = normalizeStockFinancialReportSearch(search)

  if (!normalizedSearch) {
    return items
  }

  return items.filter((item) =>
    normalizeStockFinancialReportSearch(item.item).includes(normalizedSearch),
  )
}

export const getStockFinancialReportPeriodColumns = (
  response?: Pick<StockFinancialReportResponse, "periods"> | null,
): string[] => response?.periods ?? []

export const getStockFinancialReportCellValue = (
  item: StockFinancialReportItem,
  period: string,
): StockFinancialReportCellValue | undefined => item.values[period]

export const formatStockFinancialReportCellValue = (
  value: StockFinancialReportCellValue | undefined,
): string => {
  if (value == null) {
    return "--"
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? FINANCIAL_REPORT_NUMBER_FORMATTER.format(value) : "--"
  }

  return value
}
