## 2024-10-18 - Anti-pattern Discovery
**Learning:** Found critical accessibility anti-pattern: global text selection was hidden via CSS (`*::selection { background: transparent }`). This prevents users from selecting content.
**Action:** Always check global CSS for selection/highlight overrides during visual audit.

## 2024-10-24 - Keyboard Hint Accessibility
**Learning:** Visual keyboard hints (e.g., `<kbd>/`) can be redundant for screen readers if not managed correctly.
**Action:** Use `aria-keyshortcuts` on the interactive element and hide the visual hint with `aria-hidden="true"`.
