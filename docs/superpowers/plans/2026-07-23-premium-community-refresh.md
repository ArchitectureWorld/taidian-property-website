# Premium Community Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the current technical-showcase styling with a warm, professional and responsive property-service brand experience while preserving the static deployment model.

**Architecture:** Keep the site framework-free. Semantic HTML defines the information hierarchy; layered CSS files separate the foundation, chapter styling and responsive rules; a small defensive JavaScript module controls mobile navigation, reveal states and active-section highlighting. The existing local image remains the only visual dependency and is displayed in bounded crops rather than as a full-screen background.

**Tech Stack:** HTML5, modern CSS, vanilla JavaScript, Python `unittest`, Chromium/Playwright browser verification.

## Global Constraints

- No framework, build step, CDN, remote font or external image dependency.
- Preserve the core messages: 泰典物业、住宅物业经验、老旧社区、高性价比、每一分投入。
- Do not introduce unverified operational statistics.
- Keep `assets/community.webp` as the only photographic asset.
- Support keyboard navigation, ARIA state, `prefers-reduced-motion`, desktop and mobile layouts.
- Do not modify `main`; work on `design/premium-community-refresh`.

---

### Task 1: Refresh acceptance criteria

**Files:**
- Modify: `tests/test_showcase.py`
- Test: `tests/test_showcase.py`

**Interfaces:**
- Consumes: static files at repository root.
- Produces: acceptance checks for the new visual direction and responsive navigation.

- [x] Replace assertions for `annotation-grid` and `tech-line` with assertions requiring the new hero visual, proof strip, asymmetric case layout, mobile menu button and local-only assets.
- [x] Add assertions rejecting obsolete technical annotation classes and fabricated proof metrics.
- [x] Run `python -m unittest discover -s tests -v` and verify failure because the current markup does not satisfy the new contract.

### Task 2: Rebuild semantic page markup

**Files:**
- Modify: `index.html`
- Test: `tests/test_showcase.py`

**Interfaces:**
- Consumes: `styles.css`, `sections.css`, `responsive.css`, `script.js`, `assets/community.webp`.
- Produces: stable section IDs `home`, `experience`, `value`, `community`, `cases`, `contact`; mobile nav controls `menu-toggle` and `site-nav`.

- [x] Replace the hero's technical overlays with a split editorial hero and bounded image frame.
- [x] Add a proof strip using qualitative service evidence rather than new statistics.
- [x] Recompose experience, value, community and case content into clearer editorial sections.
- [x] Add an accessible mobile navigation button with `aria-controls`, `aria-expanded` and a dismissible overlay.
- [x] Consolidate demo-data notices in the experience label, contact area and footer.

### Task 3: Implement the visual system

**Files:**
- Modify: `styles.css`
- Create: `sections.css`
- Create: `responsive.css`
- Test: `tests/test_showcase.py`

**Interfaces:**
- Consumes: class names from `index.html`.
- Produces: responsive layouts at 1120px, 820px and 640px breakpoints.

- [x] Define warm paper, forest, bronze and ink design tokens plus fluid type and spacing tokens.
- [x] Implement the fixed translucent header, editorial hero, proof strip and restrained button styles.
- [x] Implement alternating light/dark chapters, asymmetric case mosaic and high-contrast contact section.
- [x] Add mobile menu states, touch-safe controls and no-horizontal-overflow guards.
- [x] Add focus-visible styles and reduced-motion fallbacks.

### Task 4: Implement defensive interaction behavior

**Files:**
- Modify: `script.js`
- Test: `tests/test_showcase.py`

**Interfaces:**
- Consumes: `#menu-toggle`, `#site-nav`, `#nav-scrim`, `.reveal`, `main > section[id]`.
- Produces: `body.menu-open`, synchronized `aria-expanded`, active navigation state and reveal classes.

- [x] Toggle and close the mobile menu on button, scrim, navigation link, Escape and desktop resize.
- [x] Lock body scrolling only while the mobile menu is open.
- [x] Guard `IntersectionObserver` usage and reveal content immediately when unavailable or reduced motion is requested.
- [x] Keep active navigation state synchronized with the section nearest the viewport center.

### Task 5: Verify and document

**Files:**
- Create: `docs/superpowers/specs/2026-07-23-premium-community-refresh-design.md`
- Create: `docs/superpowers/plans/2026-07-23-premium-community-refresh.md`

**Interfaces:**
- Produces: implementation record and reproducible verification evidence.

- [x] Run `python -m unittest discover -s tests -v` and confirm all tests pass.
- [x] Render a self-contained local document with Chromium/Playwright, inlining the three CSS files, JavaScript and local image for deterministic verification.
- [x] Use Chromium/Playwright at 1440×1000, 820×1180 and 390×844 to capture screenshots.
- [x] Verify zero console errors, zero failed local resources, no horizontal overflow and functional menu behavior.
- [x] Review the screenshots for typography, crop quality, section rhythm and CTA visibility; refine CSS if necessary and re-run all checks.


## Verification Record

- Static acceptance: `python -m unittest discover -s tests -v` — 9 tests passed.
- JavaScript syntax: `node --check script.js` — passed.
- Chromium rendering: verified at 1440×1000, 820×1180 and 390×844.
- Runtime: zero console errors and zero page errors at all three viewports.
- Layout: no horizontal overflow; all local images loaded.
- Mobile navigation: opens with synchronized `aria-expanded`, uses a vertical layout, and closes through Escape or the scrim at both tablet and phone breakpoints.
- Visual review: final screenshots stored locally as `artifacts/desktop-final.png`, `artifacts/tablet-final.png` and `artifacts/mobile-final.png`.
