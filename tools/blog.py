#!/usr/bin/env python3
"""Blog posts: read posts/*.md, render their Markdown, build the RSS feed.

A post is one file named YYYY-MM-DD-slug.md with a short header:

    ---
    title: Why agents need a sandbox before they need a market
    summary: One or two sentences for the blog index and search results.
    author: Venture Hub Academy
    tags: AI agents, APAC
    cover: assets/blog/agents-sandbox.jpg
    cover_alt: What the photo shows, for screen readers.
    draft: true
    ---

    Body in Markdown...

Only title and summary are required. The date and the URL come from the file
name: 2026-09-23-agents-sandbox.md is dated 23 September 2026 and publishes at
blog/agents-sandbox.html. draft: true keeps a post off the site, and files
whose name starts with "_" (the template) are never published.

The Markdown is deliberately small and needs no library, matching the rest of
the site: ## and ### headings, paragraphs, **bold**, *italic*, `code`, links,
images, > quotes, - and 1. lists, --- rules and ``` code blocks. Paths to site
files are written from the site root (assets/blog/x.jpg, accelerator.html);
the generator adjusts them for the blog/ folder.
"""
import datetime, os, re
from html import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "posts")
NAME = re.compile(r"^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$")
DEFAULT_AUTHOR = "Venture Hub Academy"


# --- Markdown -------------------------------------------------------------

def _url(u):
    u = u.strip()
    # A link is the one place a post could smuggle script into the page.
    return "#" if re.match(r"(?i)\s*(javascript|vbscript|data):", u) else u


def inline(text):
    """Inline Markdown on one run of text. Escapes first, so raw HTML in a
    post shows as text rather than being injected into the page."""
    codes = []
    def keep(m):
        codes.append("<code>%s</code>" % escape(m.group(1), quote=False))
        return "\x00%d\x00" % (len(codes) - 1)
    text = re.sub(r"`([^`]+)`", keep, text)
    text = escape(text, quote=False)
    text = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)",
                  lambda m: '<img src="%s" alt="%s" loading="lazy">'
                  % (escape(_url(m.group(2))), escape(m.group(1))), text)
    def link(m):
        href = _url(m.group(2))
        ext = ' target="_blank" rel="noopener noreferrer"' if href.startswith(("http://", "https://")) else ""
        return '<a href="%s"%s>%s</a>' % (escape(href), ext, m.group(1))
    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", text)
    text = re.sub(r"(?<![\w_])_(?!\s)(.+?)(?<!\s)_(?![\w_])", r"<em>\1</em>", text)
    return re.sub(r"\x00(\d+)\x00", lambda m: codes[int(m.group(1))], text)


def markdown(src):
    lines = src.replace("\r\n", "\n").split("\n")
    out, i = [], 0
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if not s:
            i += 1
            continue
        if s.startswith("```"):
            i += 1
            code = []
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            i += 1
            out.append("<pre><code>%s</code></pre>" % escape("\n".join(code), quote=False))
            continue
        m = re.match(r"^(#{1,4})\s+(.*)$", s)
        if m:
            # The post title is the page's only h1, so body headings start at h2.
            level = max(2, len(m.group(1)))
            out.append("<h%d>%s</h%d>" % (level, inline(m.group(2).rstrip("#").strip()), level))
            i += 1
            continue
        if re.match(r"^(-{3,}|\*{3,}|_{3,})$", s):
            out.append("<hr>")
            i += 1
            continue
        if s.startswith(">"):
            quote = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote.append(lines[i].strip()[1:].strip())
                i += 1
            out.append("<blockquote>%s</blockquote>" % markdown("\n".join(quote)))
            continue
        bullet = re.match(r"^([-*+]|\d+[.)])\s+", s)
        if bullet:
            tag = "ol" if bullet.group(1)[0].isdigit() else "ul"
            pat = r"^\d+[.)]\s+" if tag == "ol" else r"^[-*+]\s+"
            items = []
            while i < len(lines) and lines[i].strip():
                t = lines[i].strip()
                if re.match(pat, t):
                    items.append(re.sub(pat, "", t))
                else:
                    items[-1] += " " + t          # a wrapped line continues the item
                i += 1
            out.append("<%s>%s</%s>" % (tag, "".join("<li>%s</li>" % inline(x) for x in items), tag))
            continue
        para = []
        while i < len(lines) and lines[i].strip() and not re.match(
                r"^(#{1,4}\s|>|```|([-*+]|\d+[.)])\s+|(-{3,}|\*{3,}|_{3,})$)", lines[i].strip()):
            para.append(lines[i].strip())
            i += 1
        body = inline(" ".join(para))
        # An image on its own line is a figure, not a paragraph.
        if re.fullmatch(r'<img [^>]+>', body):
            alt = re.search(r'alt="([^"]*)"', body).group(1)
            cap = "<figcaption>%s</figcaption>" % alt if alt else ""
            out.append("<figure>%s%s</figure>" % (body, cap))
        else:
            out.append("<p>%s</p>" % body)
    return "\n".join(out)


# --- Posts ------------------------------------------------------------------

def _front(text, path):
    if not text.startswith("---"):
        raise SystemExit("%s: must start with a --- header (see posts/_template.md)" % path)
    end = text.find("\n---", 3)
    if end < 0:
        raise SystemExit("%s: the --- header is never closed" % path)
    meta = {}
    for raw in text[3:end].strip().split("\n"):
        if raw.strip() and not raw.lstrip().startswith("#"):
            if ":" not in raw:
                raise SystemExit("%s: header line %r needs a 'name: value' form" % (path, raw))
            k, v = raw.split(":", 1)
            meta[k.strip().lower()] = v.strip().strip('"').strip("'")
    return meta, text[end + 4:].lstrip("\n")


def load_posts():
    """Every published post, newest first."""
    posts, seen = [], {}
    if not os.path.isdir(POSTS):
        return posts
    for name in sorted(os.listdir(POSTS)):
        if not name.endswith(".md") or name.startswith(("_", ".")) or name == "README.md":
            continue
        path = os.path.join("posts", name)
        m = NAME.match(name)
        if not m:
            raise SystemExit("%s: name it YYYY-MM-DD-some-title.md "
                             "(lowercase letters, numbers and hyphens)" % path)
        try:
            date = datetime.date.fromisoformat(m.group(1))
        except ValueError:
            raise SystemExit("%s: %s is not a real date" % (path, m.group(1)))
        with open(os.path.join(ROOT, path), encoding="utf-8") as f:
            meta, body = _front(f.read(), path)
        if meta.get("draft", "").lower() in ("true", "yes", "1"):
            continue
        for field in ("title", "summary"):
            if not meta.get(field):
                raise SystemExit("%s: the header needs a %s" % (path, field))
        slug = m.group(2)
        if slug == "index":
            raise SystemExit("%s: 'index' is the blog page itself - pick another name" % path)
        if slug in seen:
            raise SystemExit("%s and %s would both publish at blog/%s.html"
                             % (seen[slug], path, slug))
        seen[slug] = path
        words = len(re.findall(r"\w+", body))
        posts.append({
            "slug": slug,
            "file": "blog/%s.html" % slug,
            "source": path,
            "date": date,
            "title": meta["title"],
            "summary": meta["summary"],
            "author": meta.get("author") or DEFAULT_AUTHOR,
            "tags": [t.strip() for t in meta.get("tags", "").split(",") if t.strip()],
            "cover": meta.get("cover", ""),
            "cover_alt": meta.get("cover_alt", ""),
            "minutes": max(1, round(words / 220)),
            "html": markdown(body),
        })
        if posts[-1]["cover"] and not os.path.exists(os.path.join(ROOT, posts[-1]["cover"])):
            raise SystemExit("%s: cover %s does not exist" % (path, posts[-1]["cover"]))
    posts.sort(key=lambda p: (p["date"], p["source"]), reverse=True)
    return posts


def stamp(date):
    """2026.09.23 - the same in every language, in the site's mono meta style."""
    return date.strftime("%Y.%m.%d")


def build_feed(posts, site):
    items = []
    for p in posts[:30]:
        when = datetime.datetime.combine(p["date"], datetime.time(9, 0),
                                         datetime.timezone(datetime.timedelta(hours=8)))
        items.append(
            "  <item>\n"
            "    <title>%s</title>\n    <link>%s%s</link>\n    <guid>%s%s</guid>\n"
            "    <pubDate>%s</pubDate>\n    <description>%s</description>\n  </item>"
            % (escape(p["title"]), site, p["file"], site, p["file"],
               when.strftime("%a, %d %b %Y %H:%M:%S %z"), escape(p["summary"])))
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n'
           "  <title>Venture Hub Academy Blog</title>\n  <link>%sblog/</link>\n"
           "  <description>Our point of view on AI, company building and APAC markets.</description>\n"
           "  <language>en</language>\n%s\n</channel>\n</rss>\n" % (site, "\n".join(items)))
    os.makedirs(os.path.join(ROOT, "blog"), exist_ok=True)
    with open(os.path.join(ROOT, "blog", "feed.xml"), "w", encoding="utf-8") as f:
        f.write(xml)
