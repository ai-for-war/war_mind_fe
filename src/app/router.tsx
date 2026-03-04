/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, Outlet, useLocation } from "react-router-dom"

import App from "@/App"
import { LoginPage } from "@/features/auth/components/login-page"
import { useAuthStore } from "@/stores/use-auth-store"

type LocationState = {
  from?: string
}

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}${location.hash}`
    const state: LocationState = { from }

    return <Navigate to="/login" replace state={state} />
  }

  return <Outlet />
}

const CatchAllRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return <Navigate to={isAuthenticated ? "/" : "/login"} replace />
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
        path: "/",
        element: <App />,
      },
    ],
  },
  {
    path: "*",
    element: <CatchAllRedirect />,
  },
])

export { ProtectedRoute }
