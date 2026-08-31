/*
 * Efek parallax pada hero beranda.
 * - Foto latar (.hero-bg) bergerak lebih lambat/berlawanan arah dari
 *   scroll, memberi kesan kedalaman.
 * - Konten teks (.hero .container) sedikit naik & memudar saat mulai
 *   discroll, supaya transisi ke section berikutnya terasa halus.
 * - Panah "gulir" ikut memudar begitu user mulai scroll.
 * Otomatis nonaktif kalau user mengaktifkan "reduce motion", dan hanya
 * berjalan di halaman yang punya .hero-compact (khusus Beranda).
 */
(function () {
  "use strict";

  var hero = document.querySelector(".hero.hero-compact");
  if (!hero) return;

  var bg = hero.querySelector(".hero-bg");
  var content = hero.querySelector(".container");
  var cue = hero.querySelector(".hero-scroll-cue");
  if (!bg && !content) return;

  var reduceMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  if (reduceMotionQuery.matches) return;

  var viewportHeight = window.innerHeight;
  var ticking = false;

  function update() {
    ticking = false;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var progress = scrollY / viewportHeight;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    if (bg) {
      var bgShift = scrollY * 0.32;
      bg.style.transform =
        "translate3d(0," + bgShift.toFixed(1) + "px,0) scale(1.06)";
    }

    if (content) {
      var lift = progress * -34;
      var fade = 1 - progress * 1.15;
      if (fade < 0) fade = 0;
      content.style.transform = "translate3d(0," + lift.toFixed(1) + "px,0)";
      content.style.opacity = String(fade);
    }

    if (cue) {
      var cueFade = 1 - progress * 3.2;
      if (cueFade < 0) cueFade = 0;
      cue.style.opacity = String(cueFade);
    }
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  function onResize() {
    viewportHeight = window.innerHeight;
    update();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  update();
})();
