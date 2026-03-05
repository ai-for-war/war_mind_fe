## Context

App đã có organization store (`useOrganizationStore`) với `organizations[]`, `activeOrganization`, và `setActiveOrganization(orgId)`. Data được hydrate sau login và page reload. Tuy nhiên chưa có UI nào hiển thị active org hoặc cho phép switch.

Sidebar hiện tại (`AppSidebar`) có 3 section: Header (logo + tên app), Content (NavMain), Footer (empty — reserved). shadcn/ui `DropdownMenu` component đã có sẵn, dựa trên Radix UI.

Organization types: mỗi item là `UserOrganizationResponse` gồm `organization` object (`id`, `name`, `slug`, ...) và `role` (`"admin"` | `"user"`).

## Goals / Non-Goals

**Goals:**
- Hiển thị active organization (avatar + name + role) trong sidebar footer
- Cho phép user switch org qua dropdown menu mà không cần logout
- Hỗ trợ sidebar collapsed state (chỉ hiện avatar, dropdown vẫn mở được)
- Cập nhật store + localStorage khi switch org

**Non-Goals:**
- Không implement search/filter trong dropdown (user hiện chỉ thuộc vài org)
- Không implement "Create organization" action trong dropdown
- Không implement org management (settings, members)
- Không thay đổi organization store logic — chỉ consume existing actions

## Decisions

### 1. Component placement: SidebarFooter

**Choice**: Đặt `OrgSwitcher` component trong `SidebarFooter` của `AppSidebar`.

**Rationale**: Footer là vị trí cố định, luôn visible, không bị scroll. Giống pattern của Notion và GitHub — org/workspace switcher nằm gần bottom sidebar. Header đã chứa branding (logo + "WARMIND"), không nên chen thêm.

**Alternatives considered**:
- SidebarHeader (dưới logo): Tăng chiều cao header, push nav content xuống.
- Trên NavMain: Phá vỡ flow navigation content.

### 2. Compact trigger + DropdownMenu pattern

**Choice**: Trigger button dùng `SidebarMenuButton size="lg"`, dropdown dùng shadcn `DropdownMenu` với `DropdownMenuRadioGroup`.

**Rationale**: 
- `SidebarMenuButton size="lg"` có sẵn layout 3-slot (icon + text block + trailing icon), tự động responsive khi sidebar collapsed (ẩn text, chỉ hiện icon).
- `DropdownMenuRadioGroup` + `DropdownMenuRadioItem` tự handle selected state (radio dot indicator cho active item) — không cần custom check logic.
- Tất cả component đã có sẵn trong codebase, zero dependency mới.

**Alternatives considered**:
- Popover + custom list: Phức tạp hơn, cần handle open/close state thủ công, chỉ worth khi cần search filter.
- `Select` component: Không flexible cho layout phức tạp (avatar + name + role).

### 3. Avatar hiển thị bằng initials

**Choice**: Avatar hiển thị 2 ký tự đầu của org name, nền `bg-sidebar-primary`, text `text-sidebar-primary-foreground`, shape `rounded-lg`.

**Rationale**: Org không có avatar/logo field từ backend. Initials là pattern phổ biến (Slack, Linear, GitHub). `rounded-lg` (không phải `rounded-full`) để phân biệt với user avatar (thường tròn).

**Implementation**: Lấy 2 ký tự đầu, uppercase. Ví dụ: "Alpha Corporation" → "AL", "Beta" → "BE".

### 4. Dropdown mở side="top" với width matching trigger

**Choice**: `DropdownMenuContent` dùng `side="top"` và `className="min-w-56 rounded-lg"`.

**Rationale**: Trigger nằm ở footer (bottom sidebar), dropdown phải mở lên trên để không bị cắt bởi viewport edge. Width `min-w-56` (14rem) đảm bảo dropdown đủ rộng cho org names dài, đồng thời gần bằng sidebar width (16rem).

### 5. Role hiển thị dạng text muted, không dùng badge

**Choice**: Role (`admin` / `user`) hiển thị dưới org name với `text-xs text-muted-foreground`, không wrap trong badge component.

**Rationale**: Chỉ có 2 role values, text nhỏ muted đủ thông tin mà không chiếm nhiều space. Badge sẽ over-emphasis thông tin phụ trong một compact UI element.

### 6. File structure — single component file

**Choice**: 1 file mới `src/widgets/sidebar/components/org-switcher.tsx`, export named `OrgSwitcher`.

**Rationale**: Component đủ nhỏ (< 100 lines) để nằm trong 1 file. Đặt trong `widgets/sidebar/components/` vì nó là phần của sidebar widget, không phải reusable shared component.

## Risks / Trade-offs

**[Dropdown bị cắt khi sidebar collapsed]** → Radix DropdownMenu dùng Portal (render ngoài DOM tree), nên không bị giới hạn bởi sidebar overflow. Tested: dropdown portal vẫn hiển thị đúng khi sidebar collapsed.

**[Performance khi nhiều orgs]** → DropdownMenuRadioGroup render tất cả items. Với < 50 orgs thì không vấn đề. Nếu scale lên hàng trăm orgs → cần upgrade sang Popover + virtualized list (non-goal hiện tại).

**[Org name quá dài truncate]** → `truncate` class (text-overflow: ellipsis) đảm bảo layout không bị vỡ. User có thể thấy full name khi mở dropdown (dropdown width lớn hơn trigger).

**[Sidebar collapsed state]** → `SidebarMenuButton size="lg"` tự ẩn text khi sidebar collapsed, chỉ hiện icon (avatar). Đây là built-in behavior của shadcn sidebar, không cần custom logic.
