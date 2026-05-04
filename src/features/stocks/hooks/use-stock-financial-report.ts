import { useQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import {
  normalizeStockCompanySymbol,
  normalizeStockFinancialReportPeriod,
  normalizeStockFinancialReportType,
  type StockFinancialReportPeriod,
  type StockFinancialReportType,
} from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockFinancialReportOptions = {
  isEnabled?: boolean
  period?: StockFinancialReportPeriod | null
  reportType?: StockFinancialReportType | null
  symbol?: string | null
}

export const useStockFinancialReport = ({
  isEnabled = true,
  period,
  reportType,
  symbol,
}: UseStockFinancialReportOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)
  const normalizedReportType = normalizeStockFinancialReportType(reportType)
  const normalizedPeriod = normalizeStockFinancialReportPeriod(period)
  const shouldFetchFinancialReport = isEnabled && normalizedSymbol != null

  const query = useQuery({
    queryFn: () =>
      stocksApi.getStockFinancialReport(
        normalizedSymbol ?? "",
        normalizedReportType,
        normalizedPeriod,
      ),
    queryKey: stocksQueryKeys.companyFinancialReport(
      activeOrganizationId,
      normalizedSymbol,
      normalizedReportType,
      normalizedPeriod,
    ),
    enabled: shouldFetchFinancialReport,
  })

  return {
    ...query,
    period: normalizedPeriod,
    reportType: normalizedReportType,
    symbol: normalizedSymbol,
  }
}
