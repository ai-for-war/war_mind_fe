import {
  AlertCircle,
  FolderOpen,
  MoreHorizontal,
  Plus,
  RefreshCw,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BacktestDialog } from "@/features/backtests"
import { StockCompanyOverviewDialog } from "@/features/stocks/components"
import type { StockListItem } from "@/features/stocks/types"
import {
  StockWatchlistAddSymbolDialog,
  StockWatchlistDeleteDialog,
  StockWatchlistItemsTable,
  StockWatchlistItemsTableSkeleton,
  StockWatchlistNameDialog,
  StockWatchlistRemoveItemDialog,
  StockWatchlistsDirectoryRail,
} from "@/features/stock-watchlists/components"
import {
  useAddStockWatchlistItem,
  useCreateStockWatchlist,
  useDeleteStockWatchlist,
  useRemoveStockWatchlistItem,
  useRenameStockWatchlist,
  useStockWatchlistsWorkspace,
} from "@/features/stock-watchlists/hooks"
import type { StockWatchlistItemResponse } from "@/features/stock-watchlists/types"
import {
  formatStockWatchlistDateTime,
  getStockWatchlistApiErrorMessage,
  getStockWatchlistApiStatus,
  mapWatchlistStockMetadataToStockListItem,
} from "@/features/stock-watchlists/stock-watchlists.utils"

const WatchlistsRouteSkeleton = () => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <div className="h-5 w-28 animate-pulse rounded-md bg-accent" />
        <div className="h-8 w-48 animate-pulse rounded-md bg-accent" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-accent" />
      </div>
      <div className="h-9 w-36 animate-pulse rounded-md bg-accent" />
    </div>
    <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="h-[32rem] animate-pulse rounded-2xl bg-accent" />
      <div className="h-[32rem] animate-pulse rounded-2xl bg-accent" />
    </div>
  </div>
)

export const StockWatchlistsPage = () => {
  const {
    activeWatchlist,
    activeWatchlistId,
    activeWatchlistItemsQuery,
    setActiveWatchlistId,
    watchlistsQuery,
  } = useStockWatchlistsWorkspace()
  const createWatchlistMutation = useCreateStockWatchlist()
  const renameWatchlistMutation = useRenameStockWatchlist()
  const deleteWatchlistMutation = useDeleteStockWatchlist()
  const addStockWatchlistItemMutation = useAddStockWatchlistItem()
  const removeStockWatchlistItemMutation = useRemoveStockWatchlistItem()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createWatchlistName, setCreateWatchlistName] = useState("")
  const [createWatchlistError, setCreateWatchlistError] = useState<string | null>(null)

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [renameWatchlistName, setRenameWatchlistName] = useState("")
  const [renameWatchlistError, setRenameWatchlistError] = useState<string | null>(null)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [isAddSymbolDialogOpen, setIsAddSymbolDialogOpen] = useState(false)
  const [symbolValue, setSymbolValue] = useState("")
  const [addSymbolError, setAddSymbolError] = useState<string | null>(null)

  const [removeItemTarget, setRemoveItemTarget] = useState<StockWatchlistItemResponse | null>(
    null,
  )

  const [isCompanyOverviewOpen, setIsCompanyOverviewOpen] = useState(false)
  const [backtestDialogSymbol, setBacktestDialogSymbol] = useState<string | null>(null)
  const [selectedStock, setSelectedStock] = useState<StockListItem | null>(null)

  const openCreateDialog = () => {
    setCreateWatchlistError(null)
    setCreateWatchlistName("")
    setIsCreateDialogOpen(true)
  }

  const openRenameDialog = () => {
    if (!activeWatchlist) {
      return
    }

    setRenameWatchlistError(null)
    setRenameWatchlistName(activeWatchlist.name)
    setIsRenameDialogOpen(true)
  }

  const openDeleteDialog = () => {
    if (!activeWatchlist) {
      return
    }

    setIsDeleteDialogOpen(true)
  }

  const openAddSymbolDialog = () => {
    if (!activeWatchlist) {
      return
    }

    setAddSymbolError(null)
    setSymbolValue("")
    setIsAddSymbolDialogOpen(true)
  }

  const handleAddSymbolInputChange = (value: string) => {
    setAddSymbolError(null)
    setSymbolValue(value)
  }

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open)

    if (!open) {
      setCreateWatchlistError(null)
      setCreateWatchlistName("")
    }
  }

  const handleRenameDialogOpenChange = (open: boolean) => {
    setIsRenameDialogOpen(open)

    if (!open) {
      setRenameWatchlistError(null)
    }
  }

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setIsDeleteDialogOpen(open)
  }

  const handleAddSymbolDialogOpenChange = (open: boolean) => {
    setIsAddSymbolDialogOpen(open)

    if (!open) {
      setAddSymbolError(null)
      setSymbolValue("")
    }
  }

  const handleRemoveItemDialogOpenChange = (open: boolean) => {
    if (!open) {
      setRemoveItemTarget(null)
    }
  }

  const handleCompanyOverviewOpenChange = (open: boolean) => {
    setIsCompanyOverviewOpen(open)

    if (!open) {
      setSelectedStock(null)
    }
  }

  const handleBacktestDialogOpenChange = (open: boolean) => {
    if (open) {
      return
    }

    setBacktestDialogSymbol(null)
  }

  const handleCreateWatchlistSubmit = async () => {
    const trimmedName = createWatchlistName.trim()

    if (!trimmedName) {
      setCreateWatchlistError("Name is required.")
      return
    }

    setCreateWatchlistError(null)

    try {
      const createdWatchlist = await createWatchlistMutation.mutateAsync({
        name: trimmedName,
      })

      setActiveWatchlistId(createdWatchlist.id)
      setIsCreateDialogOpen(false)
      setCreateWatchlistName("")
      toast.success(`Created watchlist ${createdWatchlist.name}.`)
    } catch (error) {
      const errorStatus = getStockWatchlistApiStatus(error)
      const errorMessage = getStockWatchlistApiErrorMessage(error)

      if (errorStatus === 400 || errorStatus === 409) {
        setCreateWatchlistError(errorMessage)
        return
      }

      toast.error(errorMessage)
    }
  }

  const handleRenameWatchlistSubmit = async () => {
    if (!activeWatchlist) {
      return
    }

    const trimmedName = renameWatchlistName.trim()

    if (!trimmedName) {
      setRenameWatchlistError("Name is required.")
      return
    }

    setRenameWatchlistError(null)

    try {
      const updatedWatchlist = await renameWatchlistMutation.mutateAsync({
        watchlistId: activeWatchlist.id,
        payload: {
          name: trimmedName,
        },
      })

      setIsRenameDialogOpen(false)
      toast.success(`Renamed watchlist to ${updatedWatchlist.name}.`)
    } catch (error) {
      const errorStatus = getStockWatchlistApiStatus(error)
      const errorMessage = getStockWatchlistApiErrorMessage(error)

      if (errorStatus === 400 || errorStatus === 409) {
        setRenameWatchlistError(errorMessage)
        return
      }

      toast.error(errorMessage)
    }
  }

  const handleDeleteWatchlistConfirm = async () => {
    if (!activeWatchlist) {
      return
    }

    try {
      await deleteWatchlistMutation.mutateAsync({
        watchlistId: activeWatchlist.id,
      })

      setIsDeleteDialogOpen(false)
      toast.success(`Deleted watchlist ${activeWatchlist.name}.`)
    } catch (error) {
      toast.error(getStockWatchlistApiErrorMessage(error))
    }
  }

  const handleAddSymbolSubmit = async () => {
    if (!activeWatchlist) {
      return
    }

    const trimmedSymbol = symbolValue.trim()

    if (!trimmedSymbol) {
      setAddSymbolError("Symbol is required.")
      return
    }

    setAddSymbolError(null)

    try {
      const createdItem = await addStockWatchlistItemMutation.mutateAsync({
        watchlistId: activeWatchlist.id,
        payload: {
          symbol: trimmedSymbol,
        },
      })

      setIsAddSymbolDialogOpen(false)
      setSymbolValue("")
      toast.success(`Added ${createdItem.symbol} to ${activeWatchlist.name}.`)
    } catch (error) {
      const errorStatus = getStockWatchlistApiStatus(error)
      const errorMessage = getStockWatchlistApiErrorMessage(error)

      if (errorStatus === 400 || errorStatus === 404 || errorStatus === 409) {
        setAddSymbolError(errorMessage)
        return
      }

      toast.error(errorMessage)
    }
  }

  const handleRemoveItemConfirm = async () => {
    if (!activeWatchlist || !removeItemTarget) {
      return
    }

    try {
      await removeStockWatchlistItemMutation.mutateAsync({
        watchlistId: activeWatchlist.id,
        symbol: removeItemTarget.symbol,
      })

      setRemoveItemTarget(null)
      toast.success(`Removed ${removeItemTarget.symbol} from ${activeWatchlist.name}.`)
    } catch (error) {
      toast.error(getStockWatchlistApiErrorMessage(error))
    }
  }

  const handleWatchlistItemSelect = (item: StockWatchlistItemResponse) => {
    if (!item.stock) {
      return
    }

    setSelectedStock(mapWatchlistStockMetadataToStockListItem(item.stock))
    setIsCompanyOverviewOpen(true)
  }

  const handleWatchlistItemBacktest = (item: StockWatchlistItemResponse) => {
    setBacktestDialogSymbol(item.symbol)
  }

  const handleOpenBacktestFromCompany = (item: StockListItem) => {
    setIsCompanyOverviewOpen(false)
    setSelectedStock(null)
    setBacktestDialogSymbol(item.symbol)
  }

  if (watchlistsQuery.isLoading) {
    return <WatchlistsRouteSkeleton />
  }

  if (watchlistsQuery.isError) {
    return (
      <section className="flex h-full min-h-0 min-w-0 max-h-[calc(100dvh-6rem)] flex-1 flex-col gap-4 overflow-hidden">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
              Markets
            </Badge>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Watchlists</h1>
              <p className="text-sm text-muted-foreground">
                Organize symbols into durable research lists scoped to the active organization.
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => void watchlistsQuery.refetch()}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </header>

        <div className="flex flex-1 items-center justify-center rounded-2xl border border-border/60 bg-background/40 p-6">
          <Empty className="border-destructive/30 bg-destructive/5">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle className="size-5 text-destructive" />
              </EmptyMedia>
              <EmptyTitle>Unable to load watchlists</EmptyTitle>
              <EmptyDescription>
                Keep the route open and retry once the watchlist service is reachable again.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>

        <StockWatchlistNameDialog
          open={isCreateDialogOpen}
          onOpenChange={handleCreateDialogOpenChange}
          onSubmit={handleCreateWatchlistSubmit}
          nameValue={createWatchlistName}
          onNameChange={setCreateWatchlistName}
          error={createWatchlistError}
          isPending={createWatchlistMutation.isPending}
          submitLabel="Create Watchlist"
          title="New Watchlist"
          description="Create a named research list for the current organization."
        />
      </section>
    )
  }

  if (watchlistsQuery.items.length === 0) {
    return (
      <section className="flex h-full min-h-0 min-w-0 max-h-[calc(100dvh-6rem)] flex-1 flex-col gap-4 overflow-hidden">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
                Markets
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-secondary/70">
                0 watchlists
              </Badge>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Watchlists</h1>
              <p className="text-sm text-muted-foreground">
                Create and maintain symbol lists for research without leaving the stocks workspace.
              </p>
            </div>
          </div>
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="size-4" />
            New Watchlist
          </Button>
        </header>

        <div className="flex flex-1 items-center justify-center rounded-2xl border border-border/60 bg-background/40 p-6">
          <Empty className="border-border/60 bg-background/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderOpen className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No watchlists yet</EmptyTitle>
              <EmptyDescription>
                Create your first watchlist to start saving symbols for research.
              </EmptyDescription>
            </EmptyHeader>
            <Button type="button" onClick={openCreateDialog}>
              <Plus className="size-4" />
              Create Watchlist
            </Button>
          </Empty>
        </div>

        <StockWatchlistNameDialog
          open={isCreateDialogOpen}
          onOpenChange={handleCreateDialogOpenChange}
          onSubmit={handleCreateWatchlistSubmit}
          nameValue={createWatchlistName}
          onNameChange={setCreateWatchlistName}
          error={createWatchlistError}
          isPending={createWatchlistMutation.isPending}
          submitLabel="Create Watchlist"
          title="New Watchlist"
          description="Create a named research list for the current organization."
        />
      </section>
    )
  }

  return (
    <>
      <section className="flex h-full min-h-0 min-w-0 max-h-[calc(100dvh-6rem)] flex-1 flex-col gap-4 overflow-hidden">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
                Markets
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-secondary/70">
                {watchlistsQuery.items.length} watchlists
              </Badge>
              {activeWatchlist ? (
                <Badge variant="outline" className="rounded-full border-border/60">
                  Updated {formatStockWatchlistDateTime(activeWatchlist.updated_at)}
                </Badge>
              ) : null}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Watchlists</h1>
              <p className="text-sm text-muted-foreground">
                Curate research-ready symbol lists and drill into the latest stock catalog metadata.
              </p>
            </div>
          </div>

          <Button type="button" onClick={openCreateDialog}>
            <Plus className="size-4" />
            New Watchlist
          </Button>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[18rem_minmax(0,1fr)]">
          <StockWatchlistsDirectoryRail
            activeWatchlistId={activeWatchlistId}
            isCreatePending={createWatchlistMutation.isPending}
            onCreateWatchlist={openCreateDialog}
            onSelectWatchlist={setActiveWatchlistId}
            watchlists={watchlistsQuery.items}
          />

          <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/45">
            {activeWatchlist ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full bg-secondary/70">
                        {activeWatchlistItemsQuery.items.length} items
                      </Badge>
                      <Badge variant="outline" className="rounded-full border-border/60">
                        Updated {formatStockWatchlistDateTime(activeWatchlist.updated_at)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        {activeWatchlist.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Saved symbols are shown in backend order without local search, filters, or
                        reordering controls.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button type="button" onClick={openAddSymbolDialog}>
                      <Plus className="size-4" />
                      Add Symbol
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          aria-label={`Manage ${activeWatchlist.name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={openRenameDialog}>
                          Rename watchlist
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={openDeleteDialog}
                        >
                          Delete watchlist
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                  {activeWatchlistItemsQuery.isLoading ? (
                    <StockWatchlistItemsTableSkeleton />
                  ) : null}

                  {!activeWatchlistItemsQuery.isLoading && activeWatchlistItemsQuery.isError ? (
                    <div className="flex h-full items-center justify-center p-6">
                      <Empty className="border-destructive/30 bg-destructive/5">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <AlertCircle className="size-5 text-destructive" />
                          </EmptyMedia>
                          <EmptyTitle>Unable to load watchlist items</EmptyTitle>
                          <EmptyDescription>
                            Keep the active watchlist selected and retry the item request.
                          </EmptyDescription>
                        </EmptyHeader>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void activeWatchlistItemsQuery.refetch()}
                        >
                          <RefreshCw className="size-4" />
                          Retry
                        </Button>
                      </Empty>
                    </div>
                  ) : null}

                  {!activeWatchlistItemsQuery.isLoading &&
                  !activeWatchlistItemsQuery.isError &&
                  activeWatchlistItemsQuery.items.length === 0 ? (
                    <div className="flex h-full items-center justify-center p-6">
                      <Empty className="border-border/60 bg-background/20">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <FolderOpen className="size-5" />
                          </EmptyMedia>
                          <EmptyTitle>No symbols in this watchlist</EmptyTitle>
                          <EmptyDescription>
                            Add a symbol directly to start building this research list.
                          </EmptyDescription>
                        </EmptyHeader>
                        <Button type="button" onClick={openAddSymbolDialog}>
                          <Plus className="size-4" />
                          Add Symbol
                        </Button>
                      </Empty>
                    </div>
                  ) : null}

                  {!activeWatchlistItemsQuery.isLoading &&
                  !activeWatchlistItemsQuery.isError &&
                  activeWatchlistItemsQuery.items.length > 0 ? (
                    <ScrollArea className="h-full min-h-0">
                      <div className="min-w-full">
                        <StockWatchlistItemsTable
                          items={activeWatchlistItemsQuery.items}
                          onBacktest={handleWatchlistItemBacktest}
                          onRemoveItem={setRemoveItemTarget}
                          onSelectItem={handleWatchlistItemSelect}
                          selectedSymbol={isCompanyOverviewOpen ? selectedStock?.symbol ?? null : null}
                        />
                      </div>
                    </ScrollArea>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-6">
                <Empty className="border-border/60 bg-background/20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FolderOpen className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>No active watchlist</EmptyTitle>
                    <EmptyDescription>
                      Select a watchlist from the directory to load its symbols.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </div>
        </div>
      </section>

      <StockWatchlistNameDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogOpenChange}
        onSubmit={handleCreateWatchlistSubmit}
        nameValue={createWatchlistName}
        onNameChange={setCreateWatchlistName}
        error={createWatchlistError}
        isPending={createWatchlistMutation.isPending}
        submitLabel="Create Watchlist"
        title="New Watchlist"
        description="Create a named research list for the current organization."
      />

      <StockWatchlistNameDialog
        open={isRenameDialogOpen}
        onOpenChange={handleRenameDialogOpenChange}
        onSubmit={handleRenameWatchlistSubmit}
        nameValue={renameWatchlistName}
        onNameChange={setRenameWatchlistName}
        error={renameWatchlistError}
        isPending={renameWatchlistMutation.isPending}
        submitLabel="Save Changes"
        title="Rename Watchlist"
        description="Update the watchlist name while keeping its saved symbols."
      />

      <StockWatchlistDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
        onConfirmDelete={handleDeleteWatchlistConfirm}
        isPending={deleteWatchlistMutation.isPending}
        watchlistName={activeWatchlist?.name ?? "this watchlist"}
      />

      <StockWatchlistAddSymbolDialog
        open={isAddSymbolDialogOpen}
        onOpenChange={handleAddSymbolDialogOpenChange}
        onSubmit={handleAddSymbolSubmit}
        onSymbolChange={handleAddSymbolInputChange}
        symbolValue={symbolValue}
        error={addSymbolError}
        isPending={addStockWatchlistItemMutation.isPending}
        savedSymbols={activeWatchlistItemsQuery.items.map((item) => item.symbol)}
        watchlistName={activeWatchlist?.name ?? "this watchlist"}
      />

      <StockWatchlistRemoveItemDialog
        open={removeItemTarget != null}
        onOpenChange={handleRemoveItemDialogOpenChange}
        onConfirmRemove={handleRemoveItemConfirm}
        isPending={removeStockWatchlistItemMutation.isPending}
        symbol={removeItemTarget?.symbol ?? null}
        watchlistName={activeWatchlist?.name ?? null}
      />

      <StockCompanyOverviewDialog
        isOpen={isCompanyOverviewOpen}
        onOpenChange={handleCompanyOverviewOpenChange}
        onOpenBacktest={handleOpenBacktestFromCompany}
        selectedStock={selectedStock}
      />
      <BacktestDialog
        open={backtestDialogSymbol != null}
        onOpenChange={handleBacktestDialogOpenChange}
        initialValues={backtestDialogSymbol ? { symbol: backtestDialogSymbol } : undefined}
      />
    </>
  )
}
