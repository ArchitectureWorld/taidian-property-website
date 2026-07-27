# HD Community Imagery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the 640×246 repeated community image with distinct, optimized 1280×720 WebP assets for the hero and case-study image slots.

**Architecture:** Keep the existing semantic HTML and static deployment model unchanged. Replace the shared fallback asset, add two role-specific image assets, and let the existing deferred JavaScript assign each image to its current visual slot before interaction setup runs.

**Tech Stack:** WebP, HTML5, vanilla JavaScript, Python `unittest`, Node.js syntax verification.

## Global Constraints

- Keep all assets local; do not introduce CDN or third-party image dependencies.
- Keep each image below 1 MB while preserving at least 1280×720 resolution.
- Do not present generated demonstration visuals as verified real project documentation.
- Preserve the existing page structure, navigation behavior and deployment configuration.
- Work only on `design/hd-community-imagery`; do not merge without explicit approval.

---

### Task 1: Define the high-resolution asset contract

**Files:**
- Create: `tests/test_hd_imagery.py`

- [x] Require `community.webp`, `community-courtyard.webp` and `community-inspection.webp`.
- [x] Parse WebP dimensions using the Python standard library and require at least 1280×720.
- [x] Require each asset to remain below 1 MB.
- [x] Require JavaScript mappings for all three existing visual slots.
- [x] Run the test before implementation and verify it fails because the assets and mappings are absent.

### Task 2: Prepare optimized visual assets

**Files:**
- Replace: `assets/community.webp`
- Create: `assets/community-courtyard.webp`
- Create: `assets/community-inspection.webp`

- [x] Convert the selected generated visuals to RGB WebP at 1280×720.
- [x] Use WebP quality 65 with metadata removed.
- [x] Verify final sizes are 65,518 bytes, 167,038 bytes and 153,316 bytes.
- [x] Verify SHA-256 values before upload.

### Task 3: Assign distinct images to existing slots

**Files:**
- Modify: `script.js`

- [x] Map the hero image to `assets/community.webp`.
- [x] Map the featured case image to `assets/community-courtyard.webp`.
- [x] Map the compact case thumbnail to `assets/community-inspection.webp`.
- [x] Preserve all existing navigation, reveal and active-section behavior.

### Task 4: Verify the branch

- [x] Run `python -m unittest discover -s tests -v` locally for the focused image contract.
- [x] Run `node --check script.js` locally.
- [ ] Materialize the three binary assets on the Git branch.
- [ ] Run the complete repository test suite in GitHub Actions.
- [ ] Open a Draft pull request for review.
