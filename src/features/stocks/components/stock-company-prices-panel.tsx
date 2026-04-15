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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/25 px-4 py-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold tracking-wide text-foreground uppercase">Price Data</div>
          <div className="text-sm text-muted-foreground">
            Explore OHLCV candles with the intraday tape alongside the chart for {selectedStock.symbol}.
          </div>
        </div>
      </div>

      <StockCompanyPriceHistoryView isActive={isActive} symbol={selectedStock.symbol} />
    </div>
  )
}
