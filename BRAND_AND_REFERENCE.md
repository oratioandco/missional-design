# Shared brand and unified reference

The owner-selected brand uses the two-segment “by” rule, Mona Sans for reading/interface, Roboto Flex for short display moments and Instrument Serif for larger editorial passages. The current local homepage uses approved urban editorial photography with blue-silver silicon reflections, sharp four-point sun-star glints and restrained halation. Older object families remain exploratory. Naturally graded Startup Life event photos provide the human presence and are attributed on the page.

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

Local revision 14 October: English/German homepage contextual composition and continuous recontextualization question; shared reference imagery and updated A4/A5 guide snapshot. No public deployment. Fictional generated people/place captions are preserved. Neighborhood change video is being developed separately; old construction storyboard is superseded.

## Canvas workbook (15 October 2026)

`/missional-canvas/` now includes Explore / Fill modes. The writing mode uses the same versioned church/nonprofit/business question data, keeps separate local drafts, and offers explicit JSON import/export. No account, answer upload, backend or shared editing is involved. Local storage can be cleared by the browser; the UI explains this and offers a downloadable backup. Invalid or unreadable data is not silently overwritten.

PDF export loads jsPDF and same-origin PDF fonts only on demand. The export is exactly one A3 landscape page using the actual canvas grid. Every guiding question is paired with its complete written answer inside the corresponding block; unanswered questions remain visible. Questions use a quieter semibold style and answers use darker body text; optional legacy summaries are preserved in editable files but do not replace answers. No appendix, excerpts or automatic truncation. Each block fits answers between 10.5pt and a 9pt minimum, with questions at 9pt down to 8pt; overflow names the affected section and offers an edit link before any PDF is downloaded. It is a static reading/printing document. The JSON copy is the editable source. Unsupported font characters trigger a visible message rather than silent omission; the native Print / Save as PDF alternative supports system font fallback and uses the same one-page canvas geometry with the same overflow gate. All imported/user content is inserted as text, never HTML.

Verification: `npm run build`; focused TypeScript check for `src/lib/canvas-*.ts` with Astro client types; `python3 scripts/check-canvas-workbook.py --url http://127.0.0.1:8794/missional-canvas/` against the built site using Playwright. The browser check covers save/reload (including answering the third question first), isolated versions, JSON round-trip, malformed imports, PDF download, mobile overflow, unsupported characters, safe printing, unavailable storage and corrupt draft recovery. The corrected fictional filled example was rendered and inspected as one A3 page. Answer placement, final answer marker, umlauts and page boundaries were checked with pdfplumber. A deliberately oversized answer is preserved in editable export, but blocks PDF download until shortened.

Question export verification: all three variants were exported and checked with `scripts/check-canvas-pdf.py` (pdfplumber). Every original guiding question is present inside its own block on exactly one A3 landscape page; the filled church example and native print fallback were also checked and visually inspected.
