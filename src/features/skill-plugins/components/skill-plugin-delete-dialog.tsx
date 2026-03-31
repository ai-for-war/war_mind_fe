import { Loader2, ShieldAlert, Trash2 } from "lucide-react"

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

export const SkillPluginDeleteDialog = ({
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
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Delete skill
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
