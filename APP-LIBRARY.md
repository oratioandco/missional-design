# App research beta

The read-only library is static Astro with Pagefind search. No server credentials, database or backend-for-frontend are needed. Public routes: `/screens/`, `/flows/`, `/apps/`, `/organisations/`.

The initial selection contains 38 authored app profiles, 35 organisation profiles, 12 individually inspected original screenshots and two explicitly partial capture sequences. These are examples, not comprehensive app-state coverage. Financial figures retain source dates and organisational scope; missing app revenue and active-user counts remain unknown. Outreach contacts and individual LinkedIn leads remain private.

## Updating

1. Prepare a separately approved public export in the reference project (`research/screenshot-collection/export_public.py`). Original captures, OCR, annotations, account information and outreach records never enter this repository.
2. Run `python3 scripts/import-app-library.py /path/to/reviewed-export`. This imports authored profiles, approved screenshots, reviewed captions, selected transcribed interface labels and facets.
3. Run `npm run build`. Astro generates pages, the reference finalizer generates the sitemap, then Pagefind indexes only detail pages marked with `data-pagefind-body`.
4. Check screenshot identity, article links, privacy, search, filters, light/dark reading themes, mobile width and the no-JavaScript gallery before merging.

The JSON catalog is deliberately public and contains the same approved information used by the pages. The local private capture browser must never be deployed. Adding accounts, saved collections, shared annotations or a private editorial UI would require a separate authenticated design and storage decision.

The original beta started at published master. The circuit change was merged separately and is preserved. All branches and worktrees remain retained during migration.

## Release validation — 25 October 2026

Astro/Pagefind build succeeded (87 indexed detail pages, seven filters). Twelve public-export boundary tests pass in the reference repository. All public images match the reviewed export byte for byte. Chromium checks passed for public detail/article routes, Pagefind queries including German interface labels, component filtering, desktop/mobile width, light/dark controls and the no-JavaScript gallery. The design detector reported no primary findings; advisory typography flags reflect a documented stale machine-readable design snapshot. No independent reviewer was used.

## Publisher media and navigation — 25 October 2026

App profiles now separate **App Store screenshots** (publisher-supplied marketing images) from **Research captures** (the reviewed device captures). The sourced public slice has 38 app icons and 279 store screenshots. `src/data/app-store-media.json` retains the store URL, country, lookup version, date and exact source URL/dimensions of each image; the site serves local copies without changing image pixels. These images do not establish observed app behaviour or complete state coverage.

The complete private acquisition covers all 115 catalogue entries: 113 verified Apple identities yielded 771 screenshots and 113 icons; `de.dbg.bibel` and `com.communi.mskconnect` still return no German store result and remain unresolved. This full cache stays in the sibling research directory. Run `research/market/2026-10-25/source_app_store_media.py` in the reference repository to acquire it, then `python3 scripts/import-app-store-media.py /path/to/app-store-media` here to import media only for already-public profiles. No raw capture/account/outreach data is consumed.

Organisation profiles use their apps’ publisher imagery, clearly labelled, with app links and a compact page index alongside the factual profile. Longbeard uses its sourced provider/publisher relationship rather than an invented logo or a claim to publish Hallow. Financial scope and unknown values are preserved; source lists remain available in an expandable section.

The main **App library** menu offers Apps, Organisations, Screens, Flows and Patterns. These same destinations are always visible in the wrapping library navigation. `public/assets/editorial/research-navigation.json` is the single link list for native Astro pages and the imported reference finalizer. The finalizer also ensures imported pages load their existing mobile-menu script.

Media/navigation validation: 38 complete galleries and all imported media bytes checked; 1440/768/390px navigation and 320/390/960/1024/1440px number/menu overflow checks pass. Financial definition lists preserve complete numbers on phones. Light/dark render review, native no-JavaScript disclosure/gallery, keyboard Escape, main/reference journeys and Pagefind regression pass. No primary detector findings; no suppressions added.


## Ingredients, user response and article examples — 25 October 2026

Public app profiles now include reviewed feature/pattern ingredients, scoped design observations and separate Apple/Google Play review snapshots. `/apps/assessment/` explains the eight dimensions, adapted Praxis basis, sample selection, unknowns and corrections. No overall ethical score is assigned. `scripts/import-app-assessments.py` explicitly allowlists existing public app IDs and observed ingredients with public capture evidence; raw reviews, handles, web-discovery candidates, private contacts and unchecked publisher keyword matches are excluded.

The selected research images now total 15. All 15 are embedded through 25 mappings in 14 relevant pattern articles by the build finalizer, which reads only `src/data/app-library.json`. Imported reference source HTML remains untouched. Each example links to the screen evidence and app profile, with date, version, caption and context. Three new full-size inspected derivatives show Dwell reading layout and two Hallow/Magisterium scope/referral boundaries. Lossless metadata stripping preserves decoded pixels. Other corpus captures and the full 113-app publisher-media acquisition remain private pending contextual/publication review; this release does not claim comprehensive screenshots or state coverage.

Source: `../bible-faith-patterns/research/app-assessment/2026-10-25/` and the editorial publication queue in that checkout. Reimport with `python3 scripts/import-app-assessments.py /path/to/app-assessments.json`, then the normal build. Both source and website branches/worktrees are retained during migration. The new branch `codex/app-assessment-publication` starts at published master `594277c` and is complete when the allowlisted release, responsive/privacy checks and publication PR are verified.
