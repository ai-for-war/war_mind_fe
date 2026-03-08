import type { Socket } from "socket.io-client"

export type SharedSocketClient = Socket

let sharedSocket: SharedSocketClient | null = null

const getSocketClient = (): SharedSocketClient | null => {
  return sharedSocket
}

const setSocketClient = (socket: SharedSocketClient): void => {
  sharedSocket = socket
}

const clearSocketClient = (): void => {
  sharedSocket = null
}

export { clearSocketClient, getSocketClient, setSocketClient }
