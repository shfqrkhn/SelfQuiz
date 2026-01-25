## 2024-10-18 - [Palette] - Timer Accessibility Spam
**Insight:** High-frequency updates (1Hz) with `aria-live` create unusable auditory interfaces for screen readers.
**Protocol:** Timers updating at intervals < 5s must use `role="timer"` and avoid `aria-live` regions.

## 2024-05-22 - [Sentinel] - Unbounded Client-Side Parsing
**Insight:** Allowing unrestricted file uploads for client-side parsing (JSON.parse) invites DoS via memory exhaustion.
**Protocol:** All client-side file inputs must enforce a strict size limit (e.g., 5MB) before reading into memory.

## 2024-05-22 - [Bolt] - Hollow Offline Promise
**Insight:** Caching the app shell (HTML/CSS) is insufficient for "Offline" features if content is fetched dynamically.
**Protocol:** All dynamic content essential for core functionality must use a Runtime Caching strategy (e.g., Stale-While-Revalidate).
