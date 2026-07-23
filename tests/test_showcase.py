from pathlib import Path
import json
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
CSS = ROOT / "styles.css"
SCRIPT = ROOT / "script.js"


class ShowcaseAcceptanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = HTML.read_text(encoding="utf-8")
        cls.css = CSS.read_text(encoding="utf-8")
        cls.script = SCRIPT.read_text(encoding="utf-8")
        cls.all_frontend = "\n".join((cls.source, cls.css, cls.script))

    def test_static_site_and_metadata_exist(self):
        self.assertIn("<!doctype html>", self.source.lower())
        self.assertIn("<title>泰典物业", self.source)
        self.assertRegex(self.source, r'<meta\s+name="viewport"')
        self.assertRegex(self.source, r'<meta\s+name="description"')
        self.assertIn('name="theme-color"', self.source)

    def test_brand_and_core_messages_remain_primary(self):
        self.assertRegex(self.source, r'<h1\s+class="hero-company">\s*泰典物业\s*</h1>')
        for text in ["泰典物业", "住宅物业", "老旧社区", "性价比", "每一分投入"]:
            self.assertIn(text, self.source)
        self.assertNotIn("XX物业", self.source)
        self.assertNotIn("XX PROPERTY", self.source)

    def test_semantic_sections_and_skip_link_exist(self):
        self.assertIn('class="skip-link"', self.source)
        self.assertIn('<main id="main-content">', self.source)
        for section_id in ["home", "experience", "value", "community", "cases", "contact"]:
            self.assertIn(f'id="{section_id}"', self.source)

    def test_new_editorial_visual_direction_replaces_technical_overlay(self):
        for token in ["hero-visual", "proof-strip", "case-card--featured", "case-card--compact"]:
            self.assertIn(token, self.source)
        for obsolete in ["annotation-grid", "tech-line", "coordinate", "BUILDING A-03", "ZONE: 07"]:
            self.assertNotIn(obsolete, self.all_frontend)
        for variable in ["--paper", "--forest", "--bronze", "--ink"]:
            self.assertIn(variable, self.css)

    def test_community_asset_is_local_and_bounded(self):
        self.assertIn("assets/community.webp", self.source)
        self.assertTrue((ROOT / "assets" / "community.webp").exists())
        external_assets = re.findall(r'(?:src|href)=["\']https?://', self.source)
        self.assertEqual([], external_assets)
        self.assertIn("hero-visual__frame", self.source)
        self.assertIn("aspect-ratio", self.css)

    def test_mobile_navigation_is_accessible_and_scripted(self):
        self.assertRegex(
            self.source,
            r'<button[^>]+id="menu-toggle"[^>]+aria-controls="site-nav"[^>]+aria-expanded="false"',
        )
        self.assertRegex(self.source, r'<nav[^>]+id="site-nav"')
        self.assertIn('id="nav-scrim"', self.source)
        for behavior in ["menu-open", "aria-expanded", "Escape", "matchMedia"]:
            self.assertIn(behavior, self.script)

    def test_accessibility_and_motion_fallbacks_exist(self):
        self.assertIn(":focus-visible", self.css)
        self.assertIn("prefers-reduced-motion", self.css)
        self.assertIn("IntersectionObserver", self.script)
        self.assertIn("aria-label", self.source)
        self.assertIn("aria-hidden", self.source)

    def test_demo_data_is_disclosed_without_inventing_proof_metrics(self):
        self.assertIn("示例数据，正式发布前核验", self.source)
        self.assertIn("待替换示例", self.source)
        for fabricated_metric in ["98%", "99%", "24小时响应", "服务100+小区"]:
            self.assertNotIn(fabricated_metric, self.source)

    def test_deployment_files_remain_valid(self):
        for filename in ["vercel.json", "README.md", "DATA_REQUIREMENTS.md", "DEPLOY_VERCEL.md"]:
            self.assertTrue((ROOT / filename).exists(), filename)
        config = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
        self.assertIn("headers", config)


if __name__ == "__main__":
    unittest.main()
