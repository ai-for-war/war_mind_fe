import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockCompanyAffiliatePanel } from "@/features/stocks/components/stock-company-affiliate-panel"
import { StockCompanyEventsPanel } from "@/features/stocks/components/stock-company-events-panel"
import { StockCompanyNewsPanel } from "@/features/stocks/components/stock-company-news-panel"
import { StockCompanyOfficersPanel } from "@/features/stocks/components/stock-company-officers-panel"
import { StockCompanyOverviewPanel } from "@/features/stocks/components/stock-company-overview-panel"
import { StockCompanyRatioSummaryPanel } from "@/features/stocks/components/stock-company-ratio-summary-panel"
import { StockCompanyReportsPanel } from "@/features/stocks/components/stock-company-reports-panel"
import { StockCompanyShareholdersPanel } from "@/features/stocks/components/stock-company-shareholders-panel"
import { StockCompanySubsidiariesPanel } from "@/features/stocks/components/stock-company-subsidiaries-panel"
import { formatNullableValue } from "@/features/stocks/components/stock-company-dialog.utils"
import type { StockListItem } from "@/features/stocks/types"

type StockCompanyOverviewDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedStock: StockListItem | null
}

type CompanyDetailTab =
  | "overview"
  | "shareholders"
  | "officers"
  | "subsidiaries"
  | "affiliate"
  | "events"
  | "news"
  | "reports"
  | "ratio-summary"

const COMPANY_DETAIL_TABS = [
  { value: "overview", label: "Overview", isDisabled: false },
  { value: "shareholders", label: "Shareholders", isDisabled: false },
  { value: "officers", label: "Officers", isDisabled: false },
  { value: "subsidiaries", label: "Subsidiaries", isDisabled: false },
  { value: "affiliate", label: "Affiliate", isDisabled: false },
  { value: "events", label: "Events", isDisabled: false },
  { value: "news", label: "News", isDisabled: false },
  { value: "reports", label: "Reports", isDisabled: false },
  { value: "ratio-summary", label: "Ratio Summary", isDisabled: false },
  { value: "trading-stats", label: "Trading Stats", isDisabled: true },
] as const

export const StockCompanyOverviewDialog = ({
  isOpen,
  onOpenChange,
  selectedStock,
}: StockCompanyOverviewDialogProps) => {
  const dialogContentKey = selectedStock?.symbol ?? "company-overview"

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[88vh] w-[96vw] max-w-[96vw] overflow-hidden border-border/60 bg-background/95 p-0 backdrop-blur-xl sm:w-[min(96vw,96rem)] sm:max-w-[min(96vw,96rem)]"
        showCloseButton
      >
        <StockCompanyOverviewDialogBody key={dialogContentKey} selectedStock={selectedStock} />
      </DialogContent>
    </Dialog>
  )
}

type StockCompanyOverviewDialogBodyProps = {
  selectedStock: StockListItem | null
}

const StockCompanyOverviewDialogBody = ({
  selectedStock,
}: StockCompanyOverviewDialogBodyProps) => {
  const [activeTab, setActiveTab] = useState<CompanyDetailTab>("overview")

  const visibleGroups = useMemo(() => selectedStock?.groups ?? [], [selectedStock?.groups])

  const handleTabChange = (value: string) => {
    if (
      value !== "overview" &&
      value !== "shareholders" &&
      value !== "officers" &&
      value !== "subsidiaries" &&
      value !== "affiliate" &&
      value !== "events" &&
      value !== "news" &&
      value !== "reports" &&
      value !== "ratio-summary"
    ) {
      return
    }

    setActiveTab(value)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DialogHeader className="border-b border-border/60 px-6 py-5 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
            {formatNullableValue(selectedStock?.symbol)}
          </Badge>
          <Badge variant="secondary" className="rounded-full bg-secondary/70">
            {formatNullableValue(selectedStock?.exchange)}
          </Badge>
          <Badge variant="outline" className="rounded-full border-border/70 bg-background/40">
            {formatNullableValue(selectedStock?.industry_name)}
          </Badge>
          {visibleGroups.map((group) => (
            <Badge
              key={group}
              variant="secondary"
              className="rounded-full bg-secondary/70 text-secondary-foreground"
            >
              {group}
            </Badge>
          ))}
        </div>

        <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
          {selectedStock?.organ_name?.trim() || selectedStock?.symbol || "Company overview"}
        </DialogTitle>
      </DialogHeader>

      <Tabs className="flex min-h-0 flex-1 flex-col" onValueChange={handleTabChange} value={activeTab}>
        <div className="border-b border-border/60 px-4 py-3">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList variant="line" className="inline-flex h-auto min-w-full justify-start gap-2">
              {COMPANY_DETAIL_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  className="h-9 rounded-full border border-border/60 px-3 text-sm data-[state=active]:border-cyan-400/30 data-[state=active]:bg-cyan-400/10 data-[state=active]:text-cyan-100"
                  disabled={tab.isDisabled}
                  value={tab.value}
                >
                  {tab.label}
                  {tab.isDisabled ? (
                    <span className="rounded-full border border-border/50 px-1.5 py-0.5 text-[10px] leading-none uppercase">
                      Beta
                    </span>
                  ) : null}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex min-h-full flex-col gap-5 px-6 py-5">
            {activeTab === "overview" ? (
              <StockCompanyOverviewPanel isActive={activeTab === "overview"} selectedStock={selectedStock} />
            ) : null}

            {activeTab === "shareholders" ? (
              <StockCompanyShareholdersPanel
                isActive={activeTab === "shareholders"}
                selectedStock={selectedStock}
              />
            ) : null}

            {activeTab === "officers" ? (
              <StockCompanyOfficersPanel
                isActive={activeTab === "officers"}
                selectedStock={selectedStock}
              />
            ) : null}

            {activeTab === "subsidiaries" ? (
              <StockCompanySubsidiariesPanel
                isActive={activeTab === "subsidiaries"}
                selectedStock={selectedStock}
              />
            ) : null}

            {activeTab === "affiliate" ? (
              <StockCompanyAffiliatePanel
                isActive={activeTab === "affiliate"}
                selectedStock={selectedStock}
              />
            ) : null}

            {activeTab === "events" ? (
              <StockCompanyEventsPanel
                isActive={activeTab === "events"}
                selectedStock={selectedStock}
              />
            ) : null}

            {activeTab === "news" ? (
              <StockCompanyNewsPanel
                isActive={activeTab === "news"}
                selectedStock={selectedStock}
              />
            ) : null}

            {activeTab === "reports" ? (
              <StockCompanyReportsPanel
                isActive={activeTab === "reports"}
                selectedStock={selectedStock}
              />
            ) : null}

            {activeTab === "ratio-summary" ? (
              <StockCompanyRatioSummaryPanel
                isActive={activeTab === "ratio-summary"}
                selectedStock={selectedStock}
              />
            ) : null}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
