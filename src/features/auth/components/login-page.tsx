import { Navigate } from "react-router-dom"

import { AuthLayout } from "@/app/layouts/auth-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoginForm } from "@/features/auth/components/login-form"
import { useAuthStore } from "@/stores/use-auth-store"

export const LoginPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md border-border/70 bg-card/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-semibold tracking-tight">War Mind</CardTitle>
          <CardDescription>
            Sign in to access your tactical intelligence dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
