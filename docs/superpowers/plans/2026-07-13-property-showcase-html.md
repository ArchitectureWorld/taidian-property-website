# Property Showcase HTML Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, mobile-first property company showcase page with Apple-inspired section storytelling and restrained technical annotations.

**Architecture:** A single semantic HTML document contains all styles and scripts. Images are stored as local WebP assets. CSS handles layout, responsive behavior, sticky navigation, and reduced-motion fallbacks; a small IntersectionObserver script handles reveal states and navigation highlighting.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Python unittest for static acceptance checks, Chromium headless for render verification.

## Global Constraints

- No external runtime dependencies or CDN assets.
- Preserve the three key messages: company name, deep experience, high value for money.
- Technology appears primarily through visual language, not claims of software capability.
- Use authentic old-residential-community imagery and restrained architectural annotations.

---

### Task 1: Static acceptance tests

**Files:**
- Create: `tests/test_showcase.py`
- Test: `tests/test_showcase.py`

- [ ] Write tests that require the standalone HTML, semantic sections, mobile viewport, core messages, reduced-motion CSS, local image assets, and no external HTTP assets.
- [ ] Run the test and confirm it fails because `index.html` does not exist.

### Task 2: Standalone showcase page

**Files:**
- Create: `index.html`
- Create: `assets/community.webp`

- [ ] Add a compressed community WebP in the local `assets/` directory.
- [ ] Implement semantic page chapters and fixed navigation.
- [ ] Implement architectural annotation overlays and subtle motion.
- [ ] Implement mobile breakpoints and reduced-motion behavior.
- [ ] Run static tests and confirm they pass.

### Task 3: Browser render verification

- [ ] Serve the directory locally with Python HTTP server.
- [ ] Render the site with headless Chromium.
- [ ] Verify there are no console/runtime errors and no horizontal overflow.
