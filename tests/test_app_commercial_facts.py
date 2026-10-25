"""Public commercial projection privacy, identity and access regression checks."""
import copy
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('commercial', ROOT/'scripts/import-app-commercial-facts.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class CommercialFactsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((ROOT/'src/data/app-commercial-facts.json').read_text())
        cls.library = json.loads((ROOT/'src/data/app-library.json').read_text())
        cls.apps = {a['app_id']: a for a in cls.data['apps']}

    def test_exact_public_identity_sets(self):
        self.assertEqual({a['id'] for a in self.library['apps']}, set(self.apps))
        self.assertEqual(len(self.apps), 113)
        self.assertEqual({o['id'] for o in self.library['organisations']}, {o['organisation_id'] for o in self.data['organisations']})
        self.assertEqual(len(self.data['organisations']), 105)

    def test_scoped_access_does_not_become_whole_app_requirement(self):
        hallow = self.apps['app.hallow.Hallow']
        self.assertEqual(hallow['core_access']['status'], 'publisher_states_free_access_available')
        self.assertIn('subscription_required_for_scope', [s['status'] for s in hallow['access_scopes']])
        church = self.apps['com.ministrycentered.ChurchCenter']
        self.assertEqual(church['subscription']['status'], 'publisher_mentions_church_product_subscriptions')
        self.assertEqual(church['access_scopes'][0]['scope'], 'church_organisation_products')
        self.assertEqual(church['core_access']['status'], 'unknown')
        self.assertEqual(self.apps['ai.jesus']['core_access']['status'], 'unknown')
        self.assertEqual(self.apps['APP.AMEN']['core_access']['status'], 'publisher_states_payment_required')
        self.assertEqual(self.apps['org.amenapp.amen']['core_access']['status'], 'publisher_states_free_access_available')

    def test_download_and_unknown_do_not_infer_access_or_absence(self):
        app = self.apps['365STEPS']
        self.assertEqual(app['download']['value'], 0)
        self.assertEqual(app['core_access']['status'], 'unknown')
        self.assertEqual(app['subscription']['status'], 'unknown')
        self.assertEqual(app['iap']['status'], 'not_declared_on_retrieved_listing')

    def test_prices_deduplicate_only_exact_label_and_price(self):
        for app in self.apps.values():
            products = app['iap']['products']
            self.assertEqual(len(products), len({(p['name'], p['display_price']) for p in products}))
        self.assertEqual(len(self.apps['ai.jesus']['iap']['products']), 2)
        dwell = self.apps['io.dwellapp.dwell']
        self.assertIn('one_time', [p['publisher_stated_billing_period'] for p in dwell['published_prices']])

    def test_dwell_full_access_includes_separately_sourced_lifetime_alternative(self):
        dwell = self.apps['io.dwellapp.dwell']
        for record in dwell['access_scopes'] + dwell['publisher_web_facts']:
            if record['scope'] == 'sample_content_vs_full_catalogue':
                self.assertIn('Free sample listening plans', record['summary'])
                self.assertIn('subscriptions', record['summary'])
                self.assertIn('one-time lifetime purchase', record['summary'])
                self.assertIn('help.dwellbible.com', record['source_url'])
                self.assertEqual(record['related_source_urls'], ['https://dwellapp.io/pricing/lifetime'])
                self.assertEqual(record['checked'], '2026-10-25')
        lifetime = next(p for p in dwell['published_prices'] if p['publisher_stated_billing_period'] == 'one_time')
        self.assertEqual(lifetime['source_url'], 'https://dwellapp.io/pricing/lifetime')
        self.assertEqual(lifetime['channel'], 'publisher_web')
        self.assertEqual(dwell['iap']['channel'], 'apple_app_store')

    def test_allowlisted_shape_and_no_private_funding_policy(self):
        module.validate(self.data)
        encoded = json.dumps(self.data)
        for forbidden in ['cache_file', 'cache_path', 'evidence_excerpt', 'source_excerpt', 'prior_research', 'ethical_assessment', 'research_attempts', 'publication_status']:
            self.assertNotIn(forbidden, encoded)
        org = next(o for o in self.data['organisations'] if o['organisation_id'] == 'C016')
        self.assertEqual(org['facts'], [])
        for o in self.data['organisations']:
            self.assertEqual(set(o), {'organisation_id', 'status', 'facts', 'unknowns'})
            for fact in o['facts']:
                self.assertEqual(set(fact), set(module.FIELDS['fact']))
                self.assertTrue(all(fact[k] for k in ['scope', 'checked', 'statement_period', 'limitations']))

    def test_historical_capital_retains_period_and_does_not_become_revenue(self):
        org = next(o for o in self.data['organisations'] if o['organisation_id'] == 'C049')
        fact = next(f for f in org['facts'] if 'Series C' in f['summary'])
        self.assertEqual(fact['statement_period'], '2023')
        self.assertIn('$50 million', fact['summary'])
        self.assertIn('$105 million at that announcement', fact['summary'])
        self.assertIn('not revenue', fact['summary'])
        self.assertIn('not revenue or a verified current cumulative total', fact['summary'])

    def test_reject_private_content_and_bad_urls(self):
        for value in ['file:///tmp/private', 'https://user:pass@example.com', 'http://example.com', 'https://localhost/private']:
            with self.assertRaises(ValueError):
                module.safe_url(value)
        for value in ['/Users/research/private.json', 'person@example.com', '<html>raw document']:
            with self.assertRaises(ValueError):
                module.validate({'summary': value})

if __name__ == '__main__':
    unittest.main()
