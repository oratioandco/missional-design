"""Emit a sitemap covering Astro pages and the imported public reference."""
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
urls = []
for path in sorted(DIST.rglob('index.html')):
    text = path.read_text()
    rel = path.parent.relative_to(DIST).as_posix()
    if rel.startswith('demos') or 'content="noindex"' in text or 'http-equiv="refresh"' in text or 'http-equiv="Refresh"' in text:
        continue
    rel = path.parent.relative_to(DIST).as_posix()
    url = 'https://missional.design/' + ('' if rel == '.' else rel + '/')
    urls.append(url)
(DIST / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('<url><loc>' + escape(u) + '</loc></url>\n' for u in urls) + '</urlset>\n')
(DIST / 'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://missional.design/sitemap.xml\n')
print('Unified sitemap:', len(urls), 'pages')
