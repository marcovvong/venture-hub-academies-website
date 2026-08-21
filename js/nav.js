/* Menu drawer: open/close, backdrop, Escape, focus trap. */
(function () {
  function initNav() {
    var hamburger = document.querySelector("[data-menu-open]");
    var closeBtn = document.querySelector("[data-menu-close]");
    var drawer = document.querySelector("[data-drawer]");
    var backdrop = document.querySelector("[data-drawer-backdrop]");
    if (!hamburger || !drawer || !backdrop) return;

    var lastFocused = null;

    function focusableEls() {
      return Array.prototype.slice.call(
        drawer.querySelectorAll('a[href], button:not([disabled])')
      );
    }

    function open() {
      lastFocused = document.activeElement;
      drawer.setAttribute("data-open", "true");
      backdrop.setAttribute("data-open", "true");
      hamburger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      var f = focusableEls();
      if (f.length) f[0].focus();
    }

    function close() {
      drawer.setAttribute("data-open", "false");
      backdrop.setAttribute("data-open", "false");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    hamburger.addEventListener("click", function () {
      var isOpen = drawer.getAttribute("data-open") === "true";
      if (isOpen) close(); else open();
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);

    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (e) {
      var isOpen = drawer.getAttribute("data-open") === "true";
      if (!isOpen) return;
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "Tab") {
        var f = focusableEls();
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  window.VhaNav = { init: initNav };
})();
