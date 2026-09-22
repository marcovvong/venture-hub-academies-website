# Venture Hub Academy — website

Static marketing site for Venture Hub Academy (AI accelerator · venture studio, APAC).
No framework, no dependencies to install. The `.html` files at the root are the site.

**Design System v2.0 "Venture Energy"** — Black / White / Purple / Sharp Purple.

---

## Pages

| Page | File | Purpose |
|---|---|---|
| Home | `index.html` | The narrative: proof, platform, program, APAC, ecosystem |
| Accelerator | `accelerator.html` | The 6-month program, the two phases, compute, Demo Day |
| Community | `community.html` | The three tiers, activity, events |
| About | `about.html` | Who we back, criteria, the two engines, the studio, backing |
| Apply | `apply.html` | Process and the application form |
| Blog | `blog.html` + `blog/*.html` | Our point of view on AI, one page per post |

---

## Editing

**Pages are generated. Do not hand-edit the `.html` files at the root** — the next
build overwrites them. Edit the generator instead:

```bash
python3 tools/build_site.py
```

- `tools/build_site.py` — page content plus the shared nav, footer, hero, CTA and
  ticker. Because every page is assembled from the same partials, the chrome cannot
  drift between pages. Adding a page to the `NAV` list updates the nav, the mobile
  drawer, the footer and `sitemap.xml` together.
- `tools/apply-form.html` — the application form, kept as a separate partial so its
  Formspree field names are not disturbed by regeneration.

Styles and behaviour are hand-maintained and not generated:

- `css/vha-v2.css` — the whole design system: tokens, three modes (light,
  black, deep purple), and every component.
- `js/vha-v2.js` — nav drawer, scroll reveals, counters, ticker, map init.
- `js/vha-network.js` — the APAC network canvas (d3 + topojson from CDN).
- `js/vha-apply.js` — application form: pill groups and Formspree submission.

---

## Posting to the blog

Each post is one Markdown file in `posts/`. No HTML needed.

```bash
python3 tools/new_post.py "Why AI agents need a sandbox first"   # 1. start a post, dated today
# 2. write it in posts/2026-09-23-why-ai-agents-need-a-sandbox-first.md
#    and delete the "draft: true" line when it is ready
python3 tools/build_site.py                                       # 3. build
git add -A && git commit -m "Post: Why AI agents need a sandbox first" && git push   # 4. publish
```

- The date and the web address come from the file name:
  `posts/2026-09-23-agents.md` becomes `blog/agents.html`, dated 23 Sep 2026.
- `posts/_template.md` shows every formatting option: headings, bold, links,
  quotes, lists and photos. Put photos for posts in `assets/blog/` (about
  1600px wide, JPEG) and write their path as `assets/blog/name.jpg`.
- The header needs a `title` and a `summary`. `author`, `tags` and a `cover`
  photo are optional. `draft: true` keeps a post off the site.
- The blog page, each post page, `sitemap.xml` and the RSS feed
  (`blog/feed.xml`) are all rebuilt from `posts/`, and so is anything a renamed
  or deleted post leaves behind. Posts are English-only: the page labels
  around them are translated, and non-English visitors see a short note
  saying so.
- Build logic is in `tools/blog.py`; the page templates are `page_blog` and
  `page_post` in `tools/build_site.py`.

---

## Colour

Three of the accents cannot be used as text on the light background, so each has a
fill role and a text role. Check contrast before changing them.

| Token | Value | Use |
|---|---|---|
| `--white` | `#F7F7F2` | Page background |
| `--sharp` | `#C77DFF` | Energy accent. **Fill only on light** (2.50:1); text on dark (7.34:1) |
| `--purple` | `#8044FD` | Brand: fills, large display, map |
| `--purple-text` | `#7433F0` | Small text on light (5.62:1; `--purple` is only 4.69:1) |
| `--black` | `#0A0A0F` | Darkest contrast sections |
| `--purple-deep` | `#2E1065` | Footer, dark CTA |

---

## The application form

`apply.html` posts to Formspree (`https://formspree.io/f/maqrelbb`). The 15 field
names are the column headings in the Formspree dashboard — **renaming a field
renames the column and splits the history**, so keep them as they are.

---

## Notes

- **Six languages**, selected with `?lang=sc|tc|jp|th|km` (no parameter means English).
  `js/i18n.js` layers the chosen locale over English, so an untranslated key renders
  in English rather than blank. `locales/en.json` is **generated** from the markup by
  `build_site.py` - never edit it by hand; change the copy in the generator instead.
  The other five are hand-maintained. All six are complete. Traditional Chinese
  follows Hong Kong usage. Japanese, Thai and Khmer are **provisional** until a
  native speaker reviews them - see `docs/translation-gaps.md`, regenerated with
  `python3 tools/gap_list.py`. Each script gets its Noto face through `:lang()`
  rules at the end of `css/vha-v2.css`.
- **Awaiting content:** event dates are marked "awaiting content" rather than
  invented. Search for `tag--pending`.
- **Photography:** eleven images, all from the Venture Showcase at HKU (23 May 2026).
  Every page hero uses a different photo; the Community gallery reuses some of
  them. Web copies live in `assets/images/` at two widths, listed in `PHOTO` in
  `tools/build_site.py`; camera originals stay in `assets/` and are gitignored.
- `reference/` holds design-canvas exports, the brief and older prototypes. It is not
  part of the site, but it *is* served if the whole repo is deployed.

## Local preview

```bash
python3 -m http.server 8000
```
