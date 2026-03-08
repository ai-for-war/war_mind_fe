import { getSocketClient, type SharedSocketClient } from "@/features/socket/client/socket-client"

const useSocket = (): SharedSocketClient | null => {
  return getSocketClient()
}

export { useSocket }
