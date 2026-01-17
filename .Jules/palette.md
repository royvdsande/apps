## 2024-10-18 - Anti-pattern Discovery
**Learning:** Found critical accessibility anti-pattern: global text selection was hidden via CSS (`*::selection { background: transparent }`). This prevents users from selecting content.
**Action:** Always check global CSS for selection/highlight overrides during visual audit.

## 2024-10-24 - Search Feedback Gap
**Learning:** Search filters often lack immediate screen reader feedback, leaving non-sighted users unsure if filtering worked.
**Action:** Use `aria-live` regions to announce result counts (e.g., "4 apps found") dynamically when filtering content.
