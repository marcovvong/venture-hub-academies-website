# VHA Website — Claude Design Brief (v2 — SUPERSEDES v1)
**Purpose:** Visual mockup for Home / About / Accelerator / Community pages, before Claude Code build.

⚠️ **THIS BRIEF REPLACES ALL PREVIOUS DIRECTION.** Discard the dark-mode-first, particle/dot-grid design system from the earlier round entirely. Do not blend the two — this is a full aesthetic reset, not an incremental adjustment.

---

## Positioning
Venture Hub Academy (VHA) is an AI accelerator and venture studio — NOT an EdTech company. Reference brands: **Y Combinator, a16z, Sequoia Capital, BlackRock, Blackstone**. Institutional, restrained, authority-led. Not consumer-app energetic — energy comes from motion, not loud UI.

---

## Design System v2 (locked — replaces v1 entirely)

**Mode: LIGHT ONLY. No dark mode this round.**
Matches the existing VHA pitch deck aesthetic exactly — white/near-white background throughout.

**Color — matched to VHA's existing pitch deck**
- Background: `#FFFFFF` / `#FAFAFA`
- Text primary: `#111111`
- Text secondary: `#5A5A5A`
- Accent (primary): `#8044FD`
- Accent-hover: `#A174FE`
- Tint: `#CDB7FC`
- Tint-light: `#E4D7FF`
- Border/divider: `#E5E5E5`
- Match the VHA pitch deck cover slide palette precisely (reference image in Website Pics folder).

**Typography**
- Headings: **Century Gothic** (English only)
- Body: **Inter**
- Multilingual fallback (headings AND body, non-Latin scripts): **Noto Sans SC / TC / JP / Thai / Khmer** — Century Gothic has no CJK/Thai/Khmer glyphs.
- Two weights: regular + bold. Deck headline weight is heavy/bold.

**Motion direction — core visual signature**
- Reference: VHA pitch deck cover slide — concentric purple hairline arcs flowing from the right edge, increasing in density toward the edge (reference image in Website Pics folder — most important visual reference for this build).
- Animate as slow, continuous, organic flow (smoke/fluid motion, not mechanical rotation). Lines drift, breathe, slowly shift position/opacity — smooth ambient backdrop, never distracting from foreground text.
- Do NOT use particle/dot systems, geometric grids, or mechanical animation.
- Placement: right-to-left flow anchored to right edge, consistent across Home hero and page headers.
- Secondary: scroll-triggered fade/slide-in for content blocks.

**Reference sites (layout/tone only, not color/mode)**
- radical.vc — layout calm, whitespace, typography-led hierarchy
- aifund.ai — venture-studio positioning language and structure
- Do not use dark mode or different colors from these references — VHA stays light-mode, purple-accented.

**Imagery**
- Founder/office/event photos (Website Pics folder) + wave motion above. No video, no particle effects, no stock photography.

**Logo**
- Black version only.

**Language switcher**
- Single dropdown/selector, not a row of codes. Collapsed: "EN ▾". Expanded: English / 简体中文 / 繁體中文 / 日本語 / ภาษาไทย / ភាសាខ្មែរ

---

## Sitemap (4 pages, no Team page, no Portfolio page, no Fund page)

### 1. Home
- Hero: Headline "Backing execution-ready AI founders across Asia." + subhead + single CTA "Apply to the Accelerator"
- At A Glance stat bar (4 stats, number count-up on scroll): US$150K via SAFE / Up to 10 companies per cohort / 6-month program / 6 jurisdictions
- "Why Execution Matters" — short editorial section
- "How It Works" — 4-step flow: Community → Structured Program (3mo) → APAC Sandbox (3mo) → Demo Day
- "Beyond Capital" — 3-column feature block: HPC / APAC Sandbox / Ecosystem Network
- Jurisdictions map — static visual, 6 markets highlighted (HK, TW, SG, JP, TH, Cambodia)
- Closing CTA

### 2. About
- Mission statement
- Investment thesis / selection criteria (3 points)
- "Who We Back" — explicit: experienced operators, not idea-stage first-timers
- Institutional backing: First Financial Holding, HKU/HKUST/CUHK academic partners

### 3. Accelerator
- Program overview (6-month structure, cohort size, SAFE terms)
- Structured Program detail (Month 1-3)
- APAC Sandbox detail (Month 4-6)
- Demo Day section
- Selection criteria (reuse from About)
- CTA to application form

### 4. Community
- Funnel explainer: Open Forum → Members → Core Cohort (3-tier progression visual, not a pricing table)
- CTA: Join the Community

---

## Tone
Sentence case throughout. No exclamation marks. No "leverage/seamless/unlock/empower" corporate filler. Confident, plain-spoken, institutional — closer to how a PE firm writes than how a consumer startup writes.

## Copy source of truth
Use only the content in VHA_Website_Copy_6Languages.md (already shared in this project). Do not invent new headline/subheadline copy, taglines, or stat framing. If a section needs copy not covered in that file, flag it as a question rather than drafting original marketing copy.

---

## What NOT to include this round
- No portfolio company names/logos (Edspark, Dote, AROSYS — excluded)
- No team headshots/bios
- No mention of FCGM Venture Hub Tech Fund (compliance)
- No video backgrounds

---

## Deliverable requested from Claude Design
High-fidelity visual mockups for the 4 pages above, reflecting the color/type/motion system, ready to hand to Claude Code for build.
