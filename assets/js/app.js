const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

// Kotak saran pencarian (search-suggest-box) sebelumnya bisa terpotong
// kalau induknya punya overflow:hidden (mis. .hero di Beranda) atau
// tertimpa elemen lain yang stacking context-nya lebih tinggi. Untuk
// menjaminnya selalu tampil penuh dan paling atas di mobile & desktop,
// kotak ini dipindah (bukan disalin) ke <body> lalu diposisikan dengan
// position:fixed mengikuti posisi input, dihitung ulang tiap kali
// muncul dan saat scroll/resize selama sedang tampil.
const positionedSuggestBoxes = new WeakSet();
const positionSuggestBox = (input, box) => {
  if (!input || !box) return;
  if (box.parentElement !== document.body) {
    document.body.appendChild(box);
    box.classList.add("search-suggest-box-floating");
  }
  const place = () => {
    const rect = input.getBoundingClientRect();
    box.style.top = `${rect.bottom + 6}px`;
    box.style.left = `${rect.left}px`;
    box.style.width = `${rect.width}px`;
  };
  place();
  if (!positionedSuggestBoxes.has(box)) {
    positionedSuggestBoxes.add(box);
    const reposition = () => {
      if (box.classList.contains("show")) place();
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
  }
};

const formatDate = (dateString) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));

// Tanggal + jam akurat, mis. "13 Juli 2026 · 09.40 WIB", dipakai sebagai
// judul (tooltip) dan sebagai teks cadangan saat data tanggal tidak valid.
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const datePart = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${datePart} \u00b7 ${timePart} WIB`;
};

// Waktu relatif ("5 menit lalu") dihitung ulang setiap kali dipanggil,
// bukan teks statis. Elemen yang memakai ini diberi atribut data-time-ago
// lalu diperbarui berkala lewat initRelativeTimeUpdater agar selalu akurat
// (tidak "macet" di angka lama seperti "1 menit").
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return "Baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} minggu lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan lalu`;
  const years = Math.floor(days / 365);
  return `${years} tahun lalu`;
};

// Menjaga label "X menit lalu" tetap hidup/dinamis selama halaman terbuka.
const initRelativeTimeUpdater = () => {
  const update = () => {
    qsa("[data-time-ago]").forEach((el) => {
      const raw = el.dataset.timeAgo;
      if (!raw) return;
      el.textContent = timeAgo(raw);
      if (!el.title) el.title = formatDateTime(raw);
    });
  };
  update();
  setInterval(update, 30000);
};

const stripHtml = (html = "") => html.replace(/<[^>]*>?/gm, "");

const readingTime = (html = "") => {
  const words = stripHtml(html).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

// Avatar penulis: kalau akun penulis sudah punya foto profil (field
// penulis_foto, dikirim backend hasil mencocokkan nama di kolom "penulis"
// dengan akun di sheet Users), tampilkan foto itu. Kalau belum ada foto,
// tampil lingkaran inisial huruf pertama nama penulis sebagai fallback --
// bukan ikon generik, supaya tetap terasa personal. Foto dipasang di atas
// inisial (bukan gantiannya), jadi kalau gambar gagal dimuat (link rusak),
// onerror cukup menghapus elemen img dan inisial di baliknya langsung
// kelihatan tanpa ikon rusak.
const authorAvatarHtml = (article) => {
  const name = String(article.penulis || "Redaksi").trim();
  const initial = (name.charAt(0) || "R").toUpperCase();
  const photo = article.penulis_foto;
  return `
    <span class="author-avatar-wrap">
      <span class="author-avatar-fallback">${initial}</span>
      ${photo ? `<img class="author-avatar-img" src="${photo}" alt="" loading="lazy" onerror="this.remove()">` : ""}
    </span>
  `;
};

const createArticleCard = (article) => `
  <div class="col-md-6 col-lg-4">
    <article class="article-card fade-up">
      <a href="${HCRoutes.buildUrl('artikel', article.slug)}" aria-label="Baca ${article.judul}">
        <img src="${article.gambar || "assets/images/article-placeholder.svg"}" alt="${article.judul}" loading="lazy" onerror="this.src='assets/images/article-placeholder.svg'">
      </a>
      <div class="card-body-pad">
        <span class="badge-soft mb-3"><i class="bi bi-bookmark"></i>${article.kategori}</span>
        <h3 class="h5 article-title"><a class="text-reset" href="${HCRoutes.buildUrl('artikel', article.slug)}">${article.judul}</a></h3>
        <p class="lead-muted mb-3">${article.ringkasan}</p>
        <div class="meta">
          <span>${authorAvatarHtml(article)} ${article.penulis || "Redaksi"}</span>
          <span><i class="bi bi-eye"></i> ${Number(article.views || 0).toLocaleString("id-ID")}x dibaca</span>
        </div>
        <div class="meta mt-2 article-time" title="${formatDateTime(article.tanggal)}">
          <span><i class="bi bi-calendar3"></i> ${formatDate(article.tanggal)}</span>
          <span><i class="bi bi-clock-history"></i> <span data-time-ago="${article.tanggal}">${timeAgo(article.tanggal)}</span></span>
        </div>
      </div>
    </article>
  </div>
`;

const showToast = (message, variant = "success") => {
  const container =
    qs(".toast-container") ||
    document.body.appendChild(
      Object.assign(document.createElement("div"), {
        className: "toast-container position-fixed top-0 end-0 p-3",
      }),
    );
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${variant} border-0`;
  toast.setAttribute("role", "status");
  toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Tutup"></button></div>`;
  container.appendChild(toast);
  bootstrap.Toast.getOrCreateInstance(toast, { delay: 3500 }).show();
  toast.addEventListener("hidden.bs.toast", () => toast.remove());
};

const setActiveNav = () => {
  const current = location.pathname.split("/").pop() || "index.html";
  qsa(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current) link.classList.add("active");
  });
};

const initBackToTop = () => {
  const button = qs("#backToTop");
  if (!button) return;
  window.addEventListener(
    "scroll",
    () => button.classList.toggle("show", window.scrollY > 500),
    { passive: true },
  );
  button.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
};

const initAnimations = () => {
  const targets = qsa(".fade-up:not(.animate__animated)");
  if (!targets.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(
          "animate__animated",
          "animate__fadeInUp",
          "animate__faster",
        );
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );
  targets.forEach((item) => observer.observe(item));
};

const renderCategories = async () => {
  const target = qs("[data-categories]");
  if (!target) return;
  const categories = await HCApi.getCategories();
  target.innerHTML = categories
    .map(
      (category) => `
    <div class="col-md-6 col-lg-4">
      <a class="category-card p-4 d-block text-reset fade-up" href="kategori.html?kategori=${category.slug}">
        <i class="bi ${category.icon || "bi-grid"} fs-2 text-primary"></i>
        <h3 class="h5 mt-3 mb-1">${category.nama}</h3>
        <p class="lead-muted mb-0">Lihat panduan dan artikel ${category.nama.toLowerCase()}.</p>
      </a>
    </div>
  `,
    )
    .join("");
};

const initNewsletter = () => {
  const form = qs("#newsletterForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.reset();
    showToast("Terima kasih, email Anda sudah masuk daftar newsletter.");
  });
};

const initContactForm = () => {
  const form = qs("#contactForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.reset();
    showToast(
      "Pesan berhasil disiapkan. Hubungi info@manasikgo.id untuk tindak lanjut cepat.",
    );
  });
};

const initNavClock = async () => {
  const target = qs("[data-nav-clock]");
  if (!target) return;
  let prayerTimes = [
    ["Subuh", "04:35"],
    ["Dzuhur", "12:05"],
    ["Ashar", "15:24"],
    ["Maghrib", "18:02"],
    ["Isya", "19:18"],
  ];
  const tick = () => {
    const now = new Date();
    const wib = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const next =
      prayerTimes.find(([, time]) => {
        const [hour, minute] = time.split(":").map(Number);
        return hour * 60 + minute > minutesNow;
      }) || prayerTimes[0];
    target.innerHTML = `<strong>${wib}</strong> WIB &middot; <span class="nav-clock-next">${next[0]} ${next[1]}</span>`;
  };
  tick();
  setInterval(tick, 30000);
};

// Saran pencarian ringan untuk kotak pencarian: tampil begitu user mulai
// mengetik, mengambil data artikel yang sama dengan halaman Artikel, dan
// mengarah langsung ke halaman detail. Beranda punya DUA kotak pencarian
// dengan markup identik (hero & versi ringkas yang "mengalir" di sticky
// bar begitu discroll, lihat navbar.js) -- keduanya dipasangi atribut
// data-hero-search-input/data-hero-search-suggestions yang sama, jadi di
// sini kita pasang logic yang sama ke SETIAP pasangan input+box yang ada
// (bukan cuma yang pertama ditemukan), supaya suggestion jalan konsisten
// baik dari hero maupun dari search bar sticky.
const initHeroSearch = () => {
  const inputs = qsa("[data-hero-search-input]");
  if (!inputs.length || !window.HCApi) return;
  let articlesPromise = null;
  const getArticles = () => {
    if (!articlesPromise) articlesPromise = HCApi.getArticles();
    return articlesPromise;
  };
  // Placeholder di kotak pencarian menjanjikan "checklist panduan, doa,
  // hotel, transportasi..." tapi sebelumnya pencarian cuma menyisir
  // artikel -- ketik "wukuf" atau istilah lain yang cuma ada di Kamus
  // Istilah (bukan judul artikel) akan kosong padahal datanya ada.
  // Tambahkan Kamus Istilah sebagai sumber kedua supaya sesuai janji
  // placeholder-nya sendiri.
  let termsPromise = null;
  const getTerms = () => {
    if (!termsPromise) termsPromise = HCApi.getTerms();
    return termsPromise;
  };
  const escapeHtml = (value = "") =>
    value
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  // Skor kecocokan generik: dipakai untuk artikel maupun istilah, supaya
  // logic pemberian bobot (judul persis > judul mengandung kata > isi
  // mengandung kata) konsisten di kedua sumber data.
  const scoreMatch = (title, haystack, keyword, terms) => {
    let score = 0;
    if (title.includes(keyword)) score += 24;
    if (haystack.includes(keyword)) score += 10;
    terms.forEach((term) => {
      if (title.includes(term)) score += 10;
      if (haystack.includes(term)) score += 4;
      if (title.startsWith(term)) score += 4;
    });
    if (terms.every((term) => title.includes(term))) score += 8;
    if (terms.every((term) => haystack.includes(term))) score += 6;
    return score;
  };

  inputs.forEach((input) => {
    // Kotak suggestion untuk input ini: cari di dalam wrapper yang sama
    // (.search-field-wrap membungkus ikon + input + kotak suggestion di
    // markup hero maupun sticky), supaya tiap search bar dipasangkan ke
    // kotak suggestion miliknya sendiri, bukan tertukar dengan yang lain.
    const wrap = input.closest(".search-field-wrap") || input.parentElement;
    const box = wrap?.querySelector("[data-hero-search-suggestions]");
    if (!box) return;

    const render = async () => {
      const keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        box.innerHTML = "";
        box.classList.remove("show");
        return;
      }
      const terms = keyword.split(/\s+/).filter(Boolean);
      const [articles, glossaryTerms] = await Promise.all([
        getArticles(),
        getTerms().catch(() => []),
      ]);

      const articleMatches = articles.map((article) => {
        const title = (article.judul || "").toLowerCase();
        const haystack = [article.judul, article.ringkasan, article.kategori, article.penulis, article.slug]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return {
          type: "artikel",
          href: `${HCRoutes.buildUrl('artikel', article.slug)}`,
          title: article.judul,
          label: article.kategori || "Artikel",
          icon: "bi-file-earmark-text",
          score: scoreMatch(title, haystack, keyword, terms),
        };
      });

      const termMatches = (glossaryTerms || []).map((item) => {
        const title = (item.title || "").toLowerCase();
        const haystack = [item.title, item.summary, item.category, item.slug]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return {
          type: "istilah",
          href: `${HCRoutes.buildUrl('istilah', item.slug)}`,
          title: item.title,
          label: "Kamus Istilah",
          icon: "bi-bookmark",
          score: scoreMatch(title, haystack, keyword, terms),
        };
      });

      const matches = articleMatches
        .concat(termMatches)
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
      // Kalau input ini sempat kehilangan fokus/berubah lagi selagi
      // menunggu data artikel (fetch async), jangan render hasil basi.
      if (input.value.trim().toLowerCase() !== keyword) return;
      if (!matches.length) {
        box.innerHTML = "";
        box.classList.remove("show");
        return;
      }
      box.innerHTML = matches
        .map(
          (item) => `
        <a
          class="search-suggest-item"
          href="${item.href}"
          role="option"
          aria-label="Buka ${item.type === "istilah" ? "istilah" : "artikel"} ${escapeHtml(item.title)}"
          title="Buka ${item.type === "istilah" ? "istilah" : "artikel"} ${escapeHtml(item.title)}"
        >
          <i class="bi ${item.icon}"></i>
          <span class="d-flex flex-column align-items-start">
            <span class="fw-semibold">${escapeHtml(item.title)}</span>
            <small class="text-muted">${escapeHtml(item.label)}</small>
          </span>
        </a>
      `,
        )
        .join("");
      box.setAttribute("aria-label", keyword ? `Saran pencarian untuk "${keyword}"` : "Saran pencarian");
      positionSuggestBox(input, box);
      box.classList.add("show");
    };

    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-hero-search-input]") || event.target.closest("[data-hero-search-suggestions]")) return;
      box.classList.remove("show");
    });
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  setActiveNav();
  initBackToTop();
  initNewsletter();
  initContactForm();
  await renderCategories();
  initNavClock();
  initAnimations();
  initRelativeTimeUpdater();
  initHeroSearch();
});

window.HCUtils = {
  qs,
  qsa,
  formatDate,
  formatDateTime,
  timeAgo,
  stripHtml,
  readingTime,
  createArticleCard,
  showToast,
  initAnimations,
  positionSuggestBox,
};

// === HCVideoThumb ===
// Kartu pratinjau Short (di Beranda & halaman Video) dulunya memuat iframe
// embed platform sumber walau cuma untuk pratinjau kecil -- akibatnya yang
// tampil sering "halaman web" pemutar TikTok/Instagram/YouTube (lengkap
// dengan header, tombol follow, dsb), bukan gambar videonya saja, dan boros
// karena semua iframe itu ikut dimuat sekaligus. Helper ini menggantinya
// dengan gambar thumbnail asli videonya + fallback ikon platform yang rapi
// kalau thumbnail tidak tersedia. Video sesungguhnya tetap main lewat
// iframe, tapi hanya saat kartu diklik (mode fullscreen HCShortFeed).
const VIDEO_PLATFORM_ICON_MAP = {
  YouTube: "bi-youtube",
  TikTok: "bi-tiktok",
  Instagram: "bi-instagram",
};

const shortThumbFallbackHtml = (item) => {
  const icon = VIDEO_PLATFORM_ICON_MAP[item.platform] || "bi-play-circle";
  const platformClass = `platform-${String(item.embedKind || "").toLowerCase()}`;
  return `
    <div class="short-thumb-fallback ${platformClass}">
      <i class="bi ${icon}"></i>
      <span>${item.embedUrl ? item.platform || "" : "Link short belum valid"}</span>
    </div>
  `;
};

// Markup awal (dipasang langsung saat render, sebelum thumbnail async
// selesai dicari). data-thumb-for dipakai loadShortThumbnails untuk
// menyisipkan <img> begitu URL-nya ketemu.
const shortThumbHtml = (item, key) => `
  <div class="short-thumb" data-thumb-for="${key}">
    ${item.thumbnailUrl ? `<img src="${item.thumbnailUrl}" alt="${item.judul || ""}" loading="lazy" onerror="this.classList.add('is-error')">` : ""}
    ${shortThumbFallbackHtml(item)}
  </div>
`;

// Setelah kartu-kartu ditempel ke DOM, cari thumbnail yang belum diketahui
// secara sinkron (mis. TikTok lewat oEmbed) dan sisipkan <img> begitu
// ketemu. Kalau tidak ketemu, fallback ikon platform yang sudah tampil
// dibiarkan apa adanya.
const loadShortThumbnails = (container, items) => {
  items.forEach(async (item, index) => {
    if (item.thumbnailUrl || !item.embedUrl) return;
    const key = item.__thumbKey ?? index;
    const url = await window.HCApi?.getShortThumbnail?.(item);
    if (!url) return;
    const holder = container?.querySelector(
      `[data-thumb-for="${key}"]`,
    );
    if (!holder || holder.querySelector("img")) return;
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = item.judul || "";
    img.src = url;
    img.addEventListener("error", () => img.classList.add("is-error"));
    holder.prepend(img);
  });
};

window.HCVideoThumb = { html: shortThumbHtml, load: loadShortThumbnails };
