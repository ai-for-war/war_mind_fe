import { useState } from "react"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  useSkillPluginList,
  useSkillPluginsPageState,
} from "@/features/skill-plugins/hooks"
import { SkillPluginCard } from "@/features/skill-plugins/components/skill-plugin-card"
import { SkillPluginDialogShell } from "@/features/skill-plugins/components/skill-plugin-dialog-shell"
import {
  SkillPluginListEmptyState,
  SkillPluginListErrorState,
  SkillPluginListLoadingState,
  SkillPluginListNoResultsState,
} from "@/features/skill-plugins/components/skill-plugin-list-states"
import { SkillPluginListToolbar } from "@/features/skill-plugins/components/skill-plugin-list-toolbar"

const SKILL_PLUGINS_PAGE_SIZE = 8

export const SkillPluginsPage = () => {
  const pageState = useSkillPluginsPageState()
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearchText = useDebouncedValue(pageState.searchText, 300)
  const skillPluginListQuery = useSkillPluginList({
    filter: pageState.statusFilter,
    limit: SKILL_PLUGINS_PAGE_SIZE,
    search: debouncedSearchText,
    skip: (currentPage - 1) * SKILL_PLUGINS_PAGE_SIZE,
  })
  const skillPlugins = skillPluginListQuery.data?.items ?? []
  const totalSkills = skillPluginListQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalSkills / SKILL_PLUGINS_PAGE_SIZE))
  const hasActiveServerFilters =
    debouncedSearchText.trim().length > 0 || pageState.statusFilter !== "all"

  const paginationItems = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter((pageNumber) => {
    if (totalPages <= 5) {
      return true
    }

    return (
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - currentPage) <= 1
    )
  })

  const handleSearchChange = (value: string) => {
    setCurrentPage(1)
    pageState.setSearchText(value)
  }

  const handleStatusFilterChange = (
    value: Parameters<typeof pageState.setStatusFilter>[0],
  ) => {
    setCurrentPage(1)
    pageState.setStatusFilter(value)
  }

  const handleResetFilters = () => {
    setCurrentPage(1)
    pageState.resetFilters()
  }

  return (
    <section
      className="flex flex-col gap-6"
      data-status-filter={pageState.statusFilter}
    >
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
          Skill Plugins
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Manage lead-agent skills from one focused list view with search,
          filters, and popup-based workflows that keep your place in the page.
        </p>
      </header>

      <SkillPluginListToolbar
        onCreate={pageState.openCreateDialog}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        resultCount={totalSkills}
        searchText={pageState.searchText}
        statusFilter={pageState.statusFilter}
      />

      {skillPluginListQuery.isLoading ? <SkillPluginListLoadingState /> : null}

      {skillPluginListQuery.isError ? (
        <SkillPluginListErrorState
          onRetry={() => {
            void skillPluginListQuery.refetch()
          }}
        />
      ) : null}

      {!skillPluginListQuery.isLoading &&
      !skillPluginListQuery.isError &&
      totalSkills === 0 &&
      !hasActiveServerFilters ? (
        <SkillPluginListEmptyState onCreate={pageState.openCreateDialog} />
      ) : null}

      {!skillPluginListQuery.isLoading &&
      !skillPluginListQuery.isError &&
      totalSkills === 0 &&
      hasActiveServerFilters ? (
        <SkillPluginListNoResultsState onReset={handleResetFilters} />
      ) : null}

      {!skillPluginListQuery.isLoading &&
      !skillPluginListQuery.isError &&
      skillPlugins.length > 0 ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card/30 p-2">
            <ScrollArea className="h-[calc(100vh-24rem)] min-h-[24rem] pr-3">
              <div className="space-y-4 p-2">
                {skillPlugins.map((skillPlugin) => (
                  <SkillPluginCard
                    key={skillPlugin.skill_id}
                    skill={skillPlugin}
                    onSelect={pageState.openDetailDialog}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          {totalPages > 1 ? (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()

                      if (currentPage === 1) {
                        return
                      }

                      setCurrentPage((previousPage) => previousPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>

                {paginationItems.map((pageNumber, index) => {
                  const previousPageNumber = paginationItems[index - 1]
                  const shouldShowEllipsis =
                    previousPageNumber && pageNumber - previousPageNumber > 1

                  return (
                    <div key={`skill-plugin-page-${pageNumber}`} className="flex items-center">
                      {shouldShowEllipsis ? (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : null}

                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive={pageNumber === currentPage}
                          onClick={(event) => {
                            event.preventDefault()
                            setCurrentPage(pageNumber)
                          }}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    </div>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()

                      if (currentPage === totalPages) {
                        return
                      }

                      setCurrentPage((previousPage) => previousPage + 1)
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </div>
      ) : null}
      <SkillPluginDialogShell
        activeDialog={pageState.activeDialog}
        clearSelection={pageState.clearSelection}
        closeDialog={pageState.closeDialog}
        openDeleteDialog={pageState.openDeleteDialog}
        openDetailDialog={pageState.openDetailDialog}
        openEditDialog={pageState.openEditDialog}
        selectedSkillId={pageState.selectedSkillId}
      />
    </section>
  )
}
