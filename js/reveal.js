/* Scroll-triggered reveal + stat count-up. Honors prefers-reduced-motion. */
(function () {
  function initReveal(root) {
    root = root || document;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var els = Array.prototype.slice.call(root.querySelectorAll("[data-reveal]"));

    if (reduce) {
      els.forEach(function (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    } else {
      // Content is fully visible in the raw HTML (no-JS / crawler baseline);
      // only hide-then-reveal here, once JS is confirmed running.
      els.forEach(function (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(22px)";
        el.style.transition = "opacity .75s cubic-bezier(.2,.6,.2,1), transform .75s cubic-bezier(.2,.6,.2,1)";
        el.style.transitionDelay = (el.getAttribute("data-reveal-delay") || "0") + "s";
      });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "none";
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      els.forEach(function (el) { io.observe(el); });
    }
  }

  function runCount(el) {
    var end = +el.getAttribute("data-count");
    if (!isFinite(end)) return;
    var dur = 1100;
    var t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }

  function initCounters(root) {
    root = root || document;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var els = Array.prototype.slice.call(root.querySelectorAll("[data-count]"));
    if (reduce) {
      els.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  window.VhaReveal = { initReveal: initReveal, initCounters: initCounters };
})();
