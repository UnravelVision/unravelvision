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

  /* ---------- Preferencias del visitante ---------- */
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer =
    window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Barra de progreso de lectura ---------- */
  var progress = doc.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  body.appendChild(progress);

  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progress.style.setProperty("--progress", value.toFixed(4));
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  if (finePointer && !reduceMotion) {
    /* ---------- Foco que sigue al cursor en la portada ---------- */
    var heroArt = doc.querySelector(".hero-art");
    if (heroArt) {
      heroArt.addEventListener("pointermove", function (event) {
        var rect = heroArt.getBoundingClientRect();
        heroArt.style.setProperty(
          "--mx",
          (((event.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%"
        );
        heroArt.style.setProperty(
          "--my",
          (((event.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%"
        );
      });
    }

    /* ---------- Inclinación suave en las tarjetas de proyecto ---------- */
    doc.querySelectorAll(".project-card").forEach(function (card) {
      var media = card.querySelector(".project-card__media");
      if (!media) return;
      var frame = null;

      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width - 0.5;
        var py = (event.clientY - rect.top) / rect.height - 0.5;
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          media.style.transform =
            "perspective(1000px) rotateX(" +
            (-py * 5).toFixed(2) +
            "deg) rotateY(" +
            (px * 6).toFixed(2) +
            "deg)";
        });
      });

      card.addEventListener("pointerleave", function () {
        if (frame) cancelAnimationFrame(frame);
        media.style.transform = "";
      });
    });

    /* ---------- Botones con un leve seguimiento del cursor ---------- */
    doc.querySelectorAll(".btn--primary").forEach(function (btn) {
      btn.addEventListener("pointermove", function (event) {
        var rect = btn.getBoundingClientRect();
        var x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        var y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        btn.style.transform =
          "translate(" + (x * 6).toFixed(2) + "px," + (y * 5 - 2).toFixed(2) + "px)";
      });

      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Formulario de contacto ----------
     El correo destino se escribe en el atributo action del <form>.
     Mientras esté vacío, el formulario no envía nada: valida y ofrece
     alternativas (correo y Beacons) para no mostrar un envío falso. */
  var contactForm = doc.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.setAttribute("novalidate", "");
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var statusBox = contactForm.querySelector("[data-form-status]");
      var endpoint = (contactForm.getAttribute("action") || "").trim();
      var emailField = contactForm.querySelector("#correo");

      if (emailField) {
        emailField.removeAttribute("aria-invalid");
      }

      var invalids = contactForm.querySelectorAll(":invalid");
      var onlyBadEmail =
        invalids.length === 1 && emailField !== null && invalids[0] === emailField;

      if (invalids.length > 0 && !onlyBadEmail) {
        var invalid = invalids[0];
        if (invalid && typeof invalid.focus === "function") invalid.focus();
        if (statusBox) {
          statusBox.textContent =
            "Falta completar algún campo obligatorio. Revisa los campos marcados.";
        }
        return;
      }

      if (onlyBadEmail) {
        emailField.setAttribute("aria-invalid", "true");
        if (typeof emailField.focus === "function") emailField.focus();
        if (statusBox) {
          statusBox.textContent = "Revisa el correo: parece incompleto o mal escrito.";
        }
        return;
      }

      var submitButton = contactForm.querySelector('button[type="submit"]');

      if (!endpoint) {
        if (statusBox) {
          statusBox.textContent =
            "Todavía no hay un servicio de envío conectado. Escríbenos desde el botón de correo o por Beacons y te responderemos igual.";
        }
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        if (submitButton.dataset.originalLabel === undefined) {
          submitButton.dataset.originalLabel = submitButton.textContent.trim();
        }
        submitButton.textContent = "Enviando…";
      }
      if (statusBox) statusBox.textContent = "";

      var formData = new FormData(contactForm);
      formData.append("_origen", window.location.href);
      formData.append("_fecha", new Date().toLocaleString("es-CL"));
      if (doc.querySelector("title")) formData.append("_pagina", doc.title);

      fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Respuesta " + response.status);
          if (statusBox) {
            statusBox.textContent =
              "Mensaje enviado. Te responderemos al correo o teléfono que dejaste.";
          }
          contactForm.reset();
        })
        .catch(function () {
          if (statusBox) {
            statusBox.textContent =
              "No pudimos enviar el mensaje. Escríbenos directamente al correo y lo resolvemos.";
          }
        })
        .then(function () {
          if (submitButton) {
            submitButton.disabled = false;
            if (submitButton.dataset.originalLabel !== undefined) {
              submitButton.textContent = submitButton.dataset.originalLabel;
            }
          }
        });
    });

    contactForm.addEventListener("input", function (event) {
      if (event.target === contactForm.querySelector("#correo")) {
        event.target.removeAttribute("aria-invalid");
      }
    });
  }
})();
