// assets/js/navbar.js
// Navbar ManasikGo - SATU sumber untuk semua halaman.
// Cukup taruh <script src="assets/js/navbar.js"></script> (TANPA atribut
// defer/async, biar posisinya persis di tempat navbar seharusnya muncul)
// di body, gantikan blok <nav>...</nav> yang dulu diulang di tiap file.
//
// Kalau mau ubah menu navigasi, cukup edit HTML di bawah ini SEKALI SAJA,
// otomatis berlaku ke semua halaman.
//
// Jam realtime di samping logo (data-nav-clock) mengarah ke halaman Waktu
// (waktu.html) saat diklik. Strip realtime penuh di bawah navbar yang dulu
// ada di Beranda sudah dihapus - cukup jam ringkas ini saja.
(function () {
  // Beranda punya preview "Cerita Jamaah" langsung di halaman (section
  // #cerita-jemaah), jadi dari Beranda menu ini scroll ke section itu.
  // Dari halaman lain, tidak ada section itu, jadi menu mengarah ke
  // halaman penuh pengalaman.html.
  var currentPage = location.pathname.split("/").pop();
  var isHome = currentPage === "" || currentPage === "index.html";
  var ceritaJamaahHref = isHome ? "#cerita-jemaah" : "pengalaman.html";

  // Bila build SSG (build.js) sudah membake markup navbar ke HTML, jangan
  // menulis ulang (menghindari duplikat). Markup partial tetap hidup di bawah.
  if (!document.querySelector(".site-header")) {
    document.write(
      '<div class="site-header fixed-top">' +
      '<nav class="navbar navbar-expand-lg" aria-label="Navigasi utama">' +
      '<div class="container">' +
      '<a class="navbar-brand d-flex align-items-center" href="index.html"><img src="assets/images/logo.png" alt="ManasikGo" class="brand-logo" height="32" /><span class="brand-name">ManasikGo</span></a>' +
      '<a class="nav-clock d-none d-lg-block" data-nav-clock href="waktu.html" aria-label="Lihat jadwal shalat dan waktu lengkap"><strong>--:--</strong> WIB &middot; <span class="nav-clock-next">Memuat...</span></a>' +
      '<button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#mainNav" aria-controls="mainNav" aria-label="Buka navigasi"><span class="navbar-toggler-icon"></span></button>' +
      '<div class="offcanvas offcanvas-start" tabindex="-1" id="mainNav" aria-labelledby="mainNavLabel">' +
      '<div class="offcanvas-header">' +
      '<a class="navbar-brand d-flex align-items-center mb-0" id="mainNavLabel" href="index.html"><img src="assets/images/logo.png" alt="ManasikGo" class="brand-logo" height="32" /><span class="brand-name">ManasikGo</span></a>' +
      '<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Tutup navigasi"></button>' +
      "</div>" +
      '<div class="offcanvas-body">' +
      '<ul class="navbar-nav ms-lg-auto align-items-lg-center gap-lg-1">' +
      '<li class="nav-item"><a class="nav-link" href="index.html">Beranda</a></li>' +
      '<li class="nav-item"><a class="nav-link" href="artikel.html">Artikel</a></li>' +
      '<li class="nav-item"><a class="nav-link" href="index.html#panduan">Panduan</a></li>' +
      '<li class="nav-item"><a class="nav-link" href="index.html#info-praktis">Info Praktis</a></li>' +
      '<li class="nav-item dropdown">' +
      '<a class="nav-link dropdown-toggle" href="#" id="layananDropdown" role="button" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">Layanan</a>' +
      '<ul class="dropdown-menu" aria-labelledby="layananDropdown">' +
      '<li><a class="dropdown-item" href="doa.html">Kumpulan Doa</a></li>' +
      '<li><a class="dropdown-item" href="badal.html">Badal Umroh</a></li>' +
      '<li><a class="dropdown-item" href="wakaf-quran.html">Wakaf Al-Qur\'an</a></li>' +
      '<li><a class="dropdown-item" href="rekrutmen-petugas.html">Informasi Rekrutmen PPIH</a></li>' +
      "</ul>" +
      "</li>" +
      '<li class="nav-item"><a class="nav-link" href="' + ceritaJamaahHref + '">Cerita Jamaah</a></li>' +
      '<li class="nav-item"><a class="nav-link" href="faq.html">FAQ</a></li>' +
      "</ul>" +
      '<ul class="navbar-nav navbar-actions ms-lg-2 align-items-lg-center gap-lg-2" id="navbarActions">' +
      '<li class="nav-item nav-item-theme"><button class="btn btn-outline-light btn-sm" type="button" data-theme-toggle aria-label="Ganti tema"><i data-theme-icon class="bi bi-moon-stars"></i><span class="navbar-actions-label d-lg-none">Ganti Tema</span></button></li>' +
      "</ul>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</nav>" +
      "</div>",
  );
}

  // Halaman lain tetap otomatis dapat status "aktif" yang benar di menu,
  // karena assets/js/app.js sudah punya setActiveNav() yang jalan
  // berdasarkan URL saat ini setiap DOMContentLoaded - tidak perlu
  // hardcode class "active" di sini.

  // Di layar mobile/tablet, tutup sidebar otomatis begitu jamaah memilih
  // salah satu link menu (bukan toggle "Layanan"), biar tidak perlu
  // tap tombol X dulu sebelum lanjut ke halaman tujuan.
  document.addEventListener("DOMContentLoaded", function () {
    var offcanvasEl = document.getElementById("mainNav");
    if (!offcanvasEl || !window.bootstrap || !window.bootstrap.Offcanvas)
      return;
    offcanvasEl.addEventListener("click", function (event) {
      var link = event.target.closest("a.nav-link, a.dropdown-item");
      if (!link || link.classList.contains("dropdown-toggle")) return;
      var instance =
        window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
      if (instance) instance.hide();
    });
  });

  // Navbar transparan di atas hero (Beranda), jadi solid begitu halaman
  // discroll dan konten mulai menutupi hero. Halaman lain (tanpa
  // .hero-compact) tidak terpengaruh sama sekali.
  document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector(".site-header");
    var hasHero = !!document.querySelector(".hero-compact");
    if (!header || !hasHero) return;
    var toggleScrolled = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    toggleScrolled();
    window.addEventListener("scroll", toggleScrolled, { passive: true });
  });

  // Search bar sticky: duplikat ringkas dari kotak pencarian di hero,
  // disisipkan tepat di bawah navbar HANYA di halaman yang punya hero
  // (Beranda) -- halaman lain sama sekali tidak berubah. Kemunculannya
  // "mengalir" mengikuti gerakan scroll secara langsung (dihitung ulang
  // tiap frame lewat requestAnimationFrame, BUKAN transisi CSS yang
  // dipicu sekali di satu titik ambang) -- jadi tingginya tumbuh, ikut
  // pudar masuk (opacity), dan sedikit turun dari atas (translateY)
  // secara proporsional dengan seberapa jauh halaman discroll, persis
  // seperti mengalir keluar dari kotak pencarian asli di hero. Berlaku
  // sama persis di mobile maupun desktop.
  document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector(".site-header");
    var nav = header ? header.querySelector(".navbar") : null;
    var hasHero = !!document.querySelector(".hero-compact");
    if (!header || !nav || !hasHero) return;

    var bar = document.createElement("div");
    bar.className = "sticky-search-bar";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML =
      '<div class="container">' +
      '<form class="hero-search" action="artikel.html" role="search" aria-label="Cari artikel" autocomplete="off" tabindex="-1">' +
      '<div class="row g-2 align-items-center">' +
      '<div class="col-lg">' +
      '<div class="search-field-wrap">' +
      '<span class="search-field-icon"><i class="bi bi-search"></i></span>' +
      '<input class="form-control" name="q" type="search" placeholder="Cari informasi seputar haji &amp; umrah..." aria-label="Kata kunci pencarian" aria-controls="searchSuggestionsSticky" data-hero-search-input spellcheck="false" enterkeyhint="search" tabindex="-1" />' +
      '<div class="search-suggest-box" data-hero-search-suggestions id="searchSuggestionsSticky" role="listbox" aria-label="Saran pencarian" aria-live="polite"></div>' +
      "</div>" +
      "</div>" +
      '<div class="col-lg-auto">' +
      '<button class="btn btn-primary" type="submit" tabindex="-1">' +
      '<i class="bi bi-search"></i>' +
      '<span class="hero-search-btn-label">Cari</span>' +
      "</button>" +
      "</div>" +
      "</div>" +
      "</form>" +
      "</div>";
    nav.insertAdjacentElement("afterend", bar);

    var input = bar.querySelector("input");
    var button = bar.querySelector("button");
    var focusables = [input, button];
    var interactive = false;

    var reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    // Ukur tinggi asli konten (sekali di awal & tiap resize), supaya
    // max-height yang dianimasikan tiap frame punya patokan angka pasti,
    // bukan tebakan/hardcode -- otomatis ikut berubah kalau isi/ukuran
    // kotak pencarian berubah (mis. breakpoint mobile vs desktop).
    var fullHeight = 0;
    var measureHeight = function () {
      var prevMaxHeight = bar.style.maxHeight;
      bar.style.maxHeight = "none";
      fullHeight = bar.offsetHeight;
      bar.style.maxHeight = prevMaxHeight;
    };

    // Rentang scroll tempat animasi "mengalir" berlangsung: mulai begitu
    // jamaah baru sedikit scroll (masih di area hero), selesai/berlabuh
    // sebelum hero benar-benar terlewati -- diukur relatif terhadap
    // tinggi layar supaya proporsional di semua ukuran device.
    var startScroll = 0;
    var endScroll = 1;
    var computeRange = function () {
      var vh = window.innerHeight;
      startScroll = vh * 0.1;
      endScroll = vh * 0.52;
    };

    var setInteractive = function (next) {
      if (next === interactive) return;
      interactive = next;
      bar.classList.toggle("is-interactive", interactive);
      bar.setAttribute("aria-hidden", interactive ? "false" : "true");
      focusables.forEach(function (el) {
        if (!el) return;
        if (interactive) el.removeAttribute("tabindex");
        else el.setAttribute("tabindex", "-1");
      });
    };

    var ticking = false;
    var update = function () {
      ticking = false;
      var scrollY = window.scrollY || window.pageYOffset || 0;
      var span = endScroll - startScroll || 1;
      var raw = (scrollY - startScroll) / span;
      if (raw < 0) raw = 0;
      if (raw > 1) raw = 1;

      // Reduced motion: langsung ke posisi akhir tanpa easing/pergerakan,
      // supaya tidak ada animasi berjalan untuk jamaah yang memintanya.
      var progress = reduceMotionQuery.matches
        ? raw > 0.5
          ? 1
          : 0
        : 1 - Math.pow(1 - raw, 2); // ease-out: cepat di awal, melambat & "mendarat" halus

      bar.style.maxHeight = (progress * fullHeight).toFixed(1) + "px";
      bar.style.opacity = String(Math.min(1, progress * 1.25));
      bar.style.transform =
        "translateY(" + ((1 - progress) * -12).toFixed(1) + "px)";

      setInteractive(progress > 0.92);
    };

    var onScroll = function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    measureHeight();
    computeRange();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      measureHeight();
      computeRange();
      update();
    });
  });
})();
