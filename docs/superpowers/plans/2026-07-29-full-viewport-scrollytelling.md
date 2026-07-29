# Full-Viewport Scrollytelling Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the mistaken outer presentation background and device-card shell from all three experimental branches, so the browser viewport itself becomes the continuous scrollytelling stage.

**Architecture:** Preserve the existing sticky scroll timeline, damped progress, Canvas renderers, five-chapter copy system, and handoff variables. Recompose each branch through HTML layout metadata and branch-specific CSS: navigation and chapter controls become overlays, the visual layer fills the viewport, and text sits directly in the same spatial field instead of inside a split card. The main branch receives requirements documentation only; concept code stays isolated.

**Tech Stack:** Static HTML, CSS, native JavaScript Canvas, Python `unittest`, GitHub Pages-compatible assets.

## Global Constraints

- The product name remains “滚动叙事（Scrollytelling）”.
- The page must fill `100% × 100svh`; no outer presentation background is part of the website.
- The full page must not use a global max-width, max-height, rounded outer frame, floating border, or card shadow.
- Inner labels, dividers, tabs, and localized translucent gradients are allowed when they do not create another full-page card.
- Existing scroll direction, reverse playback, damped progress, reduced-motion fallback, and continuous outro handoff must remain intact.
- `main` must not receive concept implementation code.

---

### Task 1: Record the full-viewport visual contract

**Files:**
- Modify: `docs/SCROLLYTELLING_REQUIREMENTS.md`
- Create: `docs/superpowers/plans/2026-07-29-full-viewport-scrollytelling.md`

**Interfaces:**
- Produces: A stable product-level rule consumed by all three concept branches.

- [ ] Add a “全视口舞台” section that distinguishes the reference video’s presentation background from the actual webpage.
- [ ] State explicit prohibitions on outer gray backgrounds, global rounded frames, global shadows, and global width/height caps.
- [ ] Preserve the existing five-chapter, performance, accessibility, and continuous-handoff requirements.
- [ ] Commit documentation separately from branch code.

### Task 2: Add a failing full-viewport acceptance contract to each branch

**Files:**
- Modify: `tests/test_showcase.py` on each concept branch.

**Interfaces:**
- Consumes: Existing scrollytelling test contract.
- Produces: Assertions for `data-layout="full-viewport"`, `viewport-stage`, full-viewport CSS, and absence of the old device-card shell.

- [ ] Assert the root contains `data-layout="full-viewport"`.
- [ ] Assert the main stage contains `class="device viewport-stage"`.
- [ ] Assert CSS includes `width: 100%`, `height: 100svh`, `max-width: none`, `max-height: none`, `border-radius: 0`, and `box-shadow: none` for the outer stage.
- [ ] Assert the visual layer is full-bleed and the copy layer is an overlay, not a bordered card.
- [ ] Run the tests and confirm they fail against the previous branch state.

### Task 3: Upgrade branch A — community life network

**Files:**
- Modify: `index.html`
- Modify: `scroll.css`
- Modify: `docs/SCROLLYTELLING_CONCEPT.md`
- Test: `tests/test_showcase.py`

**Interfaces:**
- Consumes: Existing Canvas network and damped scroll progress in `scroll.js`.
- Produces: A light, full-viewport narrative field with the network shifted toward the right and integrated editorial copy on the left.

- [ ] Add `data-layout="full-viewport"` and `viewport-stage` without changing Canvas IDs or scroll controls.
- [ ] Make `.device-shell` a zero-padding sticky viewport and `.device` a borderless `100svh` stage.
- [ ] Make `.visual-panel` full-bleed and `.copy-panel` an unboxed overlay with only a soft integrated gradient for readability.
- [ ] Overlay the top navigation and bottom chapter timeline directly on the stage.
- [ ] Keep the existing handoff variables but remove the card-like scale reveal.
- [ ] Run acceptance tests and JavaScript syntax validation.

### Task 4: Upgrade branch B — architectural spatial model

**Files:**
- Modify: `index.html`
- Modify: `scroll.css`
- Modify: `docs/SCROLLYTELLING_CONCEPT.md`
- Test: `tests/test_showcase.py`

**Interfaces:**
- Consumes: Existing building interpolation and Canvas renderer in `scroll.js`.
- Produces: A dark full-screen spatial operating model with the model extending to browser edges and copy floating within the same coordinate field.

- [ ] Apply the same full-viewport structural contract.
- [ ] Remove the split-panel seam and all outer-card properties.
- [ ] Place the architectural Canvas edge-to-edge, with copy and model metadata layered above it.
- [ ] Preserve model controls, state tabs, and continuous handoff.
- [ ] Run acceptance tests and JavaScript syntax validation.

### Task 5: Upgrade branch C — real community digital layer

**Files:**
- Modify: `index.html`
- Modify: `scroll.css`
- Modify: `docs/SCROLLYTELLING_CONCEPT.md`
- Test: `tests/test_showcase.py`

**Interfaces:**
- Consumes: Existing local community image, Canvas service network, scan line, and damped scroll progress.
- Produces: A full-bleed community scene where text, navigation, service nodes, and HUD are all part of one page surface.

- [ ] Apply the same full-viewport structural contract.
- [ ] Make the real image and Canvas overlay cover the complete stage.
- [ ] Replace the left card with a graduated readability field that merges into the image.
- [ ] Keep HUD and chapter controls as restrained overlays.
- [ ] Preserve the continuous transition into the outro section.
- [ ] Run acceptance tests and JavaScript syntax validation.

### Task 6: Cross-branch verification

**Files:**
- Verify all modified files on the three branches.

**Interfaces:**
- Produces: Comparable fixed-commit previews with `main` unchanged except documentation.

- [ ] Confirm each branch remains isolated from `main`.
- [ ] Confirm all three branches retain five chapters and their concept-specific Canvas IDs.
- [ ] Confirm there are no external runtime assets.
- [ ] Confirm no CSS contains the previous global device-card pattern.
- [ ] Generate fixed-commit preview URLs for review.
