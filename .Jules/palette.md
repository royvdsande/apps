## 2024-10-18 - Anti-pattern Discovery
**Learning:** Found critical accessibility anti-pattern: global text selection was hidden via CSS (`*::selection { background: transparent }`). This prevents users from selecting content.
**Action:** Always check global CSS for selection/highlight overrides during visual audit.

## 2024-10-24 - Keyboard Hint Accessibility
**Learning:** Using `aria-keyshortcuts` is cleaner than putting shortcuts in placeholders. It keeps the UI text simple while providing semantic info to screen readers.
**Action:** When adding visual keyboard hints, always pair them with `aria-keyshortcuts` on the interactive element and hide the visual hint (`aria-hidden="true"`) to avoid duplicate announcements.
