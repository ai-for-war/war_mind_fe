import { useEffect, useRef } from "react"

import { useSocket } from "@/features/socket/hooks/use-socket"
import { useOrganizationStore } from "@/stores/use-organization-store"

type SubscriptionHandler<TPayload> = (payload: TPayload) => void

type UseSocketSubscriptionOptions = {
  enabled?: boolean
  organizationScoped?: boolean
}

type OrganizationScopedPayload = {
  organization_id?: unknown
}

const readOrganizationId = (payload: unknown): string | null => {
  if (typeof payload !== "object" || payload === null) {
    return null
  }

  const organizationId = (payload as OrganizationScopedPayload).organization_id

  return typeof organizationId === "string" && organizationId.length > 0
    ? organizationId
    : null
}

const useSocketSubscription = <TPayload>(
  eventName: string,
  handler: SubscriptionHandler<TPayload>,
  options?: UseSocketSubscriptionOptions,
): void => {
  const socket = useSocket()
  const activeOrganizationId = useOrganizationStore(
    (state) => state.activeOrganization?.organization.id ?? null,
  )
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (options?.enabled === false) {
      return
    }

    const listener = (payload: TPayload) => {
      if (options?.organizationScoped) {
        const payloadOrganizationId = readOrganizationId(payload)

        if (!payloadOrganizationId || payloadOrganizationId !== activeOrganizationId) {
          return
        }
      }

      handlerRef.current(payload)
    }

    socket.on(eventName, listener)

    return () => {
      socket.off(eventName, listener)
    }
  }, [
    activeOrganizationId,
    eventName,
    options?.enabled,
    options?.organizationScoped,
    socket,
  ])
}

export { useSocketSubscription }
export type { UseSocketSubscriptionOptions }
