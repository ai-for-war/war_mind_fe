import { AlertCircle, ListFilter, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useImageGenerationHistory } from "@/features/text-to-image/hooks"

import { TextToImageHistoryItem } from "@/features/text-to-image/components/text-to-image-history-item"
import type { ImageGenerationJobStatus, ImageGenerationJobSummaryItem } from "@/features/text-to-image/types"

interface TextToImageHistoryListProps {
  onSelectJob: (jobId: string) => void
  selectedJobId: string | null
}

const HISTORY_PAGE_SIZE = 10

type HistoryFilter = "all" | "in-progress" | "succeeded" | "failed" | "cancelled"

const FILTER_OPTIONS: Array<{ label: string; value: HistoryFilter }> = [
  { label: "All", value: "all" },
  { label: "In progress", value: "in-progress" },
  { label: "Succeeded", value: "succeeded" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
]

const matchesFilter = (status: ImageGenerationJobStatus, filter: HistoryFilter): boolean => {
  if (filter === "all") {
    return true
  }

  if (filter === "in-progress") {
    return status === "pending" || status === "processing"
  }

  return status === filter
}

const orderNewestFirst = (
  firstItem: ImageGenerationJobSummaryItem,
  secondItem: ImageGenerationJobSummaryItem,
): number => {
  return (
    new Date(secondItem.requested_at).getTime() - new Date(firstItem.requested_at).getTime()
  )
}

export const TextToImageHistoryList = ({
  onSelectJob,
  selectedJobId,
}: TextToImageHistoryListProps) => {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("all")
  const [historyLimit, setHistoryLimit] = useState(HISTORY_PAGE_SIZE)

  const historyQuery = useImageGenerationHistory({
    limit: historyLimit,
    skip: 0,
  })

  const sortedHistoryItems = useMemo(() => {
    return [...(historyQuery.data?.items ?? [])].sort(orderNewestFirst)
  }, [historyQuery.data?.items])

  const filteredItems = useMemo(() => {
    return sortedHistoryItems.filter((item) => matchesFilter(item.status, activeFilter))
  }, [activeFilter, sortedHistoryItems])

  const hasMore = (historyQuery.data?.total ?? 0) > sortedHistoryItems.length
  const isInitialLoading = historyQuery.isLoading && sortedHistoryItems.length === 0

  const handleFilterChange = (value: string): void => {
    if (!value) {
      return
    }

    setActiveFilter(value as HistoryFilter)
  }

  const handleLoadMore = (): void => {
    setHistoryLimit((previous) => previous + HISTORY_PAGE_SIZE)
  }

  return (
    <Card className="border-border/70 bg-card/95">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ListFilter className="size-4 text-primary" />
          History
        </CardTitle>
        <CardDescription>Your recent text-to-image generations.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ToggleGroup
          type="single"
          value={activeFilter}
          onValueChange={handleFilterChange}
          variant="outline"
          className="flex w-full flex-wrap gap-2"
          aria-label="Filter generation history status"
        >
          {FILTER_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className="rounded-md px-2 text-xs"
              aria-label={`Filter ${option.label}`}
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {isInitialLoading ? (
          <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-8 text-center text-sm text-muted-foreground">
            <div className="mb-2 inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Loading history...
            </div>
          </div>
        ) : null}

        {historyQuery.isError ? (
          <div
            role="alert"
            className="space-y-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4" />
              <span>Failed to load history.</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void historyQuery.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {!isInitialLoading && !historyQuery.isError ? (
          <>
            {filteredItems.length === 0 ? (
              <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-8 text-center text-sm text-muted-foreground">
                {sortedHistoryItems.length === 0
                  ? "No generations yet. Create your first image to start your history."
                  : "No history items match the selected filter."}
              </div>
            ) : (
              <ScrollArea className="h-80 rounded-md border border-border/60 sm:h-96 lg:h-128">
                <div className="space-y-2 p-2">
                  {filteredItems.map((item) => (
                    <TextToImageHistoryItem
                      key={item.id}
                      item={item}
                      isSelected={selectedJobId === item.id}
                      onSelect={onSelectJob}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}

            {hasMore ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleLoadMore}
                disabled={historyQuery.isFetching}
              >
                {historyQuery.isFetching ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            ) : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
