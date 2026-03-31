import { Badge } from "@/components/ui/badge"

export const SkillPluginStatusBadge = ({
  isEnabled,
}: {
  isEnabled: boolean
}) => {
  if (isEnabled) {
    return <Badge>Enabled</Badge>
  }

  return <Badge variant="outline">Disabled</Badge>
}
