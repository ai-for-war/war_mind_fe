import type {
  MapSkillPluginUpdateRequestParams,
  UpdateSkillPluginRequest,
} from "@/features/skill-plugins/types"

const normalizeAllowedToolNames = (toolNames: string[]) => {
  const seenToolNames = new Set<string>()

  return toolNames.reduce<string[]>((accumulator, toolName) => {
    const normalizedToolName = toolName.trim()

    if (!normalizedToolName || seenToolNames.has(normalizedToolName)) {
      return accumulator
    }

    seenToolNames.add(normalizedToolName)
    accumulator.push(normalizedToolName)

    return accumulator
  }, [])
}

const areToolSelectionsEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false
  }

  return left.every((toolName, index) => toolName === right[index])
}

export const mapSkillPluginUpdateRequest = ({
  currentValues,
  initialValues,
}: MapSkillPluginUpdateRequestParams): UpdateSkillPluginRequest => {
  const request: UpdateSkillPluginRequest = {}

  if (currentValues.name !== initialValues.name) {
    request.name = currentValues.name
  }

  if (currentValues.description !== initialValues.description) {
    request.description = currentValues.description
  }

  if (currentValues.activation_prompt !== initialValues.activation_prompt) {
    request.activation_prompt = currentValues.activation_prompt
  }

  const normalizedInitialTools = normalizeAllowedToolNames(
    initialValues.allowed_tool_names,
  )
  const normalizedCurrentTools = normalizeAllowedToolNames(
    currentValues.allowed_tool_names,
  )

  if (!areToolSelectionsEqual(normalizedInitialTools, normalizedCurrentTools)) {
    request.allowed_tool_names = normalizedCurrentTools
  }

  return request
}
