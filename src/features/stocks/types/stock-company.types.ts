export type StockCompanyResponseBase = {
  symbol: string
  source: "VCI"
  fetched_at: string
  cache_hit: boolean
}

export type StockCompanyOverviewItem = {
  symbol: string
  id: number | null
  issue_share: number | null
  history: string | null
  company_profile: string | null
  icb_name2: string | null
  icb_name3: string | null
  icb_name4: string | null
  charter_capital: number | null
  financial_ratio_issue_share: number | null
}

export type StockCompanyOverviewResponse = StockCompanyResponseBase & {
  item: StockCompanyOverviewItem
}

export type StockCompanyShareholderItem = {
  id: number | null
  share_holder: string | null
  quantity: number | null
  share_own_percent: number | null
  update_date: string | null
}

export type StockCompanyShareholdersResponse = StockCompanyResponseBase & {
  items: StockCompanyShareholderItem[]
}

export const normalizeStockCompanySymbol = (symbol?: string | null): string | null => {
  const trimmedSymbol = symbol?.trim()

  if (!trimmedSymbol) {
    return null
  }

  return trimmedSymbol.toUpperCase()
}
