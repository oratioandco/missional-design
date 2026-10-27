"""Regression coverage for public finding traceability, independent of private research."""
import contextlib
import copy
import importlib.util
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('assessment_import', ROOT / 'scripts/import-app-assessments.py')
IMPORTER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(IMPORTER)
HALLOW = 'app.hallow.Hallow'
PRAYER = '/screens/shot-9d05fb67eca9ba98aa72/'
BLESSING = '/screens/shot-a1f5c2d853dae19dc386/'
SUNDAY = '/screens/shot-a327728e3681d683e930/'


class PublicTraceabilityTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        (self.root / 'src/data').mkdir(parents=True)
        self.rubric = json.loads((ROOT / 'src/data/app-design-rubric.json').read_text())
        self.write('src/data/app-design-rubric.json', self.rubric)
        self.write('src/data/app-library.json', {'apps': [{'id': HALLOW}], 'screens': [
            {'url': PRAYER, 'app_id': HALLOW}, {'url': BLESSING, 'app_id': HALLOW},
            {'url': SUNDAY, 'app_id': 'com.aimermedia.LiveLent'},
        ]})
        dimensions = {d['id']: {'status': 'not_assessed', 'scope': 'No app-wide verdict.',
                      'principle_ids': d['principle_ids']} for d in self.rubric['dimensions']}
        dimensions['truth_authority'].update(status='ethical_baseline_observed',
            scope='Two captured prayer/blessing responses only.', reason='Boundary and referral.',
            limits='Not app-wide.', evidence=[{'source_url': 'https://missional.design' + u}
                                               for u in [PRAYER, BLESSING]])
        self.data = {'checked': '2026-10-25', 'apps': [{'app_id': HALLOW,
            'reviewed': '2026-10-25', 'ingredients': [], 'assessment': {'dimensions': dimensions},
            'reviews': {'android_identity': {'status': 'unresolved'},
                        'apple_review_page': {'n': 0, 'oldest': None, 'newest': None},
                        'apple_review_page_source': {}}}]}

    def write(self, name, value):
        path = self.root / name
        path.write_text(json.dumps(value))
        return path

    def export(self, data):
        source = self.write('source.json', data)
        with patch.object(IMPORTER, 'ROOT', self.root), contextlib.redirect_stdout(io.StringIO()):
            IMPORTER.export(source)
        return json.loads((self.root / 'src/data/app-assessments.json').read_text())

    def test_unknown_principle_rejected_without_writing(self):
        data = copy.deepcopy(self.data)
        data['apps'][0]['assessment']['dimensions']['truth_authority']['principle_ids'] = ['unknown']
        with self.assertRaises(AssertionError):
            self.export(data)
        self.assertFalse((self.root / 'src/data/app-assessments.json').exists())

    def test_wrong_app_evidence_rejected_without_writing(self):
        data = copy.deepcopy(self.data)
        data['apps'][0]['assessment']['dimensions']['truth_authority']['evidence'][0]['source_url'] = 'https://missional.design' + SUNDAY
        with self.assertRaisesRegex(AssertionError, 'exact app'):
            self.export(data)
        self.assertFalse((self.root / 'src/data/app-assessments.json').exists())

    def test_metadata_preserves_existing_judgments_and_unknowns(self):
        output = self.export(self.data)['apps'][0]['dimensions']
        source = self.data['apps'][0]['assessment']['dimensions']
        self.assertEqual(set(output), {'truth_authority'})
        self.assertEqual({k: v for k, v in output['truth_authority'].items()
                          if k not in ['principle_ids', 'evidence']},
                         {k: v for k, v in source['truth_authority'].items()
                          if k not in ['principle_ids', 'evidence']})
        # A related principle does not promote an unassessed dimension to a finding.
        self.assertNotIn('formation_relationships', output)

    def test_reviewed_unknown_does_not_become_a_grade(self):
        data=copy.deepcopy(self.data)
        data['apps'][0]['assessment']['dimensions']['money_access'].update(reviewed='2026-10-26', review_summary='Price documented; flow untested.', next_checks=['Check the exit.'], raw_review='private')
        output=self.export(data)['apps'][0]
        self.assertNotIn('money_access',output['dimensions'])
        self.assertEqual(set(output['dimension_reviews']['money_access']),{'reviewed','review_summary','next_checks'})

    def test_review_note_cannot_link_another_apps_capture(self):
        data=copy.deepcopy(self.data)
        data['apps'][0]['assessment']['dimensions']['money_access'].update(reviewed='2026-10-26',review_summary='Review.',next_checks=[],review_evidence=[{'source_url':'https://missional.design'+SUNDAY}])
        with self.assertRaisesRegex(AssertionError,'exact app'):self.export(data)

    def test_published_findings_keep_exact_statuses_and_capture_scope(self):
        apps = json.loads((ROOT / 'src/data/app-assessments.json').read_text())['apps']
        findings = {(a['app_id'], d): v for a in apps for d, v in a['dimensions'].items()}
        self.assertEqual({key: value['status'] for key, value in findings.items()}, {
            (HALLOW, 'truth_authority'): 'ethical_baseline_observed',
            ('com.aimermedia.LiveLent', 'formation_relationships'): 'redemptive_candidate',
            ('io.dwellapp.dwell', 'attention_agency'): 'ethical_baseline_observed',
            ('is.abide.abide', 'truth_authority'): 'ethical_baseline_observed',
            (HALLOW, 'attention_agency'): 'ethical_baseline_observed',
            ('com.bgolson.scripturetyper', 'money_access'): 'ethical_baseline_observed',
            ('com.bible.holy.bible.for.women', 'money_access'): 'mixed',
            ('com.prayapp.pray', 'attention_agency'): 'mixed',
        })
        self.assertEqual(findings[(HALLOW, 'truth_authority')]['evidence'],
                         [{'url': PRAYER}, {'url': BLESSING}])
        # Exact equality excludes the therapist referral (shot-0fa9...) as prayer evidence.
        self.assertEqual(findings[('com.aimermedia.LiveLent', 'formation_relationships')]['evidence'],
                         [{'url': SUNDAY}])


if __name__ == '__main__':
    unittest.main()
