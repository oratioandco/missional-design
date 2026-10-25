"""Public publisher assets: allow Apple's density suffix, reject foreign hosts/private fields."""
import importlib.util,json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
SPEC=importlib.util.spec_from_file_location('media_import',Path(__file__).resolve().parents[1]/'scripts/import-app-store-media.py');module=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(module)
class PublisherMediaTests(unittest.TestCase):
 def run_import(self,change=None):
  with tempfile.TemporaryDirectory() as folder:
   root=Path(folder);(root/'src/data').mkdir(parents=True);(root/'src/data/app-library.json').write_text('{"apps":[{"id":"example"}]}');source=root/'source';(source/'assets').mkdir(parents=True);(source/'assets/image.png').write_bytes(b'publisher asset fixture')
   asset=dict(file='assets/image.png',source_url='https://is1-ssl.mzstatic.com/image/AppIcon@1x.png',width=1,height=1)
   record=dict(app_id='example',status='matched',checked='2026-10-25',store_url='https://apps.apple.com/us/app/example/id123',country='us',store_version='1.0',icon=asset,screenshots=[])
   if change:change(record)
   (source/'manifest.json').write_text(json.dumps(dict(apps=[record])))
   with patch.object(module,'ROOT',root):module.main(source)
   return json.loads((root/'src/data/app-store-media.json').read_text())
 def test_density_filename_is_not_private_email(self):self.assertIn('example',self.run_import())
 def test_lookalike_cdn_path_is_rejected(self):
  with self.assertRaises(AssertionError):self.run_import(lambda r:r['icon'].update(source_url='https://evil.example/.mzstatic.com/image.png'))
 def test_foreign_store_host_is_rejected(self):
  with self.assertRaises(AssertionError):self.run_import(lambda r:r.update(store_url='https://evil.example/apps.apple.com/app'))
 def test_contact_in_other_field_is_rejected(self):
  with self.assertRaises(AssertionError):self.run_import(lambda r:r.update(store_version='person@example.org'))
if __name__=='__main__':unittest.main()
