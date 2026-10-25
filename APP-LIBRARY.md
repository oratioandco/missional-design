# App research beta

The read-only library is static Astro with Pagefind search. No server credentials, database or backend-for-frontend are needed. Public routes: `/screens/`, `/flows/`, `/apps/`, `/organisations/`.

The initial selection contains 38 authored app profiles, 35 organisation profiles, 12 individually inspected original screenshots and two explicitly partial capture sequences. These are examples, not comprehensive app-state coverage. Financial figures retain source dates and organisational scope; missing app revenue and active-user counts remain unknown. Outreach contacts and individual LinkedIn leads remain private.

## Updating

1. Prepare a separately approved public export in the reference project (`research/screenshot-collection/export_public.py`). Original captures, OCR, annotations, account information and outreach records never enter this repository.
2. Run `python3 scripts/import-app-library.py /path/to/reviewed-export`. This imports authored profiles, approved screenshots, reviewed captions, selected transcribed interface labels and facets.
3. Run `npm run build`. Astro generates pages, the reference finalizer generates the sitemap, then Pagefind indexes only detail pages marked with `data-pagefind-body`.
4. Check screenshot identity, article links, privacy, search, filters, light/dark reading themes, mobile width and the no-JavaScript gallery before merging.

The JSON catalog is deliberately public and contains the same approved information used by the pages. The local private capture browser must never be deployed. Adding accounts, saved collections, shared annotations or a private editorial UI would require a separate authenticated design and storage decision.

The publication branch starts at published master; the unpublished `codex/rock-circuits` branch and its circuit commit are retained separately.

## Release validation — 25 October 2026

Astro/Pagefind build succeeded (87 indexed detail pages, seven filters). Twelve public-export boundary tests pass in the reference repository. All public images match the reviewed export byte for byte. Chromium checks passed for public detail/article routes, Pagefind queries including German interface labels, component filtering, desktop/mobile width, light/dark controls and the no-JavaScript gallery. The design detector reported no primary findings; advisory typography flags reflect a documented stale machine-readable design snapshot. No independent reviewer was used.
