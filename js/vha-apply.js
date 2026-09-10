/* Apply page — pill-choice groups and Formspree submission.
   Loaded alongside js/vha-v2.js, which handles nav, reveal and the footer. */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    /* Pill groups write into a hidden input so the value posts with the form. */
    document.querySelectorAll("[data-pill-group]").forEach(function (group) {
      var name = group.getAttribute("data-pill-group");
      var hidden = document.querySelector('[data-pill-input="' + name + '"]');
      var pills = group.querySelectorAll(".pill");
      pills.forEach(function (btn) {
        btn.setAttribute("aria-pressed", "false");
        btn.addEventListener("click", function () {
          pills.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
          btn.setAttribute("aria-pressed", "true");
          if (hidden) hidden.value = btn.getAttribute("data-value") || btn.textContent.trim();
          group.classList.remove("pills--invalid");
        });
      });
    });

    var form = document.getElementById("apply-form");
    var submitBtn = document.getElementById("apply-submit-btn");
    var errorBox = document.querySelector("[data-form-error]");
    var successBox = document.querySelector("[data-apply-success]");
    var formWrap = document.querySelector("[data-form-wrap]");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errorBox) errorBox.setAttribute("data-visible", "false");

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      /* Hidden inputs are skipped by native constraint validation, so the
         required pill groups are checked by hand. */
      var valid = true, firstInvalid = null;
      document.querySelectorAll("[data-pill-group]").forEach(function (group) {
        var name = group.getAttribute("data-pill-group");
        var hidden = document.querySelector('[data-pill-input="' + name + '"]');
        if (hidden && hidden.hasAttribute("required") && !hidden.value) {
          valid = false;
          group.classList.add("pills--invalid");
          if (!firstInvalid) firstInvalid = group;
        } else {
          group.classList.remove("pills--invalid");
        }
      });
      if (!valid) {
        if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      submitBtn.disabled = true;
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (!res.ok) throw new Error("Formspree submission failed: " + res.status);
        if (formWrap) formWrap.hidden = true;
        if (successBox) successBox.hidden = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }).catch(function (err) {
        console.error(err);
        if (errorBox) errorBox.setAttribute("data-visible", "true");
        submitBtn.disabled = false;
      });
    });
  });
})();
