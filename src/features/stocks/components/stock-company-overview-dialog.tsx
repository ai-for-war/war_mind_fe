import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { StockListItem } from "@/features/stocks/types"

type StockCompanyOverviewDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedStock: StockListItem | null
}

const COMPANY_DETAIL_TABS = [
  { value: "overview", label: "Overview", isDisabled: false },
  { value: "shareholders", label: "Shareholders", isDisabled: true },
  { value: "officers", label: "Officers", isDisabled: true },
  { value: "subsidiaries", label: "Subsidiaries", isDisabled: true },
  { value: "affiliate", label: "Affiliate", isDisabled: true },
  { value: "events", label: "Events", isDisabled: true },
  { value: "news", label: "News", isDisabled: true },
  { value: "reports", label: "Reports", isDisabled: true },
  { value: "ratio-summary", label: "Ratio Summary", isDisabled: true },
  { value: "trading-stats", label: "Trading Stats", isDisabled: true },
] as const

const formatNullableValue = (value: string | number | null | undefined): string =>
  value == null || `${value}`.trim().length === 0 ? "--" : `${value}`

export const StockCompanyOverviewDialog = ({
  isOpen,
  onOpenChange,
  selectedStock,
}: StockCompanyOverviewDialogProps) => {
  const visibleGroups = useMemo(() => selectedStock?.groups ?? [], [selectedStock?.groups])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[88vh] max-w-[min(88vw,72rem)] overflow-hidden border-border/60 bg-background/95 p-0 backdrop-blur-xl"
        showCloseButton
      >
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
            </div>

            <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
              {selectedStock?.organ_name?.trim() || selectedStock?.symbol || "Company overview"}
            </DialogTitle>

            <DialogDescription className="max-w-3xl text-sm text-muted-foreground">
              Beta company detail shell with `Overview` active and the remaining company tabs
              visible but disabled until their APIs are wired in later tasks.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            className="flex min-h-0 flex-1 flex-col"
            defaultValue="overview"
            value="overview"
          >
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
                {visibleGroups.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
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
                ) : null}

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(18rem,0.9fr)]">
                  <div className="rounded-2xl border border-border/60 bg-background/40 p-6">
                    <h3 className="text-base font-semibold text-foreground">Overview</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      The overview shell is ready. Task 4 will replace this beta placeholder with
                      the actual hybrid summary layout, overview metadata, and data-fetch states.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-dashed border-border/60 bg-background/30 p-6">
                    <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                      Selected Stock Context
                    </h3>
                    <dl className="mt-4 grid gap-3 text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-muted-foreground">Symbol</dt>
                        <dd className="font-medium text-foreground">
                          {formatNullableValue(selectedStock?.symbol)}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-muted-foreground">Company</dt>
                        <dd className="max-w-[14rem] text-right font-medium text-foreground">
                          {formatNullableValue(selectedStock?.organ_name)}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-muted-foreground">Exchange</dt>
                        <dd className="font-medium text-foreground">
                          {formatNullableValue(selectedStock?.exchange)}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-muted-foreground">Industry</dt>
                        <dd className="max-w-[14rem] text-right font-medium text-foreground">
                          {formatNullableValue(selectedStock?.industry_name)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
