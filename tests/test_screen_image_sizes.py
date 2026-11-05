"""Screens that differ from a full capture record their real size, so pages reserve the right space."""
import json
import unittest
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = json.loads((ROOT / 'src/data/app-library.json').read_text())


class ScreenImageSizeTests(unittest.TestCase):
    def test_recorded_or_default_size_matches_the_image(self):
        for screen in LIBRARY['screens']:
            with Image.open(ROOT / 'public' / screen['image'].lstrip('/')) as picture:
                expected = (screen.get('width', 1320), screen.get('height', 2868))
                self.assertEqual(picture.size, expected, screen['id'])

    def test_public_catalog_matches_the_build_data(self):
        self.assertEqual(json.loads((ROOT / 'public/assets/app-library/catalog.json').read_text()), LIBRARY)


if __name__ == '__main__':
    unittest.main()
