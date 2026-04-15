import { StockCompanyPriceHistoryView } from "@/features/stocks/components/stock-company-price-history-view"
import type { StockListItem } from "@/features/stocks/types"

type StockCompanyPricesPanelProps = {
  isActive: boolean
  selectedStock: StockListItem | null
}

export const StockCompanyPricesPanel = ({
  isActive,
  selectedStock,
}: StockCompanyPricesPanelProps) => {
  if (!selectedStock?.symbol) {
    return null
  }

  return <StockCompanyPriceHistoryView isActive={isActive} symbol={selectedStock.symbol} />
}
