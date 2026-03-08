export {
  connectSocketClient,
  disconnectSocketClient,
  getSocketClient,
  initializeSocketAuth,
  type SharedSocketClient,
} from "@/features/socket/client/socket-client"
export { useSocket } from "@/features/socket/hooks/use-socket"
export {
  useSocketSubscription,
  type UseSocketSubscriptionOptions,
} from "@/features/socket/hooks/use-socket-subscription"
export { SocketProvider } from "@/features/socket/providers/socket-provider"
export {
  useSocketTransportStore,
  type SocketConnectionStatus,
  type SocketTransportActions,
  type SocketTransportError,
  type SocketTransportState,
} from "@/features/socket/stores/use-socket-transport-store"
