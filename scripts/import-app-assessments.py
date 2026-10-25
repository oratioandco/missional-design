"""Allowlist public assessment fields for existing public app profiles only."""
import argparse,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def export(source):
 data=json.loads(source.read_text());library=json.loads((ROOT/'src/data/app-library.json').read_text());ids={a['id'] for a in library['apps']};screens={s['url'] for s in library['screens']};result=[]
 for a in data['apps']:
  if a['app_id'] not in ids:continue
  ingredients=[]
  for i in a['ingredients']:
   if i['status']!='observed_in_reviewed_capture':continue
   evidence=[e for e in i['evidence'] if e['source_url'].removeprefix('https://missional.design') in screens]
   assert evidence,'Observed ingredient requires a public capture'
   ingredients.append({k:i.get(k) for k in ['kind','feature_id','pattern_slug','label','pattern_slugs','implementation','pattern_relation']}|{'evidence':[{'url':e['source_url'].removeprefix('https://missional.design')} for e in evidence]})
  r=a['reviews'];play=[]
  if r['android_identity']['status']=='reviewed_product_identity_match':
   for stream in r['google_play_sources']:
    s=stream['sample'];play.append(dict(language=stream['lang'],country=stream['country'],n=s['recent_180_days']['n'],histogram=s['recent_180_days']['histogram'],oldest=s['oldest'],newest=s['newest'],url=f"https://play.google.com/store/apps/details?id={stream['package']}&hl={stream['lang']}&gl={stream['country']}"))
  apple=r['apple_review_page'];finding=a.get('review_findings');result.append(dict(app_id=a['app_id'],checked=a['reviewed'],ingredients=ingredients,dimensions={k:v for k,v in a['assessment']['dimensions'].items() if v['status']!='not_assessed'},play=play,apple=dict(n=apple['n'],oldest=apple['oldest'][:10] if apple['oldest'] else None,newest=apple['newest'][:10] if apple['newest'] else None,url=r['apple_review_page_source'].get('url')),review_note={k:finding[k] for k in ['summary','examples_reviewed','scope','source_urls']} if finding and finding['examples_reviewed'] else None))
 assert len(result)==len(ids)
 output=dict(schema_version=1,checked=data['checked'],rubric_version='0.1',apps=result)
 serialized=json.dumps(output,ensure_ascii=False,indent=2)+'\n'
 assert not re.search(r'/Users/|phone-captures|linkedin\.com/in/|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|unreviewed_publisher_mention_candidate',serialized)
 (ROOT/'src/data/app-assessments.json').write_text(serialized)
 print(f"Exported {len(result)} public app assessment records; unreviewed ingredients and raw reviews excluded")
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('source',type=Path);export(p.parse_args().source)
