# High-Resolution Community Imagery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the visibly blurred repeated community image with four distinct high-resolution scene windows while preserving the static deployment model.

**Architecture:** Store four generated scenes in one lightweight `4096×576` AVIF strip. Semantic `<picture>` elements expose the AVIF source with the existing WebP as fallback; scoped CSS positions each scene, while a defensive JavaScript check removes sprite positioning when fallback content is active.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, AVIF/WebP, Python `unittest`, GitHub Actions for one-time binary materialization.

## Global Constraints

- No framework, build step, CDN or external image host.
- Preserve existing section IDs, navigation and core copy.
- Hero image is prioritized; case images are lazy-loaded.
- Keep the legacy WebP only as a compatibility fallback.
- Do not leave Base64 staging files or a materialization workflow in the final branch.

---

### Task 1: Stage and verify the AVIF asset

- [x] Split the binary payload into temporary UTF-8 chunks compatible with the GitHub connector.
- [x] Add a one-time workflow that reconstructs the AVIF and verifies its exact byte count and SHA-256 digest.
- [x] Remove all staging chunks and the one-time workflow after reconstruction.

### Task 2: Update image markup and crops

- [x] Add four `<picture>` placements referencing `assets/community-scenes.avif`.
- [x] Keep `assets/community.webp` as the fallback source.
- [x] Add dedicated hero, courtyard, inspection and service crop classes.
- [x] Add a distinct image window to the sand case card.

### Task 3: Add defensive fallback behavior

- [x] Detect the selected source through `HTMLImageElement.currentSrc`.
- [x] Remove sprite offsets whenever the browser selects the WebP fallback.
- [x] Preserve the existing navigation, reveal and active-section behavior.

### Task 4: Verify

- [x] Add tests for AVIF validity, four scene windows, fallback references and loading policy.
- [x] Run the complete Python test suite after materializing the binary.
- [x] Run `node --check script.js`.
- [x] Verify the final branch contains no temporary Base64 payload or workflow.
