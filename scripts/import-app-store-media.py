"""Import publisher media for the already-public app profiles from a sourced manifest."""
import argparse,json,shutil,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main(source):
 data=json.loads((source/'manifest.json').read_text());public=json.loads((ROOT/'src/data/app-library.json').read_text());ids={a['id'] for a in public['apps']};out={}
 dest=ROOT/'public/assets/app-library/store';dest.mkdir(parents=True,exist_ok=True)
 def asset(a):
  assert a and 'error' not in a and a.get('file')
  path=(source/a['file']).resolve();assert path.is_relative_to((source/'assets').resolve()) and path.is_file()
  assert a['source_url'].startswith('https://') and '.mzstatic.com/' in a['source_url']
  shutil.copyfile(path,dest/path.name)
  return dict(image='/assets/app-library/store/'+path.name,source_url=a['source_url'],width=a['width'],height=a['height'],**{k:a[k] for k in ['device','position'] if k in a})
 for record in data['apps']:
  if record['app_id'] not in ids:continue
  assert record['status']=='matched'
  out[record['app_id']]=dict(checked=record['checked'][:10],store_url=record['store_url'],country=record['country'],store_version=record['store_version'],source='publisher_app_store',icon=asset(record['icon']),screenshots=[asset(s) for s in record['screenshots']])
 assert set(out)==ids,'Missing media for a published profile'
 payload=json.dumps(out,ensure_ascii=False,indent=2)+'\n';assert not re.search(r'/Users/|phone-captures|linkedin\.com/in/|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}',payload)
 (ROOT/'src/data/app-store-media.json').write_text(payload)
 print('Imported',len(out),'app icons and',sum(len(v['screenshots']) for v in out.values()),'publisher screenshots')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('source',type=Path);main(p.parse_args().source)
