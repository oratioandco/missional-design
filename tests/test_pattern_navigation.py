"""Every published pattern has exactly one navigation area; drafts stay hidden."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AREAS = json.loads((ROOT / 'src/data/pattern-areas.json').read_text())
PUBLISHED = {d['slug'] for d in json.loads((ROOT / 'public/api/deep-dives.json').read_text())['deep_dives']}


class PatternAreaTests(unittest.TestCase):
    def test_every_published_pattern_has_exactly_one_area(self):
        listed = [slug for area in AREAS['areas'] for slug in area['slugs']]
        for slug in PUBLISHED:
            self.assertEqual(listed.count(slug), 1, slug)
        self.assertEqual(set(listed), PUBLISHED)

    def test_planned_drafts_are_not_shown(self):
        ids = {area['id'] for area in AREAS['areas']}
        for slug, area in AREAS['planned'].items():
            self.assertNotIn(slug, PUBLISHED, f'{slug} is published: move it into its area')
            self.assertIn(area, ids)

    def test_areas_have_labels_and_summaries(self):
        for area in AREAS['areas']:
            self.assertTrue(area['label'] and area['summary'] and area['slugs'], area['id'])


if __name__ == '__main__':
    unittest.main()
