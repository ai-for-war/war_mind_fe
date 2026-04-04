const EMPTY_ORGANIZATION_QUERY_SCOPE = "__no_organization__"

export const getOrganizationQueryScope = (
  organizationId?: string | null,
): string => {
  const normalizedOrganizationId = organizationId?.trim()

  return normalizedOrganizationId && normalizedOrganizationId.length > 0
    ? normalizedOrganizationId
    : EMPTY_ORGANIZATION_QUERY_SCOPE
}
