#!/usr/bin/env python3
"""Start a new blog post from the template, dated today.

    python3 tools/new_post.py "Why AI agents need a sandbox first"

Creates posts/YYYY-MM-DD-why-ai-agents-need-a-sandbox-first.md as a draft.
Write it, delete the "draft: true" line, then run python3 tools/build_site.py.
"""
import datetime, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        sys.exit('usage: python3 tools/new_post.py "Title of the post"')
    title = " ".join(sys.argv[1:]).strip()
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:60].rstrip("-") or "post"
    path = os.path.join(ROOT, "posts", "%s-%s.md" % (datetime.date.today().isoformat(), slug))
    if os.path.exists(path):
        sys.exit("%s already exists" % os.path.relpath(path, ROOT))
    with open(os.path.join(ROOT, "posts", "_template.md"), encoding="utf-8") as f:
        text = f.read()
    text = text.replace("title: Write the headline here", "title: " + title, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print("created %s (a draft - delete the 'draft: true' line to publish)"
          % os.path.relpath(path, ROOT))


if __name__ == "__main__":
    main()
