## 2024-10-18 - Anti-pattern Discovery
**Learning:** Found critical accessibility anti-pattern: global text selection was hidden via CSS (`*::selection { background: transparent }`). This prevents users from selecting content.
**Action:** Always check global CSS for selection/highlight overrides during visual audit.

## 2024-10-24 - Accessible Keyboard Shortcuts
**Learning:** Replaced text-based placeholder hints (e.g., "Search (/)") with semantic `aria-keyshortcuts` and visual `<kbd>` elements. This separates the instruction from the label for cleaner UI and better accessibility.
**Action:** When adding shortcuts, use `aria-keyshortcuts` on the interactive element and absolute positioned `<kbd aria-hidden="true">` for visual cues.
