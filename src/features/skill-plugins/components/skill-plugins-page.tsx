import { useDeferredValue } from "react"

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

export const SkillPluginsPage = () => {
  const pageState = useSkillPluginsPageState()
  const deferredSearchText = useDeferredValue(pageState.searchText)
  const skillPluginListQuery = useSkillPluginList()
  const skillPlugins = skillPluginListQuery.data?.items ?? []
  const normalizedSearchText = deferredSearchText.trim().toLowerCase()

  const filteredSkillPlugins = skillPlugins.filter((skillPlugin) => {
    const matchesStatusFilter =
      pageState.statusFilter === "all" ||
      (pageState.statusFilter === "enabled" && skillPlugin.is_enabled) ||
      (pageState.statusFilter === "disabled" && !skillPlugin.is_enabled)

    if (!matchesStatusFilter) {
      return false
    }

    if (!normalizedSearchText) {
      return true
    }

    const searchableContent = [
      skillPlugin.name,
      skillPlugin.description,
      skillPlugin.version,
      skillPlugin.is_enabled ? "enabled" : "disabled",
      ...skillPlugin.allowed_tool_names,
    ]
      .join(" ")
      .toLowerCase()

    return searchableContent.includes(normalizedSearchText)
  })

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
        onSearchChange={pageState.setSearchText}
        onStatusFilterChange={pageState.setStatusFilter}
        resultCount={filteredSkillPlugins.length}
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
      skillPlugins.length === 0 ? (
        <SkillPluginListEmptyState onCreate={pageState.openCreateDialog} />
      ) : null}

      {!skillPluginListQuery.isLoading &&
      !skillPluginListQuery.isError &&
      skillPlugins.length > 0 &&
      filteredSkillPlugins.length === 0 ? (
        <SkillPluginListNoResultsState onReset={pageState.resetFilters} />
      ) : null}

      {!skillPluginListQuery.isLoading &&
      !skillPluginListQuery.isError &&
      filteredSkillPlugins.length > 0 ? (
        <div className="space-y-4">
          {filteredSkillPlugins.map((skillPlugin) => (
            <SkillPluginCard
              key={skillPlugin.skill_id}
              skill={skillPlugin}
              onSelect={pageState.openDetailDialog}
            />
          ))}
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
