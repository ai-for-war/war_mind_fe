import { AlertCircle } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useAudioList } from "@/features/tts/hooks/use-audio-list"

import { AudioHistoryItem } from "./audio-history-item"

const DEFAULT_LIMIT = 20

const HistorySkeleton = () => (
  <Card className="gap-4 py-4">
    <CardHeader className="space-y-2 px-4">
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </CardHeader>
    <CardContent className="space-y-3 px-4 pt-0">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-20" />
    </CardContent>
  </Card>
)

export const AudioHistoryList = () => {
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const audioListQuery = useAudioList(0, limit)

  const audioItems = audioListQuery.data?.items ?? []
  const total = audioListQuery.data?.total ?? 0
  const canLoadMore = total > audioItems.length

  return (
    <Card className="gap-4 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">Audio History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pt-0">
        {audioListQuery.isError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm">Unable to load audio history.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void audioListQuery.refetch()}
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {audioListQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <HistorySkeleton key={`history-loading-${index}`} />
            ))}
          </div>
        ) : null}

        {!audioListQuery.isLoading && audioItems.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-muted/20 p-6 text-center">
            <p className="font-medium">No audio generated yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate your first audio clip and it will appear here.
            </p>
          </div>
        ) : null}

        {!audioListQuery.isLoading && audioItems.length > 0 ? (
          <ScrollArea className="h-[28rem] lg:h-[calc(100vh-16rem)] pr-2">
            <div className="space-y-3">
              {audioItems.map((item) => (
                <AudioHistoryItem key={item.id} audio={item} signedUrl={item.audio_url} />
              ))}
            </div>
          </ScrollArea>
        ) : null}

        {canLoadMore ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={audioListQuery.isFetching}
            onClick={() => setLimit((current) => current + DEFAULT_LIMIT)}
          >
            Load more
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
