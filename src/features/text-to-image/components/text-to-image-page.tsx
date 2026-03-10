import { useMemo, useState } from "react"

import { TextToImageComposeForm } from "@/features/text-to-image/components/text-to-image-compose-form"
import { TextToImageHistoryList } from "@/features/text-to-image/components/text-to-image-history-list"
import { TextToImagePreviewPanel } from "@/features/text-to-image/components/text-to-image-preview-panel"
import {
  useImageGenerationHistory,
  useImageGenerationLifecycleSubscriptions,
} from "@/features/text-to-image/hooks"
import type { CreateTextToImageJobRequest, TextToImageGenerationJobRecord } from "@/features/text-to-image/types"

export const TextToImagePage = () => {
  const [composeInitialValues, setComposeInitialValues] = useState<
    Partial<CreateTextToImageJobRequest> | undefined
  >(undefined)
  const [composeResetKey, setComposeResetKey] = useState(0)
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

  useImageGenerationLifecycleSubscriptions({
    selectedJobId: activeSelectedJobId,
  })

  const handleGenerateAgain = (job: TextToImageGenerationJobRecord): void => {
    setComposeInitialValues({
      aspect_ratio: job.aspect_ratio,
      prompt: job.prompt,
      prompt_optimizer: job.prompt_optimizer,
      seed: job.seed ?? undefined,
    })
    setComposeResetKey((previous) => previous + 1)
  }

  return (
    <section className="space-y-5 lg:space-y-6">
      {/* <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Text to Image</h1>
        <p className="text-sm text-muted-foreground">
          Creative Studio - turn prompts into generated visuals.
        </p>
      </div> */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1.2fr)_minmax(0,320px)]">
        <div className="min-w-0">
          <TextToImageComposeForm
            key={composeResetKey}
            initialValues={composeInitialValues}
            onCreated={setSelectedJobId}
          />
        </div>
        <div className="min-w-0">
          <TextToImagePreviewPanel
            selectedJobId={activeSelectedJobId}
            onGenerateAgain={handleGenerateAgain}
          />
        </div>
        <div className="min-w-0">
          <TextToImageHistoryList
            selectedJobId={activeSelectedJobId}
            onSelectJob={setSelectedJobId}
          />
        </div>
      </div>
    </section>
  )
}
