// === HCShortFeed ===
// Overlay fullscreen ala TikTok/Instagram/YouTube Shorts: satu Short penuh
// layar, geser/scroll untuk pindah ke Short berikutnya, dan Short yang
// sedang terlihat otomatis autoplay (yang lain berhenti supaya tidak ada
// suara/video numpuk). Dipanggil dari kartu Short di index.html dan
// video.html lewat window.HCShortFeed.open(daftarShort, indexAwal).
//
// Catatan batasan platform (bukan bug, memang begitu aturan mainnya):
// - YouTube Shorts: bisa autoplay senyap penuh (pakai parameter mute=1).
// - TikTok: kita kirim parameter autoplay=1, browser BIASANYA mengizinkan
//   karena videonya senyap secara default di pemutar TikTok.
// - Instagram Reels: pemutar Instagram tidak menyediakan cara resmi untuk
//   dipaksa autoplay dari luar, jadi penonton mungkin perlu sentuh sekali
//   untuk memulai. Ini keterbatasan dari Instagram, bukan dari kode ini.
(() => {
  const PLATFORM_ICON = {
    YouTube: "bi-youtube",
    TikTok: "bi-tiktok",
    Instagram: "bi-instagram",
  };

  const styleTag = document.createElement("style");
  styleTag.textContent = `
    .hc-short-feed {
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: #000;
      display: none;
    }
    .hc-short-feed.is-open { display: block; }
    .hc-short-feed-scroller {
      height: 100dvh;
      height: 100vh;
      overflow-y: auto;
      scroll-snap-type: y mandatory;
      scrollbar-width: none;
    }
    .hc-short-feed-scroller::-webkit-scrollbar { display: none; }
    .hc-short-feed-slide {
      height: 100dvh;
      height: 100vh;
      width: 100%;
      scroll-snap-align: start;
      scroll-snap-stop: always;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .hc-short-feed-frame-wrap {
      position: relative;
      width: min(100vw, 460px);
      height: min(100dvh, 100vh);
      background: #111;
    }
    .hc-short-feed-frame-wrap iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
    }
    .hc-short-feed-iframe-wrap {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .hc-short-feed-loader {
      position: absolute;
      inset: 0;
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: rgba(255,255,255,.7);
      font-size: .85rem;
      background: #111;
      transition: opacity .3s ease;
    }
    .hc-short-feed-loader.is-done {
      opacity: 0;
      pointer-events: none;
    }
    .hc-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(255,255,255,.15);
      border-top-color: var(--accent, #c9a86a);
      border-radius: 50%;
      animation: hcSpin .7s linear infinite;
    }
    @keyframes hcSpin {
      to { transform: rotate(360deg); }
    }
    .hc-short-feed-iframe-error {
      position: absolute;
      inset: 0;
      z-index: 6;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 24px;
      color: rgba(255,255,255,.85);
      background: #111;
      text-align: center;
    }
    .hc-short-feed-iframe-error .btn {
      pointer-events: auto;
    }
    .hc-short-feed-caption {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 18px 16px 22px;
      background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.75) 100%);
      color: #fff;
      pointer-events: none;
    }
    .hc-short-feed-caption .badge-soft {
      background: rgba(255,255,255,.16);
      color: #fff;
      border-color: rgba(255,255,255,.3);
    }
    .hc-short-feed-caption h3 { color: #fff; margin: 8px 0 0; }
    .hc-short-feed-empty {
      color: #fff;
      text-align: center;
      padding: 24px;
    }
    .hc-short-feed-close,
    .hc-short-feed-nav {
      position: fixed;
      z-index: 2001;
      background: rgba(0,0,0,.45);
      color: #fff;
      border: 0;
      border-radius: 999px;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    .hc-short-feed-close { top: 16px; right: 16px; }
    .hc-short-feed-nav.is-up { bottom: 96px; right: 16px; }
    .hc-short-feed-nav.is-down { bottom: 40px; right: 16px; }
    .hc-short-feed-hint {
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 2001;
      color: #fff;
      background: rgba(0,0,0,.45);
      padding: 6px 12px;
      border-radius: 999px;
      font-size: .8rem;
    }
  `;
  document.head.appendChild(styleTag);

  const root = document.createElement("div");
  root.className = "hc-short-feed";
  root.innerHTML = `
    <button type="button" class="hc-short-feed-close" aria-label="Tutup">
      <i class="bi bi-x-lg"></i>
    </button>
    <button type="button" class="hc-short-feed-nav is-up" aria-label="Short sebelumnya">
      <i class="bi bi-chevron-up"></i>
    </button>
    <button type="button" class="hc-short-feed-nav is-down" aria-label="Short berikutnya">
      <i class="bi bi-chevron-down"></i>
    </button>
    <span class="hc-short-feed-hint">Geser untuk lanjut</span>
    <div class="hc-short-feed-scroller"></div>
  `;
  document.body.appendChild(root);

  const scroller = root.querySelector(".hc-short-feed-scroller");
  const closeBtn = root.querySelector(".hc-short-feed-close");
  const navUp = root.querySelector(".hc-short-feed-nav.is-up");
  const navDown = root.querySelector(".hc-short-feed-nav.is-down");
  const hint = root.querySelector(".hc-short-feed-hint");

  let observer = null;
  let activeItems = [];

  // Tempel parameter autoplay/mute sesuai platform ke URL embed dasar
  // (embedUrl) yang sudah disiapkan HCApi.getVideos().
  const withAutoplay = (item) => {
    if (!item.embedUrl) return "";
    const key = String(item.platform || "").toLowerCase();
    const sep = item.embedUrl.includes("?") ? "&" : "?";
    if (key === "youtube") {
      return `${item.embedUrl}${sep}autoplay=1&mute=1&playsinline=1&rel=0`;
    }
    if (key === "tiktok") {
      return `${item.embedUrl}${sep}autoplay=1`;
    }
    // Instagram: parameter autoplay tidak didukung resmi, dipakai apa adanya.
    return item.embedUrl;
  };

  const buildSlide = (item, index) => {
    const icon = PLATFORM_ICON[item.platform] || "bi-play-circle";
    const platformLower = String(item.platform || "").toLowerCase();
    const isInstagram = platformLower === "instagram";
    const embedUrl = item.embedUrl ? withAutoplay(item) : "";
    const fallbackLink = item.sourceUrl
      ? `<a class="btn btn-sm btn-light mt-2" href="${item.sourceUrl}" target="_blank" rel="noopener">Buka di ${item.platform}</a>`
      : "";
    const media = item.embedUrl
      ? `<div class="hc-short-feed-iframe-wrap">
          <div class="hc-short-feed-loader"><div class="hc-spinner"></div><span>Memuat...</span></div>
          <iframe data-src="${embedUrl}" title="${item.judul}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          <div class="hc-short-feed-iframe-error" style="display:none">
            <i class="bi ${icon}" style="font-size:2rem;opacity:.7"></i>
            <p class="small mt-2 mb-2">Video tidak bisa dimuat langsung dari ${item.platform}.</p>
            ${fallbackLink}
          </div>
        </div>`
      : `<div class="hc-short-feed-empty">Link short belum valid.<br>${fallbackLink}</div>`;
    return `
      <div class="hc-short-feed-slide" data-index="${index}" data-platform="${platformLower}">
        <div class="hc-short-feed-frame-wrap">
          ${media}
          <div class="hc-short-feed-caption">
            <span class="badge-soft"><i class="bi ${icon}"></i> ${item.kategori || ""}</span>
            <h3 class="h6 fw-bold">${item.judul || ""}</h3>
          </div>
        </div>
      </div>
    `;
  };

  // Iframe hanya diisi src (jadi aktif/autoplay) ketika slide-nya benar-benar
  // terlihat penuh di layar; begitu berpindah, src dikosongkan supaya video
  // itu berhenti main dan tidak bentrok suara dengan Short berikutnya.
  const activateSlide = (slide) => {
    const iframe = slide.querySelector("iframe[data-src]");
    if (iframe && !iframe.getAttribute("src")) {
      iframe.setAttribute("src", iframe.dataset.src);
      // Loading handler: sembunyikan spinner setelah iframe selesai dimuat
      const loader = slide.querySelector(".hc-short-feed-loader");
      const errorEl = slide.querySelector(".hc-short-feed-iframe-error");
      const handleLoad = () => {
        if (loader) loader.classList.add("is-done");
        iframe.removeEventListener("load", handleLoad);
        iframe.removeEventListener("error", handleError);
      };
      const handleError = () => {
        if (loader) loader.classList.add("is-done");
        if (errorEl) errorEl.style.display = "flex";
        iframe.removeEventListener("load", handleLoad);
        iframe.removeEventListener("error", handleError);
      };
      iframe.addEventListener("load", handleLoad);
      iframe.addEventListener("error", handleError);
      // Timeout: jika iframe tidak selesai dimuat dalam 15 detik,
      // tampilkan fallback error untuk menghindari loading forever
      setTimeout(() => {
        if (loader && !loader.classList.contains("is-done")) {
          loader.classList.add("is-done");
          if (errorEl) errorEl.style.display = "flex";
        }
      }, 15000);
    }
  };
  const deactivateSlide = (slide) => {
    const iframe = slide.querySelector("iframe[data-src]");
    if (iframe) {
      iframe.removeEventListener("load", () => {});
      iframe.removeEventListener("error", () => {});
      iframe.removeAttribute("src");
    }
  };

  const setupObserver = () => {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            activateSlide(entry.target);
          } else {
            deactivateSlide(entry.target);
          }
        });
      },
      { root: scroller, threshold: [0, 0.6, 1] },
    );
    scroller
      .querySelectorAll(".hc-short-feed-slide")
      .forEach((slide) => observer.observe(slide));
  };

  const scrollToIndex = (index, behavior = "auto") => {
    const slide = scroller.querySelector(
      `.hc-short-feed-slide[data-index="${index}"]`,
    );
    if (slide) slide.scrollIntoView({ behavior, block: "start" });
  };

  const currentIndex = () => {
    const height = scroller.clientHeight || 1;
    return Math.round(scroller.scrollTop / height);
  };

  const close = () => {
    root.classList.remove("is-open");
    document.body.style.overflow = "";
    scroller.innerHTML = "";
    if (observer) observer.disconnect();
    activeItems = [];
  };

  const open = (items, startIndex = 0) => {
    activeItems = (items || []).filter((item) => item.tipe === "Short");
    if (!activeItems.length) return;
    const safeStart = Math.max(0, Math.min(startIndex, activeItems.length - 1));
    scroller.innerHTML = activeItems
      .map((item, index) => buildSlide(item, index))
      .join("");
    root.classList.add("is-open");
    document.body.style.overflow = "hidden";
    setupObserver();
    scrollToIndex(safeStart, "auto");
    // Kalau start bukan di slide pertama, IntersectionObserver butuh
    // sedikit waktu setelah scroll instan sebelum melaporkan visibilitas.
    setTimeout(() => {
      const slide = scroller.querySelector(
        `.hc-short-feed-slide[data-index="${safeStart}"]`,
      );
      if (slide) activateSlide(slide);
    }, 50);
    hint.style.opacity = "1";
    setTimeout(() => {
      hint.style.transition = "opacity .6s";
      hint.style.opacity = "0";
    }, 2200);
  };

  closeBtn.addEventListener("click", close);
  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  document.addEventListener("keydown", (event) => {
    if (!root.classList.contains("is-open")) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowDown")
      scrollToIndex(
        Math.min(currentIndex() + 1, activeItems.length - 1),
        "smooth",
      );
    if (event.key === "ArrowUp")
      scrollToIndex(Math.max(currentIndex() - 1, 0), "smooth");
  });
  navUp.addEventListener("click", () =>
    scrollToIndex(Math.max(currentIndex() - 1, 0), "smooth"),
  );
  navDown.addEventListener("click", () =>
    scrollToIndex(
      Math.min(currentIndex() + 1, activeItems.length - 1),
      "smooth",
    ),
  );

  window.HCShortFeed = { open, close };
})();
