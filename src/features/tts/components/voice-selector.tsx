import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useVoices } from "@/features/voice-cloning"

type VoiceSelectorProps = {
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export const VoiceSelector = ({
  value,
  onValueChange,
  disabled = false,
}: VoiceSelectorProps) => {
  const voicesQuery = useVoices()
  const systemVoices = voicesQuery.data?.system_voices ?? []
  const clonedVoices = voicesQuery.data?.cloned_voices ?? []

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || voicesQuery.isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={voicesQuery.isLoading ? "Loading voices..." : "Select a voice"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>System Voices</SelectLabel>
          {systemVoices.map((voice) => (
            <SelectItem key={`system-${voice.voice_id}`} value={voice.voice_id}>
              {voice.voice_name}
            </SelectItem>
          ))}
        </SelectGroup>

        {clonedVoices.length > 0 ? (
          <SelectGroup>
            <SelectLabel>My Cloned Voices</SelectLabel>
            {clonedVoices.map((voice) => (
              <SelectItem key={`cloned-${voice.voice_id}`} value={voice.voice_id}>
                {voice.name} (Cloned)
              </SelectItem>
            ))}
          </SelectGroup>
        ) : null}
      </SelectContent>
    </Select>
  )
}
