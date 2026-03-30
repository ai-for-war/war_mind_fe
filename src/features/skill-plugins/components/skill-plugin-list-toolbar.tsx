import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { SkillPluginStatusFilter } from "@/features/skill-plugins/types"

const STATUS_FILTER_OPTIONS: Array<{
  label: string
  value: SkillPluginStatusFilter
}> = [
  { label: "All", value: "all" },
  { label: "Enabled", value: "enabled" },
  { label: "Disabled", value: "disabled" },
]

export const SkillPluginListToolbar = ({
  onCreate,
  onSearchChange,
  onStatusFilterChange,
  resultCount,
  searchText,
  statusFilter,
}: {
  onCreate: () => void
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: SkillPluginStatusFilter) => void
  resultCount: number
  searchText: string
  statusFilter: SkillPluginStatusFilter
}) => {
  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Discover and manage skill plugins
          </p>
          <p className="text-sm text-muted-foreground">
            Search by visible content, then narrow the list by enablement state.
          </p>
        </div>

        <Button type="button" onClick={onCreate} className="w-full sm:w-auto">
          <Plus className="size-4" />
          New Skill
        </Button>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchText}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, description, status, version, or tools"
            className="pl-9"
            aria-label="Search skill plugins"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
          <ToggleGroup
            type="single"
            value={statusFilter}
            onValueChange={(value) => {
              if (!value) {
                return
              }

              onStatusFilterChange(value as SkillPluginStatusFilter)
            }}
            variant="outline"
            size="sm"
            className="w-full flex-wrap sm:w-auto"
            aria-label="Skill status filter"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={`Filter ${option.label.toLowerCase()} skills`}
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <p className="text-sm text-muted-foreground">
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </div>
  )
}
