import { create } from "zustand"

import type { UserOrganizationResponse } from "@/features/organization/types/organization.types"
import { storage } from "@/lib/storage"

type OrganizationState = {
  organizations: UserOrganizationResponse[]
  activeOrganization: UserOrganizationResponse | null
  setOrganizations: (orgs: UserOrganizationResponse[]) => void
  setActiveOrganization: (orgId: string) => void
  clear: () => void
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organizations: [],
  activeOrganization: null,
  setOrganizations: (orgs) => {
    const storedOrgId = storage.getActiveOrganizationId()
    const activeOrganization =
      orgs.find((org) => org.organization.id === storedOrgId) ?? orgs[0] ?? null

    if (activeOrganization) {
      storage.setActiveOrganizationId(activeOrganization.organization.id)
    } else {
      storage.removeActiveOrganizationId()
    }

    set({
      organizations: orgs,
      activeOrganization,
    })
  },
  setActiveOrganization: (orgId) => {
    set((state) => {
      const nextActiveOrganization = state.organizations.find(
        (org) => org.organization.id === orgId,
      )

      if (!nextActiveOrganization) {
        return state
      }

      storage.setActiveOrganizationId(orgId)
      return { activeOrganization: nextActiveOrganization }
    })
  },
  clear: () => {
    storage.removeActiveOrganizationId()
    set({
      organizations: [],
      activeOrganization: null,
    })
  },
}))
