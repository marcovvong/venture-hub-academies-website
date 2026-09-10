/* Homepage controller — Design System v1.0 homepage. */
(function () {
  /* 32. Marquee needs two identical groups so the -50% translate loops
     seamlessly. The second is cloned here rather than duplicated in markup,
     which would double the text for screen readers and translators. */
  function initMarquee() {
    var track = document.querySelector("[data-marquee]");
    var group = document.querySelector("[data-marquee-group]");
    if (!track || !group || track.children.length > 1) return;
    var clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  }

  function initNetworks(t) {
    if (!window.VhaNetwork) return;
    var labels = {};
    var order = ["hk", "tw", "sg", "jp", "th", "kh"];
    var markets = (t.map && t.map.markets) || [];
    markets.forEach(function (m, i) {
      if (order[i] && m && m.name) labels[order[i]] = m.name;
    });
    var unavailable = (t.chrome && t.chrome.mapUnavailable) || "";

    var hero = document.querySelector("[data-network-hero]");
    if (hero) {
      /* Hero carries the headline; market labels there would compete with it
         and crowd the smaller canvas, so the hero shows nodes only. */
      VhaNetwork.init(hero, { showLabels: false, dotSpacing: 10, unavailableText: unavailable });
    }
    var map = document.querySelector("[data-network-map]");
    if (map) {
      VhaNetwork.init(map, { labels: labels, showLabels: true, unavailableText: unavailable });
    }
  }

  function initFooter() {
    var year = document.querySelector("[data-footer-year]");
    if (year) year.textContent = "© " + new Date().getFullYear() + " Venture Hub Academy";

    var form = document.querySelector("[data-newsletter-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input[type=email]");
      var email = input ? input.value : "";
      var body = "Please add this address to the Venture Hub Academy newsletter.";
      window.location.href = "mailto:info@venturehub.tech?subject=" +
        encodeURIComponent("Newsletter signup") + "&body=" + encodeURIComponent(body) +
        (email ? "%0A%0AFrom: " + encodeURIComponent(email) : "");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    VhaNav.init();
    initMarquee();
    initFooter();

    VhaI18n.init("home").then(function (result) {
      VhaReveal.initReveal();
      VhaReveal.initCounters();
      initNetworks(result.t);
    }).catch(function (err) {
      /* Copy is already in the markup as the English baseline, so a failed
         locale fetch must not leave the page without motion or a map. */
      console.error(err);
      VhaReveal.initReveal();
      VhaReveal.initCounters();
      initNetworks({});
    });
  });
})();
