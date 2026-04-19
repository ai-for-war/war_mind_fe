import { useMutation } from "@tanstack/react-query"

import { backtestsApi } from "@/features/backtests/api"
import { backtestsQueryKeys } from "@/features/backtests/query-keys"
import type { BacktestRunRequest } from "@/features/backtests/types"

export const useRunBacktest = () => {
  const mutation = useMutation({
    mutationFn: (request: BacktestRunRequest) => backtestsApi.runBacktest(request),
    mutationKey: backtestsQueryKeys.mutation("run"),
  })

  return {
    ...mutation,
    resetRunState: mutation.reset,
    runBacktest: mutation.mutateAsync,
  }
}
