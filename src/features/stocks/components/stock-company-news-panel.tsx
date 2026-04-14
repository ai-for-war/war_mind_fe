import { AlertCircle, Globe2, ImageOff, Newspaper, RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"

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
  formatNullableValue,
  parseDateValue,
} from "@/features/stocks/components/stock-company-dialog.utils"
import { useStockCompanyNews } from "@/features/stocks/hooks"
import type { StockCompanyNewsItem, StockListItem } from "@/features/stocks/types"
import { formatAbsoluteDateTime } from "@/lib/date"

type StockCompanyNewsPanelProps = {
  isActive: boolean
  selectedStock: StockListItem | null
}

const NewsSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={`news-row-skeleton-${index}`}
        className="flex gap-4 rounded-2xl border border-border/60 bg-background/30 p-4"
      >
        <Skeleton className="hidden h-24 w-36 rounded-xl md:block" />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    ))}
  </div>
)

const getNewsPublishedAt = (item: StockCompanyNewsItem): string | null =>
  item.public_date ?? item.updated_at ?? item.created_at

const getNewsSortTimestamp = (item: StockCompanyNewsItem): number | null =>
  parseDateValue(getNewsPublishedAt(item))

type NewsListItemProps = {
  item: StockCompanyNewsItem
}

const NewsListItem = ({ item }: NewsListItemProps) => {
  const [hasImageError, setHasImageError] = useState(false)

  const headline = item.news_title?.trim() || "Untitled news"
  const subTitle = item.friendly_sub_title?.trim() || item.news_sub_title?.trim() || null
  const teaser = item.news_short_content?.trim() || null
  const publishedAt = getNewsPublishedAt(item)
  const publishedLabel = publishedAt
    ? formatAbsoluteDateTime(publishedAt, publishedAt)
    : "Unknown publish time"
  const hasSourceLink = Boolean(item.news_source_link?.trim())
  const hasImage = Boolean(item.news_image_url?.trim()) && !hasImageError

  const content = (
    <article
      className={`flex gap-4 rounded-2xl border p-4 transition-colors ${
        hasSourceLink
          ? "cursor-pointer border-border/60 bg-background/30 hover:border-cyan-400/20 hover:bg-cyan-400/8"
          : "border-border/50 bg-background/20"
      }`}
    >
      <div className="hidden md:block">
        {hasImage ? (
          <img
            src={item.news_image_url ?? undefined}
            alt={headline}
            className="h-24 w-36 rounded-xl object-cover"
            loading="lazy"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="flex h-24 w-36 items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/30 text-muted-foreground">
            <ImageOff className="size-5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="rounded-full border-border/70 bg-background/40 text-muted-foreground"
          >
            <Globe2 className="size-3.5" />
            {formatNullableValue(item.lang_code)}
          </Badge>
          <span className="text-xs text-muted-foreground">{publishedLabel}</span>
          {!hasSourceLink ? (
            <Badge variant="secondary" className="rounded-full bg-secondary/60 text-secondary-foreground">
              No link
            </Badge>
          ) : null}
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">{headline}</h3>
          {subTitle ? <p className="text-sm text-muted-foreground">{subTitle}</p> : null}
          {teaser ? (
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{teaser}</p>
          ) : null}
        </div>
      </div>
    </article>
  )

  if (!hasSourceLink) {
    return content
  }

  return (
    <a
      href={item.news_source_link ?? undefined}
      className="block"
      target="_blank"
      rel="noreferrer"
    >
      {content}
    </a>
  )
}

export const StockCompanyNewsPanel = ({
  isActive,
  selectedStock,
}: StockCompanyNewsPanelProps) => {
  const newsQuery = useStockCompanyNews({
    isEnabled: isActive,
    symbol: selectedStock?.symbol,
  })

  const newsItems = newsQuery.data?.items ?? []

  const sortedNewsItems = useMemo(() => {
    const decoratedItems = newsItems.map((item, index) => ({
      item,
      originalIndex: index,
    }))

    decoratedItems.sort((left, right) => {
      const leftValue = getNewsSortTimestamp(left.item)
      const rightValue = getNewsSortTimestamp(right.item)

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
        return rightValue - leftValue
      }

      return left.originalIndex - right.originalIndex
    })

    return decoratedItems.map((entry) => entry.item)
  }, [newsItems])

  if (newsQuery.isLoading) {
    return <NewsSkeleton />
  }

  if (newsQuery.isError) {
    return (
      <Empty className="border-destructive/30 bg-destructive/5">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="size-5 text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Unable to load news</EmptyTitle>
          <EmptyDescription>
            Keep the selected stock context visible and retry the company news request when the
            upstream service is reachable.
          </EmptyDescription>
        </EmptyHeader>
        <Button type="button" variant="outline" onClick={() => void newsQuery.refetch()}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </Empty>
    )
  }

  if (sortedNewsItems.length === 0) {
    return (
      <Empty className="border-border/60 bg-background/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Newspaper className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No news found</EmptyTitle>
          <EmptyDescription>
            No related company news rows are available for this symbol in the upstream dataset.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-3">
      {sortedNewsItems.map((item, index) => (
        <NewsListItem key={`${item.id ?? item.news_id ?? "news"}-${index}`} item={item} />
      ))}
    </div>
  )
}
