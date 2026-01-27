## 2024-10-18 - Anti-pattern Discovery
**Learning:** Found critical accessibility anti-pattern: global text selection was hidden via CSS (`*::selection { background: transparent }`). This prevents users from selecting content.
**Action:** Always check global CSS for selection/highlight overrides during visual audit.

## 2024-10-24 - Accessible Keyboard Hints
**Learning:** Best practice for input shortcuts is separating visual hints from semantics.
**Action:** Use `aria-keyshortcuts` on the input and `aria-hidden="true"` on the visual `<kbd>` element. Avoid text hints in placeholders.
