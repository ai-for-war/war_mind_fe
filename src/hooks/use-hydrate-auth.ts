import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { authApi } from "@/features/auth/api/auth-api"
import { organizationApi } from "@/features/organization"
import { useAuthStore } from "@/stores/use-auth-store"
import { useOrganizationStore } from "@/stores/use-organization-store"

type UseHydrateAuthResult = {
  isHydrating: boolean
  isHydrated: boolean
}

export const useHydrateAuth = (): UseHydrateAuthResult => {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)
  const organizations = useOrganizationStore((state) => state.organizations)
  const setOrganizations = useOrganizationStore((state) => state.setOrganizations)

  const needsHydration = useMemo(() => {
    return Boolean(token) && (user === null || organizations.length === 0)
  }, [organizations.length, token, user])

  const [isHydrating, setIsHydrating] = useState(false)
  const [isHydrated, setIsHydrated] = useState(!needsHydration)

  useEffect(() => {
    if (!needsHydration) {
      setIsHydrating(false)
      setIsHydrated(true)
      return
    }

    let isMounted = true

    const hydrate = async () => {
      setIsHydrating(true)
      setIsHydrated(false)

      try {
        const [nextUser, nextOrganizations] = await Promise.all([
          authApi.getMe(),
          organizationApi.getMyOrganizations(),
        ])

        if (!isMounted) {
          return
        }

        if (nextOrganizations.length === 0) {
          logout()
          navigate("/login", { replace: true })
          return
        }

        setUser(nextUser)
        setOrganizations(nextOrganizations)
        setIsHydrated(true)
      } catch {
        if (!isMounted) {
          return
        }

        logout()
        navigate("/login", { replace: true })
      } finally {
        if (isMounted) {
          setIsHydrating(false)
        }
      }
    }

    void hydrate()

    return () => {
      isMounted = false
    }
  }, [logout, navigate, needsHydration, setOrganizations, setUser])

  return { isHydrating, isHydrated }
}
