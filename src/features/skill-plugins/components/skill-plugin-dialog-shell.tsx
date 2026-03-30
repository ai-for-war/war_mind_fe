import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSkillPluginDetail } from "@/features/skill-plugins/hooks"

export const SkillPluginDialogShell = ({
  activeDialog,
  onOpenChange,
  selectedSkillId,
}: {
  activeDialog: "create" | "detail" | null
  onOpenChange: (open: boolean) => void
  selectedSkillId: string | null
}) => {
  const skillDetailQuery = useSkillPluginDetail(selectedSkillId ?? undefined)
  const isOpen = activeDialog === "create" || activeDialog === "detail"

  if (!isOpen) {
    return null
  }

  const isCreateDialog = activeDialog === "create"
  const dialogTitle = isCreateDialog ? "New Skill" : "Skill Details"
  const dialogDescription = isCreateDialog
    ? "The full create workflow will be completed in the next task. The route now opens a popup without leaving this page."
    : "The detail workflow is now route-local. Full detail actions and fields will be completed in the next task."

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {isCreateDialog ? (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
            Use the <span className="font-medium text-foreground">New Skill</span>{" "}
            action to stay on <code>/skill-plugins</code> while opening the create
            workflow.
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm">
            <p className="text-muted-foreground">
              Selected skill id:{" "}
              <span className="font-medium text-foreground">
                {selectedSkillId ?? "Unknown"}
              </span>
            </p>

            {skillDetailQuery.isLoading ? (
              <p className="text-muted-foreground">Loading selected skill details...</p>
            ) : null}

            {skillDetailQuery.data ? (
              <>
                <p className="font-medium text-foreground">
                  {skillDetailQuery.data.name}
                </p>
                <p className="leading-6 text-muted-foreground">
                  {skillDetailQuery.data.description}
                </p>
              </>
            ) : null}
          </div>
        )}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
