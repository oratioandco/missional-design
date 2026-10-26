"""Project reviewed thematic/context summaries; retain raw reviews and coding indices privately."""
import argparse,json,re
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1]
def export(source):
 data=json.loads(source.read_text());library=json.loads((ROOT/'src/data/app-library.json').read_text());ids={a['id'] for a in library['apps']};screens={s['url']:s['app_id'] for s in library['screens']};result=[]
 for a in data['apps']:
  assert a['app_id'] in ids
  sample=a['review_sample'];assert sample['n']>0
  themes=[]
  for t in a['review_themes']:
   assert t['sample_indices'] and all(isinstance(i,int) and 0<=i<sample['n'] for i in t['sample_indices'])
   themes.append({k:t[k] for k in ['label','summary']})
  assert all(n.get('date_kind','published') in ['published','checked'] for n in a['news'])
  for url in [sample['source_url']]+[n['url'] for n in a['news']]:assert urlparse(url).scheme=='https' and urlparse(url).netloc
  apple=a.get('apple_reading');assert not apple or (apple['n']>0 and urlparse(apple['source_url']).scheme=='https' and screens.get(apple['capture_url'])==a['app_id'])
  result.append({k:a[k] for k in ['app_id','coverage_note']}|{'review_sample':{k:sample[k] for k in ['platform','package','language_request','country_request','n','collected','oldest','newest','selection','source_url']},'news':[{k:n[k] for k in ['title','publisher','date','url','summary','date_kind'] if k in n} for n in a['news']],'review_themes':themes,'apple_reading':{k:apple[k] for k in ['n','oldest','newest','selection','source_url','summary','capture_url','capture_label'] if k in apple} if apple else None})
 assert len({a['app_id'] for a in result})==len(result)
 output={k:data[k] for k in ['schema_version','checked']}|{'apps':result};text=json.dumps(output,ensure_ascii=False,indent=2)+'\n'
 assert not re.search(r'/Users/|"reviewer"|"userName"|sample_indices|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}',text)
 (ROOT/'src/data/app-profile-context.json').write_text(text)
 print(f'Exported {len(result)} reviewed app context profiles; raw review content excluded')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('source',type=Path);export(p.parse_args().source)
