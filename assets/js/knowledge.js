const renderTermCards = async () => {
  const target = document.querySelector("[data-terms]");
  if (!target) return;
  const params = new URLSearchParams(location.search);
  const category = params.get("kategori");
  const allTerms = await HCApi.getTerms();
  const terms = category
    ? allTerms.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase(),
      )
    : allTerms;
  target.innerHTML = terms
    .map(
      (term) => `
    <div class="col-md-6 col-lg-4">
      <article class="category-card p-4 fade-up">
        <span class="badge-soft mb-3">${term.category}</span>
        <h2 class="h5 article-title">${term.title}</h2>
        <p class="lead-muted">${term.summary}</p>
        <a class="btn btn-outline-primary" href="${HCRoutes.buildUrl('istilah', term.slug)}">Baca Detail</a>
      </article>
    </div>
  `,
    )
    .join("");
  HCUtils?.initAnimations?.();
};

const renderTermDetail = async () => {
  const target = document.querySelector("[data-term-detail]");
  if (!target) return;
  const slug = HCRoutes.getSlug("istilah", "slug") || "apa-itu-haji";
  const allTerms = await HCApi.getTerms();
  const term = allTerms.find((item) => item.slug === slug) || allTerms[0];
  document.title = `${term.title} | ManasikGo`;
  // SEO: sama seperti halaman detail artikel -- canonical/description/OG
  // sebelumnya statis (sama untuk semua istilah), bikin Google anggap
  // semua halaman istilah duplikat satu sama lain. Isi per-istilah di sini.
  const pageUrl = `https://klikada.github.io/manasikgo/${HCRoutes.buildUrl("istilah", term.slug)}`;
  document
    .getElementById("metaDescription")
    ?.setAttribute("content", term.summary || `Penjelasan istilah ${term.title} dalam ibadah Haji dan Umrah.`);
  document.getElementById("metaCanonical")?.setAttribute("href", pageUrl);
  document.getElementById("metaOgUrl")?.setAttribute("content", pageUrl);
  document.getElementById("metaOgTitle")?.setAttribute("content", `${term.title} | Kamus Istilah ManasikGo`);
  document
    .getElementById("metaOgDescription")
    ?.setAttribute("content", term.summary || `Penjelasan istilah ${term.title} dalam ibadah Haji dan Umrah.`);
  const isi =
    term.isi ||
    `
      <h2>Penjelasan Ringkas</h2>
      <p>${term.summary}</p>
      <h2>Catatan untuk Jamaah</h2>
      <p>Gunakan penjelasan ini sebagai pengantar. Untuk keputusan ibadah, ikuti bimbingan pembimbing manasik, regulasi resmi, dan arahan petugas di lapangan.</p>
      <h2>Pengembangan Data</h2>
      <p>Istilah ini dapat dipindahkan ke Google Spreadsheet pada sheet <strong>Istilah</strong> agar admin bisa memperbarui konten tanpa mengubah kode.</p>
  `;
  target.innerHTML = `
    <nav aria-label="Breadcrumb" class="mb-4"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="index.html">Beranda</a></li><li class="breadcrumb-item"><a href="istilah.html">Kamus</a></li><li class="breadcrumb-item active">${term.title}</li></ol></nav>
    <span class="badge-soft mb-3">${term.category}</span>
    <h1 class="display-5 fw-bold">${term.title}</h1>
    <p class="lead lead-muted">${term.summary}</p>
    <div class="article-content surface p-4 mt-4">${isi}</div>
    ${
      term.source
        ? `
    <div class="surface p-3 p-md-4 mt-3">
      <p class="small fw-bold mb-1"><i class="bi bi-journal-check"></i> Rujukan &amp; catatan sumber</p>
      <p class="small lead-muted mb-0">${term.source}</p>
    </div>`
        : ""
    }
  `;
};

const renderAlphaTerms = async () => {
  const target = document.querySelector("[data-alpha-terms]");
  if (!target) return;
  const allTerms = await HCApi.getTerms();
  const grouped = allTerms.reduce((acc, term) => {
    const letter = term.title[0].toUpperCase();
    acc[letter] = acc[letter] || [];
    acc[letter].push(term);
    return acc;
  }, {});
  target.innerHTML = Object.keys(grouped)
    .sort()
    .map(
      (letter) => `
    <section id="huruf-${letter}" class="mb-4">
      <h2 class="h3 fw-bold">${letter}</h2>
      <div class="info-list">${grouped[letter].map((term) => `<a class="info-item text-reset" href="${HCRoutes.buildUrl('istilah', term.slug)}"><strong>${term.title}</strong><br><span class="lead-muted">${term.summary}</span></a>`).join("")}</div>
    </section>
  `,
    )
    .join("");
};

const renderGenericList = async () => {
  const targets = document.querySelectorAll("[data-content-list]");
  for (const target of targets) {
    const key = target.dataset.contentList;
    let data = window.HCContent ? window.HCContent[key] || [] : [];
    target.innerHTML = data
      .map((item) => {
        const title = Array.isArray(item) ? item[0] : item;
        const desc = Array.isArray(item)
          ? item[1]
          : "Informasi ini bersifat panduan umum dan dapat diperbarui melalui Spreadsheet.";
        return `<div class="info-item fade-up"><h2 class="h5 fw-bold">${title}</h2><p class="lead-muted mb-0">${desc}</p></div>`;
      })
      .join("");
  }
};

const renderPrep = async () => {
  const target = document.querySelector("[data-prep]");
  if (!target) return;
  const [prep, prepTimeline] = await Promise.all([
    HCApi.getPersiapan(),
    HCApi.getPersiapanTimeline(),
  ]);
  target.innerHTML =
    Object.entries(prep)
      .map(
        ([category, items]) => `
    <section class="surface p-4 mb-4">
      <h2 class="h4 fw-bold">${category}</h2>
      <div class="row g-2">${items.map((item) => `<div class="col-md-6 col-lg-4"><div class="info-item"><i class="bi bi-check2-circle text-primary"></i> ${item}</div></div>`).join("")}</div>
    </section>
  `,
      )
      .join("") +
    `
    <section class="surface p-4">
      <h2 class="h4 fw-bold">Timeline Persiapan</h2>
      <div class="info-list">${prepTimeline.map(([time, desc]) => `<div class="info-item"><strong>${time}</strong><p class="lead-muted mb-0">${desc}</p></div>`).join("")}</div>
    </section>
  `;
};

// Kartu unduhan SELALU mengarahkan pengunjung ke link asli yang tersedia
// (kolom `file`: bisa link Google Drive, PDF hosting, atau link internet
// lain; atau kolom `gambar` kalau item-nya berupa gambar/infografis yang
// di-hosting di tempat lain, mis. Google Drive juga). Tidak lagi memaksa
// download lewat atribut `download` pada tag gambar thumbnail, karena
// atribut itu tidak berlaku untuk resource cross-origin (browser hanya akan
// membuka gambar mentah, bukan benar-benar mengunduhnya) -- link tujuan
// (Google Drive, hosting file, dll) yang akan menangani proses unduhannya.
const downloadCardAction = (item) => {
  if (item.file) {
    return `<a class="btn btn-outline-primary mt-auto" href="${item.file}" target="_blank" rel="noopener"><i class="bi bi-download"></i> Unduh File</a>`;
  }
  if (item.gambar) {
    return `<a class="btn btn-outline-primary mt-auto" href="${item.gambar}" target="_blank" rel="noopener"><i class="bi bi-image"></i> Lihat &amp; Unduh Gambar</a>`;
  }
  return `<span class="small lead-muted mt-auto"><i class="bi bi-info-circle"></i> Belum diunggah admin</span>`;
};

let hcDownloadItemsCache = null;

const filterDownloadItems = (items, kategori) => {
  if (!kategori) return items;
  const target = kategori.trim().toLowerCase();
  return items.filter(
    (item) => (item.kategori || "").trim().toLowerCase() === target,
  );
};

const renderDownloadCards = (items) => {
  const target = document.querySelector("[data-infographics]");
  if (!target) return;
  if (!items.length) {
    target.innerHTML = `<div class="text-center py-5 lead-muted"><i class="bi bi-inbox fs-2 d-block mb-2"></i>Belum ada unduhan untuk kategori ini.</div>`;
    return;
  }
  const cards = items
    .map(
      (item) => `
    <div class="col-md-6 col-lg-4">
      <div class="download-card p-4 h-100 d-flex flex-column">
        ${
          item.gambar
            ? `<img src="${item.gambar}" alt="${item.judul}" loading="lazy" class="w-100 rounded-4 mb-3" style="object-fit:cover;aspect-ratio:2/1;">`
            : `<i class="bi bi-file-earmark-pdf fs-2 text-primary"></i>`
        }
        ${item.kategori ? `<span class="badge-soft mb-2 align-self-start">${item.kategori}</span>` : ""}
        <h3 class="h6 fw-bold ${item.gambar ? "" : "mt-3"}">${item.judul}</h3>
        <p class="lead-muted small mb-3">${item.deskripsi || "Placeholder unduhan. Hubungkan ke file/gambar saat produksi."}</p>
        ${downloadCardAction(item)}
      </div>
    </div>
  `,
    )
    .join("");
  target.innerHTML = `<div class="row g-4">${cards}</div>`;
};

const renderDownloadCategoryFilter = (items) => {
  const select = document.querySelector("[data-download-category-filter]");
  if (!select) return;
  const params = new URLSearchParams(location.search);
  const initialCategory = params.get("kategori") || "";
  const categories = [
    ...new Set(items.map((item) => item.kategori).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "id"));
  select.innerHTML =
    `<option value="">Semua kategori</option>` +
    categories
      .map(
        (cat) =>
          `<option value="${cat}" ${cat.toLowerCase() === initialCategory.toLowerCase() ? "selected" : ""}>${cat}</option>`,
      )
      .join("");
  select.addEventListener("change", () => {
    const value = select.value;
    const url = new URL(location.href);
    if (value) {
      url.searchParams.set("kategori", value);
    } else {
      url.searchParams.delete("kategori");
    }
    history.replaceState(null, "", url);
    renderDownloadCards(filterDownloadItems(items, value));
    HCUtils?.initAnimations?.();
  });
};

// Carousel generik (geser kiri/kanan + tombol) untuk pratinjau homepage:
// "Dokumen & Panduan Unduhan" dan "Short Edukasi". Menggeser dengan sentuh
// atau scroll tetap jalan lewat overflow-x biasa; tombol panah cuma
// mempercepat & dinonaktifkan otomatis kalau sudah mentok ujung.
const bindHcCarousel = (wrap) => {
  if (!wrap || wrap.dataset.carouselBound === "true") return;
  wrap.dataset.carouselBound = "true";

  const track = wrap.querySelector("[data-carousel-track]");
  const prevBtn = wrap.querySelector("[data-carousel-prev]");
  const nextBtn = wrap.querySelector("[data-carousel-next]");
  if (!track) return;

  const getStep = () => {
    const firstSlide =
      track.querySelector(".hc-carousel-slide") || track.firstElementChild;
    if (!firstSlide) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 16;
    return firstSlide.getBoundingClientRect().width + gap;
  };

  const updateNavState = () => {
    if (!prevBtn || !nextBtn) return;
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = maxScroll <= 0 || track.scrollLeft >= maxScroll;
  };

  prevBtn?.addEventListener("click", () => {
    track.scrollBy({ left: -getStep(), behavior: "smooth" });
  });
  nextBtn?.addEventListener("click", () => {
    track.scrollBy({ left: getStep(), behavior: "smooth" });
  });
  track.addEventListener("scroll", updateNavState, { passive: true });
  window.addEventListener("resize", updateNavState);
  updateNavState();
};

const renderInfographics = async () => {
  const target = document.querySelector("[data-infographics]");
  if (!target) return;
  const items = await HCApi.getDownloads();
  hcDownloadItemsCache = items;

  const params = new URLSearchParams(location.search);
  const initialCategory = params.get("kategori") || "";

  renderDownloadCategoryFilter(items);
  renderDownloadCards(filterDownloadItems(items, initialCategory));
  HCUtils?.initAnimations?.();
};

const renderDownloadCenterPreview = async () => {
  const target = document.querySelector("[data-download-preview]");
  if (!target) return;
  const items = (await HCApi.getDownloads()).slice(0, 8);
  target.innerHTML = items
    .map(
      (item) => `
    <a class="hc-carousel-slide download-preview-card fade-up" href="download.html">
      <span class="download-preview-top">
        <span class="download-preview-icon">
          ${
            item.gambar
              ? `<img src="${item.gambar}" alt="${item.judul}" loading="lazy">`
              : `<i class="bi bi-file-earmark-pdf"></i>`
          }
        </span>
        <span class="download-preview-tag">PDF</span>
      </span>
      <span class="download-preview-title">${item.judul}</span>
      <span class="download-preview-meta">${item.kategori || "Panduan"}</span>
      <span class="download-preview-cta"
        ><i class="bi bi-download"></i> Unduh Gratis</span
      >
    </a>
  `,
    )
    .join("");
  bindHcCarousel(target.closest("[data-carousel-wrap]"));
  HCUtils?.initAnimations?.();
};

const VIDEO_PLATFORM_ICON = {
  YouTube: "bi-youtube",
  TikTok: "bi-tiktok",
  Instagram: "bi-instagram",
};

const renderVideoPreview = async () => {
  const target = document.querySelector("[data-video-preview]");
  if (!target) return;
  const items = (await HCApi.getVideos())
    .filter((item) => item.tipe !== "Short")
    .slice(0, 6);
  target.innerHTML = items
    .map((item) => {
      const icon = VIDEO_PLATFORM_ICON[item.platform] || "bi-play-circle";
      return `
      <article class="hc-carousel-slide video-preview-slide video-card fade-up">
        ${
          item.embedUrl
            ? `<iframe class="video-frame" src="${item.embedUrl}" title="${item.judul}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
            : `<a class="video-frame d-flex align-items-center justify-content-center text-center p-3 small lead-muted text-reset" href="video.html">Link video belum valid.<br>Lihat menu Video.</a>`
        }
        <div class="p-4">
          <span class="badge-soft mb-3"><i class="bi ${icon} video-platform-icon"></i>${item.kategori}</span>
          <h3 class="h6 fw-bold mb-0">${item.judul}</h3>
        </div>
      </article>
    `;
    })
    .join("");
  bindHcCarousel(target.closest("[data-carousel-wrap]"));
  HCUtils?.initAnimations?.();
};

// Section terpisah di bawah "Video Edukasi": khusus konten vertikal
// (Short/Reels) dari YouTube Shorts, TikTok, atau Instagram.
// Section terpisah di bawah "Video Edukasi": khusus konten vertikal
// (Short/Reels) dari YouTube Shorts, TikTok, atau Instagram. Kartu di sini
// cuma pratinjau kecil -- diklik langsung buka mode fullscreen swipe lewat
// HCShortFeed (lihat assets/js/short-feed.js) supaya autoplay & tampilan
// penuh layar berjalan konsisten dengan aplikasi aslinya.
const renderShortPreview = async () => {
  const target = document.querySelector("[data-short-preview]");
  if (!target) return;
  const allShorts = (await HCApi.getVideos()).filter(
    (item) => item.tipe === "Short",
  );
  if (!allShorts.length) {
    target.closest("section")?.classList.add("d-none");
    return;
  }
  const items = allShorts.slice(0, 8);
  target.innerHTML = items
    .map((item, index) => {
      const icon = VIDEO_PLATFORM_ICON[item.platform] || "bi-play-circle";
      return `
      <article class="hc-carousel-slide short-preview-slide video-card is-short fade-up" data-short-index="${index}" role="button" tabindex="0" aria-label="Buka ${item.judul} fullscreen">
        <div class="video-frame is-short">
          ${window.HCVideoThumb?.html(item, index) || ""}
          <div class="video-short-play-badge"><i class="bi bi-arrows-fullscreen"></i></div>
        </div>
        <div class="p-3 text-center">
          <span class="badge-soft mb-2"><i class="bi ${icon} video-platform-icon"></i>${item.kategori} &middot; Short</span>
          <h3 class="h6 fw-bold mb-0">${item.judul}</h3>
        </div>
      </article>
    `;
    })
    .join("");
  target.querySelectorAll("[data-short-index]").forEach((card) => {
    const openFeed = () =>
      window.HCShortFeed?.open(allShorts, Number(card.dataset.shortIndex));
    card.addEventListener("click", openFeed);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openFeed();
      }
    });
  });
  window.HCVideoThumb?.load(target, items);
  bindHcCarousel(target.closest("[data-carousel-wrap]"));
  HCUtils?.initAnimations?.();
};

document.addEventListener("DOMContentLoaded", () => {
  renderTermCards();
  renderTermDetail();
  renderAlphaTerms();
  renderGenericList();
  renderPrep();
  renderInfographics();
  renderDownloadCenterPreview();
  renderVideoPreview();
  renderShortPreview();
  document
    .querySelectorAll("[data-carousel-wrap]")
    .forEach((wrap) => bindHcCarousel(wrap));
});
