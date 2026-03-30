import { useMemo, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Wrench,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { groupToolCatalogItems } from "@/features/skill-plugins/components/skill-plugin-dialog.utils"
import type {
  SkillPluginFormValues,
  SkillPluginToolCatalogItem,
} from "@/features/skill-plugins/types"

export const SkillPluginFormDialog = ({
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
  const [draftValues, setDraftValues] = useState(initialValues)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEditMode = mode === "edit"

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
          <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr] lg:items-start">
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

            <div className="space-y-4 rounded-xl border border-border/60 bg-card/70 p-5 lg:sticky lg:top-0">
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
                <ScrollArea className="max-h-[26rem] pr-3">
                  <div className="space-y-4">
                    {Object.entries(groupedToolCatalogItems).map(([category, items]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Wrench className="size-4 text-muted-foreground" />
                          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            {category}
                          </p>
                        </div>

                        <TooltipProvider delayDuration={150}>
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
                            spacing={2}
                            className="flex w-full flex-wrap justify-start gap-2"
                            aria-label={`Allowed tools for ${category}`}
                          >
                            {items.map((toolItem) => {
                              const isSelected = draftValues.allowed_tool_names.includes(
                                toolItem.tool_name,
                              )

                              return (
                                <Tooltip key={toolItem.tool_name}>
                                  <TooltipTrigger asChild>
                                    <ToggleGroupItem
                                      value={toolItem.tool_name}
                                      className={`h-auto min-h-16 flex-1 basis-full items-start justify-start px-3 py-3 text-left whitespace-normal transition-colors sm:basis-[calc(50%-0.25rem)] ${
                                        isSelected
                                          ? "border-primary bg-primary/12 text-foreground shadow-[0_0_0_1px_hsl(var(--primary))]"
                                          : "border-border/70"
                                      }`}
                                      aria-label={`Toggle ${toolItem.display_name}`}
                                    >
                                      <div className="flex min-w-0 w-full items-start justify-between gap-3">
                                        <div className="min-w-0 space-y-1">
                                          <p className="font-medium">{toolItem.display_name}</p>
                                          <p
                                            className={`truncate text-xs leading-5 ${
                                              isSelected
                                                ? "text-foreground/80"
                                                : "text-muted-foreground"
                                            }`}
                                          >
                                            {toolItem.description}
                                          </p>
                                        </div>

                                        {isSelected ? (
                                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                        ) : null}
                                      </div>
                                    </ToggleGroupItem>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    sideOffset={8}
                                    className="max-w-xs text-left leading-5"
                                  >
                                    {toolItem.description}
                                  </TooltipContent>
                                </Tooltip>
                              )
                            })}
                          </ToggleGroup>
                        </TooltipProvider>
                      </div>
                    ))}

                    {toolCatalogItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No selectable tools are currently available from the runtime
                        catalog.
                      </p>
                    ) : null}
                  </div>
                </ScrollArea>
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
