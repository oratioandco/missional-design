"""Pattern navigation composed at build time: the header menu, the /patterns/ overview by area,
and wayfinding on each pattern page. Areas come from src/data/pattern-areas.json; titles and
questions from the imported public/api/deep-dives.json. Imported reference HTML stays unchanged
on disk; finalize-reference.py applies these functions to dist/ only."""
from html import escape
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent.parent
AREAS = json.loads((ROOT / 'src/data/pattern-areas.json').read_text())['areas']
DIVES = {d['slug']: d for d in json.loads((ROOT / 'public/api/deep-dives.json').read_text())['deep_dives']}
AREA_OF = {slug: area for area in AREAS for slug in area['slugs']}
CHEVRON = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>'


def check():
    listed = [slug for area in AREAS for slug in area['slugs']]
    assert len(listed) == len(set(listed)), 'A pattern is listed in two areas'
    assert set(listed) == set(DIVES), f'Areas and published patterns differ: {sorted(set(listed) ^ set(DIVES))}'


def title(slug):
    return DIVES[slug]['title']


def menu(label='Patterns', current=None, slug=None, de=False):
    """Split control: the link opens the overview, the button opens every pattern by area."""
    cur = f' aria-current="{current}"' if current else ''
    toggle = 'Alle Patterns nach Bereich anzeigen' if de else 'Show all patterns by area'
    areas = []
    for area in AREAS:
        links = ''.join('<li><a href="/patterns/'+s+'/"'+(' aria-current="page"' if s == slug else '')+'>'+escape(title(s))+'</a></li>' for s in area['slugs'])
        areas.append('<section class="pmenu-area"><h2 class="pmenu-area-head"><button class="pmenu-area-btn" type="button" aria-expanded="true" aria-controls="pmenu-l-'+area['id']+'">'
                     + escape(area['label'])+' <span class="pmenu-count">'+str(len(area['slugs']))+'</span>'+CHEVRON+'</button></h2><ul id="pmenu-l-'+area['id']+'">'+links+'</ul></section>')
    foot = ('<p class="pmenu-foot"><a href="/patterns/">All patterns by area</a><a href="/patterns/tensions/">Where patterns pull against each other</a>'
            '<a href="/screens/">Screens from real apps</a></p>')
    return ('<div class="pmenu" data-pmenu><a class="pmenu-link" href="/patterns/"'+cur+'>'+escape(label)+'</a>'
            '<button class="pmenu-toggle" type="button" aria-expanded="false" aria-controls="pmenu-panel" aria-label="'+toggle+'">'+CHEVRON+'</button>'
            '<div class="pmenu-panel" id="pmenu-panel" hidden><div class="pmenu-grid">'+''.join(areas)+'</div>'+foot+'</div></div>')


def add_menu(text, rel):
    """Replace the header's Patterns link, on native Astro pages and imported reference pages."""
    slug = rel.split('/')[1] if rel.startswith('patterns/') and rel.count('/') == 1 else None
    current = 'page' if rel == 'patterns' else 'location' if rel.startswith(('patterns/', 'topics/')) else None
    de = rel == 'de' or rel.startswith('de/')

    def native(m):
        return menu(m.group(2), current or (re.search(r'aria-current="([^"]+)"', m.group(1)) or [None, None])[1], slug, de)
    text = re.sub(r'<a ([^>]*\bdata-patterns-menu\b[^>]*)>([^<]*)</a>', native, text)
    start = text.find('<nav class="e-nav"')
    if start >= 0 and 'data-pmenu' not in text[start:text.find('</nav>', start)]:
        end = text.find('</nav>', start)
        segment = re.sub(r'<a href="https://missional\.design/patterns/"( aria-current="[^"]*")?>Patterns</a>',
                         lambda m: menu('Patterns', current or ('location' if m.group(1) else None), slug), text[start:end], count=1)
        text = text[:start] + segment + text[end:]
    return text


def overview(text):
    """Regroup the flat list of pattern cards on /patterns/ into areas, keeping each card's markup."""
    start = text.find('<ul class="deep-grid">')
    if start < 0 or 'id="area-' in text:
        return text
    end = text.find('</ul>', start) + len('</ul>')
    cards = {m.group(2): m.group(1) for m in re.finditer(r'(<li><a class="deep-card" href="/patterns/([a-z0-9-]+)/">.*?</a></li>)', text[start:end], re.S)}
    assert set(cards) == set(DIVES), f'Overview cards and areas differ: {sorted(set(cards) ^ set(DIVES))}'
    jump = '<nav class="pattern-areas-jump" aria-label="Pattern areas">'+''.join(
        '<a href="#area-'+a['id']+'">'+escape(a['label'])+' <span>'+str(len(a['slugs']))+'</span></a>' for a in AREAS)+'</nav>'
    groups = ''.join('<div class="pattern-area" id="area-'+a['id']+'"><h3>'+escape(a['label'])+'</h3><p class="pattern-area-summary">'+escape(a['summary'])+'</p><ul class="deep-grid">'
                     + ''.join(cards[s] for s in a['slugs'])+'</ul></div>' for a in AREAS)
    text = text[:start] + jump + groups + text[end:]
    text = text.replace('<p class="kicker">Deep dives</p><h2>Options side by side, with the research</h2>',
                        '<p class="kicker">By area</p><h2>Options side by side, with the research</h2>', 1)
    text = text.replace('Each deep dive connects practical decisions', 'Each pattern connects practical decisions', 1)
    lede_end = text.find('</p>', text.find('<p class="lede">')) + len('</p>')
    if lede_end > len('</p>'):
        text = text[:lede_end] + '<p class="pattern-intro-link">New to the patterns? <a href="/reference/">Read the introduction</a>, or start from a <a href="/screens/">screen in a real app</a>.</p>' + text[lede_end:]
    return text


def wayfinding(text, slug):
    """Breadcrumb by area, the area's other patterns beside the contents, and previous/next."""
    area = AREA_OF.get(slug)
    if not area or 'class="pattern-pager"' in text:
        return text
    crumb = '<a href="/patterns/#area-'+area['id']+'">'+escape(area['label'])+'</a>'
    text = re.sub(r'(<p class="e-crumbs"><a href="/patterns/">Patterns</a><span aria-hidden="true">/</span>)<a href="/topics/[^"]+/">[^<]*</a>',
                  lambda m: m.group(1) + crumb, text, count=1)
    siblings = ''.join('<a href="/patterns/'+s+'/"'+(' aria-current="page"' if s == slug else '')+'>'+escape(title(s))+'</a>' for s in area['slugs'])
    toc = text.find('<nav class="e-toc"')
    if toc >= 0:
        close = text.find('</nav>', toc)
        text = text[:close] + '<div class="e-area-list"><p>In '+escape(area['label'])+'</p>'+siblings+'</div>' + text[close:]
    i = area['slugs'].index(slug)
    links = ''
    if i > 0:
        p = area['slugs'][i-1]
        links += '<a rel="prev" href="/patterns/'+p+'/"><span>Previous</span><strong>'+escape(title(p))+'</strong></a>'
    if i < len(area['slugs']) - 1:
        n = area['slugs'][i+1]
        links += '<a rel="next" href="/patterns/'+n+'/"><span>Next</span><strong>'+escape(title(n))+'</strong></a>'
    pager = ('<nav class="block e-blk pattern-pager" aria-label="More in '+escape(area['label'])+'"><p class="kicker">More in '+escape(area['label'])+'</p>'
             '<div class="pattern-pager-links">'+links+'</div><p class="pattern-pager-all"><a href="/patterns/#area-'+area['id']+'">All '+str(len(area['slugs']))
             + ' patterns in '+escape(area['label'])+'</a> · <a href="/patterns/">All patterns</a></p></nav>')
    marker = '<nav class="block e-blk related"'
    if marker in text:
        return text.replace(marker, pager + marker, 1)
    before, after = text.rsplit('</div></main>', 1)
    return before + pager + '</div></main>' + after
