/* Shared i18n: URL-param-based language selection, no storage. */
(function (global) {
  var LANGS = [
    { k: "en", c: "EN", n: "English" },
    { k: "sc", c: "简", n: "简体中文" },
    { k: "tc", c: "繁", n: "繁體中文" },
    { k: "jp", c: "日", n: "日本語" },
    { k: "th", c: "TH", n: "ภาษาไทย" },
    { k: "km", c: "KM", n: "ភាសាខ្មែរ" }
  ];
  var DEFAULT_LANG = "en";

  function getLangFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var l = params.get("lang");
    var valid = LANGS.some(function (x) { return x.k === l; });
    return valid ? l : DEFAULT_LANG;
  }

  function urlForLang(lang, href) {
    var url = new URL(href || window.location.href, window.location.href);
    if (lang === DEFAULT_LANG) {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", lang);
    }
    return url.pathname + url.search + url.hash;
  }

  function loadLocale(lang) {
    return fetch("locales/" + lang + ".json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("locale fetch failed: " + lang);
        return r.json();
      });
  }

  /* Deep-merge `over` onto a copy of `base`. Arrays are replaced wholesale,
     not merged element-wise: a translated list that is shorter than the
     English one should not inherit leftover English tail entries. */
  function merge(base, over) {
    if (Array.isArray(over)) return over;
    if (over === null || typeof over !== "object") {
      return over === undefined ? base : over;
    }
    if (base === null || typeof base !== "object" || Array.isArray(base)) return over;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(over).forEach(function (k) {
      out[k] = k in base ? merge(base[k], over[k]) : over[k];
    });
    return out;
  }

  /* Load a locale layered over English. New copy can ship in en.json alone and
     every language keeps rendering — untranslated keys fall back to English
     instead of disappearing from the page. */
  function loadLocaleWithFallback(lang) {
    if (lang === DEFAULT_LANG) return loadLocale(DEFAULT_LANG);
    return Promise.all([
      loadLocale(DEFAULT_LANG),
      loadLocale(lang).catch(function (e) {
        console.error(e);
        return {};
      })
    ]).then(function (parts) { return merge(parts[0], parts[1]); });
  }

  function get(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, obj);
  }

  // Apply text/attr bindings declared in markup:
  //  data-i18n="dot.path"            -> textContent
  //  data-i18n-attr="attr:dot.path"  -> setAttribute(attr, value)
  function applyStaticBindings(root, t) {
    root = root || document;
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      var val = get(t, el.getAttribute("data-i18n"));
      if (val !== undefined) el.textContent = val;
    });
    root.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length !== 2) return;
        var attr = parts[0].trim();
        var val = get(t, parts[1].trim());
        if (val !== undefined) el.setAttribute(attr, val);
      });
    });
  }

  function rewriteInternalLinks(root, lang) {
    root = root || document;
    root.querySelectorAll("a[data-internal]").forEach(function (a) {
      a.setAttribute("href", urlForLang(lang, a.getAttribute("href")));
    });
  }

  function setDocumentMeta(t, page, htmlLang) {
    document.documentElement.setAttribute("lang", htmlLang);
    var seo = t.seo && t.seo[page];
    if (seo) {
      if (seo.title) document.title = seo.title;
      var desc = document.querySelector('meta[name="description"]');
      if (desc && seo.description) desc.setAttribute("content", seo.description);
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && seo.title) ogTitle.setAttribute("content", seo.title);
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && seo.description) ogDesc.setAttribute("content", seo.description);
    }
  }

  function buildLangSwitcher(t, lang) {
    var trigger = document.querySelector("[data-lang-trigger]");
    var label = document.querySelector("[data-lang-label]");
    var menu = document.querySelector("[data-lang-menu]");
    var wrap = document.querySelector("[data-lang-switch]");
    if (label) {
      var current = LANGS.filter(function (x) { return x.k === lang; })[0];
      label.textContent = current ? current.c : "EN";
    }
    if (trigger) trigger.setAttribute("aria-label", t.chrome.languageLabel);
    if (menu) {
      menu.innerHTML = "";
      menu.setAttribute("role", "listbox");
      LANGS.forEach(function (item) {
        var opt = document.createElement("button");
        opt.type = "button";
        opt.className = "lang-switch__option";
        opt.setAttribute("role", "option");
        opt.setAttribute("data-lang-key", item.k);
        if (item.k === lang) opt.setAttribute("aria-selected", "true");
        else opt.setAttribute("aria-selected", "false");
        var code = document.createElement("span");
        code.className = "lang-switch__option-code";
        code.textContent = item.c;
        var name = document.createElement("span");
        name.textContent = item.n;
        opt.appendChild(code);
        opt.appendChild(name);
        opt.addEventListener("click", function () {
          window.location.href = urlForLang(item.k);
        });
        menu.appendChild(opt);
      });
    }
    if (wrap && trigger) {
      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = wrap.getAttribute("data-open") === "true";
        wrap.setAttribute("data-open", open ? "false" : "true");
        trigger.setAttribute("aria-expanded", open ? "false" : "true");
      });
      document.addEventListener("click", function (e) {
        if (!wrap.contains(e.target)) {
          wrap.setAttribute("data-open", "false");
          trigger.setAttribute("aria-expanded", "false");
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          wrap.setAttribute("data-open", "false");
          trigger.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  function buildDrawerLangChips(lang) {
    var list = document.querySelector("[data-drawer-lang-list]");
    if (!list) return;
    list.innerHTML = "";
    LANGS.forEach(function (item) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "drawer__lang-chip";
      chip.textContent = item.n;
      if (item.k === lang) chip.setAttribute("aria-pressed", "true");
      chip.addEventListener("click", function () {
        window.location.href = urlForLang(item.k);
      });
      list.appendChild(chip);
    });
  }

  // Entry point: loads the locale for the current page, applies static bindings,
  // sets meta, wires the language switcher, and resolves with { t, lang }.
  function init(page) {
    var lang = getLangFromUrl();
    return loadLocaleWithFallback(lang).then(function (t) {
      applyStaticBindings(document, t);
      rewriteInternalLinks(document, lang);
      setDocumentMeta(t, page, t.chrome.htmlLang);
      buildLangSwitcher(t, lang);
      buildDrawerLangChips(lang);
      document.querySelectorAll("[data-nav-current='" + page + "']").forEach(function (el) {
        el.setAttribute("aria-current", "page");
      });
      return { t: t, lang: lang };
    });
  }

  global.VhaI18n = {
    LANGS: LANGS,
    DEFAULT_LANG: DEFAULT_LANG,
    getLangFromUrl: getLangFromUrl,
    urlForLang: urlForLang,
    loadLocale: loadLocale,
    loadLocaleWithFallback: loadLocaleWithFallback,
    merge: merge,
    get: get,
    applyStaticBindings: applyStaticBindings,
    rewriteInternalLinks: rewriteInternalLinks,
    init: init
  };
})(window);
