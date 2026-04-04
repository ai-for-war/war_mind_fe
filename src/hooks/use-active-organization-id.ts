import { useOrganizationStore } from "@/stores/use-organization-store"

export const useActiveOrganizationId = (): string | null =>
  useOrganizationStore((state) => state.activeOrganization?.organization.id ?? null)
