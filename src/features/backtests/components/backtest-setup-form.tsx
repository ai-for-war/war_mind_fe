"use client"

import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  getBacktestFieldErrorPath,
  getBacktestValidationErrors,
} from "@/features/backtests/backtest.utils"
import {
  buildBacktestSetupDefaultValues,
  buildBacktestSetupSubmitPayload,
  buildBacktestTemplateParamValues,
  createBacktestSetupFormSchema,
  DEFAULT_BACKTEST_INITIAL_CAPITAL_PLACEHOLDER,
} from "@/features/backtests/backtest-form.utils"
import type { BacktestSetupFormValues } from "@/features/backtests/backtest-form.utils"
import { getBacktestTemplateById } from "@/features/backtests/backtest.utils"
import { BacktestStrategyPicker } from "@/features/backtests/components/backtest-strategy-picker"
import { BacktestStrategySummaryCard } from "@/features/backtests/components/backtest-strategy-summary-card"
import { BacktestSymbolPicker } from "@/features/backtests/components/backtest-symbol-picker"
import { BacktestTemplateParameterFields } from "@/features/backtests/components/backtest-template-parameter-fields"
import type { BacktestRunRequest, BacktestTemplateItem } from "@/features/backtests/types"

type BacktestSetupFormProps = {
  initialValues?: Partial<BacktestRunRequest>
  isSubmitting?: boolean
  onSubmit: (payload: BacktestRunRequest) => Promise<void> | void
  submissionError?: unknown
  templates: BacktestTemplateItem[]
}

export const BacktestSetupForm = ({
  initialValues,
  isSubmitting = false,
  onSubmit,
  submissionError,
  templates,
}: BacktestSetupFormProps) => {
  const validationSchema = useMemo(() => createBacktestSetupFormSchema(templates), [templates])
  const defaultValues = useMemo(
    () => buildBacktestSetupDefaultValues(templates, initialValues),
    [initialValues, templates],
  )
  const form = useForm<BacktestSetupFormValues>({
    defaultValues,
    resolver: zodResolver(validationSchema),
  })
  const selectedTemplateId = useWatch({
    control: form.control,
    name: "template_id",
  })
  const selectedSymbol = useWatch({
    control: form.control,
    name: "symbol",
  })
  const selectedTemplate = useMemo(
    () => getBacktestTemplateById(templates, selectedTemplateId),
    [selectedTemplateId, templates],
  )

  useEffect(() => {
    if (!form.getValues("template_id") && templates.length > 0) {
      form.setValue("template_id", templates[0].template_id, {
        shouldDirty: false,
        shouldValidate: true,
      })
    }
  }, [form, templates])

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  useEffect(() => {
    if (!selectedTemplate) {
      return
    }

    form.setValue("template_params", buildBacktestTemplateParamValues(selectedTemplate), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }, [form, selectedTemplate])

  useEffect(() => {
    if (!submissionError) {
      return
    }

    const validationErrors = getBacktestValidationErrors(submissionError)

    if (validationErrors.length === 0) {
      return
    }

    validationErrors.forEach((validationError) => {
      const fieldPath = getBacktestFieldErrorPath(validationError)

      if (!fieldPath) {
        return
      }

      form.setError(fieldPath as keyof BacktestSetupFormValues, {
        message: validationError.msg,
        type: "server",
      })
    })
  }, [form, submissionError])

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(buildBacktestSetupSubmitPayload(values, templates))
  })

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={form.formState.errors.symbol ? true : undefined}>
          <FieldLabel htmlFor="backtest-symbol">Symbol</FieldLabel>
          <FieldContent>
            <BacktestSymbolPicker
              value={selectedSymbol}
              onChange={(symbol) => {
                form.setValue("symbol", symbol, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
            />
            <FieldDescription>Search the stock catalog and select one symbol to backtest.</FieldDescription>
            <FieldError errors={form.formState.errors.symbol ? [form.formState.errors.symbol] : undefined} />
          </FieldContent>
        </Field>

        <FieldGroup className="@xl/field-group:grid @xl/field-group:grid-cols-2 @xl/field-group:gap-4">
          <Field data-invalid={form.formState.errors.date_from ? true : undefined}>
            <FieldLabel htmlFor="backtest-date-from">Date from</FieldLabel>
            <FieldContent>
              <Input
                id="backtest-date-from"
                type="date"
                aria-invalid={form.formState.errors.date_from ? true : undefined}
                {...form.register("date_from")}
              />
              <FieldError errors={form.formState.errors.date_from ? [form.formState.errors.date_from] : undefined} />
            </FieldContent>
          </Field>

          <Field data-invalid={form.formState.errors.date_to ? true : undefined}>
            <FieldLabel htmlFor="backtest-date-to">Date to</FieldLabel>
            <FieldContent>
              <Input
                id="backtest-date-to"
                type="date"
                aria-invalid={form.formState.errors.date_to ? true : undefined}
                {...form.register("date_to")}
              />
              <FieldError errors={form.formState.errors.date_to ? [form.formState.errors.date_to] : undefined} />
            </FieldContent>
          </Field>
        </FieldGroup>

        <Field data-invalid={form.formState.errors.template_id ? true : undefined}>
          <FieldLabel htmlFor="backtest-strategy">Strategy</FieldLabel>
          <FieldContent>
            <BacktestStrategyPicker
              templates={templates}
              value={selectedTemplateId}
              onChange={(templateId) => {
                form.setValue("template_id", templateId, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
            />
            <FieldDescription>Select one backend-supported strategy template.</FieldDescription>
            <FieldError
              errors={form.formState.errors.template_id ? [form.formState.errors.template_id] : undefined}
            />
          </FieldContent>
        </Field>

        <BacktestStrategySummaryCard template={selectedTemplate} />

        <Field data-invalid={form.formState.errors.initial_capital ? true : undefined}>
          <FieldLabel htmlFor="backtest-initial-capital">Initial capital</FieldLabel>
          <FieldContent>
            <Input
              id="backtest-initial-capital"
              type="number"
              inputMode="numeric"
              placeholder={DEFAULT_BACKTEST_INITIAL_CAPITAL_PLACEHOLDER}
              aria-invalid={form.formState.errors.initial_capital ? true : undefined}
              {...form.register("initial_capital")}
            />
            <FieldDescription>
              Leave empty to use the backend default initial capital.
            </FieldDescription>
            <FieldError
              errors={form.formState.errors.initial_capital ? [form.formState.errors.initial_capital] : undefined}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Parameters</FieldLabel>
          <FieldContent>
            <BacktestTemplateParameterFields
              errors={form.formState.errors}
              register={form.register}
              template={selectedTemplate}
            />
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner variant="ellipsis" className="size-4" /> : null}
          Run backtest
        </Button>
      </div>
    </form>
  )
}
