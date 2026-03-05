export interface OrganizationResponse {
  id: string
  name: string
  slug: string
  description: string | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export type OrganizationRole = "admin" | "user"

export interface UserOrganizationResponse {
  organization: OrganizationResponse
  role: OrganizationRole
}
