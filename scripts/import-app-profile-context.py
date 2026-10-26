"""Project reviewed thematic/context summaries; retain raw reviews and coding indices privately."""
import argparse,json,re
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1]
def export(source):
 data=json.loads(source.read_text());ids={a['id'] for a in json.loads((ROOT/'src/data/app-library.json').read_text())['apps']};result=[]
 for a in data['apps']:
  assert a['app_id'] in ids
  sample=a['review_sample'];assert sample['n']>0
  themes=[]
  for t in a['review_themes']:
   assert t['sample_indices'] and all(isinstance(i,int) and 0<=i<sample['n'] for i in t['sample_indices'])
   themes.append({k:t[k] for k in ['label','summary']})
  for url in [sample['source_url']]+[n['url'] for n in a['news']]:assert urlparse(url).scheme=='https' and urlparse(url).netloc
  apple=a.get('apple_reading');assert not apple or (apple['n']>0 and urlparse(apple['source_url']).scheme=='https' and apple['capture_url'] in {s['url'] for s in json.loads((ROOT/'src/data/app-library.json').read_text())['screens']})
  result.append({k:a[k] for k in ['app_id','review_sample','news','coverage_note']}|{'review_themes':themes,'apple_reading':apple})
 assert len({a['app_id'] for a in result})==len(result)
 output={k:data[k] for k in ['schema_version','checked']}|{'apps':result};text=json.dumps(output,ensure_ascii=False,indent=2)+'\n'
 assert not re.search(r'/Users/|"reviewer"|"userName"|sample_indices|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}',text)
 (ROOT/'src/data/app-profile-context.json').write_text(text)
 print(f'Exported {len(result)} reviewed app context profiles; raw review content excluded')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('source',type=Path);export(p.parse_args().source)
