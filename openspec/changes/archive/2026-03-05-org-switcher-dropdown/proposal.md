## Why

Organization store đã có đầy đủ data (`organizations[]`, `activeOrganization`, `setActiveOrganization`) nhưng chưa có UI nào cho phép user nhìn thấy org đang active hoặc switch giữa các org. Trong SaaS multi-tenant, user cần biết mình đang thao tác trong org nào tại mọi thời điểm, và cần cách switch org mà không logout.

## What Changes

- Thêm component `OrgSwitcher` hiển thị active organization trong sidebar footer, cho phép user switch org qua dropdown
- Cập nhật `AppSidebar` — render `OrgSwitcher` trong `SidebarFooter` (hiện đang empty, reserved cho use case này)
- Cập nhật spec `sidebar-navigation` — footer không còn empty mà chứa org switcher

## Capabilities

### New Capabilities
- `org-switcher`: Component hiển thị active organization với avatar + name + role trong sidebar footer, kèm dropdown menu cho phép switch giữa các organizations. Hỗ trợ sidebar collapsed state (chỉ hiện avatar).

### Modified Capabilities
- `sidebar-navigation`: SidebarFooter thay đổi từ empty/reserved sang chứa OrgSwitcher component.

## Impact

- **New files**: `src/widgets/sidebar/components/org-switcher.tsx`
- **Modified files**: `src/widgets/sidebar/components/app-sidebar.tsx`
- **Dependencies consumed**: `useOrganizationStore` (existing), `DropdownMenu` components (existing shadcn/ui), `SidebarMenu*` components (existing shadcn/ui), `ChevronsUpDown` icon (existing Lucide)
- **No new packages needed** — tất cả component và store đã có sẵn
- **No API changes** — chỉ đọc data từ organization store
- **No backend changes** — pure frontend UI addition
