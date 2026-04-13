import { AlertCircle, Building2, RefreshCw, Shapes } from "lucide-react"
import { useMemo } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStockCompanyOverview } from "@/features/stocks/hooks"
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

const formatNullableCurrency = (value: number | null | undefined): string =>
  value == null
    ? "--"
    : new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(value)

const hasNarrativeContent = (value: string | null | undefined) =>
  value != null && value.trim().length > 0

const FactsSkeleton = () => (
  <div className="rounded-2xl border border-dashed border-border/60 bg-background/30 p-6">
    <div className="space-y-4">
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={`overview-fact-skeleton-${index}`} className="flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  </div>
)

const NarrativeSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 2 }).map((_, index) => (
      <div key={`overview-narrative-skeleton-${index}`} className="rounded-2xl border border-border/60 bg-background/40 p-6">
        <Skeleton className="h-5 w-36" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((__, lineIndex) => (
            <Skeleton key={`overview-line-${index}-${lineIndex}`} className="h-4 w-full" />
          ))}
        </div>
      </div>
    ))}
  </div>
)

type NarrativeAccordionProps = {
  emptyFallback: string
  title: string
  valueKey: string
  value: string | null | undefined
}

const NarrativeAccordion = ({
  emptyFallback,
  title,
  valueKey,
  value,
}: NarrativeAccordionProps) => {
  const hasContent = hasNarrativeContent(value)

  return (
    <Accordion
      className="rounded-2xl border border-border/60 bg-background/40 px-6"
      collapsible
      defaultValue={valueKey}
      type="single"
    >
      <AccordionItem className="border-b-0" value={valueKey}>
        <AccordionTrigger className="py-6 text-base font-semibold text-foreground hover:no-underline">
          {title}
        </AccordionTrigger>
        <AccordionContent className="pb-6">
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {hasContent ? value : emptyFallback}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export const StockCompanyOverviewDialog = ({
  isOpen,
  onOpenChange,
  selectedStock,
}: StockCompanyOverviewDialogProps) => {
  const visibleGroups = useMemo(() => selectedStock?.groups ?? [], [selectedStock?.groups])
  const overviewQuery = useStockCompanyOverview({
    isEnabled: isOpen,
    symbol: selectedStock?.symbol,
  })

  const overviewItem = overviewQuery.data?.item ?? null
  const hasOverviewContent = useMemo(() => {
    if (!overviewItem) {
      return false
    }

    return Boolean(
      overviewItem.charter_capital != null ||
        overviewItem.issue_share != null ||
        hasNarrativeContent(overviewItem.company_profile) ||
        hasNarrativeContent(overviewItem.history) ||
        hasNarrativeContent(overviewItem.icb_name2) ||
        hasNarrativeContent(overviewItem.icb_name3) ||
        hasNarrativeContent(overviewItem.icb_name4),
    )
  }, [overviewItem])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[88vh] w-[96vw] max-w-[96vw] overflow-hidden border-border/60 bg-background/95 p-0 backdrop-blur-xl sm:w-[min(96vw,96rem)] sm:max-w-[min(96vw,96rem)]"
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
                {overviewQuery.isLoading ? (
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(18rem,0.9fr)]">
                    <NarrativeSkeleton />
                    <FactsSkeleton />
                  </div>
                ) : null}

                {!overviewQuery.isLoading && overviewQuery.isError ? (
                  <Empty className="border-destructive/30 bg-destructive/5">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <AlertCircle className="size-5 text-destructive" />
                      </EmptyMedia>
                      <EmptyTitle>Unable to load company overview</EmptyTitle>
                      <EmptyDescription>
                        Keep the selected stock context visible and retry the overview request when
                        the company service is reachable.
                      </EmptyDescription>
                    </EmptyHeader>
                    <Button type="button" variant="outline" onClick={() => void overviewQuery.refetch()}>
                      <RefreshCw className="size-4" />
                      Retry
                    </Button>
                  </Empty>
                ) : null}

                {!overviewQuery.isLoading &&
                !overviewQuery.isError &&
                overviewItem != null &&
                !hasOverviewContent ? (
                  <Empty className="border-border/60 bg-background/20">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Building2 className="size-5" />
                      </EmptyMedia>
                      <EmptyTitle>No overview content yet</EmptyTitle>
                      <EmptyDescription>
                        This symbol is available in the catalog, but the overview snapshot does not
                        currently contain enough company content to render the beta summary view.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : null}

                {!overviewQuery.isLoading &&
                !overviewQuery.isError &&
                overviewItem != null &&
                hasOverviewContent ? (
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(18rem,0.9fr)]">
                    <div className="space-y-4">
                      <NarrativeAccordion
                        emptyFallback="Company profile is not available for this symbol yet."
                        title="Company Profile"
                        valueKey="company-profile"
                        value={overviewItem.company_profile}
                      />

                      <NarrativeAccordion
                        emptyFallback="Company history is not available for this symbol yet."
                        title="History"
                        valueKey="history"
                        value={overviewItem.history}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-dashed border-border/60 bg-background/30 p-6">
                        <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                          Key Facts
                        </h3>
                        <dl className="mt-4 grid gap-3 text-sm">
                          <div className="flex items-start justify-between gap-4">
                            <dt className="text-muted-foreground">Charter Capital</dt>
                            <dd className="text-right font-medium text-foreground">
                              {formatNullableCurrency(overviewItem.charter_capital)}
                            </dd>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <dt className="text-muted-foreground">Issued Shares</dt>
                            <dd className="text-right font-medium text-foreground">
                              {formatNullableCurrency(overviewItem.issue_share)}
                            </dd>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <dt className="text-muted-foreground">ICB Level 2</dt>
                            <dd className="max-w-[14rem] text-right font-medium text-foreground">
                              {formatNullableValue(overviewItem.icb_name2)}
                            </dd>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <dt className="text-muted-foreground">ICB Level 3</dt>
                            <dd className="max-w-[14rem] text-right font-medium text-foreground">
                              {formatNullableValue(overviewItem.icb_name3)}
                            </dd>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <dt className="text-muted-foreground">ICB Level 4</dt>
                            <dd className="max-w-[14rem] text-right font-medium text-foreground">
                              {formatNullableValue(overviewItem.icb_name4)}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div className="rounded-2xl border border-border/60 bg-background/30 p-6">
                        <div className="flex items-center gap-2">
                          <Shapes className="size-4 text-cyan-200" />
                          <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                            Selected Stock Context
                          </h3>
                        </div>
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
                ) : null}
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
