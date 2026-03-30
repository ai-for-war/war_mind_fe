import {
  AlertCircle,
  Loader2,
  PencilLine,
  Power,
  Trash2,
} from "lucide-react"

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { SkillPluginStatusBadge } from "@/features/skill-plugins/components/skill-plugin-status-badge"
import type { SkillPluginDetail } from "@/features/skill-plugins/types"

export const SkillPluginDetailDialog = ({
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

                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
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

                  <div className="space-y-4 rounded-xl border border-border/60 bg-card/70 p-5 lg:sticky lg:top-0">
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
