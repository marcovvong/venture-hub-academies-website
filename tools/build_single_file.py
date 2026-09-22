#!/usr/bin/env python3
"""
Bundle the whole site into ONE self-contained .html file.

    python3 tools/build_single_file.py [output_path]

All five pages, the CSS, the JS and the photographs are embedded. The nav
switches pages in place, so it behaves like the real site rather than five
pages stacked end to end. Only d3/topojson (for the APAC map) load from a CDN.
"""
import base64, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/Desktop/VHA-website.html")

PAGES = [("home", "index.html", "Home"), ("accelerator", "accelerator.html", "Accelerator"),
         ("community", "community.html", "Community"),
         ("about", "about.html", "About"), ("apply", "apply.html", "Apply"),
         ("blog", "blog.html", "Blog")]
SLUG = {f: s for s, f, _ in PAGES}

# Photographs are referenced many times; embed each once and assign at runtime
# so the file does not carry the same base64 blob repeatedly.
SMALL = {"home-event-1920.jpg": "home-event-960.jpg", "about-photo-1600.jpg": "about-photo-800.jpg",
         "demo-day-1600.jpg": "demo-day-800.jpg", "community-photo-1600.jpg": "community-photo-800.jpg",
         "pitch-results-1600.jpg": "pitch-results-800.jpg", "vc-challenge-1600.jpg": "vc-challenge-800.jpg",
         "audience-laugh-1600.jpg": "audience-laugh-800.jpg", "judges-chat-1600.jpg": "judges-chat-800.jpg",
         "audience-focus-1600.jpg": "audience-focus-800.jpg", "audience-front-1600.jpg": "audience-front-800.jpg"}


def read(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return f.read()


def uri(p, mime):
    with open(os.path.join(ROOT, p), "rb") as f:
        return "data:%s;base64,%s" % (mime, base64.b64encode(f.read()).decode())


def main_of(page):
    return re.search(r'<main id="main">(.*?)</main>', read(page), re.S).group(1)


def rewrite(body, slug):
    # 'apac' exists on two pages, so scope it; other ids are already unique.
    body = body.replace('id="apac"', 'id="%s--apac"' % slug).replace('href="#apac"', 'href="#%s--apac"' % slug)
    # Page links become router navigations.
    def link(m):
        target = SLUG.get(m.group(1))
        return 'href="#/%s" data-goto="%s"' % (target, target) if target else m.group(0)
    body = re.sub(r'href="([a-z-]+\.html)"', link, body)
    # Strip responsive sources; one embedded image per photograph.
    body = re.sub(r'\s+srcset="[^"]*"', "", body)
    body = re.sub(r'\s+sizes="[^"]*"', "", body)
    def img(m):
        name = os.path.basename(m.group(1))
        return 'data-img="%s"' % SMALL.get(name, name)
    return re.sub(r'src="(assets/images/[^"]+)"', img, body)


def build():
    index = read("index.html")
    chrome = index[index.index('<div class="backdrop"'):index.index('<main id="main">')]
    footer = index[index.index('<footer class="foot">'):index.index('</footer>') + len('</footer>')]
    for old, new in [("index.html", "home")] + [(f, s) for s, f, _ in PAGES]:
        pass
    def fix_chrome(x):
        def link(m):
            t = SLUG.get(m.group(1))
            return 'href="#/%s" data-goto="%s"' % (t, t) if t else m.group(0)
        return re.sub(r'href="([a-z-]+\.html)"', link, x)
    chrome, footer = fix_chrome(chrome), fix_chrome(footer)
    for logo, mime in [("assets/logo/vha-mark-black-256.png", "image/png"),
                       ("assets/logo/vha-mark-white-256.png", "image/png")]:
        d = uri(logo, mime)
        chrome = chrome.replace('src="%s"' % logo, 'src="%s"' % d)
        footer = footer.replace('src="%s"' % logo, 'src="%s"' % d)

    sections = []
    for slug, page, _ in PAGES:
        sections.append('<div class="sitepage" data-page="%s"%s>\n%s\n</div>'
                        % (slug, "" if slug == "home" else " hidden", rewrite(main_of(page), slug)))

    photos = {v: uri("assets/images/" + v, "image/jpeg") for v in set(SMALL.values())}
    imgmap = "{" + ",".join('"%s":"%s"' % (k, v) for k, v in photos.items()) + "}"

    # The bundle drives map setup itself, once a page is actually visible.
    site_js = read("js/vha-v2.js").replace(
        "initNav(); initMarquee(); initFooter(); initReveal(); initCounters(); initMap();",
        "initNav(); initMarquee(); initFooter(); initReveal(); initCounters();")

    router = """
/* Single-file bundle: nav swaps pages in place. */
(function () {
  var IMG = %s;
  document.querySelectorAll('img[data-img]').forEach(function (im) {
    var d = IMG[im.getAttribute('data-img')];
    if (d) im.src = d;
  });

  var pages = document.querySelectorAll('.sitepage');
  function paintMaps(page) {
    if (!window.VhaNetwork) return;
    if (!window.d3 || !window.topojson) return;   /* deferred; retry on next show */
    page.querySelectorAll('[data-apac-map]').forEach(function (c) {
      if (c.dataset.ready) return;
      c.dataset.ready = '1';
      VhaNetwork.init(c, {
        labels: { hk: 'Hong Kong', tw: 'Taiwan', sg: 'Singapore', jp: 'Japan', th: 'Thailand', kh: 'Cambodia' },
        showLabels: true,
        colors: { accent: '128,68,253', land: '122,122,132', landHi: '128,68,253',
                  label: '#101014', node: '#8044FD' },
        unavailableText: 'Interactive map unavailable. Markets: Hong Kong, Taiwan, Singapore, Japan, Thailand, Cambodia.'
      });
    });
  }
  function show(slug, scroll) {
    var found = false;
    pages.forEach(function (p) {
      var on = p.getAttribute('data-page') === slug;
      p.hidden = !on;
      if (on) { found = true; paintMaps(p); }
    });
    if (!found) return show('home', scroll);
    document.querySelectorAll('.nav__links a').forEach(function (a) {
      a.toggleAttribute('aria-current', a.getAttribute('data-goto') === slug);
    });
    if (scroll !== false) window.scrollTo(0, 0);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-goto]');
    if (!a) return;
    e.preventDefault();
    var slug = a.getAttribute('data-goto');
    if (location.hash !== '#/' + slug) location.hash = '#/' + slug; else show(slug);
  });
  window.addEventListener('hashchange', function () {
    var h = location.hash || '';
    if (h.indexOf('#/') === 0) show(h.slice(2));
  });
  function start() {
    show((location.hash.indexOf('#/') === 0) ? location.hash.slice(2) : 'home', false);
  }
  /* Wait for the deferred map libraries before the first paint. */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
""" % imgmap

    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Venture Hub Academy — complete site</title>
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://unpkg.com/d3@7.9.0/dist/d3.min.js" integrity="sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i" crossorigin="anonymous" defer></script>
<script src="https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js" integrity="sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67" crossorigin="anonymous" defer></script>
<style>
%s
.sitepage[hidden] { display: none !important; }
</style>
</head>
<body>
<!-- Complete Venture Hub Academy site in a single file: all five pages, CSS,
     JS and photographs embedded. The nav switches pages in place. The APAC map
     needs a connection (d3/topojson from CDN); without one it shows its
     fallback text and everything else still works. -->
<a class="skip" href="#main">Skip to content</a>
%s
<main id="main">
%s
</main>
%s
<script>
%s
</script>
<script>
%s
</script>
<script>
%s
</script>
</body>
</html>
""" % (read("css/vha-v2.css"), chrome, "\n".join(sections), footer,
       read("js/vha-network.js"), site_js + "\n" + read("js/vha-apply.js"), router)


if __name__ == "__main__":
    html = build()
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote %s  (%.0f KB)" % (OUT, os.path.getsize(OUT) / 1024))
