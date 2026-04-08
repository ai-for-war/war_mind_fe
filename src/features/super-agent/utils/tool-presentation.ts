import {
  formatAiToolArgumentsSummary,
  getAiToolPresentation,
  toStableToolLabel,
  type AiToolPresentation,
} from "@/lib/ai-tool-presentation"

export type SuperAgentToolPresentation = AiToolPresentation

type DelegateTaskShape = {
  context?: string | null
  expected_output?: string | null
  objective?: string | null
}

type DelegateTaskResultPayload = {
  result?: {
    error?: string | null
    objective?: string | null
    status?: string | null
    summary?: string | null
  } | null
  status?: string | null
  worker_timeout_seconds?: number | null
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)

const normalizeQuotedString = (value: string): string =>
  value
    .replace(/\\'/g, "'")
    .replace(/\\"/g, "\"")
    .replace(/\\n/g, "\n")
    .trim()

const truncateText = (value: string, maxLength = 160): string =>
  value.length <= maxLength ? value : `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`

const parseLooseObjectString = (value: string): Record<string, unknown> | null => {
  const normalized = value
    .trim()
    .replace(/\bNone\b/g, "null")
    .replace(/\bTrue\b/g, "true")
    .replace(/\bFalse\b/g, "false")
    .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, group: string) => `"${group.replace(/"/g, '\\"')}"`)

  try {
    const parsed = JSON.parse(normalized)
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

const extractStringField = (source: string, field: string): string | null => {
  const quotedPatterns = [
    new RegExp(`["']${field}["']\\s*:\\s*"([^"]*)"`, "i"),
    new RegExp(`["']${field}["']\\s*:\\s*'([^']*)'`, "i"),
  ]

  for (const pattern of quotedPatterns) {
    const match = source.match(pattern)
    if (match?.[1]) {
      return normalizeQuotedString(match[1])
    }
  }

  const nullMatch = source.match(new RegExp(`["']${field}["']\\s*:\\s*(null|None)`, "i"))
  if (nullMatch) {
    return null
  }

  return null
}

const extractNumericField = (source: string, field: string): number | null => {
  const match = source.match(new RegExp(`["']${field}["']\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)`, "i"))
  if (!match?.[1]) {
    return null
  }

  const parsed = Number(match[1])
  return Number.isFinite(parsed) ? parsed : null
}

const parseDelegateTaskResultPayload = (resultText: string | null): DelegateTaskResultPayload | null => {
  if (!resultText || resultText.trim().length === 0) {
    return null
  }

  const parsedRecord = parseLooseObjectString(resultText)
  if (parsedRecord) {
    const result = isRecord(parsedRecord.result) ? parsedRecord.result : null

    return {
      result: result
        ? {
            error: typeof result.error === "string" ? result.error : null,
            objective: typeof result.objective === "string" ? result.objective : null,
            status: typeof result.status === "string" ? result.status : null,
            summary: typeof result.summary === "string" ? result.summary : null,
          }
        : null,
      status: typeof parsedRecord.status === "string" ? parsedRecord.status : null,
      worker_timeout_seconds:
        typeof parsedRecord.worker_timeout_seconds === "number"
          ? parsedRecord.worker_timeout_seconds
          : null,
    }
  }

  return {
    result: {
      error: extractStringField(resultText, "error"),
      objective: extractStringField(resultText, "objective"),
      status: extractStringField(resultText, "status"),
      summary: extractStringField(resultText, "summary"),
    },
    status: extractStringField(resultText, "status"),
    worker_timeout_seconds: extractNumericField(resultText, "worker_timeout_seconds"),
  }
}

const getDelegateTaskShape = (argumentsValue: Record<string, unknown>): DelegateTaskShape | null => {
  const task = isRecord(argumentsValue.task) ? argumentsValue.task : null

  if (!task) {
    return null
  }

  return {
    context: typeof task.context === "string" ? task.context : null,
    expected_output: typeof task.expected_output === "string" ? task.expected_output : null,
    objective: typeof task.objective === "string" ? task.objective : null,
  }
}

export const getSuperAgentToolPresentation = (toolName: string): SuperAgentToolPresentation =>
  getAiToolPresentation(toolName)

export const formatSuperAgentToolArgumentsSummary = (
  toolName: string,
  argumentsValue: Record<string, unknown>,
): string | null => formatAiToolArgumentsSummary(toolName, argumentsValue)

export const formatSuperAgentToolStepSummary = (
  toolName: string,
  argumentsValue: Record<string, unknown>,
  resultText: string | null,
): string | null => {
  if (toolName !== "delegate_tasks") {
    return formatSuperAgentToolArgumentsSummary(toolName, argumentsValue)
  }

  const task = getDelegateTaskShape(argumentsValue)
  const parsedResult = parseDelegateTaskResultPayload(resultText)
  const result = parsedResult?.result ?? null

  if (result?.error) {
    return result.error
  }

  if (result?.status === "timeout") {
    const timeout = parsedResult?.worker_timeout_seconds
    return timeout ? `Worker timed out after ${timeout}s.` : "Worker timed out."
  }

  return (
    result?.objective ??
    task?.objective ??
    (result?.status && result.status !== "completed" && resultText?.trim()
      ? truncateText(resultText.trim())
      : null) ??
    formatSuperAgentToolArgumentsSummary(toolName, argumentsValue)
  )
}

export { toStableToolLabel }
