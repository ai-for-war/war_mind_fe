import { BotIcon, BoxesIcon, LayersIcon, WrenchIcon } from "lucide-react"
import type { ComponentType, ReactNode } from "react"

import {
  ChainOfThoughtStep,
} from "@/components/ai/chain-of-thought"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  formatAiToolArgumentsSummary,
  getAiToolPresentation,
} from "@/lib/ai-tool-presentation"
import type { NormalizedAssistantMessageMetadata } from "@/lib/ai-message-metadata"
import { cn } from "@/lib/utils"

type AiMessageMetadataInspectorProps = {
  className?: string
  description?: string
  metadata: NormalizedAssistantMessageMetadata
  title?: string
}

type MetadataSectionProps = {
  children: ReactNode
  className?: string
  icon: ComponentType<{ className?: string }>
  title: string
}

const MetadataSection = ({
  children,
  className,
  icon: Icon,
  title,
}: MetadataSectionProps) => (
  <section className={cn("space-y-3", className)}>
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="size-4" />
      <span className="font-medium text-foreground">{title}</span>
    </div>
    {children}
  </section>
)

export const AiMessageMetadataInspector = ({
  className,
  description = "Inspect the model, skill, and tools used for this response.",
  metadata,
  title = "Metadata",
}: AiMessageMetadataInspectorProps) => {
  const hasSkillSection = Boolean(
    metadata.skillId || metadata.skillVersion || metadata.loadedSkills.length > 0,
  )

  return (
    <Card className={cn("h-full gap-0 overflow-hidden", className)}>
      <CardHeader className="border-b pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <ScrollArea className="min-h-0 flex-1">
        <CardContent className="space-y-5 py-6">
          {metadata.model ? (
            <MetadataSection icon={BotIcon} title="Model">
              <Badge
                className="max-w-full rounded-md px-2.5 py-1 font-medium text-sm break-all whitespace-normal"
                variant="secondary"
              >
                {metadata.model}
              </Badge>
            </MetadataSection>
          ) : null}

          {metadata.model && (hasSkillSection || metadata.toolCalls.length > 0) ? <Separator /> : null}

          {hasSkillSection ? (
            <MetadataSection icon={LayersIcon} title="Skill">
              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                {metadata.skillId ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className="max-w-full rounded-md px-2.5 py-1 font-medium text-sm break-all whitespace-normal"
                      variant="outline"
                    >
                      {metadata.skillId}
                    </Badge>
                    {metadata.skillVersion ? (
                      <Badge variant="secondary">v{metadata.skillVersion}</Badge>
                    ) : null}
                  </div>
                ) : null}

                {metadata.loadedSkills.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <BoxesIcon className="size-3.5" />
                      <span>Loaded skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {metadata.loadedSkills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </MetadataSection>
          ) : null}

          {hasSkillSection && metadata.toolCalls.length > 0 ? <Separator /> : null}

          {metadata.toolCalls.length > 0 ? (
            <MetadataSection icon={WrenchIcon} title="Tools">
              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                {metadata.toolCalls.map((toolCall, index) => {
                  const presentation = getAiToolPresentation(toolCall.name)
                  const summary = formatAiToolArgumentsSummary(toolCall.name, toolCall.arguments)

                  return (
                    <ChainOfThoughtStep
                      className={cn(
                        "gap-3 text-sm",
                        index === metadata.toolCalls.length - 1
                          ? "[&>div:first-child>div]:hidden"
                          : "[&>div:first-child>div]:block",
                      )}
                      description={summary ?? undefined}
                      icon={presentation.icon}
                      key={toolCall.id}
                      label={<span className="font-medium text-foreground">{presentation.label}</span>}
                      status="complete"
                    />
                  )
                })}
              </div>
            </MetadataSection>
          ) : null}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
