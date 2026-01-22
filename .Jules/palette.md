## 2024-10-18 - Anti-pattern Discovery
**Learning:** Found critical accessibility anti-pattern: global text selection was hidden via CSS (`*::selection { background: transparent }`). This prevents users from selecting content.
**Action:** Always check global CSS for selection/highlight overrides during visual audit.

## 2024-10-24 - Visual Keyboard Shortcuts
**Learning:** Adding `aria-keyshortcuts` alongside a visual `<kbd>` hint provides the best of both worlds: discoverability for sighted users and programmatic announcement for screen reader users.
**Action:** When adding shortcuts, always pair `aria-keyshortcuts` on the target element with a visually hidden or styled `<kbd>` hint.
