/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, Outlet, useLocation } from "react-router-dom"

import { MainLayout } from "@/app/layouts/main-layout"
import { Spinner } from "@/components/ui/spinner"
import { LoginPage } from "@/features/auth/components/login-page"
import { InterviewLabPage } from "@/features/interview-lab"
import { MultiAgentPage } from "@/features/multi-agent"
import { TextToImagePage } from "@/features/text-to-image"
import { SocketProvider } from "@/features/socket"
import { TtsPage } from "@/features/tts"
import { VoiceCloningPage } from "@/features/voice-cloning"
import { useHydrateAuth } from "@/hooks/use-hydrate-auth"
import { useAuthStore } from "@/stores/use-auth-store"

type LocationState = {
  from?: string
}

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { isHydrating, isHydrated } = useHydrateAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}${location.hash}`
    const state: LocationState = { from }

    return <Navigate to="/login" replace state={state} />
  }

  if (isHydrating || !isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  )
}

const CatchAllRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return <Navigate to={isAuthenticated ? "/voice-cloning" : "/login"} replace />
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/",
            element: <Navigate to="/voice-cloning" replace />,
          },
          {
            path: "/voice-cloning",
            element: <VoiceCloningPage />,
          },
          {
            path: "/tts",
            element: <TtsPage />,
          },
          {
            path: "/multi-agent",
            element: <MultiAgentPage />,
          },
          {
            path: "/interview-lab",
            element: <InterviewLabPage />,
          },
          {
            path: "/text-to-image",
            element: <TextToImagePage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <CatchAllRedirect />,
  },
])

export { ProtectedRoute }
