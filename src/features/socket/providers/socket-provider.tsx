import { type PropsWithChildren, useEffect } from "react"

import {
  connectSocketClient,
  disconnectSocketClient,
} from "@/features/socket/client/socket-client"
import { useSocketTransportStore } from "@/features/socket/stores/use-socket-transport-store"
import { useAuthStore } from "@/stores/use-auth-store"

type SocketProviderProps = PropsWithChildren<{
  enabled?: boolean
}>

const SocketProvider = ({
  children,
  enabled = true,
}: SocketProviderProps): React.JSX.Element => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const token = useAuthStore((state) => state.token)
  const resetTransportState = useSocketTransportStore((state) => state.reset)

  useEffect(() => {
    if (!enabled || !isAuthenticated || !token) {
      disconnectSocketClient()
      resetTransportState()
      return
    }

    connectSocketClient()
  }, [enabled, isAuthenticated, resetTransportState, token])

  useEffect(() => {
    return () => {
      disconnectSocketClient()
      resetTransportState()
    }
  }, [resetTransportState])

  return <>{children}</>
}

export { SocketProvider }
