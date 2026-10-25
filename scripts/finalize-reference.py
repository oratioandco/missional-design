"""Emit a sitemap covering Astro pages and the imported public reference."""
from pathlib import Path
import json
from html import escape as html_escape
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
urls = []
for path in sorted(DIST.rglob('index.html')):
    text = path.read_text()
    # Add the same native disclosure menu to imported reference mastheads.
    about = '<a href="https://missional.design/about/" data-site-about>'
    if about in text:
        text = text.replace('<a href="/screens/">Apps</a>', '')
        items = json.loads((ROOT / 'public/assets/editorial/research-navigation.json').read_text())
        links = ''.join('<a href="'+i['href']+'"><strong>'+html_escape(i['label'])+'</strong><span>'+html_escape(i['description'])+'</span></a>' for i in items)
        menu = '<details class="research-menu"><summary>App library<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></summary><div class="research-menu-links" role="group" aria-label="App library and patterns">'+links+'</div></details>'
        if 'class="research-menu"' not in text:
            text = text.replace(about, menu + about, 1)
        if '/assets/editorial/research-nav.css' not in text:
            text = text.replace('</head>', '<link rel="stylesheet" href="/assets/editorial/research-nav.css"><script defer src="/assets/editorial/research-nav.js"></script></head>')
        if 'src="/editorial.js' not in text:
            text = text.replace('</head>', '<script defer src="/editorial.js"></script></head>')
        path.write_text(text)
    rel = path.parent.relative_to(DIST).as_posix()
    if rel.startswith('demos') or 'content="noindex"' in text or 'http-equiv="refresh"' in text or 'http-equiv="Refresh"' in text:
        continue
    rel = path.parent.relative_to(DIST).as_posix()
    url = 'https://missional.design/' + ('' if rel == '.' else rel + '/')
    urls.append(url)
(DIST / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('<url><loc>' + escape(u) + '</loc></url>\n' for u in urls) + '</urlset>\n')
(DIST / 'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://missional.design/sitemap.xml\n')
print('Unified sitemap:', len(urls), 'pages')
