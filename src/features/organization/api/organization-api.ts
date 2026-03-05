import { apiClient } from "@/lib/api-client"

import type { UserOrganizationResponse } from "@/features/organization/types/organization.types"

const getMyOrganizations = async (): Promise<UserOrganizationResponse[]> => {
  const response = await apiClient.get<UserOrganizationResponse[]>(
    "/users/me/organizations",
  )
  return response.data
}

export const organizationApi = {
  getMyOrganizations,
}
