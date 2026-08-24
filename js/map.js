/* Jurisdictions dot-matrix map: 6 markets highlighted, dimmed regional context.
   Adapted from the VHA design reference's vha-map-dotted.html (d3-geo + topojson). */
(function () {
  var GEO = [
    { key: "hk", lon: 114.17, lat: 22.30, dx: -17, dy: -3, anchor: "end" },
    { key: "tw", lon: 120.96, lat: 23.70, dx: 18, dy: -3, anchor: "start" },
    { key: "jp", lon: 139.69, lat: 35.68, dx: 18, dy: -5, anchor: "start" },
    { key: "sg", lon: 103.85, lat: 1.29, dx: 18, dy: 5, anchor: "start" },
    { key: "th", lon: 100.52, lat: 13.75, dx: -17, dy: 19, anchor: "end" },
    { key: "kh", lon: 104.92, lat: 11.55, dx: 17, dy: 21, anchor: "start" }
  ];
  var HI = new Set(["392", "158", "764", "116", "702"]);
  var CONTEXT = new Set(["156", "704", "418", "104", "458", "608", "408", "410", "096"]);
  var ALLOW = new Set(Array.from(HI).concat(Array.from(CONTEXT)));
  var TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";

  function showFallback(canvas, message) {
    if (!message) return;
    var wrap = canvas.parentElement;
    if (!wrap || wrap.querySelector("[data-map-fallback]")) return;
    canvas.style.display = "none";
    var msg = document.createElement("div");
    msg.setAttribute("data-map-fallback", "");
    msg.className = "map-fallback";
    msg.textContent = message;
    wrap.appendChild(msg);
  }

  function initMap(canvas, labelsByKey, unavailableText) {
    if (!window.d3 || !window.topojson) {
      showFallback(canvas, unavailableText);
      return;
    }
    var controller = window.AbortController ? new AbortController() : null;
    var timeout = controller ? setTimeout(function () { controller.abort(); }, 8000) : 0;

    fetch(TOPO_URL, controller ? { signal: controller.signal } : {}).then(function (r) {
      clearTimeout(timeout);
      if (!r.ok) throw new Error("topojson fetch failed: " + r.status);
      return r.json();
    }).then(function (topo) {
      var allFeats = topojson.feature(topo, topo.objects.countries).features;
      var feats = allFeats.filter(function (f) { return ALLOW.has(String(f.id)); });
      var ctx = canvas.getContext("2d");

      function draw() {
        var box = canvas.parentElement.getBoundingClientRect();
        var w = box.width, h = box.height;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";

        // fitSize butts the projected geometry right up against the edges —
        // Singapore (the southernmost point in the whole set) then has its
        // marker glow and label clipped by the box. fitExtent leaves an
        // inset so every marker has room to breathe inside the frame.
        var pad = Math.min(44, Math.min(w, h) * 0.14);
        var proj = d3.geoMercator().fitExtent([[pad, pad], [w - pad, h - pad]], { type: "FeatureCollection", features: feats });
        var hiP = new Path2D(), loP = new Path2D();
        var genHi = d3.geoPath(proj, hiP), genLo = d3.geoPath(proj, loP);
        feats.forEach(function (f) {
          if (HI.has(String(f.id))) genHi(f); else genLo(f);
        });

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        var pts = [];
        var sp = 9;
        for (var y = sp / 2; y < h; y += sp) {
          for (var x = sp / 2; x < w; x += sp) {
            if (ctx.isPointInPath(hiP, x, y)) pts.push([x, y, 1]);
            else if (ctx.isPointInPath(loP, x, y)) pts.push([x, y, 0]);
          }
        }

        // Hong Kong has no separate country polygon in this topojson (it's
        // absorbed into China's geometry, which renders dimmed) — synthesize
        // a small highlighted dot patch under its marker so it reads
        // consistently with the other five markets, which do sit on their
        // own highlighted landmass.
        var hk = GEO.filter(function (m) { return m.key === "hk"; })[0];
        if (hk) {
          var hkPt = proj([hk.lon, hk.lat]);
          var patchR = 24;
          for (var py = hkPt[1] - patchR; py <= hkPt[1] + patchR; py += sp) {
            for (var px = hkPt[0] - patchR; px <= hkPt[0] + patchR; px += sp) {
              if (Math.hypot(px - hkPt[0], py - hkPt[1]) <= patchR) pts.push([px, py, 1]);
            }
          }
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        pts.forEach(function (p) {
          ctx.beginPath();
          ctx.arc(p[0], p[1], p[2] ? 1.7 : 1.4, 0, Math.PI * 2);
          ctx.fillStyle = p[2] ? "rgba(124,58,237,0.68)" : "rgba(178,158,242,0.4)";
          ctx.fill();
        });

        GEO.forEach(function (m) {
          var pt = proj([m.lon, m.lat]);
          var x = pt[0], y = pt[1];
          var g = ctx.createRadialGradient(x, y, 2, x, y, 24);
          g.addColorStop(0, "rgba(128,68,253,0.30)");
          g.addColorStop(0.55, "rgba(128,68,253,0.10)");
          g.addColorStop(1, "rgba(128,68,253,0)");
          ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
          ctx.beginPath(); ctx.arc(x, y, 8.5, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(124,58,237,0.6)"; ctx.lineWidth = 1.3; ctx.stroke();
          ctx.beginPath(); ctx.arc(x, y, 5.2, 0, Math.PI * 2); ctx.fillStyle = "#FFFFFF"; ctx.fill();
          ctx.beginPath(); ctx.arc(x, y, 3.3, 0, Math.PI * 2); ctx.fillStyle = "#7C3AED"; ctx.fill();

          var label = (labelsByKey && labelsByKey[m.key]) || m.key;
          var lx = x + m.dx, ly = y + m.dy;
          ctx.strokeStyle = "rgba(124,58,237,0.3)"; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + (m.anchor === "end" ? -7 : 7), y);
          ctx.lineTo(m.anchor === "end" ? lx + 4 : lx - 4, ly);
          ctx.stroke();

          var fontSize = w < 420 ? 11.5 : 13.5;
          ctx.font = "600 " + fontSize + "px Inter,'Helvetica Neue',Arial,sans-serif";
          ctx.textAlign = m.anchor;
          ctx.textBaseline = "middle";
          ctx.lineWidth = 5; ctx.strokeStyle = "#F6F3FE"; ctx.lineJoin = "round";
          ctx.strokeText(label, lx, ly);
          ctx.fillStyle = "#111111";
          ctx.fillText(label, lx, ly);
        });
      }

      draw();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
      var resizeTimer = 0;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(draw, 120);
      });
    }).catch(function (e) {
      console.error(e);
      showFallback(canvas, unavailableText);
    });
  }

  window.VhaMap = { init: initMap };
})();
