import { AlertCircle, BookmarkPlus, Loader2, Plus, RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  useAddStockWatchlistItem,
  useCreateStockWatchlist,
  useStockWatchlists,
} from "@/features/stock-watchlists/hooks"
import { normalizeStockWatchlistId } from "@/features/stock-watchlists/types"
import {
  formatStockWatchlistDateTime,
  getStockWatchlistApiErrorMessage,
  getStockWatchlistApiStatus,
} from "@/features/stock-watchlists/stock-watchlists.utils"

type StockAddToWatchlistDialogProps = {
  onOpenChange: (open: boolean) => void
  open: boolean
  symbol: string | null
}

export const StockAddToWatchlistDialog = ({
  onOpenChange,
  open,
  symbol,
}: StockAddToWatchlistDialogProps) => {
  const watchlistsQuery = useStockWatchlists()
  const createWatchlistMutation = useCreateStockWatchlist()
  const addWatchlistItemMutation = useAddStockWatchlistItem()
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null)
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const [createWatchlistName, setCreateWatchlistName] = useState("")
  const [createWatchlistError, setCreateWatchlistError] = useState<string | null>(null)

  const normalizedSelectedWatchlistId = normalizeStockWatchlistId(selectedWatchlistId)
  const effectiveSelectedWatchlistId = useMemo(() => {
    const hasSelectedWatchlist = watchlistsQuery.items.some(
      (watchlist) => watchlist.id === normalizedSelectedWatchlistId,
    )

    if (hasSelectedWatchlist) {
      return normalizedSelectedWatchlistId
    }

    return watchlistsQuery.items[0]?.id ?? null
  }, [normalizedSelectedWatchlistId, watchlistsQuery.items])

  const handleDialogOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)

    if (!nextOpen) {
      setSelectedWatchlistId(null)
      setSelectionError(null)
      setCreateWatchlistError(null)
      setCreateWatchlistName("")
    }
  }

  const handleAddToExistingWatchlist = async () => {
    const trimmedSymbol = symbol?.trim()

    if (!trimmedSymbol || !effectiveSelectedWatchlistId) {
      setSelectionError("Select a watchlist before adding this symbol.")
      return
    }

    setSelectionError(null)

    try {
      await addWatchlistItemMutation.mutateAsync({
        watchlistId: effectiveSelectedWatchlistId,
        payload: {
          symbol: trimmedSymbol,
        },
      })

      handleDialogOpenChange(false)
      toast.success(`Added ${trimmedSymbol.toUpperCase()} to the selected watchlist.`)
    } catch (error) {
      const errorStatus = getStockWatchlistApiStatus(error)
      const errorMessage = getStockWatchlistApiErrorMessage(error)

      if (errorStatus === 400 || errorStatus === 404 || errorStatus === 409) {
        setSelectionError(errorMessage)
        return
      }

      toast.error(errorMessage)
    }
  }

  const handleCreateWatchlistAndAdd = async () => {
    const trimmedName = createWatchlistName.trim()
    const trimmedSymbol = symbol?.trim()

    if (!trimmedName) {
      setCreateWatchlistError("Name is required.")
      return
    }

    if (!trimmedSymbol) {
      setCreateWatchlistError("Symbol is required before creating a watchlist.")
      return
    }

    setCreateWatchlistError(null)
    setSelectionError(null)

    let createdWatchlistId: string

    try {
      const createdWatchlist = await createWatchlistMutation.mutateAsync({
        name: trimmedName,
      })

      createdWatchlistId = createdWatchlist.id
      setSelectedWatchlistId(createdWatchlist.id)
    } catch (error) {
      const errorStatus = getStockWatchlistApiStatus(error)
      const errorMessage = getStockWatchlistApiErrorMessage(error)

      if (errorStatus === 400 || errorStatus === 409) {
        setCreateWatchlistError(errorMessage)
        return
      }

      toast.error(errorMessage)
      return
    }

    try {
      await addWatchlistItemMutation.mutateAsync({
        watchlistId: createdWatchlistId,
        payload: {
          symbol: trimmedSymbol,
        },
      })

      handleDialogOpenChange(false)
      toast.success(`Created a watchlist and added ${trimmedSymbol.toUpperCase()}.`)
    } catch (error) {
      const errorStatus = getStockWatchlistApiStatus(error)
      const errorMessage = getStockWatchlistApiErrorMessage(error)

      if (errorStatus === 400 || errorStatus === 404 || errorStatus === 409) {
        setSelectionError(errorMessage)
        return
      }

      toast.error(errorMessage)
    }
  }

  const isPending = createWatchlistMutation.isPending || addWatchlistItemMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to Watchlist</DialogTitle>
          <DialogDescription>
            Save <span className="font-medium text-foreground">{symbol?.trim() || "--"}</span> to
            one research watchlist.
          </DialogDescription>
        </DialogHeader>

        {watchlistsQuery.isLoading ? (
          <div className="space-y-3 py-2">
            <div className="h-12 animate-pulse rounded-xl bg-accent" />
            <div className="h-12 animate-pulse rounded-xl bg-accent" />
            <div className="h-12 animate-pulse rounded-xl bg-accent" />
          </div>
        ) : null}

        {!watchlistsQuery.isLoading && watchlistsQuery.isError ? (
          <Empty className="border-destructive/30 bg-destructive/5">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle className="size-5 text-destructive" />
              </EmptyMedia>
              <EmptyTitle>Unable to load watchlists</EmptyTitle>
              <EmptyDescription>
                Retry the watchlist request without leaving the current surface.
              </EmptyDescription>
            </EmptyHeader>
            <Button type="button" variant="outline" onClick={() => void watchlistsQuery.refetch()}>
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </Empty>
        ) : null}

        {!watchlistsQuery.isLoading &&
        !watchlistsQuery.isError &&
        watchlistsQuery.items.length === 0 ? (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              void handleCreateWatchlistAndAdd()
            }}
          >
            <Empty className="border-border/60 bg-background/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookmarkPlus className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No watchlists yet</EmptyTitle>
                <EmptyDescription>
                  Create a watchlist first, then add this symbol in the same step.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>

            <Field>
              <FieldLabel htmlFor="shared-stock-watchlist-name">Watchlist name</FieldLabel>
              <FieldContent>
                <Input
                  id="shared-stock-watchlist-name"
                  value={createWatchlistName}
                  onChange={(event) => setCreateWatchlistName(event.target.value)}
                  placeholder="Research Ideas"
                  maxLength={255}
                  aria-invalid={createWatchlistError ? "true" : undefined}
                  autoFocus
                />
                <FieldDescription>
                  A new watchlist will be created in the current organization before saving the
                  symbol.
                </FieldDescription>
                <FieldError>{createWatchlistError}</FieldError>
                <FieldError>{selectionError}</FieldError>
              </FieldContent>
            </Field>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => handleDialogOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Create Watchlist and Add
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {!watchlistsQuery.isLoading &&
        !watchlistsQuery.isError &&
        watchlistsQuery.items.length > 0 ? (
          <>
            <ScrollArea className="max-h-72">
              <div className="space-y-2 pr-3">
                {watchlistsQuery.items.map((watchlist) => {
                  const isSelected = watchlist.id === effectiveSelectedWatchlistId

                  return (
                    <button
                      key={watchlist.id}
                      type="button"
                      onClick={() => {
                        setSelectedWatchlistId(watchlist.id)
                        setSelectionError(null)
                      }}
                      className={
                        isSelected
                          ? "flex w-full flex-col items-start gap-1 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-3 py-3 text-left"
                          : "flex w-full flex-col items-start gap-1 rounded-xl border border-border/60 bg-background/20 px-3 py-3 text-left transition-colors hover:border-border hover:bg-background/40"
                      }
                    >
                      <span className="text-sm font-medium text-foreground">{watchlist.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Updated {formatStockWatchlistDateTime(watchlist.updated_at)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>

            {selectionError ? (
              <div className="text-sm text-destructive" role="alert">
                {selectionError}
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => handleDialogOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="button" disabled={isPending} onClick={() => void handleAddToExistingWatchlist()}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <BookmarkPlus className="size-4" />}
                Add to Watchlist
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
