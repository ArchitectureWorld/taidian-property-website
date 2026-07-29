from pathlib import Path
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
CSS = ROOT / "scroll.css"
SCRIPT = ROOT / "scroll.js"
DOC = ROOT / "docs" / "STORY_SCRIPT.md"


class StoryIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = HTML.read_text(encoding="utf-8")
        cls.css = CSS.read_text(encoding="utf-8")
        cls.script = SCRIPT.read_text(encoding="utf-8")
        cls.doc = DOC.read_text(encoding="utf-8")
        cls.all_source = "\n".join((cls.html, cls.css, cls.script, cls.doc))

    def test_full_viewport_scrollytelling_structure(self):
        self.assertIn('data-experience="scrollytelling"', self.html)
        self.assertIn('data-layout="full-viewport"', self.html)
        self.assertIn('class="scroll-story"', self.html)
        self.assertIn('class="viewport-stage"', self.html)
        self.assertIn('height: 100svh', self.css)
        self.assertNotIn('border-radius: 46px', self.css)

    def test_five_chapter_story_is_present(self):
        self.assertEqual(5, len(re.findall(r'data-copy-state="[0-4]"', self.html)))
        for text in ["序章", "经验", "老旧社区", "效率价值", "长期共建"]:
            self.assertIn(text, self.html)
        self.assertIn("001 / 005", self.html)

    def test_image_layers_are_local_and_complete(self):
        image_layers = re.findall(r'class="story-image story-image--[0-3]"', self.html)
        self.assertEqual(4, len(image_layers))
        self.assertEqual(4, self.html.count('src="assets/community-scenes.avif"'))
        self.assertEqual(4, self.html.count('data-source="assets/community-scenes.avif"'))
        for index in range(4):
            self.assertIn(f'data-scene="{index}"', self.html)
            self.assertIn(f'story-sprite--{index}', self.html)
        self.assertTrue((ROOT / "assets" / "community-scenes.avif").exists())
        self.assertNotRegex(self.html, r'(?:src|href)="https?://')

    def test_images_are_continuously_blended(self):
        for token in ["sequenceWeights", "interpolateKeyframes", "applyImageState", "--image-0-opacity", "--image-1-opacity", "--image-2-opacity", "--image-3-opacity"]:
            self.assertIn(token, self.script + self.css)
        self.assertNotIn("style.display", self.script)
        self.assertNotRegex(self.script, r'classList\.(?:add|remove)\([^\n]*story-image')

    def test_scroll_drives_one_shared_display_progress(self):
        for token in ["targetProgress", "displayProgress", "requestAnimationFrame", "damp", "prefers-reduced-motion"]:
            self.assertIn(token, self.script)
        self.assertIn("addEventListener('scroll'", self.script)
        self.assertIn("updateCopy", self.script)
        self.assertIn("applyImageState", self.script)

    def test_concept_specific_visual_contract(self):
        self.assertIn('data-concept="community-life-network"', self.html)
        self.assertIn("社区生命网络", self.html)
        for token in ['community-network', 'image-veil', 'network-canvas']:
            self.assertIn(token, self.all_source)

    def test_story_script_documents_image_choreography(self):
        for heading in ["视觉母题", "图像编排", "001 序章", "002 经验", "003 老旧社区", "004 效率价值", "005 长期共建", "连续性规则", "性能规则"]:
            self.assertIn(heading, self.doc)
        self.assertIn('assets/community-scenes.avif', self.doc)
        for scene in ['scene-0', 'scene-1', 'scene-2', 'scene-3']:
            self.assertIn(scene, self.doc)

    def test_story_math_behavior(self):
        result = subprocess.run(["node", str(ROOT / "tests" / "story_math.test.js")], cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("story math ok", result.stdout)


if __name__ == "__main__":
    unittest.main()
