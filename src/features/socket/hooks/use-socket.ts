import { getSocketClient, type SharedSocketClient } from "@/features/socket/client/socket-client"

const useSocket = (): SharedSocketClient => {
  return getSocketClient()
}

export { useSocket }
