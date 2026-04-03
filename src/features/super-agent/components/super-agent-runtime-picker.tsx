import { Check, ChevronDown, Loader2, RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import type {
  LeadAgentRuntimeCatalogModelEntry,
  LeadAgentRuntimeCatalogResponse,
  SuperAgentRuntimeSelection,
} from "@/features/super-agent/types"

type SuperAgentRuntimePickerProps = {
  catalog: LeadAgentRuntimeCatalogResponse | null
  className?: string
  isLoading: boolean
  isRetrying?: boolean
  onRetry: () => void
  onSelectModel: (args: { model: string; provider: string }) => void
  onSelectReasoning: (reasoning: string) => void
  runtimeError?: string | null
  selection: SuperAgentRuntimeSelection | null
}

const getSelectedModel = (
  catalog: LeadAgentRuntimeCatalogResponse | null,
  selection: SuperAgentRuntimeSelection | null,
): LeadAgentRuntimeCatalogModelEntry | null => {
  if (!catalog || !selection) {
    return null
  }

  const provider = catalog.providers.find((entry) => entry.provider === selection.provider)
  if (!provider) {
    return null
  }

  return provider.models.find((entry) => entry.model === selection.model) ?? null
}

export const SuperAgentRuntimePicker = ({
  catalog,
  className,
  isLoading,
  isRetrying = false,
  onRetry,
  onSelectModel,
  onSelectReasoning,
  runtimeError,
  selection,
}: SuperAgentRuntimePickerProps) => {
  const isMobile = useIsMobile()
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false)

  const selectedProvider = useMemo(
    () => catalog?.providers.find((entry) => entry.provider === selection?.provider) ?? null,
    [catalog, selection?.provider],
  )
  const selectedModel = useMemo(
    () => getSelectedModel(catalog, selection),
    [catalog, selection],
  )
  const hasReasoningOptions = Boolean(selectedModel?.reasoning_options.length)
  const modelTriggerLabel =
    selectedProvider && selectedModel
      ? `${selectedProvider.display_name} / ${selectedModel.model}`
      : isLoading
        ? "Loading models..."
        : runtimeError
          ? "Runtime unavailable"
          : "Choose model"

  const pickerContent = (
    <div className="flex min-h-0 flex-1 flex-col">
      <Command className="rounded-none border-0">
        <CommandInput placeholder="Search models or providers..." />
        <CommandList className="max-h-[min(22rem,60vh)]">
          <CommandEmpty>No matching models found.</CommandEmpty>
          {(catalog?.providers ?? []).map((provider) => (
            <CommandGroup heading={provider.display_name} key={provider.provider}>
              {provider.models.map((model) => {
                const isSelected =
                  selection?.provider === provider.provider && selection.model === model.model

                return (
                  <CommandItem
                    key={`${provider.provider}:${model.model}`}
                    keywords={[provider.provider, provider.display_name, model.model]}
                    onSelect={() => {
                      onSelectModel({ model: model.model, provider: provider.provider })
                      setIsModelPickerOpen(false)
                    }}
                    value={`${provider.display_name} ${model.model}`}
                  >
                    <div className="flex min-w-0 flex-1">
                      <span className="truncate font-medium">{model.model}</span>
                    </div>
                    {isSelected ? <Check className="ml-auto size-4" /> : null}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </div>
  )

  const modelTrigger = (
    <Button
      className={cn("h-8 max-w-full justify-between gap-2 text-xs sm:text-sm", className)}
      disabled={isLoading || Boolean(runtimeError) || !catalog}
      onClick={() => setIsModelPickerOpen(true)}
      type="button"
      variant="outline"
    >
      <span className="truncate">{modelTriggerLabel}</span>
      {isLoading ? <Loader2 className="size-3.5 animate-spin" /> : <ChevronDown className="size-3.5" />}
    </Button>
  )

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {modelTrigger}

      {hasReasoningOptions ? (
        <Select
          onValueChange={onSelectReasoning}
          value={selection?.reasoning ?? undefined}
        >
          <SelectTrigger
            aria-label="Reasoning"
            className="h-8 min-w-[10rem] text-xs sm:text-sm"
            size="sm"
          >
            <SelectValue placeholder="Reasoning">
              {selection?.reasoning ? `Reasoning: ${selection.reasoning}` : "Reasoning"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="start" position="popper" side="top">
            <SelectGroup>
              <SelectLabel>Reasoning</SelectLabel>
              {selectedModel?.reasoning_options.map((reasoning) => (
                <SelectItem key={reasoning} value={reasoning}>
                  {reasoning}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : null}

      {runtimeError ? (
        <Button
          className="h-8 gap-1.5 text-xs"
          onClick={onRetry}
          size="sm"
          type="button"
          variant="outline"
        >
          {isRetrying ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Retry
        </Button>
      ) : null}

      {isMobile ? (
        <Sheet onOpenChange={setIsModelPickerOpen} open={isModelPickerOpen}>
          <SheetContent className="p-0" side="bottom">
            <SheetHeader className="border-b pb-3">
              <SheetTitle>Choose model</SheetTitle>
              <SheetDescription>
                Pick the runtime for the next message. Models stay grouped by provider.
              </SheetDescription>
            </SheetHeader>
            {pickerContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog onOpenChange={setIsModelPickerOpen} open={isModelPickerOpen}>
          <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
            <DialogHeader className="border-b px-6 pt-6 pb-3">
              <DialogTitle>Choose model</DialogTitle>
              <DialogDescription>
                Pick the runtime for the next message. Models stay grouped by provider.
              </DialogDescription>
            </DialogHeader>
            {pickerContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
