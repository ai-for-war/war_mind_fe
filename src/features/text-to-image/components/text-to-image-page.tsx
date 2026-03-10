import { useState } from "react"

import { TextToImageComposeForm } from "@/features/text-to-image/components/text-to-image-compose-form"

export const TextToImagePage = () => {
  const [latestCreatedJobId, setLatestCreatedJobId] = useState<string | null>(null)

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Text to Image</h1>
        <p className="text-sm text-muted-foreground">
          Creative Studio - turn prompts into generated visuals.
        </p>
      </div>

      <div className="max-w-xl space-y-3">
        <TextToImageComposeForm onCreated={setLatestCreatedJobId} />
        {latestCreatedJobId ? (
          <p className="text-xs text-muted-foreground">
            Latest job created: <span className="font-mono">{latestCreatedJobId}</span>
          </p>
        ) : null}
      </div>
    </section>
  )
}
