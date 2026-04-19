import { useQuery } from "@tanstack/react-query"

import { backtestsApi } from "@/features/backtests/api"
import { backtestsQueryKeys } from "@/features/backtests/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useBacktestTemplates = () => {
  const activeOrganizationId = useActiveOrganizationId()

  const query = useQuery({
    queryFn: () => backtestsApi.getBacktestTemplates(),
    queryKey: backtestsQueryKeys.templates(activeOrganizationId),
  })

  return {
    ...query,
    items: query.data?.items ?? [],
  }
}
