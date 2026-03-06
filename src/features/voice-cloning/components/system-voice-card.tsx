import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SystemVoiceRecord } from "@/features/voice-cloning/types/voice.types"

type SystemVoiceCardProps = {
  voice: SystemVoiceRecord
}

export const SystemVoiceCard = ({ voice }: SystemVoiceCardProps) => {
  const description = voice.description.join(", ")

  return (
    <Card className="gap-4 py-4">
      <CardHeader className="px-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{voice.voice_name}</CardTitle>
          <Badge variant="secondary">System</Badge>
        </div>
      </CardHeader>
      {description ? (
        <CardContent className="px-4 pt-0">
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      ) : null}
    </Card>
  )
}
