import {
  Bot,
  FileSearch,
  Globe,
  Layers,
  ListTodo,
  Search,
  Wrench,
  type LucideIcon,
} from "lucide-react"

type ToolArgumentFormatter = (argumentsValue: Record<string, unknown>) => string | null

export interface AiToolTodoItem {
  content: string
  status: string
}

export interface AiToolPresentation {
  formatArguments: ToolArgumentFormatter
  icon: LucideIcon
  label: string
}

const isHttpUrl = (value: string): boolean => value.startsWith("http://") || value.startsWith("https://")
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)

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

const formatDelegateTasksArguments: ToolArgumentFormatter = (argumentsValue) => {
  const task = isRecord(argumentsValue.task) ? argumentsValue.task : null

  if (!task) {
    return formatFallbackArguments(argumentsValue)
  }

  return joinSummaryParts([
    typeof task.objective === "string" ? task.objective : null,
    typeof task.expected_output === "string" ? task.expected_output : null,
  ])
}

const normalizeTodoItems = (value: unknown): AiToolTodoItem[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null
      }

      const content =
        typeof item.content === "string" && item.content.trim().length > 0
          ? item.content.trim()
          : null
      const status =
        typeof item.status === "string" && item.status.trim().length > 0 ? item.status.trim() : null

      if (!content || !status) {
        return null
      }

      return { content, status }
    })
    .filter((item): item is AiToolTodoItem => Boolean(item))
}

const normalizeTodoStatus = (status: string): string => status.trim().toLowerCase().replace(/\s+/g, "_")

const formatWriteTodosArguments: ToolArgumentFormatter = (argumentsValue) => {
  const todos = normalizeTodoItems(argumentsValue.todos)

  if (todos.length === 0) {
    return formatFallbackArguments(argumentsValue)
  }

  const completedCount = todos.filter((todo) => normalizeTodoStatus(todo.status) === "completed").length
  const inProgressCount = todos.filter(
    (todo) => normalizeTodoStatus(todo.status) === "in_progress",
  ).length
  const pendingCount = todos.filter((todo) => normalizeTodoStatus(todo.status) === "pending").length

  return joinSummaryParts([
    `${todos.length} ${todos.length === 1 ? "task" : "tasks"}`,
    completedCount > 0 ? `${completedCount} completed` : null,
    inProgressCount > 0 ? `${inProgressCount} in progress` : null,
    pendingCount > 0 ? `${pendingCount} pending` : null,
  ])
}

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
  delegate_tasks: {
    formatArguments: formatDelegateTasksArguments,
    icon: Bot,
    label: "Subagent",
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
    formatArguments: formatWriteTodosArguments,
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

export const getAiToolTodoItems = (
  toolName: string,
  argumentsValue: Record<string, unknown>,
): AiToolTodoItem[] => (toolName === "write_todos" ? normalizeTodoItems(argumentsValue.todos) : [])

export const getAiToolNavigationTarget = (
  _toolName: string,
  argumentsValue: Record<string, unknown>,
): string | null => {
  if (
    typeof argumentsValue.url === "string" &&
    argumentsValue.url.trim().length > 0 &&
    isHttpUrl(argumentsValue.url)
  ) {
    return argumentsValue.url
  }

  return null
}
