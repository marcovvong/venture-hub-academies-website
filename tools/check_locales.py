#!/usr/bin/env python3
"""Check the hand-maintained locale files against generated en.json.

Run by build_site.py after every build.

Three things go wrong with translated markup, in rising order of damage:

  * a key that no longer exists in en.json - dead weight, and usually the sign
    of a rename that the translations did not follow;
  * a translation that drops a tag - it still renders, but a <br> that goes
    missing costs a designed line break and an <em> costs the purple
    highlighter band;
  * a translation that invents a tag - unbalanced markup injected through
    innerHTML, which can break the surrounding layout.

The last is an error. The first two are reported and counted.
"""
import json, os, re, sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import locale_tools as lt


def tags(value):
    return Counter(t.lower() for t in re.findall(r'<\s*/?\s*([a-z0-9]+)', value))


def check(verbose=True):
    en = lt.flat(json.load(open(os.path.join(lt.ROOT, "locales", "en.json"),
                                encoding="utf-8")))
    total = len([k for k, v in en.items() if isinstance(v, str)])
    errors, notes, coverage = [], [], {}

    for lang in lt.LANGS:
        tr = lt.flat(lt.load(lang))
        translated = 0
        for key, value in sorted(tr.items()):
            if key not in en:
                notes.append((lang, key, "not in en.json"))
                continue
            if not isinstance(value, str) or not value.strip():
                continue
            translated += 1
            te, tv = tags(en[key]), tags(value)
            if tv - te:
                errors.append((lang, key, "invents markup: %s" % dict(tv - te)))
            elif te - tv:
                notes.append((lang, key, "drops %s" % dict(te - tv)))
        coverage[lang] = translated

    if verbose:
        parts = ["%s %d/%d (%d%%)" % (l, n, total, round(100.0 * n / total))
                 for l, n in coverage.items()]
        print("  locale coverage:       " + ", ".join(parts))
        for lang, key, msg in notes:
            print("    note  %s %s: %s" % (lang, key, msg))
        for lang, key, msg in errors:
            print("    ERROR %s %s: %s" % (lang, key, msg))
    return errors, coverage, total


if __name__ == "__main__":
    errs, _, _ = check()
    sys.exit(1 if errs else 0)
