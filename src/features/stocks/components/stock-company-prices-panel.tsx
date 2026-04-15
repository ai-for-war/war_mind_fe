import { useCallback, useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockCompanyPriceHistoryView } from "@/features/stocks/components/stock-company-price-history-view"
import { StockCompanyPriceIntradayView } from "@/features/stocks/components/stock-company-price-intraday-view"
import type { PricesView } from "@/features/stocks/components/stock-company-prices-panel.utils"
import type { StockListItem } from "@/features/stocks/types"

type StockCompanyPricesPanelProps = {
  isActive: boolean
  selectedStock: StockListItem | null
}

export const StockCompanyPricesPanel = ({
  isActive,
  selectedStock,
}: StockCompanyPricesPanelProps) => {
  const [activePricesView, setActivePricesView] = useState<PricesView>("ohlcv")

  const handlePricesViewChange = useCallback((value: string) => {
    if (value === "ohlcv" || value === "intraday") {
      setActivePricesView(value)
    }
  }, [])

  if (!selectedStock?.symbol) {
    return null
  }

  return (
    <Tabs className="gap-4" onValueChange={handlePricesViewChange} value={activePricesView}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/25 px-4 py-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold tracking-wide text-foreground uppercase">Price Data</div>
          <div className="text-sm text-muted-foreground">
            Explore raw OHLCV candles and intraday prints for {selectedStock.symbol}.
          </div>
        </div>

        <TabsList variant="line" className="rounded-full border border-border/60 bg-background/20 p-1">
          <TabsTrigger
            value="ohlcv"
            className="rounded-full px-4 data-[state=active]:border-cyan-400/30 data-[state=active]:bg-cyan-400/10 data-[state=active]:text-cyan-100"
          >
            OHLCV
          </TabsTrigger>
          <TabsTrigger
            value="intraday"
            className="rounded-full px-4 data-[state=active]:border-cyan-400/30 data-[state=active]:bg-cyan-400/10 data-[state=active]:text-cyan-100"
          >
            Intraday
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="ohlcv" className="space-y-4">
        <StockCompanyPriceHistoryView
          isActive={isActive && activePricesView === "ohlcv"}
          symbol={selectedStock.symbol}
        />
      </TabsContent>

      <TabsContent value="intraday" className="space-y-4">
        <StockCompanyPriceIntradayView
          isActive={isActive && activePricesView === "intraday"}
          symbol={selectedStock.symbol}
        />
      </TabsContent>
    </Tabs>
  )
}
