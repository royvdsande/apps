## 2024-10-18 - Anti-pattern Discovery
**Learning:** Found critical accessibility anti-pattern: global text selection was hidden via CSS (`*::selection { background: transparent }`). This prevents users from selecting content.
**Action:** Always check global CSS for selection/highlight overrides during visual audit.

## 2024-10-18 - Keyboard Shortcut Hints
**Learning:** Keyboard shortcuts in placeholders are easily missed. Using `aria-keyshortcuts` with a visual `kbd` element (hidden on focus) provides better discoverability and accessibility.
**Action:** Replace placeholder hints with positioned `kbd` elements for primary actions.
