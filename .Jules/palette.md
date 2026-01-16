## 2024-10-18 - Anti-pattern Discovery
**Learning:** Found critical accessibility anti-pattern: global text selection was hidden via CSS (`*::selection { background: transparent }`). This prevents users from selecting content.
**Action:** Always check global CSS for selection/highlight overrides during visual audit.

## 2024-10-24 - Hidden Data Opportunities
**Learning:** Found that `apps.json` contained rich metadata (tags) not displayed in the UI. Exposing this data reduced cognitive load by allowing quick categorization.
**Action:** Always check data sources (`.json` files or API responses) for unused fields that could enhance the UX.
