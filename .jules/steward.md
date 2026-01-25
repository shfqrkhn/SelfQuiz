## 2024-10-18 - [Palette] - Timer Accessibility Spam
**Insight:** High-frequency updates (1Hz) with `aria-live` create unusable auditory interfaces for screen readers.
**Protocol:** Timers updating at intervals < 5s must use `role="timer"` and avoid `aria-live` regions.

## 2024-05-22 - [Sentinel] - Unbounded Client-Side Parsing
**Insight:** Allowing unrestricted file uploads for client-side parsing (JSON.parse) invites DoS via memory exhaustion.
**Protocol:** All client-side file inputs must enforce a strict size limit (e.g., 5MB) before reading into memory.
