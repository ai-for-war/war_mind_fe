import {
  FileSearch,
  Globe,
  Layers,
  ListTodo,
  Search,
  Wrench,
  type LucideIcon,
} from "lucide-react"

type ToolArgumentFormatter = (argumentsValue: Record<string, unknown>) => string | null

export interface AiToolPresentation {
  formatArguments: ToolArgumentFormatter
  icon: LucideIcon
  label: string
}

const MAX_VALUE_LENGTH = 48
const MAX_SUMMARY_LENGTH = 120

const truncateText = (value: string, maxLength = MAX_VALUE_LENGTH): string =>
  value.length <= maxLength ? value : `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`

const shortenUrl = (value: string): string => {
  try {
    const url = new URL(value)
    const normalizedPath = url.pathname === "/" ? "" : url.pathname
    return truncateText(`${url.hostname}${normalizedPath}`)
  } catch {
    return truncateText(value)
  }
}

const formatPrimitiveValue = (value: string | number | boolean): string =>
  typeof value === "string"
    ? value.startsWith("http://") || value.startsWith("https://")
      ? shortenUrl(value)
      : truncateText(value)
    : `${value}`

const formatUnknownValue = (value: unknown): string | null => {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return formatPrimitiveValue(value)
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? `[${value.length} items]` : "[]"
  }

  if (value && typeof value === "object") {
    const keyCount = Object.keys(value).length
    return keyCount > 0 ? `{${keyCount} fields}` : "{}"
  }

  return null
}

const joinSummaryParts = (parts: Array<string | null | undefined>): string | null => {
  const normalizedParts = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))

  if (normalizedParts.length === 0) {
    return null
  }

  return truncateText(normalizedParts.join(" • "), MAX_SUMMARY_LENGTH)
}

const formatKeyValue = (key: string, value: unknown): string | null => {
  const formattedValue = formatUnknownValue(value)
  return formattedValue ? `${toStableToolLabel(key)}: ${formattedValue}` : null
}

const formatSearchArguments: ToolArgumentFormatter = (argumentsValue) =>
  joinSummaryParts([
    formatUnknownValue(argumentsValue.query),
    formatUnknownValue(argumentsValue.region),
    formatUnknownValue(argumentsValue.max_results),
  ])

const formatFetchContentArguments: ToolArgumentFormatter = (argumentsValue) =>
  joinSummaryParts([
    formatUnknownValue(argumentsValue.url),
    formatUnknownValue(argumentsValue.max_length),
  ])

const formatLoadSkillArguments: ToolArgumentFormatter = (argumentsValue) =>
  joinSummaryParts([formatUnknownValue(argumentsValue.skill_id)])

const formatFallbackArguments: ToolArgumentFormatter = (argumentsValue) => {
  const entries = Object.entries(argumentsValue).slice(0, 3)
  return joinSummaryParts(entries.map(([key, value]) => formatKeyValue(key, value)))
}

const TOOL_PRESENTATION_REGISTRY: Record<string, AiToolPresentation> = {
  fetch_content: {
    formatArguments: formatFetchContentArguments,
    icon: Globe,
    label: "Crawl",
  },
  load_skill: {
    formatArguments: formatLoadSkillArguments,
    icon: Layers,
    label: "Load Skill",
  },
  search: {
    formatArguments: formatSearchArguments,
    icon: Search,
    label: "Search",
  },
  write_todos: {
    formatArguments: formatFallbackArguments,
    icon: ListTodo,
    label: "Update Plan",
  },
}

export const toStableToolLabel = (toolName: string): string => {
  const normalizedName = toolName.trim()
  if (normalizedName.length === 0) {
    return "Tool"
  }

  const label = normalizedName
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  return label.replace(/\b\w/g, (character) => character.toUpperCase())
}

export const getAiToolPresentation = (toolName: string): AiToolPresentation =>
  TOOL_PRESENTATION_REGISTRY[toolName] ?? {
    formatArguments: formatFallbackArguments,
    icon: toolName.includes("search") ? FileSearch : Wrench,
    label: toStableToolLabel(toolName),
  }

export const formatAiToolArgumentsSummary = (
  toolName: string,
  argumentsValue: Record<string, unknown>,
): string | null => getAiToolPresentation(toolName).formatArguments(argumentsValue)
