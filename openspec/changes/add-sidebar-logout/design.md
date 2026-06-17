## Context

The sidebar (`src/components/layout/Sidebar.tsx`) currently shows the user's avatar and email as a static `<div>` in the bottom-left corner. A fully functional `POST /api/auth/logout` endpoint exists but has no client-side UI trigger. Radix UI Dropdown Menu and Avatar primitives are already installed and available in `src/components/ui/`. The sidebar runs as a React "use client" component via Astro's `client:load`.

## Goals / Non-Goals

**Goals:**
- Make the user profile area clickable, opening a dropdown menu
- Provide a working "Logout" menu item that calls the existing API
- Clear client-side auth state (`sessionStorage`) and redirect to `/login` on logout
- Structure the menu to be extensible for future items (settings, profile, etc.)

**Non-Goals:**
- Add user profile editing, avatar upload, or account switching
- Modify the logout API endpoint or server-side auth logic
- Add the dropdown to the mobile bottom nav bar (desktop sidebar only for now)

## Decisions

1. **Use existing Radix DropdownMenu** over building a custom overlay — already in the project, follows shadcn patterns, handles positioning/portal/a11y correctly. Alternative was a custom absolute-positioned `<div>`, but that duplicates a11y work and doesn't match existing patterns.

2. **Trigger = entire user section row** (avatar + email), not just a small icon — larger click target, more discoverable, matches common patterns (GitHub, Slack, etc.).

3. **Logout flow**: call `POST /api/auth/logout` via fetch → on success, call `setApiAccessToken(null)` to clear `sessionStorage` → redirect to `/login` via `window.location.href`. The API already clears the `refreshToken` cookie server-side.

4. **Keep `Sidebar` as single component** — no need to extract a separate `UserMenu` component for this change. The dropdown integration is small. Can extract later if the menu grows.

## Risks / Trade-offs

- **Dropdown position**: `side="top"` and `align="end"` on the user section since it's at the bottom of the sidebar — menu opens upward. `sideOffset` needs tuning to avoid clipping.
- **Mobile behavior**: The dropdown uses Radix Portal so it escapes the sidebar container — safe, but should be tested on mobile sidebar overlay too.
- **No loading/error state for logout**: The current design omits a loading spinner or error toast for simplicity — if the logout request fails, the user stays on the page without feedback. Acceptable for v1 since failures are rare (network error). Add toast notification in a follow-up.
