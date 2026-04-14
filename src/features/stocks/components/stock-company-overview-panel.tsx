import { AlertCircle, Building2, RefreshCw, Shapes } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useStockCompanyOverview } from "@/features/stocks/hooks"
import type { StockListItem } from "@/features/stocks/types"
import {
  formatNullableNumber,
  formatNullableValue,
  hasNarrativeContent,
} from "@/features/stocks/components/stock-company-dialog.utils"

type StockCompanyOverviewPanelProps = {
  isActive: boolean
  selectedStock: StockListItem | null
}

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

export const StockCompanyOverviewPanel = ({
  isActive,
  selectedStock,
}: StockCompanyOverviewPanelProps) => {
  const overviewQuery = useStockCompanyOverview({
    isEnabled: isActive,
    symbol: selectedStock?.symbol,
  })

  const overviewItem = overviewQuery.data?.item ?? null
  const hasOverviewContent =
    overviewItem != null &&
    (overviewItem.charter_capital != null ||
      overviewItem.issue_share != null ||
      hasNarrativeContent(overviewItem.company_profile) ||
      hasNarrativeContent(overviewItem.history) ||
      hasNarrativeContent(overviewItem.icb_name2) ||
      hasNarrativeContent(overviewItem.icb_name3) ||
      hasNarrativeContent(overviewItem.icb_name4))

  if (overviewQuery.isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(18rem,0.9fr)]">
        <NarrativeSkeleton />
        <FactsSkeleton />
      </div>
    )
  }

  if (overviewQuery.isError) {
    return (
      <Empty className="border-destructive/30 bg-destructive/5">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="size-5 text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Unable to load company overview</EmptyTitle>
          <EmptyDescription>
            Keep the selected stock context visible and retry the overview request when the company
            service is reachable.
          </EmptyDescription>
        </EmptyHeader>
        <Button type="button" variant="outline" onClick={() => void overviewQuery.refetch()}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </Empty>
    )
  }

  if (overviewItem != null && !hasOverviewContent) {
    return (
      <Empty className="border-border/60 bg-background/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2 className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No overview content yet</EmptyTitle>
          <EmptyDescription>
            This symbol is available in the catalog, but the overview snapshot does not currently
            contain enough company content to render the beta summary view.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (!overviewItem) {
    return null
  }

  return (
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
          <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">Key Facts</h3>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Charter Capital</dt>
              <dd className="text-right font-medium text-foreground">
                {formatNullableNumber(overviewItem.charter_capital)}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Issued Shares</dt>
              <dd className="text-right font-medium text-foreground">
                {formatNullableNumber(overviewItem.issue_share)}
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
  )
}
