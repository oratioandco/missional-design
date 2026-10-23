"""Bring the generated pattern reference into the unified missional.design site.

Only public dist/ artifacts are imported. Research caches, private photos,
editorial source files and credentials never enter this export. Existing
Astro pages remain authoritative at / and /about/; the reference's corresponding
pages live at /reference/ and /reference/about/. MCP stays at its existing host.
"""
from pathlib import Path
import argparse
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=ROOT.parent / 'bible-faith-patterns' / 'dist')
args = parser.parse_args()
if not (args.source / 'field-guide/index.html').exists():
    raise FileNotFoundError('Build the reference site before importing its public output')
manifest = ROOT / 'reference-import-manifest.json'
old = set(json.loads(manifest.read_text())['files']) if manifest.exists() else set()
new = set()
text_ext = {'.html', '.css', '.js', '.json', '.md', '.txt', '.svg'}
for source in sorted(args.source.rglob('*')):
    if not source.is_file():
        continue
    rel = source.relative_to(args.source)
    if rel.as_posix() in {'sitemap.xml', 'robots.txt'}:
        continue
    if rel == Path('index.html'):
        rel = Path('reference/index.html')
    elif rel.parts[0] == 'about':
        rel = Path('reference') / rel
    target = ROOT / 'public' / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    if source.suffix in text_ext:
        text = source.read_text()
        # Keep the actual service endpoint and instructions valid. Ordinary
        # content, assets and canonical URLs now use the main site's origin.
        text = re.sub(r'https://patterns\.missional\.design(?!/mcp\b)', 'https://missional.design', text)
        text = text.replace('https://missional.design/about', 'https://missional.design/reference/about')
        text = re.sub(r'(["\'])/about(?=[/#"\'])', r'\1/reference/about', text)
        # The shared masthead's About is the site's /about/, not the reference's About page.
        text = text.replace('href="https://missional.design/reference/about/" data-site-about', 'href="https://missional.design/about/" data-site-about')
        if source.relative_to(args.source) == Path('index.html'):
            text = text.replace('data-auto href="https://missional.design/"', 'data-auto href="https://missional.design/reference/"')
            text = text.replace('property="og:url" content="https://missional.design/"', 'property="og:url" content="https://missional.design/reference/"')
        text = text.replace('href="https://missional.design">Missional.design ↗</a>', 'href="/framework/">Framework</a>')
        if source.relative_to(args.source) == Path('api/pages.json'):
            payload = json.loads(text)
            for page in payload.get('pages', []):
                if page.get('url') == 'https://missional.design/':
                    page['url'] = 'https://missional.design/reference/'
            text = json.dumps(payload, ensure_ascii=False, indent=2) + '\n'
        target.write_text(text)
    else:
        shutil.copy2(source, target)
    new.add(rel.as_posix())
for rel in old - new:
    target = ROOT / 'public' / rel
    if target.is_file():
        target.unlink()
manifest.write_text(json.dumps({'source': 'bible-faith-patterns public dist output', 'files': sorted(new)}, indent=2) + '\n')
print('Imported', len(new), 'public files into the unified site')
