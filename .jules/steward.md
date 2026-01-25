## 2024-10-18 - [Palette] - Timer Accessibility Spam
**Insight:** High-frequency updates (1Hz) with `aria-live` create unusable auditory interfaces for screen readers.
**Protocol:** Timers updating at intervals < 5s must use `role="timer"` and avoid `aria-live` regions.

## 2024-05-22 - [Sentinel] - Unbounded Client-Side Parsing
**Insight:** Allowing unrestricted file uploads for client-side parsing (JSON.parse) invites DoS via memory exhaustion.
**Protocol:** All client-side file inputs must enforce a strict size limit (e.g., 5MB) before reading into memory.

## 2024-05-22 - [Bolt] - Hollow Offline Promise
**Insight:** Caching the app shell (HTML/CSS) is insufficient for "Offline" features if content is fetched dynamically.
**Protocol:** All dynamic content essential for core functionality must use a Runtime Caching strategy (e.g., Stale-While-Revalidate).

## 2024-10-24 - [Sentinel] - Unchecked Remote Fetch
**Insight:** Fetching remote content (via `fetch().text()`) without size limits allows large malicious files to crash the browser tab (OOM).
**Protocol:** Use `Response.body.getReader()` to stream and enforce a byte limit (e.g., 5MB) on all external data fetches.

## 2024-10-25 - [Sentinel] - Remote Fetch Size Limit
**Insight:** Unchecked remote fetches expose the application to DoS attacks via memory exhaustion (OOM).
**Protocol:** Implemented a 5MB strict limit on all `fetch` operations using `response.body.getReader()` to stream and count bytes before parsing.

## 2024-10-26 - [Sentinel] - Dynamic Text Rendering
**Insight:** Reliance on `innerHTML` and custom sanitization for dynamic content (questions/choices) is fragile and prone to XSS bypasses.
**Protocol:** Dynamic text rendering must exclusively use `document.createElement` and `textContent` to neutralize XSS vectors.

## 2026-01-25 - [Bolt] - Runtime Font Caching
**Insight:** Pre-caching stylesheets via `ASSETS` is insufficient for offline support because referenced font files (`.woff2`) are fetched lazily and remain cached only by the HTTP cache, not the Service Worker.
**Protocol:** Fonts and other lazily-loaded assets essential for offline rendering must use a targeted Runtime Caching strategy (e.g., Cache-First for `destination === 'font'`) in the Service Worker.

## 2026-01-25 - [Bolt] - Persistent Runtime Caches
**Insight:** Service Worker activation events often aggressively prune "unknown" caches. If runtime caches (like ) are not explicitly whitelisted, they are deleted on every app update, defeating the purpose of offline persistence.
**Protocol:** All Service Worker cache cleanup logic ( handler) must explicitly whitelist known runtime cache prefixes to ensure data persistence across version updates.

## 2026-01-25 - [Bolt] - Persistent Runtime Caches
**Insight:** Service Worker activation events often aggressively prune "unknown" caches. If runtime caches (like `selfquiz-data-v1`) are not explicitly whitelisted, they are deleted on every app update, defeating the purpose of offline persistence.
**Protocol:** All Service Worker cache cleanup logic (`activate` handler) must explicitly whitelist known runtime cache prefixes to ensure data persistence across version updates.
