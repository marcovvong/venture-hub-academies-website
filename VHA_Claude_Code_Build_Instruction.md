# VHA Website — Claude Code Build Instruction

Paste this as your first message in Claude Code.

---

I'm building the Venture Hub Academy (VHA) website. Everything you need is in this folder:

- `design-reference/` — HTML mockups exported from Claude Design. These define the visual target: layout, spacing, colors, motion. Read them first.
- `content/VHA_Website_Copy_6Languages.md` — the complete copy for all pages in 6 languages. This is the single source of truth for all text. Do not write new marketing copy.
- `docs/VHA_Claude_Design_Brief.md` — the design system spec (colors, fonts, motion direction).
- `assets/logo/` and `assets/images/` — logo and photography.

## What to build

A static website — plain HTML, CSS, and vanilla JavaScript. No React, no build step, no framework. It needs to be deployable by copying files to a static host.

Pages: Home, About, Accelerator, Community, Apply (5 pages).

## Requirements

**Design system**
- Light mode only. No dark mode, no theme toggle.
- Background `#FFFFFF` / `#FAFAFA`, text `#111111` / `#5A5A5A`, accent `#8044FD`, hover `#A174FE`, tints `#CDB7FC` / `#E4D7FF`, borders `#E5E5E5`.
- Headings: Century Gothic for English. Body: Inter (Google Fonts).
- Non-Latin scripts fall back to Noto Sans SC / TC / JP / Thai / Khmer — Century Gothic has no CJK/Thai/Khmer glyphs, so never let those languages render as tofu boxes.

**Hero motion (the key visual)**
- Concentric purple hairline arcs flowing in from the right edge, denser toward the edge — matching the VHA pitch deck cover.
- Animate slowly and organically: smoke/fluid drift, subtle opacity and position shifts. Not mechanical rotation, not a particle system, not a dot grid.
- Must stay behind foreground text and never reduce legibility.
- Secondary motion: scroll-triggered fade/slide-in on content blocks. Keep it restrained.

**Internationalization (i18n)**
- 6 languages: English, 简体中文, 繁體中文, 日本語, ภาษาไทย, ភាសាខ្មែរ.
- Store all copy in separate language files (e.g. a `/locales/` folder with one JSON per language) — do not hardcode text into the HTML.
- Language switcher in the top nav: a single dropdown, not a row of codes. Collapsed state shows current language (e.g. "EN ▾").
- English is the default.

**Application form (on the Apply page)**
- Native form built into the site — not an embedded Google Form.
- Submits to Formspree: `https://formspree.io/f/maqrelbb`
- Fields:
  1. Company name (text, required)
  2. Website or product URL (text)
  3. Founder name(s) and role(s) (text, required)
  4. Email (email, required)
  5. HQ or operating market (dropdown: Hong Kong / Taiwan / Singapore / Japan / Thailand / Cambodia / Other)
  6. Company stage (select: Pre-seed / Seed / Series A / Established business exploring AI transformation)
  7. What does your company do, in one sentence? (short text, required)
  8. What proprietary technology or unique commercial advantage do you have? (paragraph, required)
  9. What traction do you have today? (paragraph, required)
  10. Why do you need capital, compute, or market access specifically in Asia/APAC right now? (paragraph, required)
  11. Pitch deck or one-pager (file upload, optional, PDF only, max 10MB — show this limit in the UI)
  12. How did you hear about us? (dropdown: Community / Referral / Event / Social / Other)
  13. Are you open to relocating or spending time on-site during the program? (Yes / No / Depends)
  14. Anything else you'd like us to know? (paragraph, optional)
- Include success and error states styled to match the site.
- Enable Formspree's honeypot spam protection.
- Form labels must be translated for all 6 languages (they're in the copy file).

**SEO — important**
- The previous Wix site had `<meta name="robots" content="noindex">`, which kept it out of Google entirely. Do not carry this over. Make sure every page is indexable.
- Add proper `<title>`, meta description, Open Graph tags, and `lang` attributes per language.
- Generate a sitemap.xml and robots.txt.

**Other**
- Responsive: desktop-first, but must work properly on mobile.
- Accessible: semantic HTML, alt text on images, keyboard-navigable form and language switcher.
- No localStorage or sessionStorage.

## How to work

Start by reading the design reference files and the copy file, then tell me your plan before writing code. Build the Home page first so I can review it in the browser before you continue to the other pages.
