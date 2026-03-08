import { create } from "zustand"

export type SocketConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error"

export type SocketTransportState = {
  status: SocketConnectionStatus
  connectedAt: number | null
  disconnectedAt: number | null
  lastError: string | null
}

export type SocketTransportActions = {
  setStatus: (status: SocketConnectionStatus) => void
  setConnectedAt: (timestamp: number | null) => void
  setDisconnectedAt: (timestamp: number | null) => void
  setLastError: (error: string | null) => void
  reset: () => void
}

const initialState: SocketTransportState = {
  status: "idle",
  connectedAt: null,
  disconnectedAt: null,
  lastError: null,
}

export const useSocketTransportStore = create<
  SocketTransportState & SocketTransportActions
>((set) => ({
  ...initialState,
  setStatus: (status) => set({ status }),
  setConnectedAt: (connectedAt) => set({ connectedAt }),
  setDisconnectedAt: (disconnectedAt) => set({ disconnectedAt }),
  setLastError: (lastError) => set({ lastError }),
  reset: () => set(initialState),
}))
