from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
CSS = ROOT / "scroll.css"
SCRIPT = ROOT / "scroll.js"
CONCEPT_DOC = ROOT / "docs" / "SCROLLYTELLING_CONCEPT.md"


class ScrollytellingAcceptanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = HTML.read_text(encoding="utf-8")
        cls.css = CSS.read_text(encoding="utf-8")
        cls.script = SCRIPT.read_text(encoding="utf-8")
        concept_match = re.search(r'data-concept="([^"]+)"', cls.source)
        cls.concept = concept_match.group(1) if concept_match else ""

    def test_product_language_is_scrollytelling(self):
        self.assertIn("滚动叙事", self.source)
        self.assertIn('data-experience="scrollytelling"', self.source)
        self.assertNotIn("滚动概念", self.source)
        self.assertRegex(self.source, r"<title>泰典物业｜滚动叙事")
        self.assertRegex(self.source, r'<meta name="description" content="[^"]*滚动叙事')

    def test_five_chapter_brand_story_exists(self):
        self.assertEqual(5, len(re.findall(r'data-copy-state="[0-4]"', self.source)))
        self.assertEqual(5, len(re.findall(r'class="state-tab(?: is-active)?"', self.source)))
        for text in ["001 / 005", "泰典物业", "经验", "老旧社区", "性价比", "长期"]:
            self.assertIn(text, self.source)

    def test_scroll_is_the_narrative_time_axis(self):
        for token in ["scroll-story", "device-shell", "story-steps", "targetProgress", "displayProgress", "damp", "requestAnimationFrame"]:
            self.assertIn(token, self.source + self.css + self.script)
        self.assertIn("addEventListener('scroll'", self.script)
        self.assertIn("scrollToState", self.script)

    def test_continuous_handoff_replaces_background_hard_cut(self):
        for token in ["--handoff", ".after-story::before", "var(--handoff)", "handoffStart", "contentEnd"]:
            self.assertIn(token, self.css + self.script)
        self.assertIn("translate3d", self.css)

    def test_concept_specific_visual_contract(self):
        contracts = {
            "community-life-network": ["community-network", "particleCount", "社区生命网络"],
            "architectural-wireframe": ["architecture-canvas", "drawBuilding", "建筑空间模型"],
            "community-digital-overlay": ["service-overlay", "scene-image", "数字化服务网络"],
        }
        self.assertIn(self.concept, contracts)
        combined = self.source + self.css + self.script
        for token in contracts[self.concept]:
            self.assertIn(token, combined)

    def test_accessibility_and_motion_fallbacks_exist(self):
        self.assertIn("prefers-reduced-motion", self.script)
        self.assertIn("aria-label", self.source)
        self.assertIn("aria-live", self.source)
        self.assertNotRegex(self.source, r'(?:src|href)="https?://')

    def test_branch_documentation_exists(self):
        self.assertTrue(CONCEPT_DOC.exists())
        documentation = CONCEPT_DOC.read_text(encoding="utf-8")
        self.assertIn("滚动叙事", documentation)
        self.assertIn("五章叙事", documentation)

    def test_deployment_files_remain_available(self):
        for filename in ["vercel.json", "README.md", "DATA_REQUIREMENTS.md", "DEPLOY_VERCEL.md"]:
            self.assertTrue((ROOT / filename).exists(), filename)


if __name__ == "__main__":
    unittest.main()
