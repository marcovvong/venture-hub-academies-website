/* Homepage controller — Design System v2.0 "Venture Energy". English only. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ===== Drawer ===== */
  function initNav() {
    var open = document.querySelector("[data-open-menu]");
    var close = document.querySelector("[data-close-menu]");
    var drawer = document.querySelector("[data-drawer]");
    var backdrop = document.querySelector("[data-backdrop]");
    if (!open || !drawer || !backdrop) return;
    var last = null;

    function focusables() {
      return Array.prototype.slice.call(drawer.querySelectorAll('a[href], button:not([disabled])'));
    }
    function show() {
      last = document.activeElement;
      drawer.setAttribute("data-open", "true");
      backdrop.setAttribute("data-open", "true");
      open.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      var f = focusables(); if (f.length) f[0].focus();
    }
    function hide() {
      drawer.setAttribute("data-open", "false");
      backdrop.setAttribute("data-open", "false");
      open.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (last) last.focus();
    }
    open.addEventListener("click", function () {
      drawer.getAttribute("data-open") === "true" ? hide() : show();
    });
    if (close) close.addEventListener("click", hide);
    backdrop.addEventListener("click", hide);
    drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", hide); });
    document.addEventListener("keydown", function (e) {
      if (drawer.getAttribute("data-open") !== "true") return;
      if (e.key === "Escape") return hide();
      if (e.key !== "Tab") return;
      var f = focusables(); if (!f.length) return;
      var first = f[0], lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    });
  }

  /* ===== Reveal (§24 image reveals / directional transitions) ===== */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (reduce) return;  /* content ships visible in the markup */
    els.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(26px)";
      el.style.transition = "opacity .7s cubic-bezier(.22,.61,.24,1), transform .7s cubic-bezier(.22,.61,.24,1)";
      el.style.transitionDelay = (el.getAttribute("data-delay") || "0") + "s";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.opacity = "1";
        e.target.style.transform = "none";
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ===== Number counters (§24) ===== */
  function initCounters() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
    if (reduce) {
      els.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = +el.getAttribute("data-count");
        io.unobserve(el);
        if (!isFinite(end)) return;
        var t0 = performance.now(), dur = 1000;
        el.textContent = "0";
        (function step(now) {
          var p = Math.min(1, (now - t0) / dur);
          el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ===== Marquee: clone the group so the -50% translate loops seamlessly.
     Cloned in JS rather than duplicated in markup, which would repeat the
     text for screen readers. ===== */
  function initMarquee() {
    document.querySelectorAll("[data-marquee]").forEach(function (track) {
      var group = track.querySelector("[data-marquee-group]");
      if (!group || track.children.length > 1) return;
      var clone = group.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
  }

  /* ===== APAC network — electric blue on warm white (§16) ===== */
  function initMap() {
    var canvas = document.querySelector("[data-apac-map]");
    if (!canvas || !window.VhaNetwork) return;
    VhaNetwork.init(canvas, {
      labels: { hk: "Hong Kong", tw: "Taiwan", sg: "Singapore", jp: "Japan", th: "Thailand", kh: "Cambodia" },
      showLabels: true,
      colors: {
        accent: "128,68,253",   /* --purple #8044FD */
        land:   "122,122,132",
        landHi: "128,68,253",
        label:  "#101014",      /* --ink */
        node:   "#8044FD"
      },
      unavailableText: "Interactive map unavailable. Markets: Hong Kong, Taiwan, Singapore, Japan, Thailand, Cambodia."
    });
  }

  function initFooter() {
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = "© " + new Date().getFullYear() + " Venture Hub Academy";
    var form = document.querySelector("[data-newsletter]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input[type=email]");
      var email = input ? input.value : "";
      window.location.href = "mailto:info@venturehub.tech?subject=" +
        encodeURIComponent("Newsletter signup") +
        "&body=" + encodeURIComponent("Please add this address to the Venture Hub Academy newsletter.") +
        (email ? "%0A%0AFrom: " + encodeURIComponent(email) : "");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav(); initMarquee(); initFooter(); initReveal(); initCounters(); initMap();
  });
})();
