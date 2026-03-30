import { useMemo, useState } from "react"
import { isAxiosError } from "axios"
import {
  AlertCircle,
  Loader2,
  PencilLine,
  Power,
  ShieldAlert,
  Trash2,
  Wrench,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  mapSkillPluginUpdateRequest,
} from "@/features/skill-plugins/api"
import { SkillPluginStatusBadge } from "@/features/skill-plugins/components/skill-plugin-status-badge"
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
  SkillPluginDetail,
  SkillPluginDialogType,
  SkillPluginFormValues,
  SkillPluginToolCatalogItem,
} from "@/features/skill-plugins/types"
import type { ApiErrorResponse } from "@/types/api"

const EMPTY_SKILL_PLUGIN_FORM_VALUES: SkillPluginFormValues = {
  name: "",
  description: "",
  activation_prompt: "",
  allowed_tool_names: [],
}

const getApiErrorMessage = (error: unknown) => {
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

const buildSkillPluginFormValues = (
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

const groupToolCatalogItems = (toolCatalogItems: SkillPluginToolCatalogItem[]) => {
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

const SkillPluginDetailDialog = ({
  actionError,
  detailError,
  detailLoading,
  onDelete,
  onEdit,
  onEnableToggle,
  onOpenChange,
  pendingEnablement,
  skillDetail,
}: {
  actionError: string | null
  detailError: string | null
  detailLoading: boolean
  onDelete: () => void
  onEdit: () => void
  onEnableToggle: () => void
  onOpenChange: (open: boolean) => void
  pendingEnablement: boolean
  skillDetail?: SkillPluginDetail
}) => {
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Skill Details</DialogTitle>
          <DialogDescription>
            Inspect the selected skill, then edit content, toggle enablement, or
            permanently delete it without leaving the list page.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-5">
            {detailLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading selected skill details...
              </div>
            ) : null}

            {detailError ? (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Failed to load selected skill</AlertTitle>
                <AlertDescription>{detailError}</AlertDescription>
              </Alert>
            ) : null}

            {actionError ? (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Skill action failed</AlertTitle>
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            ) : null}

            {skillDetail ? (
              <>
                <div className="rounded-xl border border-border/60 bg-card/70 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="text-2xl font-semibold text-foreground">
                        {skillDetail.name}
                      </p>
                      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        {skillDetail.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <SkillPluginStatusBadge isEnabled={skillDetail.is_enabled} />
                      <Badge variant="secondary">v{skillDetail.version}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                  <div className="space-y-4 rounded-xl border border-border/60 bg-card/70 p-5">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Activation Prompt
                      </p>
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
                        {skillDetail.activation_prompt}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl border border-border/60 bg-card/70 p-5">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Allowed Tools
                      </p>
                      {skillDetail.allowed_tool_names.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skillDetail.allowed_tool_names.map((toolName) => (
                            <Badge
                              key={toolName}
                              variant="outline"
                              className="font-normal"
                            >
                              {toolName}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No tools are currently assigned to this skill.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 border-t border-border/60 pt-4">
                      <p className="text-sm font-medium text-foreground">
                        Metadata
                      </p>
                      <dl className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-start justify-between gap-4">
                          <dt>Skill ID</dt>
                          <dd className="text-right font-medium text-foreground">
                            {skillDetail.skill_id}
                          </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <dt>Updated</dt>
                          <dd className="text-right">{skillDetail.updated_at}</dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <dt>Created</dt>
                          <dd className="text-right">{skillDetail.created_at}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-between">
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onDelete}>
              <Trash2 className="size-4" />
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onEnableToggle}
              disabled={!skillDetail || pendingEnablement}
            >
              {pendingEnablement ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Power className="size-4" />
              )}
              {skillDetail?.is_enabled ? "Disable" : "Enable"}
            </Button>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="button" onClick={onEdit} disabled={!skillDetail}>
              <PencilLine className="size-4" />
              Edit Skill
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const SkillPluginFormDialog = ({
  detailLoading,
  initialValues,
  mode,
  onOpenChange,
  onSubmit,
  submitting,
  submitLabel,
  toolCatalogError,
  toolCatalogItems,
  toolCatalogLoading,
}: {
  detailLoading: boolean
  initialValues: SkillPluginFormValues
  mode: "create" | "edit"
  onOpenChange: (open: boolean) => void
  onSubmit: (values: SkillPluginFormValues) => Promise<string | null>
  submitting: boolean
  submitLabel: string
  toolCatalogError: string | null
  toolCatalogItems: SkillPluginToolCatalogItem[]
  toolCatalogLoading: boolean
}) => {
  const groupedToolCatalogItems = useMemo(
    () => groupToolCatalogItems(toolCatalogItems),
    [toolCatalogItems],
  )

  const isEditMode = mode === "edit"
  const [draftValues, setDraftValues] = useState(initialValues)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const nextError = await onSubmit(draftValues)
    setSubmitError(nextError)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Skill" : "New Skill"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the skill content and tool access for the selected lead-agent capability."
              : "Create a new lead-agent skill and choose which runtime tools it can access."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4 rounded-xl border border-border/60 bg-card/70 p-5">
              {detailLoading && isEditMode ? (
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading current skill values...
                </div>
              ) : null}

              {submitError ? (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Could not save skill</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="skill-plugin-name">Name</Label>
                <Input
                  id="skill-plugin-name"
                  value={draftValues.name}
                  onChange={(event) =>
                    setDraftValues({
                      ...draftValues,
                      name: event.target.value,
                    })
                  }
                  placeholder="Sales Research"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-plugin-description">Description</Label>
                <Textarea
                  id="skill-plugin-description"
                  value={draftValues.description}
                  onChange={(event) =>
                    setDraftValues({
                      ...draftValues,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe what this skill should help the lead agent do."
                  className="min-h-24"
                  maxLength={2000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-plugin-activation-prompt">
                  Activation Prompt
                </Label>
                <Textarea
                  id="skill-plugin-activation-prompt"
                  value={draftValues.activation_prompt}
                  onChange={(event) =>
                    setDraftValues({
                      ...draftValues,
                      activation_prompt: event.target.value,
                    })
                  }
                  placeholder="Explain when this skill should activate and how it should behave."
                  className="min-h-48"
                  maxLength={20000}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-border/60 bg-card/70 p-5">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Allowed Tools</p>
                <p className="text-sm text-muted-foreground">
                  Tool choices come from the runtime catalog exposed by the backend.
                </p>
              </div>

              {toolCatalogLoading ? (
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading available tools...
                </div>
              ) : null}

              {toolCatalogError ? (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Could not load tool catalog</AlertTitle>
                  <AlertDescription>{toolCatalogError}</AlertDescription>
                </Alert>
              ) : null}

              {!toolCatalogLoading && !toolCatalogError ? (
                <div className="space-y-4">
                  {Object.entries(groupedToolCatalogItems).map(([category, items]) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Wrench className="size-4 text-muted-foreground" />
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                          {category}
                        </p>
                      </div>

                      <ToggleGroup
                        type="multiple"
                        value={draftValues.allowed_tool_names}
                        onValueChange={(nextValue) =>
                          setDraftValues({
                            ...draftValues,
                            allowed_tool_names: nextValue,
                          })
                        }
                        variant="outline"
                        className="flex w-full flex-wrap justify-start gap-2"
                        aria-label={`Allowed tools for ${category}`}
                      >
                        {items.map((toolItem) => (
                          <ToggleGroupItem
                            key={toolItem.tool_name}
                            value={toolItem.tool_name}
                            className="h-auto min-h-16 flex-1 basis-full justify-start px-3 py-3 text-left sm:basis-[calc(50%-0.25rem)]"
                            aria-label={`Toggle ${toolItem.display_name}`}
                          >
                            <div className="min-w-0 space-y-1">
                              <p className="font-medium">{toolItem.display_name}</p>
                              <p className="text-xs leading-5 text-muted-foreground">
                                {toolItem.description}
                              </p>
                            </div>
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </div>
                  ))}

                  {toolCatalogItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No selectable tools are currently available from the runtime
                      catalog.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const SkillPluginDeleteDialog = ({
  deleting,
  onConfirmDelete,
  onOpenChange,
  skillName,
}: {
  deleting: boolean
  onConfirmDelete: () => void
  onOpenChange: (open: boolean) => void
  skillName: string
}) => {
  return (
    <AlertDialog open onOpenChange={onOpenChange}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <ShieldAlert className="size-7" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete skill permanently?</AlertDialogTitle>
          <AlertDialogDescription>
            Deleting <span className="font-medium text-foreground">{skillName}</span>{" "}
            removes the skill definition entirely. This is different from disabling
            the skill, which only turns it off for the current organization.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(event) => {
              event.preventDefault()
              void onConfirmDelete()
            }}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Delete skill
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

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

  const handleFormSubmit = async (formValues: SkillPluginFormValues) => {
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
        return
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
