/* APAC network: dot-matrix Asia map, six market nodes, animated connections.
   Design system §20 (Geographic System) + §44.01 (signature motif).
   Used twice on the homepage (hero visual + APAC section) so the map reads as
   a recurring motif rather than a one-off illustration.
   Depends on d3-geo + topojson-client (loaded via CDN, defer).

   Accent colour is --signal (#A174FE / rgb(161,116,254)). Canvas cannot read
   CSS custom properties, so the value is mirrored here — keep it in sync with
   the token in css/vha.css. */
(function () {
  var MARKETS = [
    { key: "hk", code: "HKG", lon: 114.17, lat: 22.30, dx: -16, dy: -4, anchor: "end" },
    { key: "tw", code: "TPE", lon: 120.96, lat: 23.70, dx: 17, dy: -6, anchor: "start" },
    { key: "jp", code: "TYO", lon: 139.69, lat: 35.68, dx: 17, dy: -6, anchor: "start" },
    { key: "sg", code: "SIN", lon: 103.85, lat: 1.29, dx: 17, dy: 6, anchor: "start" },
    { key: "th", code: "BKK", lon: 100.52, lat: 13.75, dx: -16, dy: 16, anchor: "end" },
    { key: "kh", code: "PNH", lon: 104.92, lat: 11.55, dx: 16, dy: 20, anchor: "start" }
  ];

  /* Connections drawn between markets — a sparse set, not a full mesh:
     a mesh at this scale turns into visual noise and fights the type. */
  var LINKS = [
    ["hk", "tw"], ["hk", "jp"], ["hk", "sg"], ["hk", "th"],
    ["sg", "th"], ["th", "kh"], ["tw", "jp"], ["sg", "kh"]
  ];

  /* Highlighted country IDs (ISO numeric): TW, SG, JP, KH, TH.
     Hong Kong has no separate polygon in this topojson — it is absorbed into
     China's geometry, so its highlight patch is synthesized below. */
  var HI = new Set(["158", "702", "392", "116", "764"]);
  /* Projection is fit to this tight Asia-Pacific basis. Fitting to the whole
     rendered world would collapse the six markets into an overlapping cluster. */
  var FIT_BASIS = new Set(["392", "158", "764", "116", "702", "156", "704", "418", "104", "458", "608", "408", "410", "096"]);
  var EXCLUDE = new Set(["010"]); /* Antarctica — dominates the frame, no relevance */
  var TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";

  var topoPromise = null;
  function loadTopo() {
    if (topoPromise) return topoPromise;
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 8000) : 0;
    topoPromise = fetch(TOPO_URL, controller ? { signal: controller.signal } : {})
      .then(function (r) {
        clearTimeout(timer);
        if (!r.ok) throw new Error("topojson fetch failed: " + r.status);
        return r.json();
      });
    return topoPromise;
  }

  function showFallback(canvas, message) {
    if (!message) return;
    var wrap = canvas.parentElement;
    if (!wrap || wrap.querySelector("[data-map-fallback]")) return;
    canvas.style.display = "none";
    var el = document.createElement("div");
    el.setAttribute("data-map-fallback", "");
    el.className = "map-fallback";
    el.textContent = message;
    wrap.appendChild(el);
  }

  function init(canvas, options) {
    options = options || {};
    var labels = options.labels || {};
    var showLabels = options.showLabels !== false;
    var dotSpacing = options.dotSpacing || 9;

    if (!window.d3 || !window.topojson) {
      showFallback(canvas, options.unavailableText);
      return;
    }

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    loadTopo().then(function (topo) {
      var all = topojson.feature(topo, topo.objects.countries).features;
      var feats = all.filter(function (f) { return !EXCLUDE.has(String(f.id)); });
      var fitFeats = all.filter(function (f) { return FIT_BASIS.has(String(f.id)); });
      var ctx = canvas.getContext("2d");

      var dots = [];      /* [x, y, highlighted] */
      var nodes = {};     /* key -> [x, y] */
      var w = 0, h = 0, dpr = 1;

      function layout() {
        var box = canvas.parentElement.getBoundingClientRect();
        w = box.width; h = box.height;
        if (!w || !h) return false;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";

        /* fitExtent (not fitSize) so node glows and labels have room inside
           the frame instead of being clipped at the edges. */
        var pad = Math.min(48, Math.min(w, h) * 0.15);
        var proj = d3.geoMercator()
          .fitExtent([[pad, pad], [w - pad, h - pad]],
                     { type: "FeatureCollection", features: fitFeats });

        var hiPath = new Path2D(), loPath = new Path2D();
        var genHi = d3.geoPath(proj, hiPath), genLo = d3.geoPath(proj, loPath);
        feats.forEach(function (f) {
          if (HI.has(String(f.id))) genHi(f); else genLo(f);
        });

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        dots = [];
        var sp = dotSpacing;
        for (var y = sp / 2; y < h; y += sp) {
          for (var x = sp / 2; x < w; x += sp) {
            if (ctx.isPointInPath(hiPath, x, y)) dots.push([x, y, 1]);
            else if (ctx.isPointInPath(loPath, x, y)) dots.push([x, y, 0]);
          }
        }

        nodes = {};
        MARKETS.forEach(function (m) {
          var p = proj([m.lon, m.lat]);
          nodes[m.key] = p;
        });

        /* Synthesize Hong Kong's highlight patch (see HI note above). */
        var hk = nodes.hk;
        if (hk) {
          var r = 22;
          for (var py = hk[1] - r; py <= hk[1] + r; py += sp) {
            for (var px = hk[0] - r; px <= hk[0] + r; px += sp) {
              if (Math.hypot(px - hk[0], py - hk[1]) <= r) dots.push([px, py, 1]);
            }
          }
        }
        return true;
      }

      function drawFrame(time) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        /* Land dot matrix */
        dots.forEach(function (d) {
          ctx.beginPath();
          ctx.arc(d[0], d[1], d[2] ? 1.7 : 1.35, 0, Math.PI * 2);
          ctx.fillStyle = d[2] ? "rgba(161,116,254,0.38)" : "rgba(247,247,242,0.14)";
          ctx.fill();
        });

        /* Connection lines + travelling pulses (§18 restrained motion) */
        LINKS.forEach(function (link, i) {
          var a = nodes[link[0]], b = nodes[link[1]];
          if (!a || !b) return;
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.strokeStyle = "rgba(161,116,254,0.20)";
          ctx.lineWidth = 1;
          ctx.stroke();

          if (reduce) return;
          /* Each link runs its own offset pulse so the network reads as
             continuously active without any single synchronized "blink". */
          var period = 4200 + i * 900;
          var t = ((time + i * 1400) % period) / period;
          var ease = t * t * (3 - 2 * t);
          var px = a[0] + (b[0] - a[0]) * ease;
          var py = a[1] + (b[1] - a[1]) * ease;
          var fade = Math.sin(Math.PI * t);
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(161,116,254," + (0.85 * fade).toFixed(3) + ")";
          ctx.fill();
        });

        /* Market nodes */
        MARKETS.forEach(function (m, i) {
          var p = nodes[m.key];
          if (!p) return;
          var x = p[0], y = p[1];

          if (!reduce) {
            /* Slow breathing halo, offset per node. */
            var t = ((time + i * 700) % 3600) / 3600;
            var pulse = Math.sin(Math.PI * t);
            ctx.beginPath();
            ctx.arc(x, y, 9 + pulse * 9, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(161,116,254," + (0.28 * (1 - pulse)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          var g = ctx.createRadialGradient(x, y, 1, x, y, 20);
          g.addColorStop(0, "rgba(161,116,254,0.34)");
          g.addColorStop(1, "rgba(161,116,254,0)");
          ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();

          ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#A174FE"; ctx.fill();

          if (!showLabels) return;
          var label = labels[m.key] || m.code;
          var lx = x + m.dx, ly = y + m.dy;
          ctx.beginPath();
          ctx.moveTo(x + (m.anchor === "end" ? -7 : 7), y);
          ctx.lineTo(m.anchor === "end" ? lx + 4 : lx - 4, ly);
          ctx.strokeStyle = "rgba(161,116,254,0.32)";
          ctx.lineWidth = 1; ctx.stroke();

          var size = w < 420 ? 11 : 12.5;
          ctx.font = "700 " + size + "px 'Plus Jakarta Sans', Inter, Arial, sans-serif";
          ctx.textAlign = m.anchor;
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(247,247,242,0.92)";
          ctx.fillText(label, lx, ly);
        });
      }

      var running = false, rafId = 0, startTime = 0;
      function tick(now) {
        if (!startTime) startTime = now;
        drawFrame(now - startTime);
        if (running) rafId = requestAnimationFrame(tick);
      }
      function start() {
        if (running) return;
        running = true;
        rafId = requestAnimationFrame(tick);
      }
      function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
      }

      if (!layout()) return;
      if (reduce) {
        drawFrame(0);
      } else {
        /* Only animate while the canvas is actually on screen. */
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
        }, { threshold: 0 });
        io.observe(canvas);
      }

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { if (reduce) drawFrame(0); });
      }
      var resizeTimer = 0;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          if (layout() && reduce) drawFrame(0);
        }, 120);
      });
    }).catch(function (err) {
      console.error(err);
      showFallback(canvas, options.unavailableText);
    });
  }

  window.VhaNetwork = { init: init, MARKETS: MARKETS };
})();
