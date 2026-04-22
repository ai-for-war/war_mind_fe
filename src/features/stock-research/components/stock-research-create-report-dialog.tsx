import { AlertCircle, Loader2, RefreshCw } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateStockResearchReport } from "@/features/stock-research/hooks/use-create-stock-research-report"
import { useStockResearchCatalog } from "@/features/stock-research/hooks/use-stock-research-catalog"
import {
  buildStockResearchRuntimeOverride,
  getStockResearchApiErrorMessage,
  getStockResearchDefaultModel,
  getStockResearchDefaultReasoning,
  getStockResearchDefaultRuntimeSelection,
  getStockResearchModelById,
  getStockResearchProviderById,
} from "@/features/stock-research/stock-research.utils"
import type { StockResearchReportCreateResponse } from "@/features/stock-research/types"
import { normalizeStockResearchSymbol } from "@/features/stock-research/types"

type StockResearchCreateReportDialogProps = {
  description?: string
  initialSymbol?: string | null
  onCreated?: (createdReport: StockResearchReportCreateResponse) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  submitLabel?: string
  title?: string
}

type StockResearchCreateReportDialogFormProps = Omit<
  StockResearchCreateReportDialogProps,
  "open"
>

const NO_REASONING_VALUE = "__no_reasoning__"

const toReasoningSelectValue = (reasoning: string | null) => reasoning ?? NO_REASONING_VALUE

const fromReasoningSelectValue = (reasoning: string) =>
  reasoning === NO_REASONING_VALUE ? null : reasoning

const StockResearchCreateReportDialogForm = ({
  description = "Queue a new report for one symbol. Leave runtime untouched to use backend defaults.",
  initialSymbol,
  onCreated,
  onOpenChange,
  submitLabel = "Queue Report",
  title = "Create stock research report",
}: StockResearchCreateReportDialogFormProps) => {
  const normalizedInitialSymbol = normalizeStockResearchSymbol(initialSymbol) ?? ""
  const catalogQuery = useStockResearchCatalog()
  const createReportMutation = useCreateStockResearchReport()
  const [symbolValue, setSymbolValue] = useState(normalizedInitialSymbol)
  const [symbolError, setSymbolError] = useState<string | null>(null)
  const [providerDraftValue, setProviderDraftValue] = useState<string | null>(null)
  const [modelDraftValue, setModelDraftValue] = useState<string | null>(null)
  const [reasoningDraftValue, setReasoningDraftValue] = useState<string | null>(null)

  const defaultRuntimeSelection = useMemo(
    () => getStockResearchDefaultRuntimeSelection(catalogQuery.data),
    [catalogQuery.data],
  )
  const selectedProviderValue = providerDraftValue ?? defaultRuntimeSelection.provider
  const selectedProvider = useMemo(
    () => getStockResearchProviderById(catalogQuery.data, selectedProviderValue),
    [catalogQuery.data, selectedProviderValue],
  )
  const fallbackModel = useMemo(
    () =>
      getStockResearchDefaultModel(
        selectedProvider,
        providerDraftValue == null ? defaultRuntimeSelection.model : null,
      ),
    [defaultRuntimeSelection.model, providerDraftValue, selectedProvider],
  )
  const selectedModelValue = modelDraftValue ?? fallbackModel?.model ?? null
  const selectedModel = useMemo(
    () => getStockResearchModelById(selectedProvider, selectedModelValue),
    [selectedModelValue, selectedProvider],
  )
  const selectedReasoningValue =
    reasoningDraftValue ??
    getStockResearchDefaultReasoning({
      catalog: catalogQuery.data,
      model: selectedModel,
      provider: selectedProvider,
    })
  const normalizedSymbol = normalizeStockResearchSymbol(symbolValue)
  const runtimeOverride = useMemo(
    () =>
      buildStockResearchRuntimeOverride({
        catalog: catalogQuery.data,
        selection: {
          model: selectedModelValue,
          provider: selectedProviderValue,
          reasoning: selectedReasoningValue,
        },
      }),
    [
      catalogQuery.data,
      selectedModelValue,
      selectedProviderValue,
      selectedReasoningValue,
    ],
  )
  const hasIncompleteRuntimeSelection =
    catalogQuery.data != null &&
    selectedProviderValue != null &&
    selectedProviderValue.trim().length > 0 &&
    (selectedProvider == null || selectedModel == null)

  const handleProviderChange = (nextProviderValue: string) => {
    setProviderDraftValue(nextProviderValue)
    setModelDraftValue(null)
    setReasoningDraftValue(null)
  }

  const handleModelChange = (nextModelValue: string) => {
    setModelDraftValue(nextModelValue)
    setReasoningDraftValue(null)
  }

  const handleSubmit = async () => {
    if (!normalizedSymbol) {
      setSymbolError("Symbol is required.")
      return
    }

    setSymbolError(null)

    if (hasIncompleteRuntimeSelection) {
      toast.error("Select a valid provider and model before queueing a runtime override.")
      return
    }

    try {
      const createdReport = await createReportMutation.mutateAsync({
        symbol: normalizedSymbol,
        ...(runtimeOverride ? { runtime_config: runtimeOverride } : {}),
      })

      toast.success(`Queued research report for ${createdReport.symbol}.`)
      onCreated?.(createdReport)
      onOpenChange(false)
    } catch (error) {
      toast.error(getStockResearchApiErrorMessage(error))
    }
  }

  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="stock-research-symbol">Symbol</FieldLabel>
            <FieldContent>
              <Input
                id="stock-research-symbol"
                value={symbolValue}
                onChange={(event) => {
                  setSymbolValue(event.target.value)
                  setSymbolError(null)
                }}
                placeholder="FPT"
                maxLength={32}
                aria-invalid={symbolError ? "true" : undefined}
                autoCapitalize="characters"
                autoFocus
              />
              <FieldDescription>
                The backend trims and normalizes the symbol to uppercase before queueing
                the report.
              </FieldDescription>
              <FieldError>{symbolError}</FieldError>
            </FieldContent>
          </Field>

          {catalogQuery.isError ? (
            <Alert>
              <AlertCircle />
              <AlertTitle>Runtime options are unavailable</AlertTitle>
              <AlertDescription>
                Runtime overrides cannot be selected right now. You can still queue the
                report with backend defaults.
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
            <Field>
              <FieldLabel htmlFor="stock-research-provider">Provider</FieldLabel>
              <FieldContent>
                <Select
                  value={selectedProviderValue ?? undefined}
                  onValueChange={handleProviderChange}
                  disabled={catalogQuery.isLoading || catalogQuery.providers.length === 0}
                >
                  <SelectTrigger id="stock-research-provider" className="w-full">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Providers</SelectLabel>
                      {catalogQuery.providers.map((provider) => (
                        <SelectItem key={provider.provider} value={provider.provider}>
                          {provider.display_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Leave the current runtime untouched to keep backend defaults.
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="stock-research-model">Model</FieldLabel>
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
                  <SelectTrigger id="stock-research-model" className="w-full">
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
                <FieldError>
                  {hasIncompleteRuntimeSelection
                    ? "The selected provider does not currently expose a valid model."
                    : null}
                </FieldError>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="stock-research-reasoning">Reasoning</FieldLabel>
              <FieldContent>
                <Select
                  value={toReasoningSelectValue(selectedReasoningValue)}
                  onValueChange={(nextValue) =>
                    setReasoningDraftValue(fromReasoningSelectValue(nextValue))
                  }
                  disabled={catalogQuery.isLoading || selectedModel == null}
                >
                  <SelectTrigger id="stock-research-reasoning" className="w-full">
                    <SelectValue placeholder="Select reasoning" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Reasoning</SelectLabel>
                      <SelectItem value={NO_REASONING_VALUE}>No reasoning override</SelectItem>
                      {(selectedModel?.reasoning_options ?? []).map((reasoningOption) => (
                        <SelectItem key={reasoningOption} value={reasoningOption}>
                          {reasoningOption}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  The request omits `runtime_config` until you change runtime values away
                  from the catalog defaults.
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldGroup>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createReportMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              createReportMutation.isPending ||
              normalizedSymbol == null ||
              hasIncompleteRuntimeSelection
            }
          >
            {createReportMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

export const StockResearchCreateReportDialog = ({
  open,
  onOpenChange,
  ...props
}: StockResearchCreateReportDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {open ? (
      <StockResearchCreateReportDialogForm
        {...props}
        onOpenChange={onOpenChange}
      />
    ) : null}
  </Dialog>
)
