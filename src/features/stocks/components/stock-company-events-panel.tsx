import { format } from "date-fns"
import {
  AlertCircle,
  ArrowUpDown,
  CalendarRange,
  ChevronDown,
  ExternalLink,
  Link2,
  RefreshCw,
} from "lucide-react"
import { Fragment, useCallback, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatNullableNumber,
  formatNullableValue,
  parseDateValue,
} from "@/features/stocks/components/stock-company-dialog.utils"
import { useStockCompanyEvents } from "@/features/stocks/hooks"
import type { StockCompanyEventItem, StockListItem } from "@/features/stocks/types"

type StockCompanyEventsPanelProps = {
  isActive: boolean
  selectedStock: StockListItem | null
}

type EventSortKey = "activity" | "event" | "type"
type EventSortDirection = "asc" | "desc"

type EventSortState = {
  direction: EventSortDirection
  key: EventSortKey
}

type EventDateEntry = {
  label: string
  value: string
}

const DEFAULT_EVENT_SORT: EventSortState = {
  direction: "desc",
  key: "activity",
}

const EventsSkeleton = () => (
  <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`events-summary-skeleton-${index}`}
          className="rounded-2xl border border-border/60 bg-background/30 p-5"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-7 w-32" />
        </div>
      ))}
    </div>

    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="space-y-3 px-2 pt-1">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={`event-row-skeleton-${index}`}
            className="grid grid-cols-[3rem_minmax(18rem,1.8fr)_minmax(12rem,1fr)_minmax(14rem,1.3fr)_minmax(10rem,0.8fr)_minmax(5rem,0.4fr)] gap-3"
          >
            <Skeleton className="h-5 w-6" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

type SortableEventHeaderProps = {
  isActive: boolean
  label: string
  onClick: () => void
}

const SortableEventHeader = ({
  isActive,
  label,
  onClick,
}: SortableEventHeaderProps) => (
  <Button
    type="button"
    variant="ghost"
    className={`h-auto px-0 py-0 text-xs font-semibold tracking-wide uppercase ${
      isActive ? "text-cyan-100" : "text-muted-foreground hover:text-foreground"
    }`}
    onClick={onClick}
  >
    {label}
    <ArrowUpDown className="size-3.5" />
  </Button>
)

const formatEventDate = (value: string | null | undefined): string => {
  if (!value) {
    return "--"
  }

  const parsedTime = parseDateValue(value)

  if (parsedTime == null) {
    return value
  }

  return format(parsedTime, "MMM d, yyyy")
}

const formatNullableMetric = (value: number | null | undefined): string =>
  value == null
    ? "--"
    : new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
      }).format(value)

const getEventActivityTimestamp = (item: StockCompanyEventItem): number | null => {
  const timestamps = [
    item.public_date,
    item.issue_date,
    item.record_date,
    item.exright_date,
  ]
    .map((value) => parseDateValue(value))
    .filter((value): value is number => value != null)

  if (timestamps.length === 0) {
    return null
  }

  return Math.max(...timestamps)
}

const getUpcomingKeyTimestamp = (item: StockCompanyEventItem): number | null => {
  const upcomingTimestamps = [item.exright_date, item.record_date]
    .map((value) => parseDateValue(value))
    .filter((value): value is number => value != null)

  if (upcomingTimestamps.length === 0) {
    return null
  }

  return Math.min(...upcomingTimestamps)
}

const getEventPreviewDates = (item: StockCompanyEventItem): EventDateEntry[] => {
  const primaryDates: EventDateEntry[] = []

  if (item.record_date) {
    primaryDates.push({
      label: "Record",
      value: formatEventDate(item.record_date),
    })
  }

  if (item.exright_date) {
    primaryDates.push({
      label: "Ex-right",
      value: formatEventDate(item.exright_date),
    })
  }

  if (primaryDates.length > 0) {
    return primaryDates
  }

  if (item.public_date) {
    primaryDates.push({
      label: "Public",
      value: formatEventDate(item.public_date),
    })
  }

  if (item.issue_date) {
    primaryDates.push({
      label: "Issue",
      value: formatEventDate(item.issue_date),
    })
  }

  return primaryDates
}

const getAllEventDates = (item: StockCompanyEventItem): EventDateEntry[] =>
  [
    { label: "Public", value: formatEventDate(item.public_date) },
    { label: "Issue", value: formatEventDate(item.issue_date) },
    { label: "Record", value: formatEventDate(item.record_date) },
    { label: "Ex-right", value: formatEventDate(item.exright_date) },
  ].filter((entry) => entry.value !== "--")

const getEventSortDefaultDirection = (key: EventSortKey): EventSortDirection =>
  key === "activity" ? "desc" : "asc"

const getEventRowKey = (item: StockCompanyEventItem, index: number) =>
  `${item.id ?? "event"}-${item.event_list_code ?? "type"}-${index}`

export const StockCompanyEventsPanel = ({
  isActive,
  selectedStock,
}: StockCompanyEventsPanelProps) => {
  const [eventSort, setEventSort] = useState<EventSortState>(DEFAULT_EVENT_SORT)
  const [expandedEventKey, setExpandedEventKey] = useState<string | null>(null)

  const eventsQuery = useStockCompanyEvents({
    isEnabled: isActive,
    symbol: selectedStock?.symbol,
  })

  const eventItems = eventsQuery.data?.items ?? []

  const sortedEvents = useMemo(() => {
    const decoratedItems = eventItems.map((item, index) => ({
      item,
      originalIndex: index,
    }))

    decoratedItems.sort((left, right) => {
      const directionFactor = eventSort.direction === "asc" ? 1 : -1

      if (eventSort.key === "activity") {
        const leftValue = getEventActivityTimestamp(left.item)
        const rightValue = getEventActivityTimestamp(right.item)

        if (leftValue == null && rightValue == null) {
          return left.originalIndex - right.originalIndex
        }

        if (leftValue == null) {
          return 1
        }

        if (rightValue == null) {
          return -1
        }

        if (leftValue !== rightValue) {
          return (leftValue - rightValue) * directionFactor
        }

        return left.originalIndex - right.originalIndex
      }

      if (eventSort.key === "type") {
        const leftValue = `${left.item.event_list_name ?? ""}${left.item.event_list_code ?? ""}`
        const rightValue = `${right.item.event_list_name ?? ""}${right.item.event_list_code ?? ""}`
        const comparison = leftValue.localeCompare(rightValue)

        if (comparison !== 0) {
          return comparison * directionFactor
        }

        return left.originalIndex - right.originalIndex
      }

      const leftValue = left.item.event_title?.trim() ?? ""
      const rightValue = right.item.event_title?.trim() ?? ""
      const comparison = leftValue.localeCompare(rightValue)

      if (comparison !== 0) {
        return comparison * directionFactor
      }

      return left.originalIndex - right.originalIndex
    })

    return decoratedItems.map((entry) => entry.item)
  }, [eventItems, eventSort.direction, eventSort.key])

  const handleEventSortChange = useCallback((key: EventSortKey) => {
    setEventSort((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "desc" ? "asc" : "desc",
        }
      }

      return {
        key,
        direction: getEventSortDefaultDirection(key),
      }
    })
  }, [])

  const handleToggleExpanded = useCallback((rowKey: string) => {
    setExpandedEventKey((current) => (current === rowKey ? null : rowKey))
  }, [])

  if (eventsQuery.isLoading) {
    return <EventsSkeleton />
  }

  if (eventsQuery.isError) {
    return (
      <Empty className="border-destructive/30 bg-destructive/5">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="size-5 text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Unable to load events</EmptyTitle>
          <EmptyDescription>
            Keep the selected stock context visible and retry the company events request when the
            upstream service is reachable.
          </EmptyDescription>
        </EmptyHeader>
        <Button type="button" variant="outline" onClick={() => void eventsQuery.refetch()}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      {eventItems.length === 0 ? (
        <Empty className="border-border/60 bg-background/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarRange className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No events found</EmptyTitle>
            <EmptyDescription>
              No corporate event rows are available for this company in the upstream dataset.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="rounded-2xl border border-border/60 bg-background/30">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">Events Table</h3>
                <p className="text-sm text-muted-foreground">
                  Dense corporate actions list with expandable date and source details.
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Sorted by latest activity by default
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    <SortableEventHeader
                      isActive={eventSort.key === "event"}
                      label="Event"
                      onClick={() => handleEventSortChange("event")}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableEventHeader
                      isActive={eventSort.key === "type"}
                      label="Type"
                      onClick={() => handleEventSortChange("type")}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableEventHeader
                      isActive={eventSort.key === "activity"}
                      label="Key Dates"
                      onClick={() => handleEventSortChange("activity")}
                    />
                  </TableHead>
                  <TableHead className="text-right">Ratio / Value</TableHead>
                  <TableHead className="text-right">Source</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedEvents.map((item, index) => {
                  const rowKey = getEventRowKey(item, index)
                  const isExpanded = expandedEventKey === rowKey
                  const previewDates = getEventPreviewDates(item)
                  const detailDates = getAllEventDates(item)

                  return (
                    <Fragment key={rowKey}>
                      <TableRow key={rowKey} data-state={isExpanded ? "selected" : undefined}>
                        <TableCell className="font-semibold text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="min-w-[18rem] py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className={`h-auto min-h-[4.5rem] w-full justify-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                              isExpanded
                                ? "border-cyan-400/20 bg-cyan-400/10 hover:bg-cyan-400/12"
                                : "border-border/50 bg-background/20 hover:border-cyan-400/20 hover:bg-cyan-400/8"
                            }`}
                            onClick={() => handleToggleExpanded(rowKey)}
                            aria-expanded={isExpanded}
                            aria-label={`Toggle event details for ${formatNullableValue(item.event_title)}`}
                          >
                            <ChevronDown
                              className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                            <div className="min-w-0 space-y-1">
                              <div className="truncate font-medium text-foreground">
                                {formatNullableValue(item.event_title)}
                              </div>
                            </div>
                          </Button>
                        </TableCell>
                        <TableCell className="min-w-[12rem]">
                          <div className="space-y-2">
                            <Badge
                              variant="secondary"
                              className="w-fit rounded-full bg-secondary/70 text-secondary-foreground"
                            >
                              {formatNullableValue(item.event_list_name)}
                            </Badge>
                            {item.event_list_code ? (
                              <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                {item.event_list_code}
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[14rem]">
                          <div className="space-y-2 text-sm">
                            {previewDates.length > 0 ? (
                              previewDates.map((entry) => (
                                <div key={`${rowKey}-${entry.label}`} className="flex gap-2">
                                  <span className="min-w-16 text-muted-foreground">{entry.label}</span>
                                  <span className="font-medium text-foreground">{entry.value}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-muted-foreground">--</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[10rem] text-right">
                          <div className="space-y-2 text-sm">
                            <div className="font-medium text-foreground">
                              Ratio {item.ratio != null ? formatNullableMetric(item.ratio) : "--"}
                            </div>
                            <div className="text-muted-foreground">
                              Value {item.value != null ? formatNullableNumber(item.value) : "--"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.source_url ? (
                            <Button asChild type="button" variant="ghost" size="sm">
                              <a
                                href={item.source_url}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Open source for ${formatNullableValue(item.event_title)}`}
                              >
                                <ExternalLink className="size-4" />
                                Open
                              </a>
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">--</span>
                          )}
                        </TableCell>
                      </TableRow>

                      {isExpanded ? (
                        <TableRow className="bg-background/10 hover:bg-background/10">
                          <TableCell colSpan={6} className="px-6 py-4">
                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.9fr)]">
                              <div className="space-y-3 rounded-2xl border border-border/60 bg-background/40 p-4">
                                <h4 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                                  Event Detail
                                </h4>
                                <p className="text-sm leading-7 text-muted-foreground">
                                  {formatNullableValue(item.event_title)}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge
                                    variant="outline"
                                    className="rounded-full border-border/70 bg-background/50"
                                  >
                                    {formatNullableValue(item.event_list_name)}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="rounded-full border-border/70 bg-background/50 font-mono"
                                  >
                                    {formatNullableValue(item.event_list_code)}
                                  </Badge>
                                </div>
                              </div>

                              <div className="space-y-3 rounded-2xl border border-border/60 bg-background/40 p-4">
                                <div className="flex items-center gap-2">
                                  <Link2 className="size-4 text-cyan-200" />
                                  <h4 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                                    Event Metadata
                                  </h4>
                                </div>
                                <dl className="grid gap-3 text-sm">
                                  {detailDates.length > 0 ? (
                                    detailDates.map((entry) => (
                                      <div
                                        key={`${rowKey}-detail-${entry.label}`}
                                        className="flex items-start justify-between gap-4"
                                      >
                                        <dt className="text-muted-foreground">{entry.label}</dt>
                                        <dd className="text-right font-medium text-foreground">
                                          {entry.value}
                                        </dd>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="flex items-start justify-between gap-4">
                                      <dt className="text-muted-foreground">Dates</dt>
                                      <dd className="text-right font-medium text-foreground">--</dd>
                                    </div>
                                  )}
                                  <div className="flex items-start justify-between gap-4">
                                    <dt className="text-muted-foreground">Ratio</dt>
                                    <dd className="text-right font-medium text-foreground">
                                      {item.ratio != null ? formatNullableMetric(item.ratio) : "--"}
                                    </dd>
                                  </div>
                                  <div className="flex items-start justify-between gap-4">
                                    <dt className="text-muted-foreground">Value</dt>
                                    <dd className="text-right font-medium text-foreground">
                                      {item.value != null ? formatNullableNumber(item.value) : "--"}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
