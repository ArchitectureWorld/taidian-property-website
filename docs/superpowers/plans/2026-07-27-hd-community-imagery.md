# HD Community Imagery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the repeated 640×246 community image with one optimized 1280×720 WebP asset so every existing photographic slot becomes clear immediately.

**Architecture:** Preserve the existing semantic HTML, CSS crops and static deployment model. The page already uses `assets/community.webp` for the hero and both case-study image slots, so replacing that shared asset upgrades every displayed photo without adding runtime logic or external dependencies.

**Tech Stack:** WebP, HTML5, Python `unittest`, Node.js syntax verification.

## Global Constraints

- Keep the image local; do not introduce CDN or third-party image dependencies.
- Preserve at least 1280×720 resolution and keep the asset below 1 MB.
- Treat the generated image as a demonstration visual, not verified real project documentation.
- Preserve the existing page structure, navigation behavior and deployment configuration.
- Work only on `design/hd-community-imagery`; do not merge without explicit approval.

---

### Task 1: Define the high-resolution asset contract

**Files:**
- Create: `tests/test_hd_imagery.py`

- [x] Parse WebP dimensions using the Python standard library.
- [x] Require `assets/community.webp` to be at least 1280×720 and below 1 MB.
- [x] Require all three existing photo slots to continue using the shared local asset.
- [x] Verify the test fails against the original 640×246 image.

### Task 2: Prepare the optimized visual asset

**Files:**
- Replace: `assets/community.webp`

- [x] Select a community-service visual with property staff and residents.
- [x] Convert it to RGB WebP at 1280×720.
- [x] Use WebP quality 65 with metadata removed.
- [x] Verify final size is 65,518 bytes.
- [x] Verify SHA-256 is `bc8af86d93a8c61ba54bccea844a41d20a7e63b7faa0a74421d3556ac454d12b` before upload.

### Task 3: Verify and review

- [x] Materialize the binary asset on the Git branch.
- [x] Run the complete repository test suite and `node --check script.js` in GitHub Actions.
- [x] Open Draft PR #2 for review.
