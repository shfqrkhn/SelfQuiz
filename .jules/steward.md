## 2024-10-18 - [Palette] - Timer Accessibility Spam
**Insight:** High-frequency updates (1Hz) with `aria-live` create unusable auditory interfaces for screen readers.
**Protocol:** Timers updating at intervals < 5s must use `role="timer"` and avoid `aria-live` regions.
