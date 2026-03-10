import { useState } from "react"

import { TextToImageComposeForm } from "@/features/text-to-image/components/text-to-image-compose-form"
import { TextToImageHistoryList } from "@/features/text-to-image/components/text-to-image-history-list"

export const TextToImagePage = () => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Text to Image</h1>
        <p className="text-sm text-muted-foreground">
          Creative Studio - turn prompts into generated visuals.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,360px)]">
        <TextToImageComposeForm onCreated={setSelectedJobId} />
        <TextToImageHistoryList
          selectedJobId={selectedJobId}
          onSelectJob={setSelectedJobId}
        />
      </div>
    </section>
  )
}
