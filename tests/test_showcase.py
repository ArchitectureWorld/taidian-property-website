from pathlib import Path
import json
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"


class ShowcaseAcceptanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = HTML.read_text(encoding="utf-8")

    def test_standalone_html_exists(self):
        self.assertTrue(HTML.exists())
        self.assertIn("<!doctype html>", self.source.lower())

    def test_taidian_brand_is_primary_visual(self):
        self.assertIn("<title>泰典物业", self.source)
        self.assertRegex(self.source, r'<h1\s+class="hero-company">\s*泰典物业\s*</h1>')
        self.assertNotIn("XX物业", self.source)
        self.assertNotIn("XX PROPERTY", self.source)

    def test_mobile_and_semantic_structure(self):
        self.assertRegex(self.source, r'<meta\s+name="viewport"')
        for section_id in ["home", "experience", "value", "community", "cases", "contact"]:
            self.assertIn(f'id="{section_id}"', self.source)

    def test_core_messages_are_present(self):
        for text in ["泰典物业", "经验", "老旧社区", "性价比", "每一分投入"]:
            self.assertIn(text, self.source)

    def test_visual_direction_is_implemented(self):
        self.assertIn("annotation-grid", self.source)
        self.assertIn("tech-line", self.source)
        self.assertIn("assets/community.webp", self.source)
        self.assertTrue((ROOT / "styles.css").exists())
        self.assertIn("position: sticky", (ROOT / "styles.css").read_text(encoding="utf-8"))
        self.assertTrue((ROOT / "script.js").exists())

    def test_accessible_motion_fallback(self):
        css = (ROOT / "styles.css").read_text(encoding="utf-8")
        self.assertIn("prefers-reduced-motion", css)
        self.assertRegex(self.source, r'<main[^>]*>')
        self.assertIn("aria-label", self.source)

    def test_no_external_asset_dependencies(self):
        external_assets = re.findall(r'(?:src|href)=["\']https?://', self.source)
        self.assertEqual([], external_assets)

    def test_vercel_ready_files_exist(self):
        for filename in ["vercel.json", "README.md", "DATA_REQUIREMENTS.md", "DEPLOY_VERCEL.md"]:
            self.assertTrue((ROOT / filename).exists(), filename)
        config = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
        self.assertIn("headers", config)


if __name__ == "__main__":
    unittest.main()
