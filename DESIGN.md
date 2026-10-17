---
name: Missional by Design — Reflected Light
description: Luminous editorial design for contextual Christian discernment.
colors:
  navy-ink: "#102c47"
  muted-ink: "#486078"
  white: "#fff"
  ice-field: "#edf5f9"
  rule: "#ccdae3"
  action: "#10324f"
  action-hover: "#234e72"
  focus: "#256292"
  selection: "#bed9ed"
  resource-rule: "#d3e0e8"
  reference-link: "#245a80"
  reference-dark-paper: "#102333"
  reference-dark-card: "#162e40"
  reference-dark-ink: "#e8f1f7"
  reference-dark-muted: "#b9cddd"
  reference-dark-rule: "#3c566a"
  reference-dark-link: "#a7d2f0"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(55px,6.6vw,100px)"
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: "-.025em"
  headline:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-.02em"
  editorial:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(28px,3.5vw,40px)"
    fontWeight: 400
    lineHeight: 1.25
  body:
    fontFamily: "Mona Sans, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Mona Sans, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: "4px"
  reading-preview: "24px"
spacing:
  section: "72px"
  section-mobile: "44px"
  gutter: "9.8%"
  gutter-mobile: "6%"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
    textColor: "{colors.white}"
  editorial-link:
    textColor: "{colors.navy-ink}"
  resource-item:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy-ink}"
---

# Design System: Missional by Design — Reflected Light

## Overview

**Creative North Star: "Reflected Light"**

Reflected Light pairs luminous paper and cool blue fields with navy ink, expressive editorial typography and warm urban working scenes. The fractured reflective silicon specimen carries reflected witness: broad rugged fractures, icy blue-silver sheen and a sharp four-point optical glint. It does not stand for the gospel or foundation.

The active system is the final cascade in `src/styles/reflected-light.css`, after global and historical brand styles. Native marketing remains light. The adjacent reference extends this world for sustained reading with a deliberate light/dark control and system-preference fallback. Home composition remains in its surface contract rather than becoming a universal page template.

**Key Characteristics:**
- White and pale ice-blue fields with navy ink.
- Instrument Serif display and short editorial passages; Mona Sans body and UI.
- Restrained rules, small control radii, generous editorial image fields.
- Warm fictional urban photography with visible generated-image disclosure.

## Colors

### Primary
Navy Ink supplies readable text and linework; Action and Action Hover establish compact, confident routes forward. Focus and Selection remain visible on pale fields.

### Neutral
White is the default canvas; Ice Field separates reading and example regions without heavy boxes. Muted Ink supports captions and secondary copy; Rule and Resource Rule define quiet structural boundaries. The homepage also uses closely related pale image-ground fields rather than a single forced background value.

### Secondary
Reference Link belongs to sustained reading. The reference dark paper/card/ink/muted/rule/link tokens describe its alternate reading theme; they do not enable a dark marketing theme. Its further tonal surfaces remain in the adjacent reference stylesheet.

**The Light Marketing Rule.** Keep native marketing surfaces light; carry alternate reading themes through the reference's existing theme controls.

## Typography

**Display Font:** Instrument Serif with Georgia fallback. **Body Font:** Mona Sans with system sans-serif fallback. Locally supplied regular and italic Instrument Serif support expressive questions and short reflective passages. The inherited display custom property still names Mona Sans; actual h1/h2 and wordmark selectors explicitly use the editorial family.

The hero uses the frontmatter display role; mobile switches to `clamp(48px,12.8vw,76px)` at `.98` line height. General headings use the headline role with context-dependent sizes; framework hero type runs `clamp(46px,6vw,88px)`. Body copy is limited to 65ch where applicable and drops to 17px on mobile. Decks and short editorial body blocks are larger and tighter than long-form body text. Captions use the label role; navigation uses Mona Sans at 14px desktop and 18px mobile. Do not promote legacy eyebrows into a reusable type role.

**The Two Voices Rule.** Use Instrument Serif for display and short editorial passages, and Mona Sans for reading, navigation and controls.

## Layout

Use broad editorial fields and asymmetric image/copy relationships rather than repeating boxed cards. Desktop gutters are 9.8%; mobile gutters are 6%. The home hero uses a 971/431 desktop aspect ratio with copy at left and the specimen at right; below 720px copy precedes a separately cropped lower image field. The following image/copy split is 69.8/30.2; the example split is 51/49; resources form three columns; context uses 30.5/69.5. These are home compositions, not mandatory grids for every page.

At 719px and below, these sections stack and resources become icon-led rows with horizontal separators. At 359px and below the illustrative reading previews gain height and allow action labels to wrap. Intermediate adjustments occur at 1100px; large-display caps begin at 1600px. General sections use the documented section spacing; composed homepage sections use their actual viewport-relative padding.

## Elevation & Depth

Depth comes primarily from photographic light, silicon reflections and pale tonal fields. The primary action has a subtle `0 4px 10px #10324f15` shadow. Illustrative phone frames use `0 7px 14px #1b3c5021`, a dark border and a fine offset outline. These device-frame treatments do not establish a general floating-card system.

Motion is small and functional: button/link arrows move 4px over 180ms ease-out only when reduced motion is not requested. The mobile menu uses 160ms opacity and vertical transitions. Global reduced-motion handling remains in force.

## Shapes

Controls use the small documented radius. Editorial images remain broad rectangles. The larger rounded dark reading frames represent devices, not application cards. The stacked serif wordmark places “by” between two fine horizontal rules; preserve that construction. Use standard Phosphor regular SVG icons for resources and illustrative reading navigation. The silicon specimen remains fractured and reflective, with a sharp four-point optical glint rather than a rounded decorative sparkle.

## Components

### Buttons and editorial links
Primary actions combine white text, deep blue fill, a modest radius and a right-arrow SVG. Hover deepens the blue; keyboard focus uses a 3px visible outline with 5px offset. Editorial links remain underlined with a 6px underline offset and a right arrow. Preserve actual destinations and visible labels.

### Navigation and locale switch
The stacked wordmark anchors the main menu. On the desktop home it overlays the light hero; interior pages have a pale navigation field. Mobile uses a labelled button with `aria-expanded` and `aria-controls`; opening locks page scroll, following a link closes the menu, Escape closes and restores toggle focus, and entering desktop width resets it. EN/DE remains visible; German routes identify English-only Canvas and Patterns destinations with “(EN)”.

### Resource items
Principles, Canvas and Patterns use standard Phosphor icons, serif titles, compact descriptions and underlined routes. Desktop items are separated by vertical rules; mobile items become horizontal ruled rows. They are navigation choices, not raised cards.

### Illustrative reading previews
The paired semantic HTML reading examples are explicitly labelled illustrative design options, including English-language disclosure in German. Their actions route to the real reading-plan comparison. Small device text is presentation material, not a new long-form reading scale. Decorative preview tab icons are hidden from assistive technology.

### Identity imagery and wordmark
Keep the actual approved neighborhood image as the contextual source. The studio hero is a source-faithful generated adaptation, not a pixel-exact extraction. Warm urban/startup scenes retain human presence and generated-image captions. Do not imply that fictional people endorse the work.

### Reference reading and workbook workflows
The adjacent reference carries quiet reading surfaces, compact navigation, source-aware comparisons and user-controlled dark mode with system fallback. Keep working reading controls and mode selection. The canvas remains a browser-local workbook with save/reopen and overflow safeguards: filled export must remain ONE A3 landscape page in the actual nine-block arrangement, retaining all guiding questions and full answers inside their blocks. Visual changes must preserve local data and this export behavior.

This document records the built visual system. The fresh reviewer accepted the home topology, material and readability with intentional adaptations; the later ship verdict covers the scored fixes. The automated runtime phase remains open because continuation came through direct chat approval rather than a review UI receipt. This is not a claim that all automated gates passed, nor a universal quality or theological endorsement.

## Do's and Don'ts

### Do:
- **Do** use the active Reflected Light overrides as the visual source of truth.
- **Do** retain the actual approved neighborhood source and label generated fictional scenes.
- **Do** keep reading proposals visibly illustrative and preserve source/evidence distinctions.
- **Do** preserve menu, locale routing, reading controls, workbook data and one-page A3 export behavior.

### Don't:
- **Don't** inherit the historical amber, cream or Roboto Flex display palette as the new identity.
- **Don't** substitute a cross-cutout rock, abstract rock icons or unlabelled fictional testimony.
- **Don't** turn marketing preview text into evidence of observed app behavior or spiritual outcomes.
