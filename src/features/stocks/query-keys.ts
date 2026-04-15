import type { NormalizedStockCatalogFilters } from "@/features/stocks/types"
import {
  normalizeStockPriceHistoryInterval,
  normalizeStockPriceIntradayPageSize,
  normalizeStockPriceLookbackLength,
  normalizeStockCompanyOfficersFilter,
  normalizeStockCompanySubsidiariesFilter,
  normalizeStockCompanySymbol,
} from "@/features/stocks/types"
import { getOrganizationQueryScope } from "@/lib/organization-query"

const STOCKS_QUERY_KEY = ["stocks"] as const

export const stocksQueryKeys = {
  all: STOCKS_QUERY_KEY,
  scoped: (organizationId?: string | null) =>
    [...STOCKS_QUERY_KEY, "organization", getOrganizationQueryScope(organizationId)] as const,
  catalogLists: (organizationId?: string | null) =>
    [...stocksQueryKeys.scoped(organizationId), "catalog"] as const,
  catalog: (
    organizationId: string | null | undefined,
    filters: NormalizedStockCatalogFilters,
  ) =>
    [
      ...stocksQueryKeys.catalogLists(organizationId),
      filters.q,
      filters.exchange,
      filters.group,
      filters.industryCode,
      filters.pageSize,
    ] as const,
  companyDetails: (organizationId?: string | null) =>
    [...stocksQueryKeys.scoped(organizationId), "company"] as const,
  companyOverview: (organizationId: string | null | undefined, symbol?: string | null) =>
    [
      ...stocksQueryKeys.companyDetails(organizationId),
      "overview",
      normalizeStockCompanySymbol(symbol),
    ] as const,
  companyShareholders: (organizationId: string | null | undefined, symbol?: string | null) =>
    [
      ...stocksQueryKeys.companyDetails(organizationId),
      "shareholders",
      normalizeStockCompanySymbol(symbol),
    ] as const,
  companyOfficers: (
    organizationId: string | null | undefined,
    symbol?: string | null,
    filterBy?: string | null,
  ) =>
    [
      ...stocksQueryKeys.companyDetails(organizationId),
      "officers",
      normalizeStockCompanySymbol(symbol),
      normalizeStockCompanyOfficersFilter(filterBy),
    ] as const,
  companySubsidiaries: (
    organizationId: string | null | undefined,
    symbol?: string | null,
    filterBy?: string | null,
  ) =>
    [
      ...stocksQueryKeys.companyDetails(organizationId),
      "subsidiaries",
      normalizeStockCompanySymbol(symbol),
      normalizeStockCompanySubsidiariesFilter(filterBy),
    ] as const,
  companyAffiliate: (organizationId: string | null | undefined, symbol?: string | null) =>
    [
      ...stocksQueryKeys.companyDetails(organizationId),
      "affiliate",
      normalizeStockCompanySymbol(symbol),
    ] as const,
  companyEvents: (organizationId: string | null | undefined, symbol?: string | null) =>
    [
      ...stocksQueryKeys.companyDetails(organizationId),
      "events",
      normalizeStockCompanySymbol(symbol),
    ] as const,
  companyNews: (organizationId: string | null | undefined, symbol?: string | null) =>
    [
      ...stocksQueryKeys.companyDetails(organizationId),
      "news",
      normalizeStockCompanySymbol(symbol),
    ] as const,
  companyReports: (organizationId: string | null | undefined, symbol?: string | null) =>
    [
      ...stocksQueryKeys.companyDetails(organizationId),
      "reports",
      normalizeStockCompanySymbol(symbol),
    ] as const,
  companyRatioSummary: (organizationId: string | null | undefined, symbol?: string | null) =>
    [
      ...stocksQueryKeys.companyDetails(organizationId),
      "ratio-summary",
      normalizeStockCompanySymbol(symbol),
    ] as const,
  priceDetails: (organizationId?: string | null) =>
    [...stocksQueryKeys.scoped(organizationId), "prices"] as const,
  priceHistory: (
    organizationId: string | null | undefined,
    symbol: string | null | undefined,
    options: {
      end?: string | null
      interval?: string | null
      length?: number | string | null
      start?: string | null
    },
  ) =>
    [
      ...stocksQueryKeys.priceDetails(organizationId),
      "history",
      normalizeStockCompanySymbol(symbol),
      normalizeStockPriceHistoryInterval(options.interval),
      options.start?.trim() || null,
      options.end?.trim() || null,
      options.start ? null : normalizeStockPriceLookbackLength(options.length),
    ] as const,
  priceIntraday: (
    organizationId: string | null | undefined,
    symbol: string | null | undefined,
    options: {
      pageSize?: number | string | null
    },
  ) =>
    [
      ...stocksQueryKeys.priceDetails(organizationId),
      "intraday",
      normalizeStockCompanySymbol(symbol),
      normalizeStockPriceIntradayPageSize(options.pageSize),
    ] as const,
}
