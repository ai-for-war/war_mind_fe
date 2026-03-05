const ACCESS_TOKEN_KEY = "access_token"
const ACTIVE_ORGANIZATION_KEY = "active_organization"

const getToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

const setToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

const removeToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

const getActiveOrganizationId = (): string | null => {
  return localStorage.getItem(ACTIVE_ORGANIZATION_KEY)
}

const setActiveOrganizationId = (organizationId: string): void => {
  localStorage.setItem(ACTIVE_ORGANIZATION_KEY, organizationId)
}

const removeActiveOrganizationId = (): void => {
  localStorage.removeItem(ACTIVE_ORGANIZATION_KEY)
}

export const storage = {
  getToken,
  setToken,
  removeToken,
  getActiveOrganizationId,
  setActiveOrganizationId,
  removeActiveOrganizationId,
}
