import { useState } from "react"

import { mapSkillPluginUpdateRequest } from "@/features/skill-plugins/api"
import { SkillPluginDeleteDialog } from "@/features/skill-plugins/components/skill-plugin-delete-dialog"
import { SkillPluginDetailDialog } from "@/features/skill-plugins/components/skill-plugin-detail-dialog"
import {
  buildSkillPluginFormValues,
  EMPTY_SKILL_PLUGIN_FORM_VALUES,
  getApiErrorMessage,
} from "@/features/skill-plugins/components/skill-plugin-dialog.utils"
import { SkillPluginFormDialog } from "@/features/skill-plugins/components/skill-plugin-form-dialog"
import {
  useCreateSkillPlugin,
  useDeleteSkillPlugin,
  useDisableSkillPlugin,
  useEnableSkillPlugin,
  useSkillPluginDetail,
  useSkillPluginToolCatalog,
  useUpdateSkillPlugin,
} from "@/features/skill-plugins/hooks"
import type {
  CreateSkillPluginRequest,
  SkillPluginDialogType,
  SkillPluginFormValues,
} from "@/features/skill-plugins/types"

export const SkillPluginDialogShell = ({
  activeDialog,
  clearSelection,
  closeDialog,
  openDeleteDialog,
  openDetailDialog,
  openEditDialog,
  selectedSkillId,
}: {
  activeDialog: SkillPluginDialogType | null
  clearSelection: () => void
  closeDialog: () => void
  openDeleteDialog: (skillId: string) => void
  openDetailDialog: (skillId: string) => void
  openEditDialog: (skillId: string) => void
  selectedSkillId: string | null
}) => {
  const skillDetailQuery = useSkillPluginDetail(selectedSkillId ?? undefined)
  const toolCatalogQuery = useSkillPluginToolCatalog()
  const createSkillPluginMutation = useCreateSkillPlugin()
  const updateSkillPluginMutation = useUpdateSkillPlugin()
  const enableSkillPluginMutation = useEnableSkillPlugin()
  const disableSkillPluginMutation = useDisableSkillPlugin()
  const deleteSkillPluginMutation = useDeleteSkillPlugin()
  const [actionError, setActionError] = useState<string | null>(null)

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog()
    }
  }

  const handleFormSubmit = async (
    formValues: SkillPluginFormValues,
  ): Promise<string | null> => {
    const trimmedFormValues: SkillPluginFormValues = {
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      activation_prompt: formValues.activation_prompt.trim(),
      allowed_tool_names: formValues.allowed_tool_names,
    }

    if (!trimmedFormValues.name) {
      return "Name is required."
    }

    if (!trimmedFormValues.description) {
      return "Description is required."
    }

    if (!trimmedFormValues.activation_prompt) {
      return "Activation prompt is required."
    }

    setActionError(null)

    try {
      if (activeDialog === "create") {
        const createdSkill = await createSkillPluginMutation.mutateAsync(
          trimmedFormValues as CreateSkillPluginRequest,
        )

        openDetailDialog(createdSkill.skill_id)
        return null
      }

      if (activeDialog === "edit" && selectedSkillId && skillDetailQuery.data) {
        const initialValues = buildSkillPluginFormValues(skillDetailQuery.data)
        const updatePayload = mapSkillPluginUpdateRequest({
          currentValues: trimmedFormValues,
          initialValues,
        })

        if (Object.keys(updatePayload).length === 0) {
          return "No changes to save."
        }

        const updatedSkill = await updateSkillPluginMutation.mutateAsync({
          currentValues: trimmedFormValues,
          initialValues,
          skillId: selectedSkillId,
        })

        openDetailDialog(updatedSkill.skill_id)
      }
    } catch (error) {
      return getApiErrorMessage(error)
    }

    return null
  }

  const handleEnableToggle = async () => {
    if (!selectedSkillId || !skillDetailQuery.data) {
      return
    }

    setActionError(null)

    try {
      if (skillDetailQuery.data.is_enabled) {
        await disableSkillPluginMutation.mutateAsync(selectedSkillId)
      } else {
        await enableSkillPluginMutation.mutateAsync(selectedSkillId)
      }
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedSkillId) {
      return
    }

    setActionError(null)

    try {
      await deleteSkillPluginMutation.mutateAsync(selectedSkillId)
      clearSelection()
    } catch (error) {
      setActionError(getApiErrorMessage(error))
      openDetailDialog(selectedSkillId)
    }
  }

  const detailError =
    skillDetailQuery.isError && activeDialog !== "create"
      ? getApiErrorMessage(skillDetailQuery.error)
      : null
  const toolCatalogError = toolCatalogQuery.isError
    ? getApiErrorMessage(toolCatalogQuery.error)
    : null
  const enablementPending =
    enableSkillPluginMutation.isPending || disableSkillPluginMutation.isPending
  const submitPending =
    createSkillPluginMutation.isPending || updateSkillPluginMutation.isPending
  const deletePending = deleteSkillPluginMutation.isPending
  const formInitialValues =
    activeDialog === "edit"
      ? buildSkillPluginFormValues(skillDetailQuery.data)
      : EMPTY_SKILL_PLUGIN_FORM_VALUES
  const formDialogKey = `${activeDialog ?? "closed"}:${selectedSkillId ?? "new"}:${
    skillDetailQuery.data?.updated_at ?? "draft"
  }`

  if (activeDialog === "detail") {
    return (
      <SkillPluginDetailDialog
        actionError={actionError}
        detailError={detailError}
        detailLoading={skillDetailQuery.isLoading}
        onDelete={() => {
          if (selectedSkillId) {
            openDeleteDialog(selectedSkillId)
          }
        }}
        onEdit={() => {
          if (selectedSkillId) {
            openEditDialog(selectedSkillId)
          }
        }}
        onEnableToggle={() => {
          void handleEnableToggle()
        }}
        onOpenChange={handleDialogOpenChange}
        pendingEnablement={enablementPending}
        skillDetail={skillDetailQuery.data}
      />
    )
  }

  if (activeDialog === "create" || activeDialog === "edit") {
    return (
      <SkillPluginFormDialog
        key={formDialogKey}
        detailLoading={skillDetailQuery.isLoading}
        initialValues={formInitialValues}
        mode={activeDialog}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleFormSubmit}
        submitLabel={activeDialog === "create" ? "Create Skill" : "Save Changes"}
        submitting={submitPending}
        toolCatalogError={toolCatalogError}
        toolCatalogItems={toolCatalogQuery.data?.items ?? []}
        toolCatalogLoading={toolCatalogQuery.isLoading}
      />
    )
  }

  if (activeDialog === "delete") {
    return (
      <SkillPluginDeleteDialog
        deleting={deletePending}
        onConfirmDelete={() => handleDeleteConfirm()}
        onOpenChange={handleDialogOpenChange}
        skillName={skillDetailQuery.data?.name ?? "this skill"}
      />
    )
  }

  return null
}
