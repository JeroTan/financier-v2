## Why

The sidebar displays the user's avatar and email but offers no way to log out. Users have no discoverable way to end their session — the logout API endpoint exists (`POST /api/auth/logout`) but is inaccessible from the UI. This is a basic UX requirement for any authenticated application.

## What Changes

- Make the user info section in the bottom-left of the sidebar clickable (avatar + email)
- Add a dropdown/popover menu triggered by clicking the user section
- Include a "Logout" action in the menu that calls the existing `POST /api/auth/logout` endpoint
- On successful logout, clear local session state and redirect to `/login`
- Structure the user menu to support future menu items (e.g., settings, switch account)

## Capabilities

### New Capabilities
- `user-menu`: Clickable user profile section in the sidebar that opens a dropdown menu with session actions (initially logout, extensible for future items)

### Modified Capabilities
- *(none — no existing spec-level behavior changes)*

## Impact

- **File modified**: `src/components/layout/Sidebar.tsx` — user section becomes interactive with dropdown trigger
- **File modified**: `src/layouts/AppLayout.astro` — may need to pass additional props (none expected, current `userEmail` prop is sufficient)
- **No new dependencies** — Radix UI Dropdown Menu and Avatar components already exist in `src/components/ui/`
- **No API changes** — logout endpoint already exists
- **No new routes**
