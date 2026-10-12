# Shared brand and unified reference

The owner-selected brand uses the two-segment “by” rule, Mona Sans for reading/interface, Roboto Flex for short display moments and Instrument Serif for larger editorial passages. Brighter white/black Cycles still lifes use fractured silicon, wafers, layered planes and connections. Naturally graded Startup Life event photos provide the human presence and are attributed on the page.

The public pattern reference is part of this website. Its landing page is `/reference/`; its editorial about pages are under `/reference/about/`, preserving this site's existing `/about/`. Other reference routes keep their established paths. English/German framework pages and existing canvas resources remain available. The optional Bezalel MCP endpoint remains at its existing service host.

## Updating the reference and brand

After generating and validating the adjacent `bible-faith-patterns` checkout:

```sh
python3 scripts/sync-brand.py
python3 scripts/import-pattern-reference.py
npm run build
```

Only public `dist/` artifacts are imported. The import manifest tracks those files so future updates can remove stale exported files without touching the site's own public resources. Private research, source caches and original photo libraries are not imported. CI builds the checked-in public snapshot; it does not depend on access to the owner's Mac or font library.

`finalize-reference.py` combines real pages in the sitemap while excluding redirects, noindex placeholders and embedded examples. The import adjusts canonical/content API URLs and relocates the reference's about-page links; it preserves the established MCP endpoint.

Validation includes Astro build, 15,185 internal asset/link checks, responsive layouts, axe WCAG checks and the reference's Scripture/quotation checks. The privacy page reflects self-hosted fonts and local example/theme state, and the accessibility statement describes the checks actually performed.
