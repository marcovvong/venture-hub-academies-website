# VHA Website — v3 Handoff Spec

**Written:** 2026-09-20 · **Repo:** `~/Desktop/vha-website`
**Purpose:** everything a fresh session needs to build v3 without re-reading history.

Read §0 first — several assumptions in the v3 brief no longer match the repo.

---

## 0. Corrections to the brief (verified against the repo)

| Brief says | Actually true | Action |
|---|---|---|
| Work is on branch `main` | Work is on **`redesign/energetic-institutional`**. `origin/main` is at `ba15314`, **8 commits behind**. | Decide before starting: build v3 on the branch, or merge to `main` first. Do not assume `main` is current. |
| Claude Code can't push, Davis pushes manually | **Push works from this environment** and was used throughout; latest push `ea6ad59`. | A session can push. Still confirm with Davis before pushing to `main`. |
| SC/TC use 操盘手 for "operator" | **Already fixed** — SC `运营者`, TC `運營者`. | None. |
| KM renders "groundbreaking" as ឧត្តមគតិ | **Already fixed** — KM uses `ច្នៃប្រឌិតខ្ពស់`. | None. |
| TH/KM leave "Accelerator"/"APAC Sandbox" in English | **Already localised** — TH `แอคเซลเลอเรเตอร์` / `แซนด์บ็อกซ์เอเชียแปซิฟิก`, KM `អាចសេឡេរ៉េទ័រ` / `កម្មវិធីសាកល្បងអាស៊ីប៉ាស៊ីហ្វិក`. | None. TH/KM use transliteration rather than native coinage — worth raising in the native-speaker pass, but nothing is left in English. |
| Delete "regulatory support" from the Access pillar | **Already absent** — no occurrence of "regulatory" anywhere in the site. | None. |
| Delete "with follow-on support into your next round" from Capital | That exact phrase is on **`portfolio.html`**, which v3 deletes. The homepage Capital pillar currently reads "…alongside access to investors, strategic partners and **follow-on funding pathways**." | Still remove the follow-on claim from the homepage pillar (see §2.2). |
| "Who we back" is missing from v2 | It exists on **`about.html`**. It is missing from the **homepage**. | Add to the homepage (see §2.2). |

**Critical, unrelated to v3 scope:** `origin/main` does not contain the commit that restores the APAC map libraries (`2c9cd2b`). `git show origin/main:index.html | grep -c d3.min.js` → `0`. If the live site deploys from `main`, **the map is broken in production right now** and shows its text fallback. Ship that commit regardless of what else v3 does.

---

## 1. Current state — v2 (this design is APPROVED, preserve it)

### 1.1 Files

```
index.html  about.html  accelerator.html  community.html      # pages (generated)
apply.html  portfolio.html  venture-studio.html
css/vha-v2.css          # entire design system, hand-maintained
js/vha-v2.js            # nav drawer, scroll reveals, counters, ticker, map init
js/vha-network.js       # APAC network canvas (needs d3 + topojson)
js/vha-apply.js         # apply form: pill groups + Formspree submit
tools/build_site.py     # GENERATES all pages — edit this, never the .html
tools/apply-form.html   # apply form partial (keeps Formspree field names safe)
tools/build_single_file.py  # bundles whole site into one .html for review
locales/*.json          # 6 languages, currently UNUSED by v2
assets/images/          # 4 photographs, assets/logo/ 6 PNGs
reference/              # design canvas exports + brief, not part of the site
```

**Pages are generated.** Never hand-edit the root `.html`. Edit `tools/build_site.py`, then:

```bash
python3 tools/build_site.py      # rewrites all pages + sitemap.xml
python3 -m http.server 8080      # preview
```

The `NAV` list at the top of `build_site.py` is the single source of truth: adding/removing a page updates nav, mobile drawer, footer and `sitemap.xml` together.

### 1.2 Colour tokens

Three accents cannot be used as text on light. **Check contrast before changing any of these.**

| Token | Value | Role |
|---|---|---|
| `--white` | `#F7F7F2` | page background (warm, not pure) |
| `--paper` | `#FFFFFF` | cards, the final CTA field |
| `--black` | `#0A0A0F` | footer + mobile drawer only (site chrome) |
| `--purple` | `#8044FD` | brand: fills, large display, map nodes |
| `--purple-text` | `#7433F0` | small text on light — 5.62:1 (`--purple` is only 4.69:1) |
| `--purple-deep` | `#2E1065` | button hovers |
| `--sharp` | `#C77DFF` | light-purple section fields. **Fill only on light (2.50:1)** |
| `--ink` | `#101014` | body text — 17.66:1 |
| `--muted` | `#6A6A72` | muted body — 4.99:1 |
| `--on-purple-muted` | `rgba(16,16,20,.78)` | muted text on `--sharp` — 4.99:1 |
| `--line-control` | `#888882` | control borders — 3.32:1, meets the 3:1 UI minimum |

**White text on `--sharp` fails at 2.50:1.** Light-purple sections carry black text only.

### 1.3 Type scale

`.d-xl` `clamp(46px,8.4vw,118px)` · `.d-l` `clamp(38px,5.6vw,78px)` · `.d-m` `clamp(30px,3.8vw,54px)` · `.h` `clamp(24px,2.6vw,38px)` · `.body-l` `clamp(18px,1.5vw,22px)` · `.cap` mono 12.5px uppercase.

Plus Jakarta Sans throughout; JetBrains Mono for metadata, eyebrows, market codes, coordinates.

### 1.4 Section rhythm

`.mode-inst` and `.mode-energy` are both warm white (semantic distinction only). `.mode-purple` is the `--sharp` light-purple field with black text. Sections alternate; the final CTA is pure white; the footer is black.

### 1.5 Motion

Hero APAC canvas (dot-matrix map, six nodes, animated connection pulses; animates only while on screen, static under `prefers-reduced-motion`) · scroll reveals via IntersectionObserver · number counters · markets ticker (duplicated in JS for a seamless loop) · button/arrow hovers 150–260ms.

### 1.6 Hero structure — keep identical across pages

Every page uses the same hero: eyebrow → `.d-xl` headline with a `<em>` sharp-purple highlighter band → lede → two buttons → photo with coordinate badge → metadata row → ticker. The photo is absolutely positioned and fills the column, so it aligns with the text block to the pixel. **Do not reintroduce per-page hero markup.**

### 1.7 Cache-busting

CSS/JS are emitted with a content hash (`css/vha-v2.css?v=9189abcd`). Keep this. Without it a cached stylesheet pairs with new HTML and text disappears — that bug has already happened once.

---

## 2. What changes in v3

### 2.1 Seven pages → five

Keep: **Home, About, Accelerator, Community, Apply.**

**Delete `portfolio.html`** — no permission to name portfolio companies.
- remove from `NAV` in `build_site.py`, which clears nav/drawer/footer/sitemap
- delete `page_portfolio()` and its `_company()` helper
- remove the Portfolio teaser section from `page_home()`
- check no residual links: `grep -rn "portfolio" *.html tools/`

**Delete `venture-studio.html`** as a page; fold its positioning into About.
- About already has a "Two engines" section with an accelerator/studio `.compare` pair — extend that rather than inventing a new component
- carry across: *"The accelerator backs founders. The studio builds with them"*, and the thesis → build → incorporate → scale sequence if it still fits
- the homepage nav item disappears with the `NAV` edit

After the cut, delete `portfolio.html` and `venture-studio.html` from disk — the generator will not remove stale files.

### 2.2 Homepage copy corrections

| Where | Change |
|---|---|
| Hero meta row | `COHORT 01 — APPLICATIONS OPEN` → `APPLICATIONS OPEN`. Also present in `apply.html` (and `portfolio.html`, being deleted). |
| Capital pillar | Drop the follow-on claim. Current: "Invested via SAFE, alongside access to investors, strategic partners and follow-on funding pathways." → e.g. "Invested via SAFE, alongside access to investors and strategic partners." |
| Access pillar | No change needed — "regulatory support" is already gone. |
| **Who we back** | Restore to the homepage. VHA prioritises **experienced operators over first-time, idea-stage founders** — the sharpest filter, currently only on About. Reuse the `.compare` component (Not our fit / Our fit) already built for About. |

US$150K via SAFE is **confirmed accurate** and stays as the headline figure. Proof band stays `US$150K / 10 companies / 6 months / 6 APAC markets`. Do not claim guaranteed customers or revenue anywhere — Sandbox language is "market access, validation opportunities and regional connections".

### 2.3 Internationalisation — the largest task

v2 has **zero** i18n. v1 had a working implementation; restore it onto the v2 design.

**Locale files are intact** — all six parse as valid JSON:

| File | Size | Top-level keys |
|---|---|---|
| `en.json` | 16.6 KB | 17 (`nav hero stats why how beyond map close about acc com apply footer chrome seo images home`) |
| `jp.json` | 12.9 KB | 16 (no `home`) |
| `sc.json` | 10.4 KB | 16 |
| `tc.json` | 10.4 KB | 16 |
| `th.json` | 20.6 KB | 16 |
| `km.json` | 22.1 KB | 16 |

**But they describe v1 copy, not v2.** Measured coverage of v2 visible strings against `en.json` values:

| Page | Covered |
|---|---|
| index.html | **10/56 (17%)** |
| accelerator.html | 17/41 (41%) |
| venture-studio.html | 3/35 (8%) — page being deleted |
| portfolio.html | 14/37 (37%) — page being deleted |
| community.html | 12/29 (41%) |
| about.html | 10/37 (27%) |
| apply.html | 29/45 (64%) — form labels survived |
| **Total** | **95/280 (33%)** |

Every v2 headline is missing: *What VHA does · Build. Validate. Scale. · Build here. Validate everywhere. · Match. Nurture. Connect. · Two ways we work · Three ways in · A living collection.*

So roughly **two thirds of the copy needs new keys and new translation.** Treat the existing files as a reusable base for nav, footer, form labels, market names and About/Accelerator body — not as a finished translation.

**Reference implementation** (v1, still in history):

```bash
git show 57e1dcd^:js/i18n.js        # the module
git show 57e1dcd^:about.html        # data-i18n / data-i18n-attr binding style
```

It provides: `LANGS` (en, sc, tc, jp, th, km), `?lang=xx` URL selection with no storage, `data-i18n="dot.path"` for text and `data-i18n-attr="attr:dot.path"` for attributes, nav dropdown + mobile drawer chips, per-page SEO title/description swap, and English fallback merge (added later — new copy can ship in `en.json` alone without blanking other languages).

**Work required:**
1. Restore `js/i18n.js` and wire it into `build_site.py` so every generated element carries a `data-i18n` key.
2. Re-key `en.json` to the v2 section structure (the v1 key names no longer describe the sections).
3. Translate the ~65% that is new, in five languages.
4. Re-add the language switcher to the nav and drawer using v2 components.
5. Restore `hreflang` alternates in `sitemap.xml` (stripped when the site went English-only) — **only if** the language URLs actually serve translated content. Advertising `?lang=tc` while serving English is worse than omitting it.

**CJK/Thai/Khmer fonts:** v2 loads only Plus Jakarta Sans + JetBrains Mono. v1 also loaded Noto Sans SC/TC/JP/Thai/Khmer. Re-add those to the font link, or non-Latin text falls back to system fonts and the typography breaks.

---

## 3. Carry-over

**Logo.** `assets/logo/vha-mark-{black,white}-{128,256}.png` plus two larger PNGs. **No SVG exists** — flagged. The mark is used at 30×30 in nav/drawer/footer, so 256px PNG is adequate for now, but an SVG is needed for print, large display and crisp scaling.

**Apply form.** Endpoint `https://formspree.io/f/maqrelbb`. **15 field names are the Formspree column headings — renaming one splits the submission history.** Honeypot `_gotcha` present. File input is `accept=".pdf"`, help text says max 10MB; the 10MB ceiling is Formspree's and is **not enforced client-side** — a larger file fails at submit. Pill groups (Company stage, Open to relocating) write to hidden inputs and are validated by hand, because hidden inputs are skipped by native constraint validation. The form partial lives in `tools/apply-form.html` precisely so regeneration cannot disturb it.

**Domain & SEO.** `academy.venturehub.tech`. Homepage canonical is the bare root; inner pages are `/<file>.html`. `robots.txt` allows everything and points at the sitemap. **No `noindex` anywhere — never reintroduce one.** After the page cut, `sitemap.xml` must list exactly five URLs (the generator rebuilds it from `NAV`; confirm the output).

**Translation quality.** The three specific defects in the brief are fixed (§0). Still open: **JP, TH and KM need a native-speaker pass before public launch**, including whether TH/KM should keep transliterated "Accelerator"/"APAC Sandbox" or adopt native terms.

**Content still missing.** Founder quote on the portfolio page is a placeholder (page being deleted, but the quote may resurface); event dates are "Date TBC". Anything unconfirmed is marked with `tag--pending` — `grep -rn "tag--pending" *.html`.

**Photography.** Only four images exist, all from one panel event, reused across pages at different crops. More photography would let each page stand on its own.

---

## 4. Git state

- **Remote:** `https://github.com/marcovvong/venture-hub-academies-website.git`
- **Working branch:** `redesign/energetic-institutional` — this is where all v2 work lives
- **`origin/main`:** `ba15314`, **8 commits behind** the working branch
- **Pushing works from this environment** (contrary to the brief); latest push `ea6ad59`

Commits on the branch that `main` lacks:

```
ea6ad59 Homepage content revision: AI venture-building ecosystem positioning
34819be Add a single-file bundle of the whole site
8b9deea Align the Platform section with the sections around it
917bc4f Content-hash asset URLs so stale CSS cannot break the page
fa1489e Dark sections become light purple with black text
39615e0 Swap the dark surfaces: sections to deep purple, footer to black
127472e CTA field to white, footer to black
2c9cd2b Restore the APAC map libraries dropped in the generator rebuild  ← fixes the live map
```

**Decide with Davis before starting v3:** merge the branch into `main` first (so v3 builds on current code and the live map is fixed), or continue on the branch. Do not push to `main` without asking — the live site appears to deploy from it.

---

## 5. Definition of done for v3

- [ ] Exactly five pages exist; `portfolio.html` and `venture-studio.html` deleted from disk
- [ ] No link, nav item, footer entry or sitemap URL references a deleted page
- [ ] `sitemap.xml` lists exactly five URLs; no `noindex`; canonicals match
- [ ] Homepage: no cohort number, no follow-on claim, "Who we back" restored
- [ ] Venture-studio positioning present on About
- [ ] All six languages switchable via `?lang=`, switcher in nav and drawer
- [ ] Noto fonts loaded for SC/TC/JP/Thai/Khmer
- [ ] No horizontal overflow, 360–1440px, every page
- [ ] Hero photo aligns to the text block top and bottom on every page
- [ ] APAC map paints (d3/topojson present) — no `[data-map-fallback]` in the DOM
- [ ] Apply form: 15 field names and endpoint unchanged; pill validation works
- [ ] Contrast: no white text on `--sharp`; all body text ≥4.5:1

Verify with a headless pass over every page × {360, 390, 768, 1024, 1440} checking `scrollWidth === clientWidth`, hero alignment, and absence of the map fallback. That harness caught four real regressions during v2.
