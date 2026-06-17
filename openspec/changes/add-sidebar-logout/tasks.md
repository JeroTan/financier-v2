## 1. Integrate user menu with logout in Sidebar

- [x] 1.1 Import `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` from `@/components/ui/dropdown-menu` and `LogOut` from `lucide-react` in `Sidebar.tsx`
- [x] 1.2 Replace the static user section `<div>` with a `DropdownMenu` wrapping the avatar+email as `DropdownMenuTrigger`
- [x] 1.3 Add a `DropdownMenuContent` with `side="top"` and `align="end"` containing a `DropdownMenuItem` with `LogOut` icon and "Logout" label
- [x] 1.4 Implement the `handleLogout` async function: call `POST /api/auth/logout`, on success clear `sessionStorage` via `setApiAccessToken(null)` and redirect to `/login` with `window.location.href`
- [x] 1.5 Wire the click handler to the Logout `DropdownMenuItem`
- [x] 1.6 Verify the menu opens/closes correctly in both desktop and mobile sidebar views
