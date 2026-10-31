"""Emit a sitemap covering Astro pages and the imported public reference."""
from pathlib import Path
import json, re, struct
from html import escape as html_escape
from xml.sax.saxutils import escape
import pattern_nav

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
urls = []
pattern_nav.check()
library = json.loads((ROOT / 'src/data/app-library.json').read_text())
app_by_id = {a['id']: a for a in library['apps']}
chat_compare = json.loads((ROOT / 'src/data/ai-chat-comparison.json').read_text())
def capture_gallery(slug, limit=8):
    shots = [s for s in library['screens'] if slug in s['article_slugs']]
    if not shots: return '', 0
    # Lead with app diversity; the full set stays one click away in the library.
    first_by_app = list({s['app_id']: next(x for x in shots if x['app_id']==s['app_id']) for s in shots}.values())
    leading = first_by_app[:limit]
    leading += [s for s in shots if s not in leading][:max(0,limit-len(leading))]
    figures = []
    for s in leading:
        a = app_by_id[s['app_id']]
        image_bytes = (ROOT / 'public' / s['image'].lstrip('/')).read_bytes()
        size = ''
        if image_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
            width, height = struct.unpack('>II', image_bytes[16:24])
            size = ' width="'+str(width)+'" height="'+str(height)+'"'
        figures.append('<figure><a class="lib-image" href="'+s['url']+'"><img src="'+s['image']+'" alt="'+html_escape(s['screen_name'], quote=True)+'" loading="lazy"'+size+'></a><figcaption><strong><a href="'+s['url']+'">'+html_escape(s['screen_name'])+'</a></strong><p>'+html_escape(s['caption'])+'</p><small><a href="'+a['url']+'">'+html_escape(a['name'])+'</a> · '+html_escape(s['captured'])+'</small></figcaption></figure>')
    gallery = '<div class="lib-grid lib-pattern-captures">'+''.join(figures)+'</div>'
    compared = [q for q in chat_compare['questions'] if slug in q['patterns']]
    if compared:
        # Pattern pages that the chat comparison covers point to the side-by-side answers.
        links = ', '.join('<a href="/apps/ai-chat/#'+q['id']+'">'+html_escape(q['question'])+'</a>' for q in compared)
        gallery = '<p class="lib-pattern-compare">Five faith chat apps, asked the same question: '+links+'</p>' + gallery
    gallery += '<p class="lib-pattern-all"><a href="/screens/?article='+slug+'">See all '+str(len(shots))+' screens for this pattern</a> · <a href="/apps/">Browse apps</a> · <a href="/apps/assessment/">How we review</a></p><p class="lib-note">Screenshots: respective app publishers. Captions describe the captured state; generated responses can differ.</p>'
    return gallery, len(shots)

def capture_section(slug):
    gallery, count = capture_gallery(slug)
    if not count: return ''
    return '<section class="block e-blk" id="app-examples" aria-labelledby="app-captures-title"><p class="kicker">In real apps</p><h2 id="app-captures-title">Examples in real apps</h2><p class="block-intro">Reviewed device captures of particular states. They show an implementation, not every option or a complete app walkthrough.</p>'+gallery+'</section>'

examples = json.loads((ROOT / 'public/api/examples.json').read_text())['examples']
app_by_name = {a['name'].lower(): a for a in library['apps']}
app_by_name.update({k: app_by_id[v] for k, v in {'youversion': 'tv.lifechurch.bible', 'bibleai': 'ai.bible.bibleai', 'olive tree': 'com.olivetree.BR-Free', 'neubible (now mere bible)': 'com.quietpupil.neubible', 'mere bible (formerly neubible)': 'com.quietpupil.neubible'}.items() if v in app_by_id})
example_app = {e['url'].rstrip('/').rsplit('/', 1)[1]: app_by_name.get((e.get('app') or '').lower()) for e in examples}
assessments = json.loads((ROOT / 'src/data/app-assessments.json').read_text())
rubric = json.loads((ROOT / 'src/data/app-design-rubric.json').read_text())
verdicts = {'concern_evidenced':'Works against the person','ethical_baseline_observed':'Respects the person','mixed':'Respects and works against the person','redemptive_candidate':'May restore, at the builder’s cost','redemptive_practice_evidenced':'Restores, at the builder’s cost'}
def principle_section(pid):
    dims = {d['id']: d for d in rubric['dimensions'] if pid in d['principle_ids']}
    rows = []
    for x in assessments['apps']:
        a = app_by_id.get(x['app_id'])
        if not a: continue
        for did, f in x['dimensions'].items():
            if did in dims and f['status'] in verdicts:
                rows.append('<li><a href="'+a['url']+'#finding-'+did+'"><strong>'+html_escape(a['name'])+'</strong> · '+html_escape(verdicts[f['status']])+'</a><p>'+html_escape(f['scope'])+'</p></li>')
    areas = ', '.join(d['label'] for d in dims.values())
    body = '<ul class="lib-principle-obs">'+''.join(rows)+'</ul>' if rows else '<p>No app observation has been placed for this principle yet.</p>'
    return '<section class="block" id="in-real-apps"><h2>Seen in real apps</h2><p>App design reviews connect this principle to the review area'+('s' if len(dims)>1 else '')+' '+html_escape(areas)+'. Each entry is one scoped observation of a specific flow, not a verdict on the app.</p>'+body+'<p><a href="/apps/">Browse app profiles</a> · <a href="/apps/assessment/">How we review</a></p></section>'
for path in sorted(DIST.rglob('index.html')):
    text = path.read_text()
    # Compose reviewed library examples into imported articles at build time.
    # Keep imported source HTML unchanged; all metadata comes from the public allowlist.
    rel = path.parent.relative_to(DIST).as_posix()
    if rel.startswith('patterns/') and rel.count('/') == 1 and 'id="app-captures-title"' not in text:
        slug = rel.split('/')[1]
        gallery, count = capture_gallery(slug)
        start = text.find('<section class="block e-blk" id="app-examples">')
        if count and start >= 0:
            end = text.find('</section>', start)
            body = text[start:end]
            body = body.replace('<h2 class="rv">Examples in use</h2>', '<h2 class="rv" id="app-captures-title">Examples in real apps</h2>', 1)
            body = re.sub(r'<p><a href="/examples/">Explore the growing app-example collection</a></p>', '', body)
            body = body.replace('<div class="grid">', '<h3 class="lib-curated-title">Annotated examples</h3><div class="grid">', 1)
            body += '<h3 class="lib-curated-title">Research screens</h3>' + gallery
            text = text[:start] + body + text[end:]
            text = re.sub(r'<li><strong>\d+</strong> app examples</li>', '<li><strong>'+str(count)+'</strong> app screens</li>', text, count=1)
        elif count:
            section = capture_section(slug)
            marker = '<nav class="block e-blk related"'
            if marker in text:
                text = text.replace(marker, section + marker, 1)
            else:
                marker = '</div></main>'
                assert 'class="e-after e-wrap"' in text and marker in text, 'Pattern insertion point missing: '+rel
                before, after = text.rsplit(marker, 1)
                text = before + section + marker + after
        if count:
            text = text.replace('</head>', '<link rel="stylesheet" href="/assets/app-library/library.css"></head>')
    if rel.startswith('examples/') and rel.count('/') == 1 and 'data-app-profile-link' not in text:
        a = example_app.get(rel.split('/')[1])
        lead_end = text.find('</p>', text.find('<p class="lead">'))
        if a and lead_end > 0:
            text = text[:lead_end+4] + '<p class="lib-example-app" data-app-profile-link>Observed in <a href="'+a['url']+'">'+html_escape(a['name'])+'</a>: app profile, research screenshots and design review.</p>' + text[lead_end+4:]
    text = text.replace('href="https://missional.design/reference/" aria-current="page">Patterns<', 'href="https://missional.design/patterns/" aria-current="location">Patterns<').replace('href="https://missional.design/reference/">Patterns<', 'href="https://missional.design/patterns/">Patterns<')
    # One Patterns menu in every header; the overview by area; wayfinding on each pattern page.
    text = pattern_nav.add_menu(text, rel)
    if rel == 'patterns':
        text = pattern_nav.overview(text)
    elif rel.startswith('patterns/') and rel.count('/') == 1:
        text = pattern_nav.wayfinding(text, rel.split('/')[1])
    if rel.startswith('principles/') and rel.count('/') == 1 and 'id="in-real-apps"' not in text:
        marker = '<nav class="block related" aria-label="Other principles">'
        if marker in text:
            text = text.replace(marker, principle_section(rel.split('/')[1]) + marker, 1)
            text = text.replace('<a href="#deep-dives">In the deep dives</a></nav>', '<a href="#deep-dives">In the deep dives</a><a href="#in-real-apps">Seen in real apps</a></nav>', 1)
            if '/assets/app-library/library.css' not in text:
                text = text.replace('</head>', '<link rel="stylesheet" href="/assets/app-library/library.css"></head>')
    # Add the same native disclosure menu to imported reference mastheads.
    about = '<a href="https://missional.design/about/" data-site-about>'
    if about in text:
        text = text.replace('<a href="/screens/">Apps</a>', '')
        items = json.loads((ROOT / 'public/assets/editorial/research-navigation.json').read_text())
        links = ''.join('<a href="'+i['href']+'"><strong>'+html_escape(i['label'])+'</strong><span>'+html_escape(i['description'])+'</span></a>' for i in items)
        menu = '<details class="research-menu"><summary>App library<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></summary><div class="research-menu-links" role="group" aria-label="App library and patterns">'+links+'</div></details>'
        if 'class="research-menu"' not in text:
            tools = '<a href="https://missional.design/building-tools/">'
            text = text.replace(tools, menu + tools, 1) if tools in text else text.replace(about, menu + about, 1)
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
