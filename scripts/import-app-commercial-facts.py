"""Project reviewed commercial evidence onto exact public identities; never copy raw research.

Usage: python3 scripts/import-app-commercial-facts.py PATH_TO_REVIEW_BATCH
No network requests, checkout inference, legacy models, or M07 inputs are used.
"""
import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
FIELDS = {
    'download': ('value', 'currency', 'country', 'source_url', 'checked'),
    'signal': ('status', 'source_url'),
    'fact': ('summary', 'scope', 'source_url', 'source_kind', 'checked', 'statement_period', 'limitations'),
    'price': ('publisher_label', 'display_price', 'publisher_stated_billing_period', 'source_url', 'checked'),
}
SCOPE_STATUSES = {
    'required_for_all_features', 'free_tier_with_premium_subscription', 'required',
    'publisher_claims_all_content_free', 'subscription_required_for_scope',
    'optional_subscription_with_free_tier', 'paid_upgrade_available', 'subscription_unlocks_scope',
    'support_subscription_available', 'publisher_claims_free_no_ads', 'publisher_claims_all_free',
    'required_for_named_features', 'premium_unlocks_scope', 'features_depend_on_church_subscription',
    'free_access_with_paid_expansion', 'free_samples_full_content_subscription',
    'patron_subscription_available', 'optional_upgrade_explicit', 'free_tier_with_optional_paid_resources',
    'optional_subscription_or_individual_resources', 'free_for_scope', 'subscription_includes_scope',
    'publisher_offers_gift_subscription_on_request',
}
NOTES = {
    'download': 'Store download price only; does not establish free core access.',
    'iap': 'Store-listed labels and prices; billing cadence and checkout availability are not verified. Missing products do not establish absence of payments.',
    'access': 'Publisher statements about the named scope; no independent app or checkout testing. Unknown means not established.',
    'pricing': 'Published web offers, not verified checkout. Dollar currency is unspecified unless marked USD; region, tax and eligibility may vary.',
    'funding': 'App offers do not establish organisation revenue. Capital and processed donations are not revenue. No ethical assessment is implied.',
}

def pick(record, fields):
    return {key: record[key] for key in fields if key in record}

def safe_url(value):
    p = urlsplit(value)
    if p.scheme != 'https' or not p.hostname or p.username or p.password or p.hostname in {'localhost', '127.0.0.1'}:
        raise ValueError('Unsafe public source URL')
    if re.search(r'\s|[<>]', value):
        raise ValueError('Malformed public source URL')
    return value

def scope_claim(s):
    status = s['status']
    if status not in SCOPE_STATUSES:
        raise ValueError('Unreviewed access status: ' + status)
    # Controlled paraphrases instead of publishing source quotations.
    text = {
        'required': 'Publisher states payment is required for app access.',
        'required_for_named_features': 'Payment is required for the named features.',
        'required_for_all_features': 'Subscription provides the complete feature set.',
        'features_depend_on_church_subscription': 'Available features depend on products subscribed to by the church.',
        'publisher_claims_all_free': 'Publisher describes its app content or features as free.',
        'publisher_claims_all_content_free': 'Publisher describes all content as free.',
        'publisher_claims_free_no_ads': 'Publisher describes app use as free without advertising.',
        'publisher_offers_gift_subscription_on_request': 'Publisher offers subscription assistance on request; eligibility was not tested.',
        'support_subscription_available': 'An optional subscription supports the publisher.',
        'patron_subscription_available': 'An optional patron subscription supports app development.',
        'free_for_scope': 'Publisher describes this specific feature as free.',
    }.get(status)
    if not text:
        if status in {'subscription_required_for_scope', 'subscription_unlocks_scope', 'subscription_includes_scope'}:
            text = 'Subscription access applies to this content or feature scope.'
        elif status in {'paid_upgrade_available', 'premium_unlocks_scope'}:
            text = 'A paid upgrade expands access within this scope.'
        elif status == 'free_samples_full_content_subscription':
            text = 'Free samples are available; a subscription unlocks the full catalogue. A separate lifetime purchase is also advertised.'
        else:
            text = 'Free access is available alongside optional paid content or features.'
    out = pick(s, ('scope', 'status', 'evidence_type', 'source_url', 'checked', 'independently_tested'))
    out['summary'] = text
    # These descriptions carry material scope distinctions beyond the status label.
    if s.get('summary') and s['scope'] != 'all_content':
        out['summary'] = s['summary'].split(' discounts and scholarships')[0]
    return out

def project(payment, funding, library):
    app_ids = {a['id'] for a in library['apps']}
    org_ids = {o['id'] for o in library['organisations']}
    if len(app_ids) != len(library['apps']) or len(org_ids) != len(library['organisations']):
        raise ValueError('Duplicate public identities')
    apps = []
    for a in payment['apps']:
        if a['id'] not in app_ids:
            continue
        if a['identity_status'] != 'exact_bundle_match':
            raise ValueError('Unverified app identity')
        products = []
        for p in a['iap'].get('products_for_presentation', []):
            item = pick(p, ('name', 'display_price'))
            if item not in products:
                products.append(item)
        scopes = [scope_claim(s) for s in a['access_scopes']]
        # Combine the access explanation only when a separately sourced lifetime
        # offer exists. Keep each source record and price channel intact below.
        lifetime = next((p for p in a.get('published_price_options', [])
                         if p.get('publisher_stated_billing_period') == 'one_time'), None)
        dwell_summary = 'Free sample listening plans are available. Full-content paid options include subscriptions and a separately advertised one-time lifetime purchase.'
        if a['id'] == 'io.dwellapp.dwell' and lifetime:
            for scope in scopes:
                if scope['scope'] == 'sample_content_vs_full_catalogue':
                    scope['summary'] = dwell_summary
                    scope['related_source_urls'] = [lifetime['source_url']]
        for scope in scopes:
            if a['id'] == 'app.biblebff' and scope['scope'] == 'named_features_only':
                scope['summary'] = 'A subscription is required for story content, Bible BFF chat and verse generation.'
            elif a['id'] == 'com.bgolson.scripturetyper' and scope['scope'] == 'named_features_only':
                scope['summary'] = 'The Bible reader requires an in-app purchase.'
            elif a['id'] == 'com.soultime.app':
                scope['summary'] = 'The Soultime with Friends feature is described as free; other app access is not established by this statement.'
        # Official web facts include lifetime alternatives and advertising-plan distinctions.
        website = [pick(f, ('scope', 'status', 'summary', 'checked')) | {'source_url': f['url'], 'channel': 'publisher_web'} for f in a.get('publisher_website_facts', [])]
        if a['id'] == 'io.dwellapp.dwell' and lifetime:
            for fact in website:
                if fact['scope'] == 'sample_content_vs_full_catalogue':
                    fact['summary'] = dwell_summary
                    fact['related_source_urls'] = [lifetime['source_url']]
        apps.append(dict(app_id=a['id'], checked=a['checked'],
            download=pick(a['download_price'], FIELDS['download']) | {'channel': 'apple_lookup'},
            iap=pick(a['iap'], FIELDS['signal']) | {'products': products, 'storefront': 'us', 'checked': a['checked'], 'channel': 'apple_app_store'},
            **{k: pick(a[k], FIELDS['signal']) | {'checked': a['checked']} for k in ('subscription', 'donations', 'advertising')},
            core_access=pick(a['core_access_requirement'], ('status', 'checked', 'independently_tested')),
            access_scopes=scopes, publisher_web_facts=website,
            published_prices=[pick(p, FIELDS['price']) | {'channel': 'publisher_web'} for p in a.get('published_price_options', [])],
            source_urls=list(dict.fromkeys(s['url'] for s in a['sources']))))
    organisations = []
    for o in funding['organisations']:
        if o['id'] not in org_ids:
            continue
        facts = [pick(f, FIELDS['fact']) for f in o['funding_facts']] if o['id'] != 'C016' else []
        for fact in facts:
            if o['status'] == 'app_paid_products_verified':
                fact['summary'] = 'Publisher App Store listing advertises paid in-app products; this establishes app-level offers only.'
            if o['id'] == 'C033':
                fact['summary'] = 'The creator reports personally covering app costs and providing the app free without subscriptions, upgrades or advertising.'
        organisations.append(dict(organisation_id=o['id'], status=o['status'] if o['id'] != 'C016' else 'funding_not_established',
            facts=facts, unknowns=o['unknowns'] if o['id'] != 'C016' else ['Organisation funding is not established by the approved public evidence.']))
    if {a['app_id'] for a in apps} != app_ids or len(apps) != len(app_ids):
        raise ValueError('Missing or duplicate app identities')
    if {o['organisation_id'] for o in organisations} != org_ids or len(organisations) != len(org_ids):
        raise ValueError('Missing or duplicate organisation identities')
    result = dict(schema_version=1, checked=payment['checked'], notes=NOTES, apps=apps, organisations=organisations)
    validate(result)
    return result

def validate(data):
    def walk(v, key=''):
        if isinstance(v, dict):
            for k, x in v.items():
                walk(x, k)
        elif isinstance(v, list):
            for x in v:
                walk(x, key)
        elif isinstance(v, str):
            if key in {'source_url', 'source_urls', 'related_source_urls'}:
                safe_url(v)
            if re.search(r'/Users/|cache/|file://|<html|mailto:|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|data.licens|sensitive.privacy', v, re.I):
                raise ValueError('Private or unapproved content in projection')
    walk(data)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    payment = json.loads((args.source/'payment-facts/payment-facts.json').read_text())
    funding = json.loads((args.source/'funding-facts/registry.json').read_text())
    library = json.loads((ROOT/'src/data/app-library.json').read_text())
    data = project(payment, funding, library)
    (ROOT/'src/data/app-commercial-facts.json').write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
    print(f"Projected {len(data['apps'])} apps and {len(data['organisations'])} organisations")

if __name__ == '__main__':
    main()
