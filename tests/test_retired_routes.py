"""Retired reference routes stay redirects, and nothing in the public snapshot links to them (6 November 2026)."""
from pathlib import Path
import re
import unittest

PUBLIC = Path(__file__).resolve().parent.parent / 'public'
RETIRED = {'principles': '/framework/', 'field-guide': '/framework/', 'reference': '/patterns/'}
LINK = re.compile(r'''(?:href=["']|"url":\s*")(?:https://missional\.design)?/(principles|field-guide|reference)/(?:#[^"']*)?["']''')


class RetiredRoutes(unittest.TestCase):
    def test_stubs_redirect(self):
        for slug, target in RETIRED.items():
            text = (PUBLIC / slug / 'index.html').read_text()
            self.assertIn(f'http-equiv="refresh" content="0; url={target}"', text, slug)
            self.assertIn(f'rel="canonical" href="https://missional.design{target}"', text, slug)
            self.assertIn('name="robots" content="noindex"', text, slug)

    def test_no_links_to_retired_routes(self):
        offenders = []
        for f in PUBLIC.rglob('*'):
            if f.suffix not in {'.html', '.json', '.js'} or not f.is_file():
                continue
            if f.parent.relative_to(PUBLIC).as_posix() in RETIRED:
                continue
            if LINK.search(f.read_text(errors='ignore')):
                offenders.append(f.relative_to(PUBLIC).as_posix())
        self.assertEqual(offenders, [])

    def test_field_guide_pdfs_kept_but_unlinked(self):
        for name in ('missional-by-design-field-guide.pdf', 'missional-by-design-field-guide-a5.pdf'):
            self.assertTrue((PUBLIC / 'assets' / name).exists())
        linked = [f for f in PUBLIC.rglob('*.html') if 'missional-by-design-field-guide' in f.read_text(errors='ignore')]
        self.assertEqual(linked, [])

    def test_secondary_bar_has_one_patterns_link(self):
        """Owner, 7 November 2026: the label links to /patterns/; no second "Patterns" link beside "Start here"."""
        dup = re.compile(r'>Start here</a><a href="/patterns/"[^>]*>Patterns</a>')
        offenders = [f.relative_to(PUBLIC).as_posix() for f in PUBLIC.rglob('*.html') if dup.search(f.read_text(errors='ignore'))]
        self.assertEqual(offenders, [])


class SocialCards(unittest.TestCase):
    """Owner, 7 November 2026: social card URLs carry a version query so caches refresh (added in finalize-reference.py)."""

    def test_built_og_images_are_versioned(self):
        dist = PUBLIC.parent / 'dist'
        if not dist.is_dir():
            self.skipTest('no build')
        tag = re.compile(r'<meta (?:property|name)="(?:og|twitter):image" content="([^"]*/assets/og/[^"]*)"')
        bare = sorted({f.relative_to(dist).as_posix() for f in dist.rglob('index.html') for u in tag.findall(f.read_text(errors='ignore')) if '?v=' not in u})
        self.assertEqual(bare, [])



RETIRED_SCENES = ['silicon-connection-v8', 'silicon-dialogue-v13', 'silicon-reading-v13', 'silicon-people-v14',
                  'silicon-practice-v13', 'silicon-makers-v14', 'silicon-conversation-v4', 'silicon-window-v3',
                  'silicon-specimen-studio-v1', 'identity-meetup-conversation-v2', 'identity-meetup-workshop-v1']


class RetiredScenes(unittest.TestCase):
    """Owner, 6 November 2026 (DESIGN_SYSTEM.md Imagery): these scenes are retired. Files stay; pages must not use them."""

    def test_no_page_references_a_retired_scene(self):
        roots = [PUBLIC] + ([PUBLIC.parent / 'dist'] if (PUBLIC.parent / 'dist').is_dir() else [])
        offenders = []
        for root in roots:
            for f in root.rglob('*'):
                if f.suffix not in {'.html', '.css', '.js'} or not f.is_file():
                    continue
                text = f.read_text(errors='ignore')
                hits = [s for s in RETIRED_SCENES if s in text]
                if hits:
                    offenders.append(f'{f.relative_to(root.parent)}: {", ".join(hits)}')
        self.assertEqual(offenders, [])


if __name__ == '__main__':
    unittest.main()
