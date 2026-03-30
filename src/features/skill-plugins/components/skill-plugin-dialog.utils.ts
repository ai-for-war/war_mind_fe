import { isAxiosError } from "axios"

import type {
  SkillPluginDetail,
  SkillPluginFormValues,
  SkillPluginToolCatalogItem,
} from "@/features/skill-plugins/types"
import type { ApiErrorResponse } from "@/types/api"

export const EMPTY_SKILL_PLUGIN_FORM_VALUES: SkillPluginFormValues = {
  name: "",
  description: "",
  activation_prompt: "",
  allowed_tool_names: [],
}

export const getApiErrorMessage = (error: unknown) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const detail = error.response?.data?.detail

    if (typeof detail === "string") {
      return detail
    }

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(", ")
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong while processing the skill plugin request."
}

export const buildSkillPluginFormValues = (
  skillDetail?: SkillPluginDetail,
): SkillPluginFormValues => {
  if (!skillDetail) {
    return EMPTY_SKILL_PLUGIN_FORM_VALUES
  }

  return {
    name: skillDetail.name,
    description: skillDetail.description,
    activation_prompt: skillDetail.activation_prompt,
    allowed_tool_names: skillDetail.allowed_tool_names,
  }
}

export const groupToolCatalogItems = (
  toolCatalogItems: SkillPluginToolCatalogItem[],
) => {
  return toolCatalogItems.reduce<Record<string, SkillPluginToolCatalogItem[]>>(
    (groups, toolItem) => {
      const category = toolItem.category || "other"

      if (!groups[category]) {
        groups[category] = []
      }

      groups[category].push(toolItem)

      return groups
    },
    {},
  )
}
