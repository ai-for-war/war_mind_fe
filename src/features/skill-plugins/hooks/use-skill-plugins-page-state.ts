import { useState } from "react"

import type {
  SkillPluginDialogType,
  SkillPluginStatusFilter,
} from "@/features/skill-plugins/types"

const DEFAULT_STATUS_FILTER: SkillPluginStatusFilter = "all"

export const useSkillPluginsPageState = () => {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [activeDialog, setActiveDialog] = useState<SkillPluginDialogType | null>(
    null,
  )
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<SkillPluginStatusFilter>(DEFAULT_STATUS_FILTER)

  const closeDialog = () => {
    setActiveDialog(null)
  }

  const clearSelection = () => {
    setSelectedSkillId(null)
    setActiveDialog(null)
  }

  const openCreateDialog = () => {
    setSelectedSkillId(null)
    setActiveDialog("create")
  }

  const openDetailDialog = (skillId: string) => {
    setSelectedSkillId(skillId)
    setActiveDialog("detail")
  }

  const openEditDialog = (skillId: string) => {
    setSelectedSkillId(skillId)
    setActiveDialog("edit")
  }

  const openDeleteDialog = (skillId: string) => {
    setSelectedSkillId(skillId)
    setActiveDialog("delete")
  }

  const resetFilters = () => {
    setSearchText("")
    setStatusFilter(DEFAULT_STATUS_FILTER)
  }

  return {
    activeDialog,
    clearSelection,
    closeDialog,
    openCreateDialog,
    openDeleteDialog,
    openDetailDialog,
    openEditDialog,
    resetFilters,
    searchText,
    selectedSkillId,
    setSearchText,
    setStatusFilter,
    statusFilter,
  }
}
