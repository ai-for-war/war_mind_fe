import { Trash2 } from "lucide-react"

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
import { formatStockWatchlistValue } from "@/features/stock-watchlists/stock-watchlists.utils"

type StockWatchlistRemoveItemDialogProps = {
  isPending?: boolean
  onConfirmRemove: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  symbol: string | null
  watchlistName: string | null
}

export const StockWatchlistRemoveItemDialog = ({
  isPending = false,
  onConfirmRemove,
  onOpenChange,
  open,
  symbol,
  watchlistName,
}: StockWatchlistRemoveItemDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 className="size-8" />
          </AlertDialogMedia>
          <AlertDialogTitle>Remove symbol?</AlertDialogTitle>
          <AlertDialogDescription>
            Remove <span className="font-medium text-foreground">{formatStockWatchlistValue(symbol)}</span>
            {watchlistName ? (
              <>
                {" "}
                from <span className="font-medium text-foreground">{watchlistName}</span>
              </>
            ) : null}
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              onConfirmRemove()
            }}
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
