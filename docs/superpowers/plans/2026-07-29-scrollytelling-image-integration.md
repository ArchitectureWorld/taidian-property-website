# Scrollytelling Image Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate selected earlier property images into all three Taidian Property scrollytelling branches without abrupt image entry or exit, while preserving smooth scroll-driven narrative behavior.

**Architecture:** Each branch keeps its full-viewport sticky stage and one shared damped `displayProgress`. Four scenes are packed into one local AVIF sprite and retained as persistent layers. Text, images, canvas visuals, chapter state, progress, and final handoff all read the same progress value.

**Tech Stack:** Static HTML, CSS, native JavaScript, 2D Canvas, Python unittest, Node.js assertion tests.

## Global Constraints

- Product term is “滚动叙事（Scrollytelling）”.
- No external image hosts, frameworks, databases, or build steps.
- Browser viewport is the stage; no outer presentation card.
- Image transitions use continuous opacity and transform interpolation only.
- No `display:none`, sudden class swaps, automatic carousel, flash transitions, or hard background cuts.
- Support desktop, mobile, and `prefers-reduced-motion`.

---

### Task 1: Shared image-transition math

**Files:**
- Create: `story-math.js`
- Test: `tests/story_math.test.js`

**Interfaces:**
- Produces: `clamp`, `lerp`, `smootherstep`, `damp`, `interpolateKeyframes`, `sequenceWeights`, `chapterData`.

- [x] Write tests for normalized weights, boundary continuity, keyframe interpolation, and damped progress.
- [x] Verify the tests fail before `story-math.js` exists.
- [x] Implement the UMD-compatible math helper.
- [x] Run Node tests and confirm `story math ok`.

### Task 2: Branch story scripts

**Files:**
- Create: `docs/STORY_SCRIPT.md` in each concept branch.

**Interfaces:**
- Produces: five-chapter copy and image choreography contract for each implementation.

- [x] Define the visual thesis for each branch.
- [x] Map four image scenes to narrative roles.
- [x] Define chapter-by-chapter entry, overlap, and exit behavior.
- [x] Define continuity and performance rules.

### Task 3: Community life network image integration

**Files:**
- Modify: `index.html`
- Replace: `scroll.css`
- Replace: `scroll.js`
- Use: `assets/community-scenes.avif`
- Test: `tests/test_showcase.py`

**Interfaces:**
- Consumes: `TaidianStoryMath`.
- Produces: continuous image-memory layer behind the community network canvas.

- [x] Add four persistent image scene layers.
- [x] Keep the service scene through chapters 001–002.
- [x] Crossfade old community, order space, and green community across chapters 003–005.
- [x] Drive image opacity, parallax, canvas network, copy, and handoff from `displayProgress`.

### Task 4: Architectural spatial model image integration

**Files:** Same structure as Task 3 in `concept/architectural-wireframe`.

**Interfaces:**
- Produces: real architecture texture behind persistent wireframe geometry.

- [x] Blend order space, old lane, real service scale, and green community.
- [x] Keep wireframe visible throughout every image transition.
- [x] Synchronize color recovery and route optimization.
- [x] Preserve dark-to-light final handoff.

### Task 5: Real community digital layer image integration

**Files:** Same structure as Task 3 in `concept/community-digital-overlay`.

**Interfaces:**
- Produces: full-screen community photo sequence with persistent service-network overlay.

- [x] Use service scene for chapters 001–002.
- [x] Crossfade to old lane, modern entrance, and green community.
- [x] Keep digital nodes and scan line present during transitions.
- [x] Reduce digital contrast rather than switching the overlay off in chapter 005.

### Task 6: Verification and publishing

- [x] Run 8 Python acceptance tests per branch.
- [x] Run Node syntax checks and story-math behavioral tests.
- [x] Render six scroll positions per branch with Chromium using local assets.
- [x] Verify no console errors, all images decode, and no horizontal overflow.
- [x] Publish scripts, image choreography docs, tests, and implementation files to each existing Git branch.
- [x] Verify remote branch contents and prepare immutable preview links.
