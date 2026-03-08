import { env } from "@/config/env"
import { storage } from "@/lib/storage"
import { io, type Socket } from "socket.io-client"

import {
  useSocketTransportStore,
  type SocketTransportError,
} from "@/features/socket/stores/use-socket-transport-store"

export type SharedSocketClient = Socket

const resolveSocketOrigin = (): string => {
  return new URL(env.API_URL).origin
}

const buildSocketAuthPayload = (): { token?: string } => {
  const token = storage.getToken()

  if (!token) {
    return {}
  }

  return { token }
}

const parseSocketError = (error: unknown): SocketTransportError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      timestamp: Date.now(),
    }
  }

  if (typeof error === "string") {
    return {
      message: error,
      name: "SocketError",
      timestamp: Date.now(),
    }
  }

  return {
    message: "Unknown socket connection error",
    name: "SocketError",
    timestamp: Date.now(),
  }
}

const sharedSocketClient = io(resolveSocketOrigin(), {
  autoConnect: false,
})

const transportStore = useSocketTransportStore.getState()

sharedSocketClient.on("connect", () => {
  useSocketTransportStore.getState().setConnected()
})

sharedSocketClient.on("disconnect", () => {
  useSocketTransportStore.getState().setDisconnected()
})

sharedSocketClient.on("connect_error", (error) => {
  useSocketTransportStore.getState().setError(parseSocketError(error))
})

sharedSocketClient.io.on("reconnect_attempt", () => {
  useSocketTransportStore.getState().setReconnecting()
})

sharedSocketClient.io.on("reconnect_error", (error) => {
  useSocketTransportStore.getState().setError(parseSocketError(error))
})

sharedSocketClient.io.on("reconnect_failed", () => {
  useSocketTransportStore.getState().setError({
    message: "Socket reconnection failed",
    name: "ReconnectFailedError",
    timestamp: Date.now(),
  })
})

const initializeSocketAuth = (): void => {
  sharedSocketClient.auth = buildSocketAuthPayload()
}

const getSocketClient = (): SharedSocketClient => {
  return sharedSocketClient
}

const connectSocketClient = (): void => {
  initializeSocketAuth()

  if (sharedSocketClient.connected || sharedSocketClient.active) {
    return
  }

  transportStore.setConnecting()
  sharedSocketClient.connect()
}

const disconnectSocketClient = (): void => {
  if (!sharedSocketClient.connected && !sharedSocketClient.active) {
    useSocketTransportStore.getState().setIdle()
    return
  }

  sharedSocketClient.disconnect()
}

export {
  connectSocketClient,
  disconnectSocketClient,
  getSocketClient,
  initializeSocketAuth,
}
