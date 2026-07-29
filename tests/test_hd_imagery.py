from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "assets" / "community.webp"
HTML = ROOT / "index.html"


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
    def test_shared_display_asset_is_high_resolution_webp(self):
        self.assertTrue(ASSET.exists())
        width, height = read_webp_size(ASSET)
        self.assertGreaterEqual(width, 1280)
        self.assertGreaterEqual(height, 720)
        self.assertLess(ASSET.stat().st_size, 1_000_000)

    def test_every_existing_photo_slot_uses_the_shared_hd_asset(self):
        source = HTML.read_text(encoding="utf-8")
        self.assertEqual(3, source.count('src="assets/community.webp"'))


if __name__ == "__main__":
    unittest.main()
