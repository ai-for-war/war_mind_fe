import { create } from "zustand"

export type SocketConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error"

export type SocketTransportError = {
  message: string
  name: string
  timestamp: number
}

export type SocketTransportState = {
  status: SocketConnectionStatus
  lastConnectedAt: number | null
  lastDisconnectedAt: number | null
  lastError: SocketTransportError | null
}

export type SocketTransportActions = {
  setIdle: () => void
  setConnecting: () => void
  setConnected: () => void
  setReconnecting: () => void
  setDisconnected: () => void
  setError: (error: SocketTransportError) => void
  reset: () => void
}

const initialState: SocketTransportState = {
  status: "idle",
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  lastError: null,
}

export const useSocketTransportStore = create<
  SocketTransportState & SocketTransportActions
>((set) => ({
  ...initialState,
  setIdle: () => set({ status: "idle", lastError: null }),
  setConnecting: () => set({ status: "connecting" }),
  setConnected: () =>
    set({
      status: "connected",
      lastConnectedAt: Date.now(),
      lastError: null,
    }),
  setReconnecting: () => set({ status: "reconnecting" }),
  setDisconnected: () =>
    set({
      status: "disconnected",
      lastDisconnectedAt: Date.now(),
    }),
  setError: (lastError) =>
    set({
      status: "error",
      lastError,
    }),
  reset: () => set(initialState),
}))
