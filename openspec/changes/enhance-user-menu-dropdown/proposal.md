## Why

The user menu dropdown in the sidebar is too narrow compared to the sidebar's full width, and there's no quick way to toggle between dark and light mode from the sidebar. Users should be able to switch appearance without navigating to settings.

## What Changes

- Make the dropdown menu content full-width (matching the user section in the sidebar)
- Add a "Change appearance" menu item that toggles between dark and light mode
- The existing theme toggle script in `AppLayout.astro` already handles this — just wire it to a menu item

## Capabilities

### New Capabilities
- *(none — extending existing user-menu capability)*

### Modified Capabilities
- `user-menu`: Add appearance toggle menu item; make dropdown full-width

## Impact

- **File modified**: `src/components/layout/Sidebar.tsx` — add full-width class to `DropdownMenuContent`, add appearance toggle item
- **No new dependencies** — toggle logic already exists as `window.toggleTheme()` in `AppLayout.astro`
- **No API or route changes**
