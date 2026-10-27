"""Import an explicitly reviewed public export; never read the private corpus or outreach files."""
import argparse,hashlib,json,re,shutil,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def slug(text):return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',text).encode('ascii','ignore').decode().lower()).strip('-')
def main(source):
 data=json.loads((source/'library.json').read_text());assert data['schema_version']==1
 apps=[a for a in data['apps'] if a.get('description') and a.get('target_audience') and a.get('identity_status')=='exact_bundle_match']
 extra={'P001'}
 org_ids={a['organisation_id'] for a in apps}|extra
 orgs=[o for o in data['organisations'] if o['id'] in org_ids and o.get('description')]
 org_ids={o['id'] for o in orgs};apps=[a for a in apps if a['organisation_id'] in org_ids]
 seen=set()
 for a in apps:
  if a['id']=='com.BlueLetterBible.BLB':a['name']='Blue Letter Bible'
  name={'tv.lifechurch.bible':'youversion-bible','com.alphainternational.bioy':'bible-with-nicky-and-pippa-gumbel'}.get(a['id'],slug(a['name']))
  if name in seen:name+='-'+hashlib.sha256(a['id'].encode()).hexdigest()[:6]
  seen.add(name);a['slug']=name;a['url']='/apps/'+name+'/'
 for o in orgs:o['slug']=slug(o['name']) or 'publisher-'+o['id'].lower();o['url']='/organisations/'+o['slug']+'/'
 assert len({o['slug'] for o in orgs})==len(orgs)
 app_ids={a['id'] for a in apps};screens=data['screens']
 assert all(s['app_id'] in app_ids for s in screens),'Screenshot app needs an authored profile.'
 for s in screens:
  assert re.fullmatch(r'shot-[0-9a-f]{20}',s['id'])
  image=(source/s['image']).resolve();assert image.is_relative_to((source/'screens').resolve()) and image.is_file()
  s['image']='/assets/app-library/'+s['image'];s['url']='/screens/'+s['id']+'/'
 flows=[]
 names={'blue-letter-bible-mark-a-passage':('Marking a passage','Selected captures show verse actions, the range picker and a later annotated reader. Several intermediate actions are not pictured.'),'hallow-prayer-and-blessing':('Prayer and blessing boundaries','Two captured responses show how the integrated assistant distinguishes prayer wording and a request for a blessing.')}
 names.update({
  'ascension-paid-offer-to-trial':('A trial after declining a paid offer','The first annual/monthly offer is followed by an annual trial offer after dismissal. Apple confirmation was declined.'),
  'bible-memory-free-guest-entry':('Entering the free Lite library without an account','Selected collection, account-choice and empty-library states show an account-free path. No verse was added.'),
  'bible-for-women-apple-cancellation':('Canceling Apple trial renewal','Apple subscription details, available plans, cancellation confirmation and the verified expiring state. Trial access remains until October 30; intermediate navigation is omitted.'),
 })
 for key in dict.fromkeys(s['flow_id'] for s in screens if s.get('flow_id')):
  frames=sorted([s for s in screens if s.get('flow_id')==key],key=lambda s:s['flow_order'])
  title,context=names[key];flows.append(dict(id=key,url='/flows/'+key+'/',title=title,context=context,app_id=frames[0]['app_id'],screen_ids=[s['id'] for s in frames],coverage='Selected capture sequence; not a complete walkthrough.'))
 records=dict(schema_version=1,facet_aliases=data.get('facet_aliases',{}),checked=max(s['captured'] for s in screens),apps=apps,organisations=orgs,screens=screens,flows=flows)
 serialized=json.dumps(records,ensure_ascii=False,indent=2)+'\n'
 assert not re.search(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|/Users/|phone-captures|linkedin\.com/in/|capture-log|source_row|reviewer|ocr_text',serialized),'Private data in public export'
 (ROOT/'src/data/app-library.json').write_text(serialized)
 dest=ROOT/'public/assets/app-library/screens';dest.mkdir(parents=True,exist_ok=True)
 expected={Path(s['image']).name for s in screens}
 assert not ({p.name for p in dest.iterdir() if p.is_file()}-expected),'Old public screenshot assets need explicit review before updating the selection.'
 for file in (source/'screens').iterdir():
  if file.is_file() and any(s['image'].endswith('/'+file.name) for s in screens):shutil.copyfile(file,dest/file.name)
 (ROOT/'public/assets/app-library/catalog.json').write_text(serialized)
 print(json.dumps(dict(apps=len(apps),organisations=len(orgs),screens=len(screens),flows=len(flows))))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('export',type=Path);main(p.parse_args().export)
