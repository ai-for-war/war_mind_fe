export const STOCK_FINANCIAL_REPORT_TYPES = [
  "income-statement",
  "balance-sheet",
  "cash-flow",
  "ratio",
] as const

export const STOCK_FINANCIAL_REPORT_PERIODS = ["quarter", "year"] as const

export const DEFAULT_STOCK_FINANCIAL_REPORT_TYPE = "income-statement"
export const DEFAULT_STOCK_FINANCIAL_REPORT_PERIOD = "quarter"

export type StockFinancialReportType = (typeof STOCK_FINANCIAL_REPORT_TYPES)[number]

export type StockFinancialReportPeriod = (typeof STOCK_FINANCIAL_REPORT_PERIODS)[number]

export type StockFinancialReportCellValue = number | string | null

export type StockFinancialReportItem = {
  item: string
  item_id: string | number | null
  values: Record<string, StockFinancialReportCellValue>
}

export type StockFinancialReportResponse = {
  symbol: string
  source: "KBS"
  report_type: StockFinancialReportType
  period: StockFinancialReportPeriod
  periods: string[]
  items: StockFinancialReportItem[]
}

export const normalizeStockFinancialReportType = (
  reportType?: string | null,
): StockFinancialReportType => {
  if (
    reportType === "balance-sheet" ||
    reportType === "cash-flow" ||
    reportType === "ratio"
  ) {
    return reportType
  }

  return DEFAULT_STOCK_FINANCIAL_REPORT_TYPE
}

export const normalizeStockFinancialReportPeriod = (
  period?: string | null,
): StockFinancialReportPeriod => {
  if (period === "year") {
    return period
  }

  return DEFAULT_STOCK_FINANCIAL_REPORT_PERIOD
}
