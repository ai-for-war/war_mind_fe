import { AlertTriangle } from "lucide-react"

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

type StockWatchlistDeleteDialogProps = {
  isPending?: boolean
  onConfirmDelete: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  watchlistName: string
}

export const StockWatchlistDeleteDialog = ({
  isPending = false,
  onConfirmDelete,
  onOpenChange,
  open,
  watchlistName,
}: StockWatchlistDeleteDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <AlertTriangle className="size-8" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete watchlist?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{watchlistName}</span> and its saved
            symbols will be removed for the current organization.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              onConfirmDelete()
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
