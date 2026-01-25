## 2024-10-18 - Anti-pattern Discovery
**Learning:** Found critical accessibility anti-pattern: global text selection was hidden via CSS (`*::selection { background: transparent }`). This prevents users from selecting content.
**Action:** Always check global CSS for selection/highlight overrides during visual audit.

## 2026-01-25 - Keyboard Hint Pattern
**Learning:** Moving keyboard hints from placeholders to visual <kbd> elements improves accessibility (via aria-keyshortcuts) and usability (persistent visibility).
**Action:** Use position: relative wrapper + absolute positioning for <kbd> hints, and ensure input has sufficient padding-right. Hide on mobile.
