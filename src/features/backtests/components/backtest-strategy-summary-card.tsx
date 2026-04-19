import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { BacktestTemplateItem } from "@/features/backtests/types"

type BacktestStrategySummaryCardProps = {
  template?: BacktestTemplateItem | null
}

export const BacktestStrategySummaryCard = ({
  template,
}: BacktestStrategySummaryCardProps) => {
  if (!template) {
    return null
  }

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{template.display_name}</CardTitle>
          <Badge variant="secondary">
            {template.parameters.length} {template.parameters.length === 1 ? "param" : "params"}
          </Badge>
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      {template.parameters.length > 0 ? (
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {template.parameters.map((parameter) => (
              <Badge key={parameter.name} variant="outline">
                {parameter.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  )
}
