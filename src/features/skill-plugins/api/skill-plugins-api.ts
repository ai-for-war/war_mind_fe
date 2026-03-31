import { apiClient } from "@/lib/api-client"

import type {
  CreateSkillPluginRequest,
  SkillPluginDetail,
  SkillPluginEnablementResponse,
  SkillPluginListParams,
  SkillPluginListResponse,
  SkillPluginToolCatalogResponse,
  UpdateSkillPluginRequest,
} from "@/features/skill-plugins/types"

const DEFAULT_SKILL_PLUGINS_SKIP = 0
const DEFAULT_SKILL_PLUGINS_LIMIT = 8
const SKILL_PLUGINS_API_PREFIX = "/lead-agent"

const listSkills = async (
  params?: SkillPluginListParams,
): Promise<SkillPluginListResponse> => {
  const response = await apiClient.get<SkillPluginListResponse>(
    `${SKILL_PLUGINS_API_PREFIX}/skills`,
    {
      params: {
        skip: params?.skip ?? DEFAULT_SKILL_PLUGINS_SKIP,
        limit: params?.limit ?? DEFAULT_SKILL_PLUGINS_LIMIT,
      },
    },
  )

  return response.data
}

const getSkill = async (skillId: string): Promise<SkillPluginDetail> => {
  const response = await apiClient.get<SkillPluginDetail>(
    `${SKILL_PLUGINS_API_PREFIX}/skills/${skillId}`,
  )

  return response.data
}

const createSkill = async (
  payload: CreateSkillPluginRequest,
): Promise<SkillPluginDetail> => {
  const response = await apiClient.post<SkillPluginDetail>(
    `${SKILL_PLUGINS_API_PREFIX}/skills`,
    payload,
  )

  return response.data
}

const updateSkill = async (
  skillId: string,
  payload: UpdateSkillPluginRequest,
): Promise<SkillPluginDetail> => {
  const response = await apiClient.patch<SkillPluginDetail>(
    `${SKILL_PLUGINS_API_PREFIX}/skills/${skillId}`,
    payload,
  )

  return response.data
}

const deleteSkill = async (skillId: string): Promise<void> => {
  await apiClient.delete(`${SKILL_PLUGINS_API_PREFIX}/skills/${skillId}`)
}

const enableSkill = async (
  skillId: string,
): Promise<SkillPluginEnablementResponse> => {
  const response = await apiClient.put<SkillPluginEnablementResponse>(
    `${SKILL_PLUGINS_API_PREFIX}/skills/${skillId}/enabled`,
  )

  return response.data
}

const disableSkill = async (
  skillId: string,
): Promise<SkillPluginEnablementResponse> => {
  const response = await apiClient.delete<SkillPluginEnablementResponse>(
    `${SKILL_PLUGINS_API_PREFIX}/skills/${skillId}/enabled`,
  )

  return response.data
}

const getToolCatalog = async (): Promise<SkillPluginToolCatalogResponse> => {
  const response = await apiClient.get<SkillPluginToolCatalogResponse>(
    `${SKILL_PLUGINS_API_PREFIX}/tools`,
  )

  return response.data
}

export const skillPluginsApi = {
  listSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
  enableSkill,
  disableSkill,
  getToolCatalog,
}
