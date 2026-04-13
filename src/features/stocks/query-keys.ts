import type { NormalizedStockCatalogFilters } from "@/features/stocks/types"
import {
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
}
