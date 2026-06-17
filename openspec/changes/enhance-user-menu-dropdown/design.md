## Context

The user menu dropdown (`DropdownMenuContent` in `Sidebar.tsx`) currently has a fixed min-width inherited from Radix UI defaults and only contains a single "Logout" item. A global `window.toggleTheme()` function already exists (defined in `AppLayout.astro`) but isn't exposed from the sidebar.

## Goals / Non-Goals

**Goals:**
- Set the dropdown width to match the sidebar's user section (`w-full` relative to the trigger, with a `min-w` matching the sidebar padding)
- Add a "Change appearance" item that calls `window.toggleTheme()`
- Use an appropriate icon (e.g., `SunMoon` or `Moon`/`Sun` from lucide-react)

**Non-Goals:**
- Persist the theme preference — already handled by `AppLayout.astro`'s inline script
- Add appearance settings to the global settings page — the dropdown is a quick-access shortcut

## Decisions

1. **Full-width dropdown**: Add `w-[--radix-dropdown-menu-trigger-width]` to `DropdownMenuContent` to match the trigger width. Radix exposes this CSS variable automatically when the trigger uses `asChild`.
2. **Appearance toggle**: Call `window.toggleTheme()` directly — no import needed, it's a global function. The icon reflects "change appearance" generically (use `SunMoon` from lucide-react).
3. **Separator**: Add a `DropdownMenuSeparator` between logout and appearance toggle for visual grouping.

## Risks / Trade-offs

- No risk — both changes are purely additive UI modifications with no side effects.
- `window.toggleTheme()` is defined in `AppLayout.astro`'s `<script>` block — available on all pages using `AppLayout`.
