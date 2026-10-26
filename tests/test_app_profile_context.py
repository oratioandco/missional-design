"""Validate privacy and app identity boundaries of reviewed context exports."""
import contextlib,copy,importlib.util,io,json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location('context_import',ROOT/'scripts/import-app-profile-context.py');IMPORTER=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(IMPORTER)
class ContextExportTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup);self.root=Path(self.tmp.name);(self.root/'src/data').mkdir(parents=True)
  (self.root/'src/data/app-library.json').write_text(json.dumps({'apps':[{'id':'app-a'}],'screens':[{'url':'/screens/a/','app_id':'app-a'},{'url':'/screens/b/','app_id':'app-b'}]}))
  self.data={'schema_version':1,'checked':'2026-10-26','apps':[{'app_id':'app-a','review_sample':dict(platform='Google Play',package='app.a',language_request='en',country_request='us',n=1,collected='2026-10-25',oldest='2026-10-01',newest='2026-10-01',selection='Selected.',source_url='https://example.org/reviews'),'review_themes':[{'label':'Use','summary':'Reported use.','sample_indices':[0]}],'news':[dict(title='Context',publisher='Publisher',date='2026-10-01',url='https://example.org/news',summary='Context summary.')],'apple_reading':dict(n=1,oldest='2020-01-01',newest='2020-01-01',selection='Selected historical.',source_url='https://example.org/apple',summary='Summary.',capture_url='/screens/a/',capture_label='Evidence'),'coverage_note':'Limited sample.'}]}
 def export(self,data):
  source=self.root/'source.json';source.write_text(json.dumps(data))
  with patch.object(IMPORTER,'ROOT',self.root),contextlib.redirect_stdout(io.StringIO()):IMPORTER.export(source)
  return json.loads((self.root/'src/data/app-profile-context.json').read_text())
 def test_wrong_app_capture_rejected(self):
  self.data['apps'][0]['apple_reading']['capture_url']='/screens/b/'
  with self.assertRaises(AssertionError):self.export(self.data)
 def test_unbacked_theme_rejected(self):
  self.data['apps'][0]['review_themes'][0]['sample_indices']=[1]
  with self.assertRaises(AssertionError):self.export(self.data)
 def test_private_extra_fields_not_projected(self):
  a=self.data['apps'][0];a['raw_reviews']=['private'];a['review_sample']['raw_text']='private';a['apple_reading']['reviewer']='private@example.invalid';a['news'][0]['raw_html']='private'
  output=json.dumps(self.export(self.data));self.assertNotIn('private',output);self.assertNotIn('sample_indices',output)
if __name__=='__main__':unittest.main()
