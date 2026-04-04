# TODOS — NASA Game

Items deferred from /autoplan review (2026-04-04).

## Phase 2 (After MVP Validated)

- [ ] **LLM-assisted question tagging** — Call Claude API to auto-categorize each APOD image.
  Returns `{ category, confidence, question, choices, correct }`.
  Eliminates need for static question bank. Est: ~3 hours.

- [ ] **Daily mission system** — Use APOD's daily cadence as the game hook.
  "Today's mission" with streak tracking. Huge retention driver.
  Est: ~2 hours (Zustand + date tracking).

- [ ] **PWA / installable app** — Add manifest.json + service worker.
  Makes game installable on mobile, enables push notifications for daily missions.
  Est: ~1 hour with next-pwa.

- [ ] **Mars Rover mission type** — Already in plan. API available.
  Block: need question bank for Mars terrain classifications.
  Est: ~4 hours (API client + question bank + UI variant).

- [ ] **E2E tests** — Full game loop with Playwright.
  Est: ~2 hours.

## Phase 3

- [ ] Exoplanet mission type (API is CSV-based, needs parser)
- [ ] Rare image collection gallery
- [ ] Daily streak leaderboard (requires backend)

## Phase 4

- [ ] PvP / competitive mode
- [ ] Social sharing (share today's APOD + your answer)

## Known Issues (Fix Before Launch)

- [ ] APOD video days: add `media_type` check in `fetchAPOD()`, fallback to previous day
- [ ] Rate limit strategy: cache APOD response in Zustand, don't re-fetch on refresh
- [ ] localStorage error handling: wrap `setItem` in try/catch, degrade gracefully
