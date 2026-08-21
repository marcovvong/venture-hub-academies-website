(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-page") || "home";
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
        window.location.href = "mailto:info@venturehubacademy.com?subject=" +
          encodeURIComponent("Newsletter signup") + "&body=" + encodeURIComponent(body) +
          (email ? "%0A%0AFrom: " + encodeURIComponent(email) : "");
      });
    }

    VhaI18n.init(page).then(function () {
      VhaReveal.initReveal();
      VhaReveal.initCounters();
    });
  });
})();
