import { AlertCircle, ChevronRight, Loader2, RefreshCw, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { StockResearchSymbolPickerDialog } from "@/features/stock-research/components/stock-research-symbol-picker-dialog"
import {
  useCreateStockResearchSchedule,
  useStockResearchCatalog,
  useUpdateStockResearchSchedule,
} from "@/features/stock-research/hooks"
import {
  buildStockResearchScheduleDefinitionRequest,
  formatStockResearchScheduleHour,
  STOCK_RESEARCH_SCHEDULE_TYPE_LABELS,
  STOCK_RESEARCH_SCHEDULE_WEEKDAY_LABELS,
  STOCK_RESEARCH_SCHEDULE_WEEKDAYS,
} from "@/features/stock-research/stock-research-schedules.utils"
import {
  getStockResearchApiErrorMessage,
  getStockResearchDefaultAvailableProvider,
  getStockResearchDefaultModel,
  getStockResearchDefaultReasoning,
  getStockResearchDefaultRuntimeSelection,
  getStockResearchModelById,
  getStockResearchProviderById,
} from "@/features/stock-research/stock-research.utils"
import type {
  StockResearchRuntimeConfig,
  StockResearchScheduleResponse,
  StockResearchScheduleType,
  StockResearchScheduleWeekday,
} from "@/features/stock-research/types"
import { normalizeStockResearchSymbol } from "@/features/stock-research/types"
import { cn } from "@/lib/utils"

type StockResearchScheduleDialogProps = {
  initialSchedule?: StockResearchScheduleResponse | null
  onOpenChange: (open: boolean) => void
  onSaved?: (savedSchedule: StockResearchScheduleResponse) => void
  open: boolean
}

type StockResearchScheduleDialogFormProps = Omit<
  StockResearchScheduleDialogProps,
  "open"
>

type StockResearchScheduleFormErrors = {
  hour?: string
  runtime?: string
  symbol?: string
  weekdays?: string
}

const NO_REASONING_VALUE = "__no_reasoning__"
const DEFAULT_SCHEDULE_HOUR = 8

const toReasoningSelectValue = (reasoning: string | null) => reasoning ?? NO_REASONING_VALUE

const fromReasoningSelectValue = (reasoning: string) =>
  reasoning === NO_REASONING_VALUE ? null : reasoning

const getInitialScheduleHour = (schedule?: StockResearchScheduleResponse | null) =>
  schedule?.schedule.hour ?? DEFAULT_SCHEDULE_HOUR

const StockResearchScheduleDialogForm = ({
  initialSchedule,
  onOpenChange,
  onSaved,
}: StockResearchScheduleDialogFormProps) => {
  const isEditing = initialSchedule != null
  const catalogQuery = useStockResearchCatalog()
  const createScheduleMutation = useCreateStockResearchSchedule()
  const updateScheduleMutation = useUpdateStockResearchSchedule()
  const normalizedInitialSymbol = normalizeStockResearchSymbol(initialSchedule?.symbol) ?? ""
  const [symbolValue, setSymbolValue] = useState(normalizedInitialSymbol)
  const [isSymbolPickerOpen, setIsSymbolPickerOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<StockResearchScheduleFormErrors>({})
  const [providerDraftValue, setProviderDraftValue] = useState<string | undefined>(
    initialSchedule?.runtime_config.provider,
  )
  const [modelDraftValue, setModelDraftValue] = useState<string | undefined>(
    initialSchedule?.runtime_config.model,
  )
  const [reasoningDraftValue, setReasoningDraftValue] = useState<
    string | null | undefined
  >(initialSchedule ? initialSchedule.runtime_config.reasoning : undefined)
  const [scheduleType, setScheduleType] = useState<StockResearchScheduleType>(
    initialSchedule?.schedule.type ?? "daily",
  )
  const [hourValue, setHourValue] = useState(getInitialScheduleHour(initialSchedule))
  const [weekdaysValue, setWeekdaysValue] = useState<StockResearchScheduleWeekday[]>(
    initialSchedule?.schedule.weekdays ?? [],
  )

  const defaultRuntimeSelection = useMemo(
    () => getStockResearchDefaultRuntimeSelection(catalogQuery.data),
    [catalogQuery.data],
  )
  const defaultAvailableProvider = useMemo(
    () => getStockResearchDefaultAvailableProvider(catalogQuery.data),
    [catalogQuery.data],
  )
  const selectedProviderValue = providerDraftValue ?? defaultRuntimeSelection.provider
  const selectedProvider = useMemo(
    () => getStockResearchProviderById(catalogQuery.data, selectedProviderValue),
    [catalogQuery.data, selectedProviderValue],
  )
  const selectedModel = useMemo(
    () =>
      getStockResearchModelById(selectedProvider, modelDraftValue) ??
      getStockResearchDefaultModel(
        selectedProvider,
        providerDraftValue == null ? defaultRuntimeSelection.model : null,
      ),
    [defaultRuntimeSelection.model, modelDraftValue, providerDraftValue, selectedProvider],
  )
  const selectedModelValue = selectedModel?.model ?? null
  const selectedReasoningValue =
    reasoningDraftValue !== undefined
      ? reasoningDraftValue
      : getStockResearchDefaultReasoning({
          catalog: catalogQuery.data,
          model: selectedModel,
          provider: selectedProvider,
        })
  const normalizedSymbol = normalizeStockResearchSymbol(symbolValue)
  const providerHasSelectableModels = (selectedProvider?.models.length ?? 0) > 0
  const hasIncompleteRuntimeSelection =
    catalogQuery.data == null ||
    selectedProviderValue == null ||
    selectedProviderValue.trim().length === 0 ||
    selectedProvider == null ||
    !providerHasSelectableModels ||
    selectedModel == null
  const isPending = createScheduleMutation.isPending || updateScheduleMutation.isPending

  const handleProviderChange = (nextProviderValue: string) => {
    setProviderDraftValue(nextProviderValue)
    setModelDraftValue(undefined)
    setReasoningDraftValue(undefined)
    setFormErrors((currentErrors) => ({ ...currentErrors, runtime: undefined }))
  }

  const handleModelChange = (nextModelValue: string) => {
    setModelDraftValue(nextModelValue)
    setReasoningDraftValue(undefined)
    setFormErrors((currentErrors) => ({ ...currentErrors, runtime: undefined }))
  }

  const handleSelectSymbol = (symbol: string) => {
    setSymbolValue(symbol)
    setFormErrors((currentErrors) => ({ ...currentErrors, symbol: undefined }))
  }

  const handleScheduleTypeChange = (nextScheduleType: string) => {
    if (!nextScheduleType) {
      return
    }

    setScheduleType(nextScheduleType as StockResearchScheduleType)
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      hour: undefined,
      weekdays: undefined,
    }))
  }

  const handleWeekdaysChange = (nextWeekdays: string[]) => {
    setWeekdaysValue(nextWeekdays as StockResearchScheduleWeekday[])
    setFormErrors((currentErrors) => ({ ...currentErrors, weekdays: undefined }))
  }

  const handleSubmit = async () => {
    const nextErrors: StockResearchScheduleFormErrors = {}

    if (!normalizedSymbol) {
      nextErrors.symbol = "Symbol is required."
    }

    if (hasIncompleteRuntimeSelection) {
      nextErrors.runtime = "Select a valid provider and model."
    }

    if ((scheduleType === "daily" || scheduleType === "weekly") && hourValue == null) {
      nextErrors.hour = "Hour is required."
    }

    if (scheduleType === "weekly" && weekdaysValue.length === 0) {
      nextErrors.weekdays = "Select at least one weekday."
    }

    const runtimeConfig: StockResearchRuntimeConfig | null =
      selectedProviderValue && selectedModelValue
        ? {
            provider: selectedProviderValue,
            model: selectedModelValue,
            reasoning: selectedReasoningValue,
          }
        : null
    const schedule = buildStockResearchScheduleDefinitionRequest({
      type: scheduleType,
      hour: hourValue,
      weekdays: weekdaysValue,
    })

    if (!schedule) {
      if (scheduleType === "weekly" && weekdaysValue.length === 0) {
        nextErrors.weekdays = "Select at least one weekday."
      } else {
        nextErrors.hour = "Choose a valid hour."
      }
    }

    setFormErrors(nextErrors)

    if (
      Object.values(nextErrors).some(
        (errorMessage) => typeof errorMessage === "string" && errorMessage.length > 0,
      ) ||
      !normalizedSymbol ||
      !runtimeConfig ||
      !schedule
    ) {
      return
    }

    try {
      const savedSchedule = isEditing
        ? await updateScheduleMutation.mutateAsync({
            scheduleId: initialSchedule.id,
            payload: {
              symbol: normalizedSymbol,
              runtime_config: runtimeConfig,
              schedule,
            },
          })
        : await createScheduleMutation.mutateAsync({
            symbol: normalizedSymbol,
            runtime_config: runtimeConfig,
            schedule,
          })

      toast.success(
        isEditing
          ? `Updated research schedule for ${savedSchedule.symbol}.`
          : `Created research schedule for ${savedSchedule.symbol}.`,
      )
      onSaved?.(savedSchedule)
      onOpenChange(false)
    } catch (error) {
      toast.error(getStockResearchApiErrorMessage(error))
    }
  }

  return (
    <DialogContent className="flex h-[min(92dvh,46rem)] max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-2xl">
      <DialogHeader className="shrink-0">
        <DialogTitle>
          {isEditing ? "Edit research schedule" : "Create research schedule"}
        </DialogTitle>
        <DialogDescription>
          Schedule recurring stock research for one symbol using Vietnam-time cadence.
        </DialogDescription>
      </DialogHeader>

      <form
        className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }}
      >
        <ScrollArea className="min-h-0 flex-1 overflow-hidden pr-3">
          <FieldGroup className="pb-4 pr-1">
            <Field data-invalid={Boolean(formErrors.symbol)}>
              <FieldLabel htmlFor="stock-research-schedule-symbol-trigger">
                Symbol
              </FieldLabel>
              <FieldContent>
                <Button
                  id="stock-research-schedule-symbol-trigger"
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-11 w-full items-center justify-between rounded-xl px-3 text-left",
                    !normalizedSymbol && "text-muted-foreground",
                  )}
                  aria-invalid={formErrors.symbol ? "true" : undefined}
                  onClick={() => setIsSymbolPickerOpen(true)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Search className="size-4 shrink-0 text-muted-foreground" />
                    {normalizedSymbol ? (
                      <span className="truncate font-medium tracking-[0.12em] uppercase">
                        {normalizedSymbol}
                      </span>
                    ) : (
                      <span>Choose symbol</span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    Browse
                    <ChevronRight className="size-3.5" />
                  </span>
                </Button>
                <FieldError>{formErrors.symbol}</FieldError>
              </FieldContent>
            </Field>

            {catalogQuery.isError ? (
              <Alert>
                <AlertCircle />
                <AlertTitle>Runtime options are unavailable</AlertTitle>
                <AlertDescription>
                  Schedule creation requires a provider and model from the runtime catalog.
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => void catalogQuery.refetch()}
                  >
                    <RefreshCw data-icon="inline-start" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}

            <FieldGroup>
              <Field data-invalid={Boolean(formErrors.runtime)}>
                <FieldLabel htmlFor="stock-research-schedule-provider">
                  Provider
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={selectedProviderValue ?? undefined}
                    onValueChange={handleProviderChange}
                    disabled={catalogQuery.isLoading || catalogQuery.providers.length === 0}
                  >
                    <SelectTrigger id="stock-research-schedule-provider" className="w-full">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Providers</SelectLabel>
                        {catalogQuery.providers.map((provider) => (
                          <SelectItem
                            key={provider.provider}
                            value={provider.provider}
                            disabled={provider.models.length === 0}
                          >
                            {provider.display_name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError>
                    {formErrors.runtime ??
                      (defaultAvailableProvider == null && catalogQuery.providers.length > 0
                        ? "No provider currently exposes a selectable model."
                        : null)}
                  </FieldError>
                </FieldContent>
              </Field>

              <Field data-invalid={Boolean(formErrors.runtime)}>
                <FieldLabel htmlFor="stock-research-schedule-model">Model</FieldLabel>
                <FieldContent>
                  <Select
                    value={selectedModelValue ?? undefined}
                    onValueChange={handleModelChange}
                    disabled={
                      catalogQuery.isLoading ||
                      selectedProvider == null ||
                      selectedProvider.models.length === 0
                    }
                  >
                    <SelectTrigger id="stock-research-schedule-model" className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Models</SelectLabel>
                        {(selectedProvider?.models ?? []).map((model) => (
                          <SelectItem key={model.model} value={model.model}>
                            {model.model}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="stock-research-schedule-reasoning">
                  Reasoning
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={toReasoningSelectValue(selectedReasoningValue)}
                    onValueChange={(nextValue) =>
                      setReasoningDraftValue(fromReasoningSelectValue(nextValue))
                    }
                    disabled={catalogQuery.isLoading || selectedModel == null}
                  >
                    <SelectTrigger id="stock-research-schedule-reasoning" className="w-full">
                      <SelectValue placeholder="Select reasoning" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Reasoning</SelectLabel>
                        <SelectItem value={NO_REASONING_VALUE}>
                          No reasoning override
                        </SelectItem>
                        {(selectedModel?.reasoning_options ?? []).map((reasoningOption) => (
                          <SelectItem key={reasoningOption} value={reasoningOption}>
                            {reasoningOption}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            </FieldGroup>

            <Field>
              <FieldLabel>Cadence</FieldLabel>
              <FieldContent>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={scheduleType}
                  onValueChange={handleScheduleTypeChange}
                  className="grid w-full grid-cols-1 sm:grid-cols-3"
                >
                  <ToggleGroupItem value="every_15_minutes" aria-label="Every 15 minutes">
                    {STOCK_RESEARCH_SCHEDULE_TYPE_LABELS.every_15_minutes}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="daily" aria-label="Daily">
                    {STOCK_RESEARCH_SCHEDULE_TYPE_LABELS.daily}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="weekly" aria-label="Weekly">
                    {STOCK_RESEARCH_SCHEDULE_TYPE_LABELS.weekly}
                  </ToggleGroupItem>
                </ToggleGroup>
              </FieldContent>
            </Field>

            {scheduleType !== "every_15_minutes" ? (
              <Field data-invalid={Boolean(formErrors.hour)}>
                <FieldLabel htmlFor="stock-research-schedule-hour">
                  Hour
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={hourValue.toString()}
                    onValueChange={(nextValue) => {
                      setHourValue(Number.parseInt(nextValue, 10))
                      setFormErrors((currentErrors) => ({
                        ...currentErrors,
                        hour: undefined,
                      }))
                    }}
                  >
                    <SelectTrigger id="stock-research-schedule-hour" className="w-full">
                      <SelectValue placeholder="Select hour" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Vietnam time</SelectLabel>
                        {Array.from({ length: 24 }).map((_, hour) => (
                          <SelectItem key={hour} value={hour.toString()}>
                            {formatStockResearchScheduleHour(hour)} Vietnam time
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Daily and weekly schedules use Asia/Saigon hour semantics.
                  </FieldDescription>
                  <FieldError>{formErrors.hour}</FieldError>
                </FieldContent>
              </Field>
            ) : null}

            {scheduleType === "weekly" ? (
              <Field data-invalid={Boolean(formErrors.weekdays)}>
                <FieldLabel>Weekdays</FieldLabel>
                <FieldContent>
                  <ToggleGroup
                    type="multiple"
                    variant="outline"
                    spacing={2}
                    value={weekdaysValue}
                    onValueChange={handleWeekdaysChange}
                    className="grid w-full grid-cols-2 sm:grid-cols-4"
                  >
                    {STOCK_RESEARCH_SCHEDULE_WEEKDAYS.map((weekday) => (
                      <ToggleGroupItem
                        key={weekday}
                        value={weekday}
                        aria-label={STOCK_RESEARCH_SCHEDULE_WEEKDAY_LABELS[weekday]}
                      >
                        {STOCK_RESEARCH_SCHEDULE_WEEKDAY_LABELS[weekday]}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <FieldError>{formErrors.weekdays}</FieldError>
                </FieldContent>
              </Field>
            ) : null}
          </FieldGroup>
        </ScrollArea>

        <DialogFooter className="shrink-0 border-t border-border/60 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || catalogQuery.isLoading || catalogQuery.isError}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isEditing ? "Save Changes" : "Create Schedule"}
          </Button>
        </DialogFooter>
      </form>

      <StockResearchSymbolPickerDialog
        open={isSymbolPickerOpen}
        onOpenChange={setIsSymbolPickerOpen}
        onSelectSymbol={handleSelectSymbol}
        selectedSymbol={symbolValue}
      />
    </DialogContent>
  )
}

export const StockResearchScheduleDialog = ({
  open,
  onOpenChange,
  ...props
}: StockResearchScheduleDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {open ? (
      <StockResearchScheduleDialogForm
        {...props}
        onOpenChange={onOpenChange}
      />
    ) : null}
  </Dialog>
)
