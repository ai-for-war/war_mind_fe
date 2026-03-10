import { useMemo, useState } from "react"

import { TextToImageComposeForm } from "@/features/text-to-image/components/text-to-image-compose-form"
import { TextToImageHistoryList } from "@/features/text-to-image/components/text-to-image-history-list"
import { TextToImagePreviewPanel } from "@/features/text-to-image/components/text-to-image-preview-panel"
import { useImageGenerationHistory } from "@/features/text-to-image/hooks"

export const TextToImagePage = () => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const historyQuery = useImageGenerationHistory({
    limit: 20,
    skip: 0,
  })

  const newestHistoryItemId = useMemo(() => {
    const items = historyQuery.data?.items
    if (!items || items.length === 0) {
      return null
    }

    const newestItem = [...items].sort(
      (firstItem, secondItem) =>
        new Date(secondItem.requested_at).getTime() -
        new Date(firstItem.requested_at).getTime(),
    )[0]

    return newestItem?.id ?? null
  }, [historyQuery.data?.items])

  const activeSelectedJobId = selectedJobId ?? newestHistoryItemId

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Text to Image</h1>
        <p className="text-sm text-muted-foreground">
          Creative Studio - turn prompts into generated visuals.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)_minmax(0,340px)]">
        <TextToImageComposeForm onCreated={setSelectedJobId} />
        <TextToImagePreviewPanel selectedJobId={activeSelectedJobId} />
        <TextToImageHistoryList
          selectedJobId={activeSelectedJobId}
          onSelectJob={setSelectedJobId}
        />
      </div>
    </section>
  )
}
