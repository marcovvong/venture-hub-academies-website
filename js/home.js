(function () {
  document.addEventListener("DOMContentLoaded", function () {
    VhaNav.init();
    VhaWave.init();

    var yearEl = document.querySelector("[data-footer-year]");
    if (yearEl) yearEl.textContent = "© " + new Date().getFullYear() + " Venture Hub Academy";

    var newsletterForm = document.querySelector("[data-newsletter-form]");
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = newsletterForm.querySelector("input[type=email]").value;
        var body = "Please add this address to the Venture Hub Academy newsletter.";
        window.location.href = "mailto:info@venturehub.tech?subject=" +
          encodeURIComponent("Newsletter signup") + "&body=" + encodeURIComponent(body) +
          (email ? "%0A%0AFrom: " + encodeURIComponent(email) : "");
      });
    }

    VhaI18n.init("home").then(function (result) {
      var t = result.t;
      VhaReveal.initReveal();
      VhaReveal.initCounters();

      var mapCanvas = document.querySelector("[data-jurisdictions-map]");
      if (mapCanvas) {
        var order = ["hk", "tw", "sg", "jp", "th", "kh"];
        var labels = {};
        (t.map.markets || []).forEach(function (m, i) {
          if (order[i]) labels[order[i]] = m.name;
        });
        VhaMap.init(mapCanvas, labels, t.chrome.mapUnavailable);
      }
    });
  });
})();
