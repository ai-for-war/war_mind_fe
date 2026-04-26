import type {
  NormalizedStockResearchScheduleListFilters,
  StockResearchRuntimeConfig,
  StockResearchScheduleDefinitionRequest,
  StockResearchScheduleDefinitionResponse,
  StockResearchScheduleListFilters,
  StockResearchScheduleType,
  StockResearchScheduleWeekday,
} from "@/features/stock-research/types"
import {
  DEFAULT_STOCK_RESEARCH_SCHEDULE_PAGE_SIZE,
  normalizeStockResearchSymbol,
} from "@/features/stock-research/types"

export const STOCK_RESEARCH_SCHEDULE_WEEKDAYS: StockResearchScheduleWeekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

export const STOCK_RESEARCH_SCHEDULE_TYPE_LABELS: Record<
  StockResearchScheduleType,
  string
> = {
  every_15_minutes: "Every 15 minutes",
  daily: "Daily",
  weekly: "Weekly",
}

export const STOCK_RESEARCH_SCHEDULE_WEEKDAY_LABELS: Record<
  StockResearchScheduleWeekday,
  string
> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
}

export type StockResearchScheduleDefinitionDraft = {
  type: StockResearchScheduleType
  hour?: number | string | null
  weekdays?: StockResearchScheduleWeekday[] | null
}

export type StockResearchScheduleCreatePayloadInput = {
  runtimeConfig: StockResearchRuntimeConfig
  schedule: StockResearchScheduleDefinitionDraft
  symbol: string
}

export type StockResearchScheduleUpdatePayloadInput = {
  runtimeConfig?: StockResearchRuntimeConfig | null
  schedule?: StockResearchScheduleDefinitionDraft | null
  symbol?: string | null
}

export const normalizeStockResearchScheduleId = (
  scheduleId?: string | null,
): string | null => {
  const normalizedScheduleId = scheduleId?.trim()

  return normalizedScheduleId && normalizedScheduleId.length > 0
    ? normalizedScheduleId
    : null
}

export const normalizeStockResearchSchedulePageSize = (
  value?: number | string | null,
): number => {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN

  if (!Number.isFinite(numericValue) || numericValue < 1) {
    return DEFAULT_STOCK_RESEARCH_SCHEDULE_PAGE_SIZE
  }

  return Math.floor(numericValue)
}

export const normalizeStockResearchScheduleListFilters = (
  filters?: StockResearchScheduleListFilters,
): NormalizedStockResearchScheduleListFilters => ({
  pageSize: normalizeStockResearchSchedulePageSize(filters?.pageSize),
})

export const normalizeStockResearchScheduleHour = (
  value?: number | string | null,
): number | null => {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN

  if (
    !Number.isFinite(numericValue) ||
    numericValue < 0 ||
    numericValue > 23
  ) {
    return null
  }

  return Math.floor(numericValue)
}

export const normalizeStockResearchScheduleWeekdays = (
  weekdays?: StockResearchScheduleWeekday[] | null,
): StockResearchScheduleWeekday[] => {
  const supportedWeekdays = new Set(STOCK_RESEARCH_SCHEDULE_WEEKDAYS)
  const seenWeekdays = new Set<StockResearchScheduleWeekday>()
  const normalizedWeekdays: StockResearchScheduleWeekday[] = []

  for (const weekday of weekdays ?? []) {
    if (!supportedWeekdays.has(weekday) || seenWeekdays.has(weekday)) {
      continue
    }

    seenWeekdays.add(weekday)
    normalizedWeekdays.push(weekday)
  }

  return normalizedWeekdays
}

export const normalizeStockResearchRuntimeConfig = (
  runtimeConfig?: StockResearchRuntimeConfig | null,
): StockResearchRuntimeConfig | null => {
  const provider = runtimeConfig?.provider.trim()
  const model = runtimeConfig?.model.trim()

  if (!provider || !model) {
    return null
  }

  return {
    provider,
    model,
    reasoning: runtimeConfig?.reasoning?.trim() || null,
  }
}

export const buildStockResearchScheduleDefinitionRequest = (
  draft: StockResearchScheduleDefinitionDraft,
): StockResearchScheduleDefinitionRequest | null => {
  if (draft.type === "every_15_minutes") {
    return {
      type: "every_15_minutes",
    }
  }

  const hour = normalizeStockResearchScheduleHour(draft.hour)

  if (hour == null) {
    return null
  }

  if (draft.type === "daily") {
    return {
      type: "daily",
      hour,
    }
  }

  const weekdays = normalizeStockResearchScheduleWeekdays(draft.weekdays)

  if (weekdays.length === 0) {
    return null
  }

  return {
    type: "weekly",
    hour,
    weekdays,
  }
}

export const buildStockResearchScheduleCreatePayload = ({
  runtimeConfig,
  schedule,
  symbol,
}: StockResearchScheduleCreatePayloadInput) => {
  const normalizedSymbol = normalizeStockResearchSymbol(symbol)
  const normalizedRuntimeConfig = normalizeStockResearchRuntimeConfig(runtimeConfig)
  const normalizedSchedule = buildStockResearchScheduleDefinitionRequest(schedule)

  if (!normalizedSymbol || !normalizedRuntimeConfig || !normalizedSchedule) {
    return null
  }

  return {
    symbol: normalizedSymbol,
    runtime_config: normalizedRuntimeConfig,
    schedule: normalizedSchedule,
  }
}

export const buildStockResearchScheduleUpdatePayload = ({
  runtimeConfig,
  schedule,
  symbol,
}: StockResearchScheduleUpdatePayloadInput) => {
  const normalizedSymbol =
    typeof symbol === "undefined" ? undefined : normalizeStockResearchSymbol(symbol)
  const normalizedRuntimeConfig =
    typeof runtimeConfig === "undefined"
      ? undefined
      : runtimeConfig === null
        ? null
        : normalizeStockResearchRuntimeConfig(runtimeConfig)
  const normalizedSchedule =
    typeof schedule === "undefined"
      ? undefined
      : schedule === null
        ? null
        : buildStockResearchScheduleDefinitionRequest(schedule)

  return {
    ...(typeof normalizedSymbol !== "undefined" ? { symbol: normalizedSymbol } : {}),
    ...(typeof normalizedRuntimeConfig !== "undefined"
      ? { runtime_config: normalizedRuntimeConfig }
      : {}),
    ...(typeof normalizedSchedule !== "undefined" ? { schedule: normalizedSchedule } : {}),
  }
}

export const formatStockResearchScheduleHour = (
  hour?: number | null,
  fallback = "--:--",
) => {
  if (hour == null || hour < 0 || hour > 23) {
    return fallback
  }

  return `${hour.toString().padStart(2, "0")}:00`
}

export const formatStockResearchScheduleWeekdays = (
  weekdays?: StockResearchScheduleWeekday[] | null,
  fallback = "No weekdays",
) => {
  const normalizedWeekdays = normalizeStockResearchScheduleWeekdays(weekdays)

  if (normalizedWeekdays.length === 0) {
    return fallback
  }

  return normalizedWeekdays
    .map((weekday) => STOCK_RESEARCH_SCHEDULE_WEEKDAY_LABELS[weekday])
    .join(", ")
}

export const formatStockResearchScheduleCadence = (
  schedule: StockResearchScheduleDefinitionResponse | StockResearchScheduleDefinitionRequest,
) => {
  if (schedule.type === "every_15_minutes") {
    return STOCK_RESEARCH_SCHEDULE_TYPE_LABELS.every_15_minutes
  }

  const hourLabel = formatStockResearchScheduleHour(schedule.hour)

  if (schedule.type === "daily") {
    return `Daily at ${hourLabel} Vietnam time`
  }

  return `${formatStockResearchScheduleWeekdays(schedule.weekdays)} at ${hourLabel} Vietnam time`
}

export const getNextStockResearchSchedulesPage = (
  lastPage: { items: unknown[]; page: number; page_size: number; total?: number },
  allPages: Array<{ items: unknown[] }>,
): number | undefined => {
  const loadedItems = allPages.reduce((total, page) => total + page.items.length, 0)

  if (typeof lastPage.total === "number" && loadedItems >= lastPage.total) {
    return undefined
  }

  if (lastPage.items.length < lastPage.page_size) {
    return undefined
  }

  return lastPage.page + 1
}
