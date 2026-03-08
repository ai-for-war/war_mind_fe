import { useEffect } from "react"

import { useSocket } from "@/features/socket/hooks/use-socket"

type SubscriptionHandler<TPayload> = (payload: TPayload) => void

type UseSocketSubscriptionOptions = {
  enabled?: boolean
  organizationScoped?: boolean
}

const useSocketSubscription = <TPayload>(
  eventName: string,
  handler: SubscriptionHandler<TPayload>,
  options?: UseSocketSubscriptionOptions,
): void => {
  const socket = useSocket()

  useEffect(() => {
    if (!socket || options?.enabled === false) {
      return
    }

    socket.on(eventName, handler)

    return () => {
      socket.off(eventName, handler)
    }
  }, [eventName, handler, options?.enabled, socket])
}

export { useSocketSubscription }
export type { UseSocketSubscriptionOptions }
