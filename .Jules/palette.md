## 2024-10-18 - Anti-pattern Discovery
**Learning:** Found critical accessibility anti-pattern: global text selection was hidden via CSS (`*::selection { background: transparent }`). This prevents users from selecting content.
**Action:** Always check global CSS for selection/highlight overrides during visual audit.
