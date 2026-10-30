"""The faith chat comparison may only cite public screens of the app it describes."""
import hashlib
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'src/data/ai-chat-comparison.json').read_text())
LIBRARY = json.loads((ROOT / 'src/data/app-library.json').read_text())
SCREENS = {s['id']: s for s in LIBRARY['screens']}
SLUGS = {a['slug']: a['id'] for a in LIBRARY['apps']}
APPS = {a['key']: a for a in DATA['apps'] + DATA['also']}


def screen(key):
    day, rest = key.split('/', 1)
    return SCREENS.get('shot-' + hashlib.sha256(f'2026-10-{day}/{rest}.png'.encode()).hexdigest()[:20])


def cells():
    for q in DATA['questions']:
        for key, cell in q['cells'].items():
            yield q, key, cell
        for cell in q.get('also', []):
            yield q, cell['app'], cell


class ComparisonTests(unittest.TestCase):
    def test_every_app_has_a_public_profile(self):
        for app in APPS.values():
            self.assertIn(app['slug'], SLUGS, app['name'])

    def test_evidence_is_public_and_belongs_to_the_app(self):
        for q, key, cell in cells():
            for ref in cell['evidence']:
                shot = screen(ref)
                self.assertIsNotNone(shot, f'{q["id"]}/{key}: {ref} is not a public screen')
                self.assertEqual(shot['app_id'], SLUGS[APPS[key]['slug']], f'{q["id"]}/{key}: {ref}')

    def test_kinds_and_patterns_are_known(self):
        deep_dives = {d['slug'] for d in json.loads((ROOT / 'public/api/deep-dives.json').read_text())['deep_dives']}
        for q, key, cell in cells():
            self.assertIn(cell['kind'], DATA['kinds'])
        for q in DATA['questions']:
            self.assertTrue(set(q['patterns']) <= deep_dives, q['id'])

    def test_no_private_text(self):
        text = json.dumps(DATA, ensure_ascii=False)
        self.assertIsNone(re.search(r'Tobias|Treppmann|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|/Users/|phone-captures', text))


if __name__ == '__main__':
    unittest.main()
