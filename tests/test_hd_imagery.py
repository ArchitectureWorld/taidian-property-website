from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets"
SCRIPT = ROOT / "script.js"
EXPECTED_ASSETS = (
    "community.webp",
    "community-courtyard.webp",
    "community-inspection.webp",
)


def read_webp_size(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        raise AssertionError(f"{path.name} is not a WebP file")

    offset = 12
    while offset + 8 <= len(data):
        chunk_type = data[offset:offset + 4]
        chunk_size = int.from_bytes(data[offset + 4:offset + 8], "little")
        payload = data[offset + 8:offset + 8 + chunk_size]

        if chunk_type == b"VP8X" and len(payload) >= 10:
            width = int.from_bytes(payload[4:7], "little") + 1
            height = int.from_bytes(payload[7:10], "little") + 1
            return width, height
        if chunk_type == b"VP8 " and len(payload) >= 10:
            width = int.from_bytes(payload[6:8], "little") & 0x3FFF
            height = int.from_bytes(payload[8:10], "little") & 0x3FFF
            return width, height
        if chunk_type == b"VP8L" and len(payload) >= 5:
            dimensions = int.from_bytes(payload[1:5], "little")
            width = (dimensions & 0x3FFF) + 1
            height = ((dimensions >> 14) & 0x3FFF) + 1
            return width, height

        offset += 8 + chunk_size + (chunk_size % 2)

    raise AssertionError(f"Unable to read WebP dimensions for {path.name}")


class HdImageryTests(unittest.TestCase):
    def test_all_display_assets_are_high_resolution_webp(self):
        for filename in EXPECTED_ASSETS:
            path = ASSET_DIR / filename
            self.assertTrue(path.exists(), filename)
            width, height = read_webp_size(path)
            self.assertGreaterEqual(width, 1280, filename)
            self.assertGreaterEqual(height, 720, filename)
            self.assertLess(path.stat().st_size, 1_000_000, filename)

    def test_script_assigns_distinct_images_to_existing_slots(self):
        source = SCRIPT.read_text(encoding="utf-8")
        for filename in EXPECTED_ASSETS:
            self.assertIn(f"assets/{filename}", source)
        for selector in [
            ".hero-visual__frame img",
            ".case-media--featured img",
            ".case-thumb img",
        ]:
            self.assertIn(selector, source)


if __name__ == "__main__":
    unittest.main()
