# Missional by Design — continue here (15 October 2026)

The canonical cross-project handoff is in the adjacent reference repository:

- [Vision, intent, architecture, current state and runbook](../bible-faith-patterns/handoff/CURRENT_STATE_2026-10-15.md)
- [Task ledger and acceptance criteria](../bible-faith-patterns/handoff/TASKS.json)
- [Local website/brand implementation notes](BRAND_AND_REFERENCE.md)

Absolute canonical path on this Mac:
`/Users/ttreppmann/Developer/StudioProjects/bible-faith-patterns/handoff/CURRENT_STATE_2026-10-15.md`

If this repository is opened on another machine, obtain the handoff and adjacent
reference checkout rather than assuming the relative file exists in the remote.
Do not copy private screenshots or credentials into this repository.

## Settled canvas behavior

`/missional-canvas/` now offers Explore and Fill modes for church, Christian
nonprofit and Christian business. Drafts save separately in local storage and can
be downloaded/reopened as JSON. No account/backend/answer upload.

The PDF must be **ONE A3 landscape page in the actual spatial canvas layout, with
every GUIDING QUESTION and its answer INSIDE the matching block**. No appended
report, excerpts or summary-only replacement. Readable text fitting; if too full,
name the affected block and ask for shortening without discarding any data.
Unanswered prompts remain. Native printing follows the same layout. Both initial
multipage design and later answer-only design were explicitly corrected by the
owner; do not revert to them.

Current sources: `src/pages/missional-canvas.astro`,
`src/components/CanvasWorkbook.astro`, `src/data/missional-canvases.json`, and
`src/lib/canvas-{draft,workbook,layout,pdf,print}.ts`. See BRAND_AND_REFERENCE.md
for checks, font provenance and import workflow. Latest feature commit956a4a6.

## Next authorized work

1. Fix whole-scene pedestrian motion in the neighborhood film (source project is
   in the adjacent reference checkout). Architecture/colors are accepted; frozen
   people, walking in place and storefront-only motion are not. V3 is prepared,
   NOT submitted. Provider auth works; precise CLI version choice is pending.
2. Integrate accepted silent, controlled footage beside the canvas, with poster,
   reduced-motion behavior and fictional-scene disclosure.
3. Review the actual website/reference and A4/A5 field guide together for coherent
   typography, color urban/tech photography, pale blue-silver silicon, sharp
   four-point glints and page pacing. Older object studies remain provisional.
4. Review the locally refined “When Silicon Catches the Light” article at
   `/calling/rocks/`. It now uses the approved contextual image, editorial serif
   headline and a design/context bridge. Preserve source/Scripture notices.
   Details: adjacent research/editorial/2026-10-15-silicon-article.md.

## Work and check

Current branch `codex/identity-system` is retained, not retired. The changes are
locally committed; no recent push/deploy was performed. Parent AGENTS.md applies.
Stack: Astro4 static output, TypeScript, CSS, jsPDF4.2.1 lazy-loaded for export.

`npm run build` finishes Astro and `scripts/finalize-reference.py`. Wait for it to
finish before browser QA. Serve `dist` on loopback8794 for current local previews;
`/missional-canvas/` is the implemented page, not the old private recovery study.

Use `python3 scripts/check-canvas-workbook.py` for browser feature checks and
`uv run --with pdfplumber python scripts/check-canvas-pdf.py FILE --variant church`
for single-page and complete-question/block checks. Headless Chromium was already
authorized. Do not repeatedly broaden tests for documentation-only edits.

Only refresh the imported reference snapshot after changing its public source:
`python3 scripts/sync-brand.py`, `python3 scripts/import-pattern-reference.py`,
then `npm run build`. The private research corpus must never be imported.

Existing public hosting/deployment details and phone research permissions are in
the canonical handoff. Local preview differs from live because it is not deployed;
finish and review concrete changes before an authorized public rollout.
