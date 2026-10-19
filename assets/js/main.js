/* Unravel Vision — interacciones */
(function () {
  "use strict";

  var doc = document;
  var body = doc.body;

  /* ---------- Año actual ---------- */
  var yearEls = doc.querySelectorAll("[data-year]");
  yearEls.forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Header con sombra al hacer scroll ---------- */
  var header = doc.querySelector(".header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  var burger = doc.querySelector(".burger");
  var mobileMenu = doc.querySelector(".mobile-menu");
  var menuClose = doc.querySelector(".mobile-menu__close");
  var lastFocused = null;

  function openMenu() {
    if (!mobileMenu) return;
    lastFocused = doc.activeElement;
    mobileMenu.classList.add("is-open");
    mobileMenu.removeAttribute("aria-hidden");
    if (burger) burger.setAttribute("aria-expanded", "true");
    body.classList.add("is-locked");
    var firstLink = mobileMenu.querySelector("a, button");
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    if (burger) burger.setAttribute("aria-expanded", "false");
    body.classList.remove("is-locked");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      if (mobileMenu.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (menuClose) menuClose.addEventListener("click", closeMenu);

  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  doc.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && mobileMenu && mobileMenu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900 && mobileMenu && mobileMenu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  /* ---------- Animación de aparición ---------- */
  var revealEls = doc.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- Filtros de proyectos ---------- */
  var filterButtons = doc.querySelectorAll(".filter");
  var projectCards = doc.querySelectorAll("[data-categories]");

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");

      filterButtons.forEach(function (btn) {
        var active = btn === button;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });

      projectCards.forEach(function (card) {
        var cats = (card.getAttribute("data-categories") || "").split(" ");
        var show = filter === "all" || cats.indexOf(filter) !== -1;
        card.hidden = !show;
      });
    });
  });

  /* ---------- Acordeón de servicios: solo uno abierto ---------- */
  var serviceDetails = doc.querySelectorAll(".service");
  serviceDetails.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      serviceDetails.forEach(function (other) {
        if (other !== item && other.open) other.open = false;
      });
    });
  });
})();
