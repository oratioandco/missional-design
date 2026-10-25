"""Emit a sitemap covering Astro pages and the imported public reference."""
from pathlib import Path
import json, struct
from html import escape as html_escape
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
urls = []
library = json.loads((ROOT / 'src/data/app-library.json').read_text())
app_by_id = {a['id']: a for a in library['apps']}
def capture_section(slug):
    shots = [s for s in library['screens'] if slug in s['article_slugs']]
    if not shots: return ''
    # Lead with app diversity; keep every mapped example available below.
    first_by_app = list({s['app_id']: next(x for x in shots if x['app_id']==s['app_id']) for s in shots}.values())
    leading = first_by_app[:6]
    leading += [s for s in shots if s not in leading][:max(0,6-len(leading))]
    shots = leading + [s for s in shots if s not in leading]
    figures = []
    for s in shots:
        a = app_by_id[s['app_id']]
        image_bytes = (ROOT / 'public' / s['image'].lstrip('/')).read_bytes()
        size = ''
        if image_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
            width, height = struct.unpack('>II', image_bytes[16:24])
            size = ' width="'+str(width)+'" height="'+str(height)+'"'
        figures.append('<figure><a class="lib-image" href="'+s['url']+'"><img src="'+s['image']+'" alt="'+html_escape(s['screen_name'], quote=True)+'" loading="lazy"'+size+'></a><figcaption><strong>'+html_escape(s['screen_name'])+'</strong><p>'+html_escape(s['caption'])+'</p><p class="lib-note">'+html_escape(s['context'])+'</p><small>'+html_escape(a['name'])+' · Captured '+html_escape(s['captured'])+' · Version '+html_escape(s['version'] or 'not recorded')+'</small><div class="lib-evidence-links"><a href="'+s['url']+'">Screen and evidence</a><a href="'+a['url']+'#ingredients">App ingredients</a></div></figcaption></figure>')
    gallery = '<div class="lib-grid">'+''.join(figures[:6])+'</div>'
    if len(figures)>6:
        gallery += '<details class="lib-source-details"><summary>More examples for this pattern ('+str(len(figures)-6)+')</summary><div class="lib-grid">'+''.join(figures[6:])+'</div></details>'
    gallery += '<p><a href="/screens/?article='+slug+'">Explore all '+str(len(shots))+' relevant screens in the library</a></p>'
    return '<section class="lib-pattern-captures" id="app-captures" aria-labelledby="app-captures-title"><h2 id="app-captures-title">Examples in real apps</h2><p>Selected, reviewed device captures illustrate this design question. They show particular states, not every option in the spectrum or a complete app walkthrough.</p>'+gallery+'<p class="lib-note">Screenshots: respective app publishers. Captions describe the captured state; generated responses can differ. <a href="/screens/">Browse research captures</a> · <a href="/apps/assessment/">How we assess design</a>.</p></section>'

for path in sorted(DIST.rglob('index.html')):
    text = path.read_text()
    # Compose reviewed library examples into imported articles at build time.
    # Keep imported source HTML unchanged; all metadata comes from the public allowlist.
    rel = path.parent.relative_to(DIST).as_posix()
    if rel.startswith('patterns/') and rel.count('/') == 1 and 'id="app-captures"' not in text:
        section = capture_section(rel.split('/')[1])
        if section:
            marker = '<nav class="block e-blk related"'
            if marker in text:
                text = text.replace(marker, section + marker, 1)
            else:
                # Some articles have no related-pattern navigation. Their final
                # e-after wrapper still provides the same reading-width surface.
                marker = '</div></main>'
                assert 'class="e-after e-wrap"' in text and marker in text, 'Pattern insertion point missing: '+rel
                before, after = text.rsplit(marker, 1)
                text = before + section + marker + after
            text = text.replace('</head>', '<link rel="stylesheet" href="/assets/app-library/library.css"></head>')
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
