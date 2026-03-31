import { Clock3, Wrench } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SkillPluginStatusBadge } from "@/features/skill-plugins/components/skill-plugin-status-badge"
import { formatAbsoluteDateTime } from "@/lib/date"
import type { SkillPluginSummary } from "@/features/skill-plugins/types"

const formatUpdatedAt = (updatedAt: string) => {
  return `Updated ${formatAbsoluteDateTime(updatedAt, "recently")}`
}

export const SkillPluginCard = ({
  onSelect,
  skill,
}: {
  onSelect: (skillId: string) => void
  skill: SkillPluginSummary
}) => {
  const allowedToolCount = skill.allowed_tool_names.length

  return (
    <button
      type="button"
      onClick={() => onSelect(skill.skill_id)}
      className="w-full rounded-xl text-left transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Open details for ${skill.name}`}
    >
      <Card className="gap-4 border-border/60 bg-card/80 py-5 hover:border-primary/40 hover:bg-card">
        <CardHeader className="gap-3 px-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-lg">{skill.name}</CardTitle>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {skill.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SkillPluginStatusBadge isEnabled={skill.is_enabled} />
              <Badge variant="secondary">v{skill.version}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-5">
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2 rounded-full bg-muted/70 px-3 py-1.5">
              <Wrench className="size-4" />
              <span>
                {allowedToolCount} allowed tool{allowedToolCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-muted/70 px-3 py-1.5">
              <Clock3 className="size-4" />
              <span>{formatUpdatedAt(skill.updated_at)}</span>
            </div>
          </div>

          {allowedToolCount > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skill.allowed_tool_names.slice(0, 4).map((toolName) => (
                <Badge key={toolName} variant="outline" className="font-normal">
                  {toolName}
                </Badge>
              ))}

              {allowedToolCount > 4 ? (
                <Badge variant="outline" className="font-normal">
                  +{allowedToolCount - 4} more
                </Badge>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </button>
  )
}
