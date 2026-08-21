# Handoff: Venture Hub Academy — Marketing Website

## Overview
Five-route marketing site for **Venture Hub Academy (VHA)**, an AI accelerator / venture studio operating across six Asian markets. Routes: **Home, About, Accelerator, Community, Apply**. Includes a 6-language switcher (EN / 简体 / 繁體 / 日本語 / ไทย / ខ្មែរ), an animated canvas "wave" hero motif, a dot-matrix APAC map, scroll reveals, and animated stat counters.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing the intended look and behavior. They are **not production code to copy directly**.

`VHA Website.dc.html` is authored in a proprietary streaming-component format (a template with `{{ }}` holes plus a logic class, rendered by `support.js`). Do **not** try to port that runtime. Read it as a spec: the markup shows structure and every inline style value; the logic class shows state, routing, canvas animation, and the full translation dictionary.

**The task is to recreate these designs in the target codebase's existing environment** (Next.js/React, Vue, Astro, etc.) using its established routing, i18n, component, and styling conventions. If no codebase exists yet, Next.js (App Router) + Tailwind is a good fit: 5 static routes, an i18n dictionary, and two `<canvas>` components.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interaction timings. Every value in this README is taken directly from the prototype — recreate pixel-accurately, substituting the codebase's own primitives (Button, Container, etc.) where they exist.

---

## Information Architecture

| Route | Hash in prototype | Sections |
|---|---|---|
| Home | `#/` | Hero (wave canvas) · At a glance (4 stats) · Why execution matters · How it works (4 steps) · Event photo band · Beyond capital (3 cards) · Jurisdictions (dot map) · Closing CTA |
| About | `#/about` | Header (wave) · Mission pull-quote · Full-bleed photo · Selection criteria (3 cards) · Who we back (✕/✓ tags) · Institutional backing (4 icon cards) |
| Accelerator | `#/accelerator` | Header (wave) · Program overview (3 rows) · **Connected timeline**: Structured Program → APAC Sandbox → Demo Day · Selection criteria (3 cards) · CTA |
| Community | `#/community` | Header (wave) · Funnel (Open Forum → Members → Core Cohort) · Join (photo + copy) · CTA |
| Apply | `#/apply` | Header · 3-step process · Form (company, founders, stage, traction, deck upload, etc.) · Success state |

Global chrome: sticky **Nav** (70px) + slide-in **Menu drawer** (340px, from left) + dark **Footer** (4 columns).

---

## Design Tokens

### Color
| Token | Hex | Use |
|---|---|---|
| Primary | `#8044FD` | CTAs, eyebrows, icons, active underline, timeline medallions |
| Primary hover | `#A174FE` | Button/link hover |
| Primary tint bg | `#F6F2FF` | Highlighted card (funnel step 02), dropdown hover |
| Primary border | `#CDB7FC` | Card hover border, pills, dashed connectors, drawer numerals |
| Primary pale | `#E4D7FF` | `::selection`, on-dark small text |
| Ink | `#111111` | Headings, body, footer background |
| Body grey | `#5A5A5A` | Paragraphs, secondary |
| Muted grey | `#9B9B9B` / `#8A8A8A` | Labels, footer meta |
| Footer text | `#B9B9B9` | Footer links |
| Hairline | `#E5E5E5` | All 1px borders |
| Hairline light | `#F0F0F0` | Drawer row dividers |
| Surface | `#FFFFFF` | Default background |
| Surface alt | `#FAFAFA` | Alternating section bands |

Sections alternate `#FFFFFF` / `#FAFAFA`, each band separated by a `1px solid #E5E5E5` rule. Only these two background colors are used (plus the ink footer and one primary-filled card).

### Typography
- **Display / headings**: `'Century Gothic', 'Jost', <CJK/Thai/Khmer Noto fallbacks>, sans-serif` — weight **700**, `letter-spacing:-.3px` (`-.5px` on h1).
- **Body / UI**: `'Inter', <Noto fallbacks>, sans-serif` — 400/500/600.
- CJK & SEA fallback chain (required, the site is 6-language): `'Noto Sans TC','Noto Sans SC','Noto Sans JP','Noto Sans Thai','Noto Sans Khmer'`.

| Role | Size | Weight | Line-height |
|---|---|---|---|
| h1 hero | `clamp(42px, 4.6vw, 64px)` | 700 | 1.12 |
| Page header title | `clamp(38px, 4vw, 56px)` | 700 | 1.12 |
| Closing CTA h2 | `clamp(32px, 3.4vw, 46px)` | 700 | 1.15 |
| Section h2 | 34px (30–32px in timeline) | 700 | 1.25 |
| Mission pull-quote | `clamp(26px, 2.6vw, 36px)` | 700 | 1.42 |
| Card h3 | 21px | 700 | — |
| Lead paragraph | 18px | 400 | 1.68 |
| Body paragraph | 16–16.5px | 400 | 1.7–1.8 |
| Card body | 14.5–15.5px | 400 | 1.65–1.7 |
| Eyebrow | 13.5px | 600 | `letter-spacing:.4px`, color `#8044FD` |
| Nav link | 14.5px | 500 | — |
| Pill / tag | 12.5px | 600 | — |
| Footer legal | 12.5px | 400 | — |

Use `text-wrap: pretty` on all headings and long paragraphs.

### Spacing & layout
- Content container: `max-width:1280px; margin:0 auto; padding:0 40px`.
- Section vertical padding: **110–130px** top/bottom (150px on the closing CTA).
- Common grids: `5fr 7fr` and `7fr 5fr` with `gap:80px`; card grids `repeat(3, 1fr)` / `repeat(4, 1fr)` with `gap:16–24px`.
- Timeline grid: `grid-template-columns:64px 1fr; column-gap:30px`.
- Radii: **3px** buttons/inputs, **4px** dropdown, **999px** pills/avatars/newsletter input, **0** on cards (deliberately square).
- Shadows: cards `0 20px 44px rgba(17,17,17,.08)` (hover) · purple button `0 10px 28px rgba(128,68,253,.22)` · purple card `0 18px 44px rgba(128,68,253,.28)` · drawer `0 30px 80px rgba(17,17,17,.18)` · dropdown `0 16px 40px rgba(17,17,17,.10)`.

---

## Components & Interactions

### Nav (sticky)
`position:sticky; top:0; z-index:60; background:rgba(255,255,255,.94); backdrop-filter:blur(10px); border-bottom:1px solid #E5E5E5; height:70px`.
Left: hamburger (3 bars 22/14/22 × 2px, gap 5px) + 30px logo mark + wordmark 16px/700. Center: Home / About / Accelerator / Community, each `padding:6px 0; border-bottom:2px solid` — primary when active, transparent otherwise. Right: language dropdown + `Apply` button (`#8044FD`, 10px 18px, radius 3px).

Logo mark treatment (it's a photo asset, not a vector): `object-fit:cover; filter:grayscale(1) brightness(1.12) contrast(1.6); mix-blend-mode:multiply`. **Replace with the real SVG logo when available.**

### Menu drawer
Fixed left, `width:340px; max-width:84vw`, `transform: translateX(0 | -104%)`, `transition: transform .5s cubic-bezier(.2,.7,.2,1)`. Backdrop `rgba(17,17,17,.35)`, `opacity` transition `.4s`, `pointer-events` toggled. Rows: numeral `01–04` (12px, `#CDB7FC`) + label 25px/700, `padding:22px 0`, `1px solid #F0F0F0` dividers; row 04 = "Apply Now" in primary with a trailing `→`. Language chips pinned to the bottom (`margin-top:auto`).

### Wave canvas (hero + all page headers)
The signature motif, drawn on `<canvas>` filling the header box, `pointer-events:none`, behind content.
- **N** = `waveDensity` polylines (default 34, range 10–60), each sampled over 130 segments from `x = -40` to `W + 40`.
- Per line `fi = i/(N-1)`, phase `ph = fi * 1.1`, time `t = elapsedSeconds * waveSpeed`.
- `base = H*0.60 + sin(u*2.4 + t*0.42 + ph)*H*0.085 + sin(u*4.6 - t*0.28 + ph*1.7)*H*0.04`
- `spread = H*0.30 * (0.28 + 0.72*|sin(u*1.9 - t*0.24 + 0.8)|)`
- `y = base + (fi-0.5)*spread*(1 + 0.25*sin(u*3.3 + t*0.34 + fi*2.0)) + sin(u*7 + t*0.55 + i*0.42)*2.2`  (where `u = x/W`)
- Stroke color interpolates `#8044FD` (band core) → `#CDB7FC` (edges) via `core = 1 - |fi-0.5|*2`.
- DPR-aware: back-buffer at `min(devicePixelRatio, 2)`, re-fit on resize.
- `waveMotion:false` renders one static frame (also the `prefers-reduced-motion` path).

### Dot-matrix map (Home — Jurisdictions)
Separate reference file `vha-map-dotted.html` (d3-geo + topojson, `world-atlas@2` countries-110m).
- Keep only the 6 markets **plus** a neighbor-context set; drop everything else. Highlight IDs: HK/TW are drawn as markers; filled country IDs `392 JP, 158 TW, 764 TH, 116 KH, 702 SG`; context IDs `156, 704, 418, 104, 458, 608, 408, 410, 096` render dimmed.
- `d3.geoMercator().fitSize([w,h], {type:"FeatureCollection", features: filteredFeatures})` — **fit to the feature collection, not a bbox polygon** (fitting a raw polygon object silently collapses the scale).
- Dot grid: 9px pitch, hit-test with `ctx.isPointInPath`. Highlighted dots r=1.7 `rgba(124,58,237,.68)`; context dots r=1.4 `rgba(178,158,242,.4)`.
- Markers: radial glow r=24 from `rgba(128,68,253,.30)` → transparent; ring r=8.5; white dot r=5.2; purple core r=3.3. Labels 13.5px/600 with a `#F6F3FE` 5px halo stroke, offset via per-market `dx/dy/anchor` + a leader line so Hong Kong/Taiwan and Thailand/Cambodia never collide.
- Canvas background `#F6F3FE`.

### Cards (criteria, beyond capital, institutional backing)
`background:#FFFFFF` (or `#FAFAFA` on white bands); `border:1px solid #E5E5E5`; `padding:32px 28px`; square corners. 30px stroke icon, then numeral (13px/700 primary), then h3 / body.
Hover: `transform:translateY(-5px); box-shadow:0 20px 44px rgba(17,17,17,.08); border-color:#CDB7FC`, `transition:.25s ease`.

### Accelerator timeline
Two-column grid per stage: 64px rail + content. Rail = 52px circular medallion (`background:#FFFFFF; border:1.5px solid #8044FD`, or filled `#8044FD` on the final Demo Day node with `box-shadow:0 8px 22px rgba(128,68,253,.28)`) above a 2px **animated flowing dashed line**:
```css
background-image: repeating-linear-gradient(to bottom,#CDB7FC 0,#CDB7FC 7px,transparent 7px,transparent 18px);
background-size: 2px 36px;
animation: vhaflow 1s linear infinite;      /* 0 0 → 0 -36px */
```
Horizontal variant for the Community funnel connectors: `vhaflowx`, `background-size:32px 2px`, `0 0 → 32px 0`, `.9s`.
Icons: mentor-pair (Structured Program), compass (APAC Sandbox), bar-chart (Demo Day). Stage tag = pill (`border:1px solid #CDB7FC; background:#FFFFFF; color:#8044FD; radius:999px; padding:5px 13px`).

### Community funnel
`grid-template-columns: 1fr auto 1fr auto 1fr`, the `auto` tracks holding the flowing connectors. Escalating emphasis: card 01 white/hairline · card 02 `#F6F2FF` + `#CDB7FC` border · card 03 solid `#8044FD` with white text and `#E4D7FF` body. Icons: chat bubble → award badge → concentric circles.

### About — "Who we back" tags
Two pills side by side: rejected = ✕ glyph, `border:1px solid #E5E5E5; background:#FAFAFA; color:#9B9B9B` ("Idea-stage first-timers"); preferred = ✓ glyph, `border:1px solid #CDB7FC; background:#F6F2FF; color:#8044FD` ("Experienced operators"). Mission pull-quote carries `padding-left:28px; border-left:3px solid #8044FD`.

### Footer
`background:#111111`, four columns. Col 1 brand + `info@venturehubacademy.com` + "Supported by First Financial Holding". Col 2 Quick links. Col 3 newsletter — pill input (`background:transparent; border:1px solid rgba(255,255,255,.24)`) + 46px circular primary submit with `→`. Col 4 mission blurb + three 40px circular social buttons (in / X / IG), hover border+text → `#A174FE`. Bottom bar `border-top:1px solid rgba(255,255,255,.12)`: © line left, Terms | Privacy right.

---

## Motion

| Effect | Spec |
|---|---|
| Scroll reveal | Elements marked `data-reveal`: from `opacity:0; translateY(18px)` to `opacity:1; translateY(0)`, `.7s cubic-bezier(.2,.7,.2,1)`, IntersectionObserver, once. Optional stagger via a delay attribute (0.08–0.16s). |
| Stat counters | Count 0 → target over **1100ms** with an ease-out, fired when the stat band enters view, once. Prefix/suffix (`US$`, `K`, `-month`, `up to `) sit outside the animated number. |
| Card hover | `translateY(-5px)` + shadow, `.25s ease` |
| Drawer | `.5s cubic-bezier(.2,.7,.2,1)`; backdrop opacity `.4s ease` |
| Flowing connectors | `vhaflow` 1s / `vhaflowx` .9s, linear, infinite |
| Wave | `requestAnimationFrame`, continuous |
| Route change | Reset scroll to top, close drawer + language menu, re-arm reveal/counters |

Honor `prefers-reduced-motion`: freeze the wave on one frame, stop the connector loops, show final counter values, and skip reveal transforms.

## State
- `page`: `home | about | acc | com | apply` — hash-routed in the prototype (`#/`, `#/about`, `#/accelerator`, `#/community`, `#/apply`). **Use real paths (`/`, `/about`, …) in production.**
- `lang`: `en | sc | tc | jp | th | km` — selects a translation dictionary. Persist to `localStorage` and/or prefix the route; the prototype keeps it in memory only.
- `menuOpen`, `langOpen` (closes on outside click) — both reset on route change.
- Apply form: field values, `applyStage`, `applyHq`, `applyReloc`, `applyDone` (success state replaces the form).
- Tweakables exposed as props: `waveMotion` (bool, true), `waveDensity` (int, 34, 10–60), `waveSpeed` (range, 1, 0.2–3).

## Content
All copy for all six languages lives in the `_data()` method of `VHA Website.dc.html` (search `en: {`) as one nested object per language, keyed `nav / hero / stats / why / how / beyond / map / close / about / acc / com / apply / footer`. **Lift it verbatim** into the target i18n system — it is client-approved copy, not placeholder. Note the tone: matter-of-fact, no exclamation, no emoji.

## Assets
In `assets/` (originals from the client's photo library):
- `24211ef7-3c49-4c67-870d-b82fdb1fdedc.JPG` — logo mark (photo crop; **request a real SVG/PNG logo**)
- `260523 hkU_0049.JPG` — Home event band, `object-position:center 30%`
- `260523 hkU_0141.JPG` — About full-bleed photo, `object-position:center 68%`
- `260523 hkU_0133.JPG` — Accelerator Demo Day, `object-position:center 88%`
- `260523 hkU_0160.JPG`, `260523 hkU_0037 (1).JPG`, `858185bc-….JPG` — Community / alternates

All are large camera JPEGs — compress and serve responsive sizes (`next/image` or equivalent) before shipping. Icons are hand-written inline SVG (stroke-only, `stroke-width:1.6–1.7`, `stroke-linecap:round`, `stroke-linejoin:round`, 24–30px) — swap for the codebase's icon set if it has equivalents, keeping the light stroke weight.

Fonts: Century Gothic is not web-licensed here — **Jost** (Google Fonts, 600/700) is the substitute in use. Confirm licensing before launch.

## Responsive
The prototype is desktop-first (~1280–1440px) and **not** yet adapted for mobile. When implementing:
- Collapse all `5fr 7fr` / `7fr 5fr` grids to a single column below ~900px.
- Card grids: 3-up → 1-up; the 4-up stat band → 2×2.
- Community funnel: horizontal → vertical, connectors rotate to `vhaflow`.
- Hide the center nav links below ~880px; the hamburger drawer already covers navigation.
- Section padding 110–130px → 64–72px; container padding 40px → 20px.
- Keep tap targets ≥44px.

## Accessibility notes to fix in implementation
- Drawer needs focus trap, `Esc` to close, and `aria-expanded` on the hamburger.
- Language dropdown should be a real listbox (`role="listbox"`/`option`, arrow-key nav).
- Canvas decorations need `aria-hidden="true"`.
- Map markers should have a text-list equivalent (the Jurisdictions section already lists all six markets — keep it).
- Verify `#5A5A5A` on `#FAFAFA` and `#9B9B9B` on `#111111` against WCAG AA at their sizes.

## Files
| File | What it is |
|---|---|
`VHA About.dc.html`, `VHA Accelerator.dc.html`, `VHA Community.dc.html`, `VHA Apply.dc.html` | The same site pinned to one route each, so each page opens directly in a browser. Identical code to `VHA Website.dc.html` apart from the initial route — implement from whichever is convenient.
`VHA Website.dc.html` | Full 5-route site (opens on Home; append `#/about`, `#/accelerator`, `#/community`, `#/apply` to reach the others) — the primary reference. Template = markup + inline styles; logic class = state, routing, wave canvas, reveal/counter observers, all 6 translation dictionaries. |
`vha-map-dotted.html` | Standalone dot-matrix APAC map (current version, d3 + topojson). |
`vha-map.html` | Earlier map iteration, kept for reference. |
`VHA Home.dc.html` | Earlier Home-only draft. Superseded — do not implement from this. |
`support.js` | Proprietary runtime for the `.dc.html` format. Included only so the prototypes open in a browser. **Not to be ported.** |
`assets/` | Photography and logo mark. |

To view a prototype: open the `.html` file directly in a browser (needs network access for Google Fonts, d3, and the world-atlas topojson).
