export interface AssistantToolCallMetadata {
  arguments: Record<string, unknown>
  id: string
  name: string
}

export interface NormalizedAssistantMessageMetadata {
  delegationDepth: number | null
  hasDisplayableMetadata: boolean
  loadedSkills: string[]
  model: string | null
  orchestrationMode: string | null
  skillId: string | null
  skillVersion: string | null
  subagentEnabled: boolean | null
  toolCalls: AssistantToolCallMetadata[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)

const toOptionalString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null

const toOptionalBoolean = (value: unknown): boolean | null =>
  typeof value === "boolean" ? value : null

const toOptionalNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map(item => (typeof item === "string" ? item.trim() : ""))
    .filter((item): item is string => item.length > 0)
}

const normalizeToolCall = (value: unknown): AssistantToolCallMetadata | null => {
  if (!isRecord(value)) {
    return null
  }

  const id = toOptionalString(value.id)
  const name = toOptionalString(value.name)
  const argumentsValue = isRecord(value.arguments) ? value.arguments : {}

  if (!id || !name) {
    return null
  }

  return {
    arguments: argumentsValue,
    id,
    name,
  }
}

export const normalizeAssistantMessageMetadata = (
  metadata: Record<string, unknown> | null | undefined,
): NormalizedAssistantMessageMetadata => {
  const normalizedMetadata = isRecord(metadata) ? metadata : {}
  const runtime =
    isRecord(normalizedMetadata.runtime) ? normalizedMetadata.runtime : null
  const model = toOptionalString(normalizedMetadata.model) ?? toOptionalString(runtime?.model)
  const skillId = toOptionalString(normalizedMetadata.skill_id)
  const skillVersion = toOptionalString(normalizedMetadata.skill_version)
  const loadedSkills = toStringArray(normalizedMetadata.loaded_skills)
  const subagentEnabled = toOptionalBoolean(normalizedMetadata.subagent_enabled)
  const orchestrationMode = toOptionalString(normalizedMetadata.orchestration_mode)
  const delegationDepth = toOptionalNumber(normalizedMetadata.delegation_depth)
  const toolCalls = Array.isArray(normalizedMetadata.tool_calls)
    ? normalizedMetadata.tool_calls
        .map(normalizeToolCall)
        .filter((toolCall): toolCall is AssistantToolCallMetadata => Boolean(toolCall))
    : []

  const hasDisplayableMetadata = Boolean(
    model ||
      skillId ||
      skillVersion ||
      loadedSkills.length > 0 ||
      toolCalls.length > 0 ||
      subagentEnabled !== null ||
      orchestrationMode ||
      delegationDepth !== null,
  )

  return {
    delegationDepth,
    hasDisplayableMetadata,
    loadedSkills,
    model,
    orchestrationMode,
    skillId,
    skillVersion,
    subagentEnabled,
    toolCalls,
  }
}

export const hasDisplayableAssistantMessageMetadata = (
  metadata: Record<string, unknown> | null | undefined,
): boolean => normalizeAssistantMessageMetadata(metadata).hasDisplayableMetadata
