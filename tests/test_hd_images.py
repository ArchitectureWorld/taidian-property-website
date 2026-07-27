from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
SCRIPT = ROOT / "script.js"
ASSET = ROOT / "assets" / "community-scenes.avif"


class HighResolutionImageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = HTML.read_text(encoding="utf-8")
        cls.script = SCRIPT.read_text(encoding="utf-8")

    def test_high_resolution_avif_sprite_is_valid(self):
        self.assertTrue(ASSET.exists())
        self.assertEqual(51_334, ASSET.stat().st_size)
        data = ASSET.read_bytes()
        self.assertEqual(b"ftypavif", data[4:12])

    def test_four_distinct_scene_windows_use_the_sprite(self):
        self.assertEqual(4, self.source.count('assets/community-scenes.avif'))
        for token in [
            "scene-sprite--hero",
            "scene-sprite--courtyard",
            "scene-sprite--inspection",
            "scene-sprite--service",
        ]:
            self.assertIn(token, self.source)

    def test_webp_fallback_and_loading_policy_remain(self):
        image_tags = re.findall(r"<img\b[^>]+>", self.source, flags=re.S)
        self.assertEqual(4, len(image_tags))
        self.assertEqual(4, self.source.count('src="assets/community.webp"'))
        for tag in image_tags:
            self.assertIn('width="4096"', tag)
            self.assertIn('height="576"', tag)
            self.assertIn('decoding="async"', tag)
        self.assertIn('fetchpriority="high"', image_tags[0])
        self.assertTrue(all('loading="lazy"' in tag for tag in image_tags[1:]))

    def test_fallback_detection_is_scripted(self):
        for token in ["data-scene-sprite", "currentSrc", "is-fallback"]:
            self.assertIn(token, self.script)


if __name__ == "__main__":
    unittest.main()
