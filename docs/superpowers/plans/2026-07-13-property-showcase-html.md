# Property Showcase HTML Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first property company showcase page with Apple-inspired section storytelling and restrained technical annotations.

**Architecture:** A semantic HTML entry point loads a focused stylesheet and a small vanilla JavaScript file. Images are stored as local WebP assets. CSS handles layout, responsive behavior, sticky navigation, and reduced-motion fallbacks; IntersectionObserver handles reveal states and navigation highlighting.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Python unittest for static acceptance checks.

## Global Constraints

- No external runtime dependencies or CDN assets.
- Preserve the three key messages: company name, deep experience, high value for money.
- Technology appears primarily through visual language, not claims of software capability.
- Use authentic old-residential-community imagery and restrained architectural annotations.

---

### Task 1: Static acceptance tests

**Files:**
- Create: `tests/test_showcase.py`

- [ ] Require the HTML entry point, semantic sections, mobile viewport, core messages, reduced-motion CSS, local image assets, and no external HTTP assets.
- [ ] Run the test and confirm it fails before implementation.

### Task 2: Showcase page

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `script.js`
- Create: `assets/community.webp`

- [ ] Add a compressed community WebP in the local `assets/` directory.
- [ ] Implement semantic page chapters and fixed navigation.
- [ ] Implement architectural annotation overlays and subtle motion.
- [ ] Implement mobile breakpoints and reduced-motion behavior.
- [ ] Run static tests and confirm they pass.

### Task 3: Browser verification

- [ ] Serve the directory locally with Python HTTP server.
- [ ] Verify desktop and mobile layouts, scroll interactions, and horizontal overflow.
