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

    // Pill-choice single-select groups: click sets the hidden input + aria-pressed state.
    document.querySelectorAll("[data-pill-group]").forEach(function (group) {
      var name = group.getAttribute("data-pill-group");
      var hiddenInput = document.querySelector('[data-pill-input="' + name + '"]');
      var buttons = group.querySelectorAll(".pill-choice");
      buttons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", "false");
        btn.addEventListener("click", function () {
          buttons.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
          btn.setAttribute("aria-pressed", "true");
          if (hiddenInput) hiddenInput.value = btn.getAttribute("data-value") || btn.textContent;
        });
      });
    });

    var form = document.getElementById("apply-form");
    var submitBtn = document.getElementById("apply-submit-btn");
    var errorBox = document.querySelector("[data-form-error]");
    var successBox = document.querySelector("[data-apply-success]");

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (errorBox) errorBox.setAttribute("data-visible", "false");

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        // Hidden inputs are excluded from native constraint validation, so
        // pill-group "required" answers need a manual check here.
        var pillsValid = true;
        var firstInvalidGroup = null;
        document.querySelectorAll("[data-pill-group]").forEach(function (group) {
          var name = group.getAttribute("data-pill-group");
          var hiddenInput = document.querySelector('[data-pill-input="' + name + '"]');
          if (hiddenInput && hiddenInput.hasAttribute("required") && !hiddenInput.value) {
            pillsValid = false;
            group.classList.add("pill-group--invalid");
            if (!firstInvalidGroup) firstInvalidGroup = group;
          } else {
            group.classList.remove("pill-group--invalid");
          }
        });
        if (!pillsValid) {
          if (firstInvalidGroup) firstInvalidGroup.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }

        submitBtn.disabled = true;

        var formData = new FormData(form);
        fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" }
        }).then(function (response) {
          if (response.ok) {
            form.hidden = true;
            if (successBox) successBox.hidden = false;
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            return response.json().then(function () {
              throw new Error("Formspree submission failed");
            });
          }
        }).catch(function () {
          if (errorBox) errorBox.setAttribute("data-visible", "true");
          submitBtn.disabled = false;
        });
      });
    }

    VhaI18n.init("apply").then(function () {
      VhaReveal.initReveal();
      VhaReveal.initCounters();
    });
  });
})();
