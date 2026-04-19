import { z } from "zod"
import type { FieldErrors } from "react-hook-form"

import { buildBacktestTemplateParameterDefaults, getBacktestTemplateById } from "@/features/backtests/backtest.utils"
import type {
  BacktestRunRequest,
  BacktestTemplateItem,
  BacktestTemplateParams,
} from "@/features/backtests/types"
import {
  normalizeBacktestDate,
  normalizeBacktestSymbol,
  normalizeBacktestTemplateId,
} from "@/features/backtests/types"

export type BacktestSetupFormValues = {
  symbol: string
  date_from: string
  date_to: string
  template_id: string
  initial_capital: string
  template_params: Record<string, string>
}

type BacktestParameterFieldError = {
  message?: string
}

export const DEFAULT_BACKTEST_INITIAL_CAPITAL_PLACEHOLDER = "100000000"

const parseBacktestNumberInput = (value?: string | null) => {
  const trimmedValue = value?.trim()

  if (!trimmedValue) {
    return null
  }

  const parsedValue = Number(trimmedValue)

  return Number.isFinite(parsedValue) ? parsedValue : null
}

const BACKTEST_SETUP_FORM_SCHEMA = z.object({
  symbol: z.string().trim().min(1, "Select a stock symbol."),
  date_from: z.string().trim().min(1, "Select a start date."),
  date_to: z.string().trim().min(1, "Select an end date."),
  template_id: z.string().trim().min(1, "Select a strategy."),
  initial_capital: z.string(),
  template_params: z.record(z.string(), z.string()),
})

export const createBacktestSetupFormSchema = (templates: BacktestTemplateItem[]) =>
  BACKTEST_SETUP_FORM_SCHEMA.superRefine((values, context) => {
    const selectedTemplate = getBacktestTemplateById(templates, values.template_id)

    if (values.date_from.trim() && values.date_to.trim() && values.date_to < values.date_from) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be on or after the start date.",
        path: ["date_to"],
      })
    }

    if (values.initial_capital.trim().length > 0) {
      const initialCapital = parseBacktestNumberInput(values.initial_capital)

      if (initialCapital == null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Initial capital must be a valid number.",
          path: ["initial_capital"],
        })
      }
    }

    if (!selectedTemplate) {
      return
    }

    const parsedTemplateParams = selectedTemplate.parameters.reduce<Record<string, number>>(
      (templateParams, parameter) => {
        const rawValue = values.template_params[parameter.name]
        const parsedValue = parseBacktestNumberInput(rawValue)

        if (parameter.required && parsedValue == null) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${parameter.name} is required.`,
            path: ["template_params", parameter.name],
          })

          return templateParams
        }

        if (rawValue?.trim().length && parsedValue == null) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${parameter.name} must be a valid number.`,
            path: ["template_params", parameter.name],
          })

          return templateParams
        }

        if (parsedValue == null) {
          return templateParams
        }

        if (parameter.min != null && parsedValue < parameter.min) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${parameter.name} must be at least ${parameter.min}.`,
            path: ["template_params", parameter.name],
          })
        }

        templateParams[parameter.name] = parsedValue

        return templateParams
      },
      {},
    )

    const normalizedTemplateId = normalizeBacktestTemplateId(selectedTemplate.template_id)

    if (
      normalizedTemplateId === "sma_crossover" &&
      parsedTemplateParams.fast_window != null &&
      parsedTemplateParams.slow_window != null &&
      parsedTemplateParams.fast_window >= parsedTemplateParams.slow_window
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "fast_window must be smaller than slow_window.",
        path: ["template_params", "fast_window"],
      })
    }

    if (normalizedTemplateId === "ichimoku_cloud") {
      const tenkanWindow = parsedTemplateParams.tenkan_window
      const kijunWindow = parsedTemplateParams.kijun_window
      const senkouBWindow = parsedTemplateParams.senkou_b_window
      const displacement = parsedTemplateParams.displacement
      const warmupBars = parsedTemplateParams.warmup_bars

      if (
        tenkanWindow != null &&
        kijunWindow != null &&
        senkouBWindow != null &&
        !(tenkanWindow < kijunWindow && kijunWindow < senkouBWindow)
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ichimoku windows must satisfy tenkan_window < kijun_window < senkou_b_window.",
          path: ["template_params", "tenkan_window"],
        })
      }

      if (
        warmupBars != null &&
        senkouBWindow != null &&
        displacement != null &&
        warmupBars < senkouBWindow + displacement
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "warmup_bars must be at least senkou_b_window + displacement.",
          path: ["template_params", "warmup_bars"],
        })
      }
    }
  })

export const buildBacktestSetupDefaultValues = (
  templates: BacktestTemplateItem[],
  initialValues?: Partial<BacktestRunRequest>,
): BacktestSetupFormValues => {
  const initialTemplateId = normalizeBacktestTemplateId(initialValues?.template_id)
  const selectedTemplate =
    getBacktestTemplateById(templates, initialTemplateId) ?? templates[0] ?? null
  const selectedTemplateDefaults = buildBacktestTemplateParameterDefaults(selectedTemplate)

  return {
    symbol: normalizeBacktestSymbol(initialValues?.symbol),
    date_from: normalizeBacktestDate(initialValues?.date_from),
    date_to: normalizeBacktestDate(initialValues?.date_to),
    template_id: selectedTemplate?.template_id ?? "",
    initial_capital:
      typeof initialValues?.initial_capital === "number" &&
      Number.isFinite(initialValues.initial_capital)
        ? String(initialValues.initial_capital)
        : "",
    template_params: {
      ...Object.fromEntries(
        Object.entries(selectedTemplateDefaults).map(([key, value]) => [key, String(value)]),
      ),
      ...Object.fromEntries(
        Object.entries(initialValues?.template_params ?? {}).map(([key, value]) => [key, String(value)]),
      ),
    },
  }
}

export const buildBacktestSetupSubmitPayload = (
  values: BacktestSetupFormValues,
  templates: BacktestTemplateItem[],
): BacktestRunRequest => {
  const selectedTemplate = getBacktestTemplateById(templates, values.template_id)

  const templateParams = selectedTemplate?.parameters.reduce<BacktestTemplateParams>((params, parameter) => {
    const parsedValue = parseBacktestNumberInput(values.template_params[parameter.name])

    if (parsedValue != null) {
      params[parameter.name] = parsedValue
    }

    return params
  }, {})

  const initialCapital = parseBacktestNumberInput(values.initial_capital)

  return {
    symbol: values.symbol,
    date_from: values.date_from,
    date_to: values.date_to,
    template_id: values.template_id,
    ...(templateParams && Object.keys(templateParams).length > 0
      ? { template_params: templateParams }
      : {}),
    ...(initialCapital != null ? { initial_capital: initialCapital } : {}),
  }
}

export const buildBacktestTemplateParamValues = (template?: BacktestTemplateItem | null) =>
  Object.fromEntries(
    Object.entries(buildBacktestTemplateParameterDefaults(template)).map(([key, value]) => [
      key,
      String(value),
    ]),
  )

export const getBacktestTemplateParamError = (
  errors: FieldErrors<BacktestSetupFormValues>,
  parameterName: string,
) => {
  const templateParamError = errors.template_params?.[parameterName]

  if (!templateParamError || typeof templateParamError !== "object") {
    return undefined
  }

  return templateParamError as BacktestParameterFieldError
}
