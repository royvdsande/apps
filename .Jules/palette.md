## 2024-10-18 - Anti-pattern Discovery
**Learning:** Found critical accessibility anti-pattern: global text selection was hidden via CSS (`*::selection { background: transparent }`). This prevents users from selecting content.
**Action:** Always check global CSS for selection/highlight overrides during visual audit.

## 2024-10-19 - Keyboard Shortcut Accessibility
**Learning:** Visual keyboard hints (e.g., `<kbd>`) often cause duplicate announcements for screen readers if not handled correctly.
**Action:** Use `aria-keyshortcuts` on the input/button and `aria-hidden="true"` on the visual `<kbd>` element.
