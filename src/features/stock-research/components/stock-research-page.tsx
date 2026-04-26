import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockResearchReportsWorkspace } from "@/features/stock-research/components/stock-research-reports-workspace"
import { StockResearchScheduleDialog } from "@/features/stock-research/components/stock-research-schedule-dialog"
import { StockResearchSchedulesWorkspace } from "@/features/stock-research/components/stock-research-schedules-workspace"

const STOCK_RESEARCH_REPORTS_TAB = "reports"
const STOCK_RESEARCH_SCHEDULES_TAB = "schedules"

export const StockResearchPage = () => {
  const [isCreateScheduleDialogOpen, setIsCreateScheduleDialogOpen] = useState(false)

  return (
    <>
      <Tabs
        defaultValue={STOCK_RESEARCH_REPORTS_TAB}
        className="flex h-full min-h-0 min-w-0 max-h-[calc(100dvh-6rem)] flex-1 flex-col gap-4 overflow-hidden"
      >
        <TabsList variant="line" className="shrink-0">
          <TabsTrigger value={STOCK_RESEARCH_REPORTS_TAB}>Reports</TabsTrigger>
          <TabsTrigger value={STOCK_RESEARCH_SCHEDULES_TAB}>Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value={STOCK_RESEARCH_REPORTS_TAB} className="min-h-0 overflow-hidden">
          <StockResearchReportsWorkspace />
        </TabsContent>
        <TabsContent value={STOCK_RESEARCH_SCHEDULES_TAB} className="min-h-0 overflow-hidden">
          <StockResearchSchedulesWorkspace
            onCreateSchedule={() => setIsCreateScheduleDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>

      <StockResearchScheduleDialog
        open={isCreateScheduleDialogOpen}
        onOpenChange={setIsCreateScheduleDialogOpen}
      />
    </>
  )
}
