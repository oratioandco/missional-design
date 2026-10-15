# Shared brand and unified reference

**Continuation:** read [HANDOFF.md](HANDOFF.md) and its canonical cross-project vision/task/runbook before older notes. Latest work is local, not deployed.

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

15 October follow-on: the imported `/calling/rocks/` essay is now “When Silicon Catches the Light”, using approved contextual window imagery and an Instrument Serif editorial headline. The existing route is retained. A practical return-to-reading example and continuously changing context connect the metaphor to design decisions. No public deployment or field-guide PDF rewrite.


##15October2026: purpose and practical positioning

Homepage positioning and complementary essay implemented locally in EN/DE: purpose first, three concrete situations, formation/faithfulness posture, selective silicon imagery. New /blog/which-rock/ and /de/blog/which-rock/ link to the reflected-light essay. Read research/editorial/2026-10-15-foundation-and-positioning.md in the reference checkout. No public deployment; PDFs/canvas unchanged.
Validated20Astro pages/250sitemap routes; EN/DEdesktop/mobile screenshots and link checks in the adjacent reference checkout. Article figures checked against the primary Barna report; no spiritual outcome promises.


##15October2026: approved neighborhood film integrated

V6 is owner-approved, exported and integrated locally at http://127.0.0.1:8794/missional-canvas/. Finished16s1280x720/30fps silent film: worn corner → cafe beneath worn house → restoration/French balconies → upmarket store → offices. Native controls, poster, preloadnone, no autoplay; hidden in print. Master and8.1MBwebcopy in videos/neighborhood-context/assets; full provenance in v6-delivery-provenance.json. Full HyperFrames check passed; final frames inspected; desktop/mobile playback/seek/reduced-motion/print checks passed. CLI2.3.0; HyperFrames upgraded0.8.160→0.8.161. No further generation needed. No public deployment.

Astropreview (npmrunpreview-- --host127.0.0.1--port8794) replaces Pythonhttpserver for correct byte-range video seeking. Source project and original media remain in adjacent reference checkout. Public webMP4+poster copied only to public/assets/video; private research was not exported. No canvas answer/PDF logic changed.


##15October2026 — final camera correction and preferred rock imagery

V7 supersedes V6 delivery: first-two-shot camera zoom compensated locally using static architectural tracking; one fixed small crop across all five shots. Same16s approved action/rock, no new video generation. Export and canvas use updated at http://127.0.0.1:8794/missional-canvas/. Native review http://127.0.0.1:8840/review-v7.html. Approved film-specimen appearance applied to new window-v7/conversation-v7 contextual website images; EN/DEhome, reference openers and rocks article updated. Checks pass; see videos/neighborhood-context/V7-ADJUSTMENT.md in reference checkout. No public deployment.

The existing footage was stabilized rather than regenerated. Website images edited with built-in ImageGen from the approved video specimen reference; prior versions retained. Desktop/mobile visual, playback, seeking and print checks passed; no canvas/PDFlogic change. PDFs still use prior approved cover imagery pending the broader coherence review.
