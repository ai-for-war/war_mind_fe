## 1. OrgSwitcher Component

- [ ] 1.1 Create `src/widgets/sidebar/components/org-switcher.tsx` with `OrgSwitcher` named export
- [ ] 1.2 Implement trigger using `SidebarMenu > SidebarMenuItem > SidebarMenuButton size="lg"` with avatar (initials, `rounded-lg bg-sidebar-primary`), org name (`font-semibold truncate`), role text (`text-xs text-muted-foreground`), and `ChevronsUpDown` icon
- [ ] 1.3 Implement `DropdownMenu` with `DropdownMenuContent side="top" align="start" className="min-w-56 rounded-lg"`
- [ ] 1.4 Implement `DropdownMenuRadioGroup` listing all organizations with `value` bound to `activeOrganization.organization.id`
- [ ] 1.5 Each `DropdownMenuRadioItem` renders small avatar (`size-6 rounded-sm`) + org name, with `value={org.organization.id}`
- [ ] 1.6 Handle `onValueChange` to call `setActiveOrganization(orgId)` from organization store
- [ ] 1.7 Guard: return `null` when `activeOrganization` is `null`

## 2. Sidebar Integration

- [ ] 2.1 Import `OrgSwitcher` in `app-sidebar.tsx` and render inside `SidebarFooter`
- [ ] 2.2 Verify sidebar expanded state shows avatar + name + role + chevron
- [ ] 2.3 Verify sidebar collapsed state shows only avatar icon
