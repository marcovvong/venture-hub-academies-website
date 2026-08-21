/* Hero / header wave motif: concentric purple hairline arcs, slow organic drift.
   Ported from the VHA design reference canvas formula. */
(function () {
  function initWaveCanvas(canvas, opts) {
    opts = opts || {};
    var density = Math.max(8, Math.round(opts.density || 34));
    var speed = opts.speed || 1;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ctx = canvas.getContext("2d");
    var dpr = 1;
    var raf = 0;
    var t0 = performance.now();

    function fit() {
      var box = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, box.width * dpr);
      canvas.height = Math.max(1, box.height * dpr);
      canvas.style.width = box.width + "px";
      canvas.style.height = box.height + "px";
    }

    function drawFrame(tSeconds) {
      var W = canvas.width / dpr, H = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var t = tSeconds * speed;
      var seg = 130;
      for (var i = 0; i < density; i++) {
        var fi = i / (density - 1);
        var ph = fi * 1.1;
        ctx.beginPath();
        for (var s = 0; s <= seg; s++) {
          var x = -40 + ((W + 80) * s) / seg;
          var u = x / W;
          var base = H * 0.60
            + Math.sin(u * 2.4 + t * 0.42 + ph) * H * 0.085
            + Math.sin(u * 4.6 - t * 0.28 + ph * 1.7) * H * 0.04;
          var spread = H * 0.30 * (0.28 + 0.72 * Math.abs(Math.sin(u * 1.9 - t * 0.24 + 0.8)));
          var y = base
            + (fi - 0.5) * spread * (1 + 0.25 * Math.sin(u * 3.3 + t * 0.34 + fi * 2.0))
            + Math.sin(u * 7 + t * 0.55 + i * 0.42) * 2.2;
          if (s) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        var core = 1 - Math.abs(fi - 0.5) * 2;
        var R = Math.round(128 + (205 - 128) * (1 - core));
        var G = Math.round(68 + (183 - 68) * (1 - core));
        var B = Math.round(253 + (252 - 253) * (1 - core));
        var al = 0.14 + 0.34 * Math.pow(core, 1.2);
        ctx.strokeStyle = "rgba(" + R + "," + G + "," + B + "," + al.toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    function loop() {
      var t = (performance.now() - t0) / 1000;
      drawFrame(t);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (!raf) loop();
    }
    function stop() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    fit();
    if (reduce) {
      drawFrame(0.6);
    } else {
      start();
      // The canvas is almost always near the top of the page (hero/page
      // headers), but on longer pages there's no reason to keep spending a
      // frame budget on it once it's scrolled out of view.
      if (window.IntersectionObserver) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) start(); else stop();
          });
        }, { threshold: 0 });
        io.observe(canvas);
      }
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop(); else if (canvas.getBoundingClientRect().bottom > 0) start();
      });
    }

    var resizeTimer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        fit();
        if (reduce) drawFrame(0.6);
      }, 120);
    });

    return { stop: stop, start: start };
  }

  function initAll() {
    document.querySelectorAll("[data-wave-canvas]").forEach(function (canvas) {
      initWaveCanvas(canvas, {
        density: +canvas.getAttribute("data-density") || 34,
        speed: +canvas.getAttribute("data-speed") || 1
      });
    });
  }

  window.VhaWave = { init: initAll, initOne: initWaveCanvas };
})();
