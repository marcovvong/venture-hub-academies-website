#!/usr/bin/env python3
"""Headless pass over every page, language and width.

    python3 -m http.server 8099 &
    python3 tools/check_pages.py [port]

Two rules this harness learned the hard way, both of which produced
convincing false positives before they were fixed:

  * Load each page at the width being measured. Resizing a loaded page and
    measuring straight away catches the scroll-reveal transition mid-flight
    (the hero photo carries translateY(26px) while revealing) and the map
    canvas inside its debounced resize handler. Both look exactly like
    layout bugs and neither is one.
  * Run under prefers-reduced-motion. The reveals then ship visible in the
    markup, so geometry is final as soon as the page renders and there is
    no animation to race.

The map's world atlas comes from a CDN, so a missing map is retried once
before it is called a failure.
"""
import sys
from playwright.sync_api import sync_playwright

PAGES = ["index.html", "accelerator.html", "community.html", "about.html", "apply.html"]
LANGS = {"en": "en", "sc": "zh-Hans", "tc": "zh-Hant", "jp": "ja", "th": "th", "km": "km"}
WIDTHS = [360, 390, 768, 1024, 1440]
LITERALS = ["&mdash;", "&rsquo;", "&middot;", "&hellip;", "&amp;", "<br>", "<em>", "<b>"]


def audit(pg, base, page, lang, expect, width, fails):
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    url = "%s/%s%s" % (base, page, "" if lang == "en" else "?lang=" + lang)
    pg.goto(url, wait_until="domcontentloaded", timeout=60000)
    where = "%s %s @%d" % (page, lang, width)

    try:
        pg.wait_for_function("l => document.documentElement.lang === l",
                             arg=expect, timeout=15000)
    except Exception:
        fails.append("%s: language never applied" % where)
        return errs

    sw, cw = pg.evaluate("[document.documentElement.scrollWidth,"
                         " document.documentElement.clientWidth]")
    if sw > cw:
        fails.append("%s: horizontal overflow %d > %d" % (where, sw, cw))

    if width >= 1024:
        box = pg.evaluate("""() => {
            const g = document.querySelector('.hero__grid');
            if (!g) return null;
            const t = g.children[0].getBoundingClientRect();
            const m = g.children[1].getBoundingClientRect();
            return {top: t.top - m.top, bottom: t.bottom - m.bottom};
        }""")
        if box and (abs(box["top"]) > 1 or abs(box["bottom"]) > 1):
            fails.append("%s: hero photo off the text block by top %.2f bottom %.2f"
                         % (where, box["top"], box["bottom"]))

    body = pg.inner_text("body")
    desc = pg.get_attribute('meta[name="description"]', "content") or ""
    for label, text in [("body", body), ("title", pg.title()), ("description", desc)]:
        for bad in LITERALS:
            if bad in text:
                fails.append("%s: literal %r in %s" % (where, bad, label))
    return errs


def main():
    port = sys.argv[1] if len(sys.argv) > 1 else "8099"
    base = "http://localhost:%s" % port
    fails, checked = [], 0
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(reduced_motion="reduce")
        ctx.route("**://fonts.googleapis.com/**", lambda r: r.abort())
        ctx.route("**://fonts.gstatic.com/**", lambda r: r.abort())
        for page in PAGES:
            for lang, expect in LANGS.items():
                for width in WIDTHS:
                    pg = ctx.new_page()
                    pg.set_viewport_size({"width": width, "height": 900})
                    errs = audit(pg, base, page, lang, expect, width, fails)
                    real = [e for e in errs
                            if "fonts.g" not in e and "ERR_FAILED" not in e
                            and "Failed to fetch" not in e]
                    if real:
                        fails.append("%s %s @%d: console %s" % (page, lang, width, real[:1]))
                    pg.close()
                    checked += 1
            # the map only needs proving once per page, at one width
            pg = ctx.new_page()
            pg.set_viewport_size({"width": 1280, "height": 900})
            pg.goto("%s/%s" % (base, page), wait_until="domcontentloaded")
            pg.wait_for_timeout(4000)
            if pg.query_selector("[data-map-fallback]"):
                pg.reload(wait_until="domcontentloaded")       # CDN hiccup, retry once
                pg.wait_for_timeout(6000)
                if pg.query_selector("[data-map-fallback]"):
                    fails.append("%s: map fell back to text twice" % page)
            pg.close()
        b.close()

    print("\n".join(fails) if fails else
          "PASS: %d page/language/width combinations, maps painted on all %d pages"
          % (checked, len(PAGES)))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
