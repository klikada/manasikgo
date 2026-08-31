const getParam = (name) => new URLSearchParams(location.search).get(name);

const safeText = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );

// Catatan: authorAvatarHtml TIDAK didefinisikan ulang di sini. Fungsinya
// sudah global dari assets/js/app.js, yang selalu dimuat sebelum file ini
// di setiap halaman (index.html, detail.html, kirim.html, pengalaman.html).
// Mendeklarasikan ulang `const authorAvatarHtml` di sini akan menyebabkan
// SyntaxError "Identifier has already been declared" karena kedua file
// berbagi scope global yang sama (bukan ES module) -- itu sempat membuat
// seluruh file ini gagal dieksekusi (artikel tidak pernah muncul di index &
// detail karena renderHomeContent/renderDetail ikut tidak jalan).

const slugifyHeading = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "bagian";

// TOC mengikuti kaidah heading yang benar untuk SEO: H1 halaman sudah
// dipakai oleh judul artikel, jadi isi artikel hanya boleh memakai
// H2/H3/H4 secara berjenjang (tidak boleh lompat level). Struktur di
// bawah ini membangun daftar isi bersarang sesuai level heading asli,
// bukan daftar rata seperti sebelumnya.
const TOC_HEADING_SELECTOR = "h2, h3, h4";

// Susun daftar heading yang flat (urut sesuai dokumen) menjadi pohon
// bersarang berdasarkan level (h2 > h3 > h4), memakai pendekatan stack.
const buildTocTree = (flatItems) => {
  const root = [];
  const stack = [];
  flatItems.forEach((item) => {
    const node = { ...item, children: [] };
    while (stack.length && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }
    if (!stack.length) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  });
  return root;
};

const renderTocTree = (nodes, isRoot = true) => {
  if (!nodes.length) return "";
  return `
    <ol class="${isRoot ? "article-toc-list" : "article-toc-sublist"}">
      ${nodes
        .map(
          (node) => `
        <li class="article-toc-item article-toc-item-h${node.level}">
          <a class="article-toc-link" href="#${encodeURIComponent(node.id)}" data-toc-link="${safeText(node.id)}">${safeText(node.text)}</a>
          ${renderTocTree(node.children, false)}
        </li>`,
        )
        .join("")}
    </ol>`;
};

// IntersectionObserver aktif per halaman artikel; disimpan supaya bisa
// di-disconnect kalau TOC dibangun ulang (mis. ganti artikel di SPA).
let tocScrollSpyObserver = null;

const setupTocScrollSpy = (toc, headingEls) => {
  if (tocScrollSpyObserver) {
    tocScrollSpyObserver.disconnect();
    tocScrollSpyObserver = null;
  }
  if (!headingEls.length || !("IntersectionObserver" in window)) return;

  const setActiveLink = (id) => {
    toc.querySelectorAll(".article-toc-link").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.tocLink === id);
    });
  };

  // rootMargin menyisakan area "aktif" tepat di bawah header sticky,
  // supaya heading yang lagi dibaca yang ditandai, bukan yang di
  // paling atas/bawah viewport.
  tocScrollSpyObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActiveLink(visible[0].target.id);
    },
    { rootMargin: "-104px 0px -75% 0px", threshold: 0 },
  );
  headingEls.forEach((heading) => tocScrollSpyObserver.observe(heading));
};

const buildArticleTableOfContents = async (container, toc, article = null) => {
  toc ||= container.querySelector("[data-article-toc]");
  const content = container.querySelector(".article-content");
  if (!toc || !content) return;

  const headingEls = [...content.querySelectorAll(TOC_HEADING_SELECTOR)];

  let faqItems = [];
  // Fetch FAQ if article is provided
  if (article) {
    try {
      const allFAQs = await HCApi.getFAQ();
      if (allFAQs && allFAQs.length) {
        const normalize = (value = "") => String(value).toLowerCase().trim();
        const categoryNorm = normalize(article.kategori);

        faqItems = allFAQs
          .filter((faq) => {
            const faqCategoryNorm = normalize(faq.category);
            const categoryMatch = faqCategoryNorm === categoryNorm;
            const questionMatch = normalize(faq.question).includes(
              categoryNorm,
            );
            const answerMatch = normalize(faq.answer).includes(categoryNorm);
            return categoryMatch || questionMatch || answerMatch;
          })
          .slice(0, 10);
      }
    } catch (error) {
      console.info(error.message);
    }
  }

  if (!headingEls.length && !faqItems.length) {
    toc.innerHTML = `
      <p class="article-toc-title"><i class="bi bi-list-nested" aria-hidden="true"></i> Daftar isi</p>
      <p class="small lead-muted mb-0">Daftar bagian belum tersedia untuk artikel ini.</p>`;
    toc.hidden = false;
    return;
  }

  const usedIds = new Set();
  const flatItems = headingEls.map((heading, index) => {
    const baseId = slugifyHeading(heading.textContent);
    let id = heading.id || baseId;
    let counter = 2;
    while (
      usedIds.has(id) ||
      (document.getElementById(id) && document.getElementById(id) !== heading)
    ) {
      id = `${baseId}-${counter++}`;
    }
    usedIds.add(id);
    heading.id = id;
    heading.classList.add("article-heading-anchor");
    return {
      id,
      text: heading.textContent.trim() || `Bagian ${index + 1}`,
      level: Number(heading.tagName.slice(1)),
    };
  });

  const tocTree = buildTocTree(flatItems);
  let tocHTML = `
    <div class="article-toc-header">
      <p class="article-toc-title"><i class="bi bi-list-nested" aria-hidden="true"></i> Daftar isi</p>
      <button type="button" class="article-toc-close" data-toc-close aria-label="Tutup daftar isi">
        <i class="bi bi-x-lg" aria-hidden="true"></i>
      </button>
    </div>
    <div class="article-toc-body" data-toc-body>
      ${renderTocTree(tocTree)}
    </div>`;

  toc.innerHTML = tocHTML;
  toc.hidden = false;
  setupTocSheetLinks(toc);
  setupTocScrollSpy(toc, headingEls);
};

// Setiap link di dalam Daftar Isi, saat ditap di layar mobile (mode
// bubble/bottom-sheet), akan menutup sheet-nya lebih dulu sebelum
// browser lompat ke bagian artikel yang dituju.
const setupTocSheetLinks = (toc) => {
  toc.querySelectorAll(".article-toc-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 992) closeArticleTocSheet();
    });
  });
};

// Di layar mobile/tablet (<992px) Daftar Isi tidak lagi ditampilkan
// sebagai bagian dari alur artikel, melainkan lewat tombol bulat
// melayang (bubble) di pojok bawah layar. Tap bubble membuka Daftar
// Isi sebagai bottom-sheet; tap backdrop/tombol tutup/salah satu link
// akan menutupnya kembali. Fungsi ini memindah (bukan menyalin)
// elemen <nav data-article-toc> yang sama antara sidebar (desktop)
// dan overlay sheet (mobile), sehingga scroll-spy & event listener
// yang sudah terpasang tetap jalan seperti biasa.
const articleTocMobileQuery =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(max-width: 991.98px)")
    : null;
const openArticleTocSheet = () => {
  const toc = document.querySelector("[data-article-toc]");
  const bubble = document.querySelector("[data-toc-bubble]");
  const backdrop = document.querySelector("[data-toc-backdrop]");
  if (!toc || !toc.classList.contains("article-toc--sheet")) return;
  toc.classList.add("is-open");
  if (backdrop) backdrop.hidden = false;
  bubble?.setAttribute("aria-expanded", "true");
};

const closeArticleTocSheet = () => {
  const toc = document.querySelector("[data-article-toc]");
  const backdrop = document.querySelector("[data-toc-backdrop]");
  const bubble = document.querySelector("[data-toc-bubble]");
  toc?.classList.remove("is-open");
  if (backdrop) backdrop.hidden = true;
  bubble?.setAttribute("aria-expanded", "false");
};

const positionArticleTocForViewport = () => {
  const toc = document.querySelector("[data-article-toc]");
  const sidebar = document.querySelector(".article-toc-sidebar");
  const bubble = document.querySelector("[data-toc-bubble]");
  const backdrop = document.querySelector("[data-toc-backdrop]");
  if (!toc || !sidebar) return;

  const isMobile = articleTocMobileQuery
    ? articleTocMobileQuery.matches
    : window.innerWidth < 992;
  const hasContent = !!toc.querySelector("[data-toc-body]");

  if (isMobile) {
    if (toc.parentElement !== document.body) document.body.appendChild(toc);
    toc.classList.add("article-toc--sheet");
    if (bubble) bubble.hidden = !hasContent;
  } else {
    if (toc.parentElement !== sidebar) sidebar.appendChild(toc);
    toc.classList.remove("article-toc--sheet", "is-open");
    if (bubble) bubble.hidden = true;
    if (backdrop) backdrop.hidden = true;
  }
};

document
  .querySelector("[data-toc-bubble]")
  ?.addEventListener("click", () => openArticleTocSheet());
document
  .querySelector("[data-toc-backdrop]")
  ?.addEventListener("click", () => closeArticleTocSheet());
document.addEventListener("click", (event) => {
  if (event.target.closest("[data-toc-close]")) closeArticleTocSheet();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeArticleTocSheet();
});

if (articleTocMobileQuery) {
  const handleTocViewportChange = () => positionArticleTocForViewport();
  if (articleTocMobileQuery.addEventListener) {
    articleTocMobileQuery.addEventListener("change", handleTocViewportChange);
  } else if (articleTocMobileQuery.addListener) {
    // Fallback Safari lama
    articleTocMobileQuery.addListener(handleTocViewportChange);
  }
}

const getStoryId = (story) => String(story.id || story.judul || "").trim();
const getStoryLike = (story) => Number(story.like || 0);
const getLikedStories = () => {
  try {
    return JSON.parse(localStorage.getItem("manasikgo-liked-stories") || "[]");
  } catch (error) {
    return [];
  }
};
const setLikedStory = (id) => {
  try {
    const liked = new Set(getLikedStories());
    liked.add(id);
    localStorage.setItem(
      "manasikgo-liked-stories",
      JSON.stringify([...liked]),
    );
  } catch (error) {
    console.info(error.message);
  }
};
const unsetLikedStory = (id) => {
  try {
    const liked = new Set(getLikedStories());
    liked.delete(id);
    localStorage.setItem(
      "manasikgo-liked-stories",
      JSON.stringify([...liked]),
    );
  } catch (error) {
    console.info(error.message);
  }
};
const hasLikedStory = (id) => getLikedStories().includes(id);

const getAbsoluteUrl = (path = location.href) => {
  try {
    return new URL(path, location.href).href;
  } catch (error) {
    return location.href;
  }
};

const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
};

const shareContent = async ({ title, text = "", url = location.href }) => {
  const shareData = {
    title: String(title || "ManasikGo").slice(0, 120),
    text: String(text || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180),
    url: getAbsoluteUrl(url),
  };
  try {
    const mobileBrowser = /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent || "",
    );
    if (navigator.share && window.isSecureContext && mobileBrowser) {
      await navigator.share(shareData);
      return;
    }
    await copyText(shareData.url);
    HCUtils.showToast("Link berhasil disalin.");
  } catch (error) {
    if (error.name === "AbortError") return;
    await copyText(shareData.url);
    HCUtils.showToast("Link berhasil disalin.");
  }
};

const getStoryShareUrl = (id) =>
  getAbsoluteUrl(`pengalaman.html#${encodeURIComponent(id)}`);

const createStoryCard = (
  story,
  { headingLevel = 3, compact = false, slider = false } = {},
) => {
  const id = getStoryId(story);
  const liked = hasLikedStory(id);
  const Heading = `h${headingLevel}`;
  const wrapperClass = slider
    ? "story-slide"
    : compact
      ? "col-md-6 col-xl-4"
      : "col-md-6";
  return `
    <div class="${wrapperClass}" id="${safeText(id)}">
      <article class="story-card p-4 fade-up">
        <span class="badge-soft mb-3"><i class="bi bi-chat-heart"></i>${safeText(story.kategori || "Cerita Jamaah")}</span>
        <${Heading} class="${compact ? "h5" : "h4"} article-title">
          <a class="stretched-link text-reset text-decoration-none" href="${HCRoutes.buildUrl('cerita', id)}">${safeText(story.judul)}</a>
        </${Heading}>
        <p class="lead-muted">${safeText(story.pengalaman)}</p>
        <p class="small"><strong>Tips:</strong> ${safeText(story.tips || "Ikuti arahan pembimbing dan simpan kontak rombongan.")}</p>
        <div class="meta">
          <span><i class="bi bi-person"></i> ${safeText(story.nama)}${story.asal ? `, ${safeText(story.asal)}` : ""}</span>
          <span><i class="bi bi-calendar3"></i> ${HCUtils.formatDate(story.tanggal)}</span>
        </div>
        <div class="d-flex flex-wrap gap-2 mt-3 story-card-actions">
          <button class="btn btn-sm ${liked ? "btn-primary" : "btn-outline-primary"} story-like-btn" type="button" data-like-story="${safeText(id)}" aria-pressed="${liked}" title="${liked ? "Batalkan suka" : "Sukai cerita"}">
            <i class="bi ${liked ? "bi-heart-fill" : "bi-heart"}"></i> <span data-like-label>${liked ? "Disukai" : "Suka"}</span> <span data-like-count>${getStoryLike(story)}</span>
          </button>
          <button class="btn btn-sm btn-outline-primary" type="button" data-share-story="${safeText(id)}" data-share-title="${safeText(story.judul)}" data-share-text="${safeText(story.pengalaman)}">
            <i class="bi bi-share"></i> Bagikan
          </button>
        </div>
      </article>
    </div>
  `;
};

const bindStoryActions = (root = document) => {
  if (root.dataset.storyActionsBound) return;
  root.dataset.storyActionsBound = "true";
  root.addEventListener("click", async (event) => {
    const likeButton = event.target.closest("[data-like-story]");
    if (likeButton) {
      const id = likeButton.dataset.likeStory;
      if (!id) return;
      const count = likeButton.querySelector("[data-like-count]");
      const icon = likeButton.querySelector("i");
      const label = likeButton.querySelector("[data-like-label]");
      const current = Number(count?.textContent || 0);
      const liked = hasLikedStory(id);
      likeButton.disabled = true;
      likeButton.classList.add("is-loading");
      try {
        const result = liked
          ? await HCApi.unlikeExperience(id)
          : await HCApi.likeExperience(id);
        const fallbackCount = liked ? Math.max(0, current - 1) : current + 1;
        const nextCount = Number(
          result.like || result.data?.like || fallbackCount,
        );
        if (count) count.textContent = nextCount;
        if (liked) {
          if (icon) icon.className = "bi bi-heart";
          if (label) label.textContent = "Suka";
          likeButton.classList.remove("btn-primary");
          likeButton.classList.add("btn-outline-primary");
          likeButton.setAttribute("aria-pressed", "false");
          likeButton.setAttribute("title", "Sukai cerita");
          unsetLikedStory(id);
          HCUtils.showToast("Like dibatalkan.");
        } else {
          if (icon) icon.className = "bi bi-heart-fill";
          if (label) label.textContent = "Disukai";
          likeButton.classList.remove("btn-outline-primary");
          likeButton.classList.add("btn-primary");
          likeButton.setAttribute("aria-pressed", "true");
          likeButton.setAttribute("title", "Batalkan suka");
          setLikedStory(id);
          HCUtils.showToast("Terima kasih, like Anda sudah tercatat.");
        }
      } catch (error) {
        HCUtils.showToast(error.message, "danger");
      } finally {
        likeButton.disabled = false;
        likeButton.classList.remove("is-loading");
      }
      return;
    }

    const shareButton = event.target.closest("[data-share-story]");
    if (shareButton) {
      const id = shareButton.dataset.shareStory;
      await shareContent({
        title: shareButton.dataset.shareTitle || "Pengalaman Jamaah",
        text: shareButton.dataset.shareText || "",
        url: getStoryShareUrl(id),
      });
    }
  });
};

// Slider "Cerita Jamaah" di beranda: geser horizontal dengan tombol
// kiri/kanan (data-story-prev / data-story-next), plus swipe/scroll
// manual di perangkat sentuh. Tombol otomatis nonaktif saat sudah
// mentok di ujung awal/akhir daftar.
const bindStorySlider = (wrap) => {
  if (!wrap || wrap.dataset.storySliderBound) return;
  wrap.dataset.storySliderBound = "true";

  const track = wrap.querySelector("[data-stories]");
  const prevBtn = wrap.querySelector("[data-story-prev]");
  const nextBtn = wrap.querySelector("[data-story-next]");
  if (!track || !prevBtn || !nextBtn) return;

  const getStep = () => {
    const firstSlide = track.querySelector(".story-slide");
    if (!firstSlide) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 24;
    return firstSlide.getBoundingClientRect().width + gap;
  };

  const updateNavState = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = maxScroll <= 0 || track.scrollLeft >= maxScroll;
  };

  prevBtn.addEventListener("click", () => {
    track.scrollBy({ left: -getStep(), behavior: "smooth" });
  });
  nextBtn.addEventListener("click", () => {
    track.scrollBy({ left: getStep(), behavior: "smooth" });
  });
  track.addEventListener("scroll", updateNavState, { passive: true });
  window.addEventListener("resize", updateNavState);
  updateNavState();
};

// Deskripsi kartu "Artikel Terbaru" dipotong lebih pendek daripada versi
// sebelumnya supaya tinggi kartu kiri ini tidak melebihi kolom kanan (list
// Artikel Populer + kartu Layanan ManasikGo) -- CSS line-clamp di
// .featured-article-card (assets/css/style.css) jadi jaring pengaman kedua
// kalau tetap kepanjangan untuk kombinasi judul+ringkasan tertentu.
const buildFeaturedExcerpt = (article, maxLength = 100) => {
  const fallback = String(article.ringkasan || "").trim();
  const fromContent = HCUtils.stripHtml(article.isi || "")
    .replace(/\s+/g, " ")
    .trim();
  const base = fromContent.length > fallback.length ? fromContent : fallback;
  if (base.length <= maxLength) return base;
  const cut = base.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
};

const createFeaturedArticleCard = (article) => `
  <article class="featured-article-card fade-up">
    <a class="featured-article-media" href="${HCRoutes.buildUrl('artikel', article.slug)}" aria-label="Baca ${safeText(article.judul)}">
      <img src="${article.gambar || "assets/images/article-placeholder.svg"}" alt="${safeText(article.judul)}" loading="eager" onerror="this.src='assets/images/article-placeholder.svg'">
      <span class="badge-soft featured-article-badge"><i class="bi bi-bookmark"></i>${safeText(article.kategori)}</span>
    </a>
    <div class="card-body-pad">
      <h2 class="article-title mb-2"><a class="text-reset" href="${HCRoutes.buildUrl('artikel', article.slug)}">${safeText(article.judul)}</a></h2>
      <p class="lead-muted mb-3">${safeText(buildFeaturedExcerpt(article))}</p>
      <div class="meta">
        <span>${authorAvatarHtml(article)} ${safeText(article.penulis || "Redaksi")}</span>
        <span><i class="bi bi-eye"></i> ${Number(article.views || 0).toLocaleString("id-ID")}x dilihat</span>
      </div>
      <div class="meta mt-2 article-time" title="${HCUtils.formatDateTime(article.tanggal)}">
        <span><i class="bi bi-calendar3"></i> ${HCUtils.formatDate(article.tanggal)}</span>
        <span><i class="bi bi-clock-history"></i> <span data-time-ago="${article.tanggal}">${HCUtils.timeAgo(article.tanggal)}</span></span>
      </div>
    </div>
  </article>
`;

const createArticleListItem = (article, { showViews = false } = {}) => `
  <a class="article-list-item fade-up" href="${HCRoutes.buildUrl('artikel', article.slug)}">
    <span class="article-list-thumb">
      <img src="${article.gambar || "assets/images/article-placeholder.svg"}" alt="" loading="lazy" onerror="this.src='assets/images/article-placeholder.svg'">
    </span>
    <span class="article-list-body">
      ${article.kategori ? `<span class="article-list-category">${safeText(article.kategori)}</span>` : ""}
      <span class="article-list-title">${safeText(article.judul)}</span>
      <span class="article-list-author">${authorAvatarHtml(article)} ${safeText(article.penulis || "Redaksi")}</span>
      <span class="article-list-date">
        <i class="bi bi-calendar3"></i> ${HCUtils.formatDate(article.tanggal)}${
          showViews
            ? `<span class="article-list-dot">&middot;</span><i class="bi bi-eye"></i> ${Number(article.views || 0).toLocaleString("id-ID")}x dilihat`
            : ""
        }</span>
    </span>
  </a>
`;

// Artikel lain dengan kategori yang sama, dipakai sebagai rekomendasi
// "Artikel Terkait" di halaman detail. Kalau artikel sekategori kurang dari
// jumlah yang diminta, dilengkapi dari artikel terbaru lain (bukan diri
// sendiri) supaya bagian ini tidak pernah kosong.
const getRelatedArticles = (articles, current, limit = 3) => {
  const others = articles.filter((item) => item.slug !== current.slug);
  const scored = others.map((item) => ({
    item,
    score:
      normalizeSafe(item.kategori) === normalizeSafe(current.kategori) ? 1 : 0,
  }));
  scored.sort(
    (a, b) =>
      b.score - a.score || new Date(b.item.tanggal) - new Date(a.item.tanggal),
  );
  return scored.slice(0, limit).map((entry) => entry.item);
};
const normalizeSafe = (value = "") => String(value).toLowerCase().trim();

const renderArticleFAQ = async (target, article) => {
  try {
    const allFAQs = await HCApi.getFAQ();
    if (!allFAQs || !allFAQs.length) return;

    const normalize = (value = "") => String(value).toLowerCase().trim();
    const categoryNorm = normalize(article.kategori);

    // Filter FAQs where category matches or category term appears in Q/A
    const matchedFAQs = allFAQs
      .filter((faq) => {
        const faqCategoryNorm = normalize(faq.category);
        const categoryMatch = faqCategoryNorm === categoryNorm;
        const questionMatch = normalize(faq.question).includes(categoryNorm);
        const answerMatch = normalize(faq.answer).includes(categoryNorm);
        return categoryMatch || questionMatch || answerMatch;
      })
      .slice(0, 5);

    if (!matchedFAQs.length) return;

    const faqAccordionId = `faqAccordion-${article.slug || Date.now()}`;
    const heading = `Pertanyaan Umum seputar ${safeText(article.kategori)}`;

    const faqSection = document.createElement("div");
    faqSection.className = "mt-5 pt-4 border-top fade-up";
    faqSection.innerHTML = `
      <h2 class="h4 fw-bold mb-3"><i class="bi bi-question-circle text-primary"></i> ${heading}</h2>
      <div class="accordion" id="${safeText(faqAccordionId)}">
        ${matchedFAQs
          .map(
            (faq, idx) => `
          <div class="accordion-item fade-up">
            <h3 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${safeText(faq.id || `faq-item-${idx}`)}">
                ${safeText(faq.question)}
              </button>
            </h3>
            <div id="${safeText(faq.id || `faq-item-${idx}`)}" class="accordion-collapse collapse" data-bs-parent="#${safeText(faqAccordionId)}">
              <div class="accordion-body">${faq.answer}</div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `;

    target.appendChild(faqSection);
    HCUtils.initAnimations();
  } catch (error) {
    console.info(error.message);
  }
};

const renderHomeContent = async () => {
  const featured = document.querySelector("[data-featured-article]");
  const articleList = document.querySelector("[data-article-list]");
  const stories = document.querySelector("[data-stories]");
  if (!featured && !articleList && !stories) return;
  const [articles, experiences] = await Promise.all([
    HCApi.getArticles(),
    HCApi.getExperiences(),
  ]);

  // "Artikel Terbaru": selalu disortir eksplisit berdasarkan tanggal upload
  // terbaru, jangan mengandalkan urutan apa adanya dari API/sheet.
  const byLatest = articles
    .slice()
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  if (featured && byLatest.length)
    featured.innerHTML = createFeaturedArticleCard(byLatest[0]);

  // "Artikel Populer": disortir berdasarkan jumlah dibaca (views), artikel
  // yang sedang tampil sebagai featured tidak diulang di daftar ini.
  if (articleList) {
    const featuredSlug = byLatest[0]?.slug;
    const mostViewed = articles
      .filter((item) => item.slug !== featuredSlug)
      .slice()
      .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
      .slice(0, 4);
    articleList.innerHTML = mostViewed
      .map((article) => createArticleListItem(article, { showViews: true }))
      .join("");
  }

  if (stories) {
    // Sebelumnya dipotong ke 15 cerita paling disukai saja -- landing page
    // jadi terasa sedikit isinya padahal ini slider horizontal (scroll
    // kanan/kiri), bukan grid yang makan banyak tempat vertikal. Sekarang
    // semua cerita published ditampilkan (diurutkan dari yang paling
    // disukai) supaya "Cerita Jemaah" di beranda terasa lebih ramai/banyak.
    const mostLiked = experiences
      .slice()
      .sort((a, b) => getStoryLike(b) - getStoryLike(a));
    stories.innerHTML = mostLiked
      .map((story) => createStoryCard(story, { headingLevel: 3, slider: true }))
      .join("");
    bindStoryActions(stories);
    bindStorySlider(stories.closest("[data-story-slider-wrap]"));
  }
  HCUtils.initAnimations();
};

// Sekali per slug per sesi tab, supaya refresh berulang tidak
// menggelembungkan angka "populer" secara tidak wajar.
const markArticleViewedOnce = async (slug) => {
  try {
    const key = "manasikgo-viewed-articles";
    const viewed = new Set(JSON.parse(sessionStorage.getItem(key) || "[]"));
    if (viewed.has(slug)) return null;
    viewed.add(slug);
    sessionStorage.setItem(key, JSON.stringify([...viewed]));
    const result = await HCApi.viewArticle(slug);
    return result?.views ?? null;
  } catch (error) {
    console.info(error.message);
    return null;
  }
};

const renderDetail = async () => {
  const target = document.querySelector("[data-article-detail]");
  if (!target) return;
  const slug =
    HCRoutes.getSlug("artikel", "slug") || "checklist-persiapan-haji";
  const [article, allArticles] = await Promise.all([
    HCApi.getArticle(slug),
    HCApi.getArticles(),
  ]);
  if (!article) {
    location.href = "404.html";
    return;
  }
  document.title = `${article.judul} | ManasikGo`;
  document
    .querySelector("meta[name='description']")
    ?.setAttribute("content", article.ringkasan);
  // SEO: sebelumnya canonical/OG/JSON-LD statis dan SAMA untuk setiap
  // artikel (semua menunjuk ke /detail.html tanpa slug) -- ini bikin
  // Google menganggap semua artikel sebagai duplikat satu sama lain dan
  // cuma mengindeks salah satu (atau tidak sama sekali). Set per-artikel
  // di sini supaya tiap URL (?slug=...) py title/description/canonical
  // sendiri yang unik.
  const pageUrl = `https://klikada.github.io/manasikgo/${HCRoutes.buildUrl("artikel", article.slug)}`;
  const ogImage = article.gambar
    ? new URL(article.gambar, "https://klikada.github.io/manasikgo/").href
    : "https://klikada.github.io/manasikgo/assets/images/logo.png";
  document.getElementById("metaCanonical")?.setAttribute("href", pageUrl);
  document.getElementById("metaOgUrl")?.setAttribute("content", pageUrl);
  document.getElementById("metaOgTitle")?.setAttribute("content", article.judul);
  document.getElementById("metaOgDescription")?.setAttribute("content", article.ringkasan || "");
  document.getElementById("metaOgImage")?.setAttribute("content", ogImage);
  document.getElementById("metaTwitterTitle")?.setAttribute("content", article.judul);
  document.getElementById("metaTwitterDescription")?.setAttribute("content", article.ringkasan || "");
  const jsonLdEl = document.getElementById("articleJsonLd");
  if (jsonLdEl) {
    try {
      const data = JSON.parse(jsonLdEl.textContent);
      data.headline = article.judul;
      data.description = article.ringkasan;
      data.image = ogImage;
      data.datePublished = article.tanggal || undefined;
      data.author = { "@type": "Person", name: article.penulis || "Redaksi ManasikGo" };
      data.mainEntityOfPage = { "@type": "WebPage", "@id": pageUrl };
      jsonLdEl.textContent = JSON.stringify(data);
    } catch (error) {
      console.info(error.message);
    }
  }
  const related = getRelatedArticles(allArticles, article, 3);
  target.innerHTML = `
    <nav aria-label="Breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="index.html">Beranda</a></li>
        <li class="breadcrumb-item"><a href="artikel.html">Artikel</a></li>
        <li class="breadcrumb-item active" aria-current="page">${safeText(article.judul)}</li>
      </ol>
    </nav>
    <span class="badge-soft mb-3">${safeText(article.kategori)}</span>
    <h1 class="display-5 fw-bold">${safeText(article.judul)}</h1>
    <p class="lead lead-muted">${safeText(article.ringkasan)}</p>
    <div class="meta mb-4">
      <span>${authorAvatarHtml(article)} ${safeText(article.penulis || "Redaksi")}</span>
      <span title="${HCUtils.formatDateTime(article.tanggal)}"><i class="bi bi-calendar3"></i> ${HCUtils.formatDate(article.tanggal)}</span>
      <span><i class="bi bi-clock-history"></i> <span data-time-ago="${article.tanggal}">${HCUtils.timeAgo(article.tanggal)}</span></span>
      <span><i class="bi bi-clock"></i> ${HCUtils.readingTime(article.isi)} menit baca</span>
      <span data-view-count><i class="bi bi-eye"></i> ${Number(article.views || 0).toLocaleString("id-ID")}x dibaca</span>
    </div>
    <img class="rounded-4 mb-4 w-100" src="${article.gambar || "assets/images/article-placeholder.svg"}" alt="${safeText(article.judul)}" loading="eager" onerror="this.src='assets/images/article-placeholder.svg'">
    <div class="article-content">${article.isi}</div>
    ${
      article.sumber_referensi
        ? `
    <div class="surface p-3 p-md-4 mt-4">
      <p class="small fw-bold mb-1"><i class="bi bi-journal-check"></i> Rujukan &amp; catatan sumber</p>
      <p class="small lead-muted mb-0">${safeText(article.sumber_referensi)}</p>
    </div>`
        : ""
    }
        <div class="d-flex flex-wrap gap-2 mt-4">
      <button class="btn btn-outline-primary" type="button" data-share><i class="bi bi-share"></i> Bagikan</button>
    </div>
    <div class="surface p-4 p-md-5 mt-4 share-experience-cta">
      <div class="d-flex flex-column flex-md-row align-items-md-center gap-3 gap-md-4">
        <div class="share-experience-icon flex-shrink-0"><i class="bi bi-mic"></i></div>
        <div class="flex-grow-1">
          <h2 class="h5 fw-bold mb-1">Sudah Pernah Menunaikan Haji atau Umrah?</h2>
          <p class="lead-muted mb-0">
            Bagikan pengalaman Anda agar bisa menjadi bekal dan inspirasi bagi
            calon jamaah lain di ManasikGo.
          </p>
        </div>
        <a class="btn btn-primary flex-shrink-0" href="kirim.html">
          <i class="bi bi-pencil-square"></i> Bagikan Pengalaman Anda
        </a>
      </div>
    </div>
    <div class="surface p-4 p-md-5 mt-4 text-center">
      <h2 class="h5 fw-bold mb-1">Ikuti ManasikGo di Media Sosial</h2>
      <p class="lead-muted mb-3">Dapatkan artikel terbaru, tips, dan info seputar Haji &amp; Umrah setiap hari.</p>
      <div class="social-links justify-content-center" aria-label="Ikuti ManasikGo di media sosial">
        <a href="https://www.facebook.com/manasikgo" target="_blank" rel="noopener" aria-label="Facebook ManasikGo"><i class="bi bi-facebook"></i></a>
        <a href="https://www.tiktok.com/@manasikgo" target="_blank" rel="noopener" aria-label="TikTok ManasikGo"><i class="bi bi-tiktok"></i></a>
        <a href="https://www.instagram.com/manasikgo" target="_blank" rel="noopener" aria-label="Instagram ManasikGo"><i class="bi bi-instagram"></i></a>
        <a href="https://x.com/manasikgo" target="_blank" rel="noopener" aria-label="X (Twitter) ManasikGo"><i class="bi bi-twitter-x"></i></a>
      </div>
    </div>
    ${
      related.length
        ? `
    <div class="mt-5 pt-4 border-top">
      <h2 class="h4 fw-bold mb-3"><i class="bi bi-collection text-primary"></i> Artikel Terkait</h2>
      <div class="row g-3">
        ${related
          .map(
            (item) => `
          <div class="col-md-4">
            <a class="related-article-card fade-up" href="${HCRoutes.buildUrl('artikel', item.slug)}">
              <img src="${item.gambar || "assets/images/article-placeholder.svg"}" alt="" loading="lazy" onerror="this.src='assets/images/article-placeholder.svg'">
              <div class="card-body-pad">
                <span class="badge-soft mb-2"><i class="bi bi-bookmark"></i>${safeText(item.kategori)}</span>
                <p class="article-title h6 mb-0">${safeText(item.judul)}</p>
              </div>
            </a>
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="text-center mt-4">
        <a class="btn btn-outline-primary" href="artikel.html?kategori=${encodeURIComponent(article.kategori)}">
          <i class="bi bi-collection"></i> Artikel Lainnya di Kategori ${safeText(article.kategori)}
        </a>
      </div>
    </div>`
        : ""
    }
  `;
  await buildArticleTableOfContents(
    target,
    document.querySelector("[data-article-toc]"),
    article,
  );
  positionArticleTocForViewport();
  // render FAQ section related to article category
  renderArticleFAQ(target, article);
  document.querySelector("[data-share]")?.addEventListener("click", () =>
    shareContent({
      title: article.judul,
      text: article.ringkasan,
      url: location.href,
    }),
  );
  HCUtils.initAnimations();
  markArticleViewedOnce(slug).then((views) => {
    if (views === null) return;
    const el = document.querySelector("[data-view-count]");
    if (el)
      el.innerHTML = `<i class="bi bi-eye"></i> ${Number(views).toLocaleString("id-ID")}x dibaca`;
  });
};

// Halaman detail-pengalaman.html: tampilan penuh satu cerita pengalaman jamaah,
// strukturnya sengaja dibuat mirip renderDetail() (halaman artikel) supaya
// terasa konsisten (breadcrumb, meta info, konten, CTA berbagi, cerita
// terkait) walau sumber datanya beda (sheet Pengalaman, bukan Artikel).
const getRelatedStories = (all, current, limit = 3) => {
  const currentId = getStoryId(current);
  return all
    .filter((item) => getStoryId(item) !== currentId)
    .filter(
      (item) =>
        !current.kategori ||
        String(item.kategori).toLowerCase() ===
          String(current.kategori).toLowerCase(),
    )
    .sort((a, b) => getStoryLike(b) - getStoryLike(a))
    .slice(0, limit);
};

const renderCeritaDetail = async () => {
  const target = document.querySelector("[data-cerita-detail]");
  if (!target) return;
  const id = HCRoutes.getSlug("cerita", "id");
  const [story, allStories] = await Promise.all([
    HCApi.getExperience(id),
    HCApi.getExperiences(),
  ]);
  if (!story) {
    location.href = "404.html";
    return;
  }
  const storyId = getStoryId(story);
  const liked = hasLikedStory(storyId);
  document.title = `${story.judul} | Cerita Jamaah | ManasikGo`;
  document
    .querySelector("meta[name='description']")
    ?.setAttribute("content", String(story.pengalaman || "").slice(0, 160));
  // SEO: canonical/OG per cerita, sama seperti detail artikel & istilah.
  const storyPageUrl = `https://klikada.github.io/manasikgo/${HCRoutes.buildUrl("cerita", storyId)}`;
  const storyExcerpt = String(story.pengalaman || "").slice(0, 160);
  // Foto cerita jemaah (kalau ada) dipakai sebagai gambar preview link
  // share, sama seperti artikel. Kalau jamaah tidak melampirkan foto,
  // fallback ke logo ManasikGo supaya tetap ada gambar di preview.
  const storyOgImage = story.foto
    ? new URL(story.foto, "https://klikada.github.io/manasikgo/").href
    : "https://klikada.github.io/manasikgo/assets/images/logo.png";
  document.getElementById("metaCanonical")?.setAttribute("href", storyPageUrl);
  document.getElementById("metaOgUrl")?.setAttribute("content", storyPageUrl);
  document.getElementById("metaOgTitle")?.setAttribute("content", `${story.judul} | Cerita Jamaah ManasikGo`);
  document.getElementById("metaOgDescription")?.setAttribute("content", storyExcerpt);
  document.getElementById("metaOgImage")?.setAttribute("content", storyOgImage);
  document.getElementById("metaTwitterImage")?.setAttribute("content", storyOgImage);
  const related = getRelatedStories(allStories, story, 3);
  target.innerHTML = `
    <nav aria-label="Breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="index.html">Beranda</a></li>
        <li class="breadcrumb-item"><a href="pengalaman.html">Cerita Jamaah</a></li>
        <li class="breadcrumb-item active" aria-current="page">${safeText(story.judul)}</li>
      </ol>
    </nav>
    <span class="badge-soft mb-3"><i class="bi bi-chat-heart"></i> ${safeText(story.kategori || "Cerita Jamaah")}</span>
    <h1 class="display-5 fw-bold">${safeText(story.judul)}</h1>
    <div class="meta mb-4">
      <span><i class="bi bi-person"></i> ${safeText(story.nama)}${story.asal ? `, ${safeText(story.asal)}` : ""}</span>
      <span title="${HCUtils.formatDateTime(story.tanggal)}"><i class="bi bi-calendar3"></i> ${HCUtils.formatDate(story.tanggal)}</span>
      <span><i class="bi bi-clock-history"></i> <span data-time-ago="${story.tanggal}">${HCUtils.timeAgo(story.tanggal)}</span></span>
    </div>
    <div class="article-content">
      <p>${safeText(story.pengalaman).replace(/\n+/g, "</p><p>")}</p>
    </div>
    ${
      story.tips
        ? `
    <div class="surface p-3 p-md-4 mt-4">
      <p class="small fw-bold mb-1"><i class="bi bi-lightbulb text-primary"></i> Tips dari ${safeText(story.nama)}</p>
      <p class="small lead-muted mb-0">${safeText(story.tips)}</p>
    </div>`
        : ""
    }
    <div class="d-flex flex-wrap gap-2 mt-4">
      <button class="btn ${liked ? "btn-primary" : "btn-outline-primary"} story-like-btn" type="button" data-like-story="${safeText(storyId)}" aria-pressed="${liked}" title="${liked ? "Batalkan suka" : "Sukai cerita"}">
        <i class="bi ${liked ? "bi-heart-fill" : "bi-heart"}"></i> <span data-like-label>${liked ? "Disukai" : "Suka"}</span> <span data-like-count>${getStoryLike(story)}</span>
      </button>
      <button class="btn btn-outline-primary" type="button" data-share><i class="bi bi-share"></i> Bagikan</button>
    </div>
    <div class="surface p-4 p-md-5 mt-4 share-experience-cta">
      <div class="d-flex flex-column flex-md-row align-items-md-center gap-3 gap-md-4">
        <div class="share-experience-icon flex-shrink-0"><i class="bi bi-mic"></i></div>
        <div class="flex-grow-1">
          <h2 class="h5 fw-bold mb-1">Anda Juga Punya Cerita Haji atau Umrah?</h2>
          <p class="lead-muted mb-0">
            Bagikan pengalaman Anda agar bisa menjadi bekal dan inspirasi bagi
            calon jamaah lain di ManasikGo.
          </p>
        </div>
        <a class="btn btn-primary flex-shrink-0" href="kirim.html">
          <i class="bi bi-pencil-square"></i> Kirim Cerita Anda
        </a>
      </div>
    </div>
        <div class="surface p-4 p-md-5 mt-4 text-center">
      <h2 class="h5 fw-bold mb-1">Ikuti ManasikGo di Media Sosial</h2>
      <p class="lead-muted mb-3">Dapatkan artikel terbaru, tips, dan info seputar Haji &amp; Umrah setiap hari.</p>
      <div class="social-links justify-content-center" aria-label="Ikuti ManasikGo di media sosial">
        <a href="https://www.facebook.com/manasikgo" target="_blank" rel="noopener" aria-label="Facebook ManasikGo"><i class="bi bi-facebook"></i></a>
        <a href="https://www.tiktok.com/@manasikgo" target="_blank" rel="noopener" aria-label="TikTok ManasikGo"><i class="bi bi-tiktok"></i></a>
        <a href="https://www.instagram.com/manasikgo" target="_blank" rel="noopener" aria-label="Instagram ManasikGo"><i class="bi bi-instagram"></i></a>
        <a href="https://x.com/manasikgo" target="_blank" rel="noopener" aria-label="X (Twitter) ManasikGo"><i class="bi bi-twitter-x"></i></a>
      </div>
    </div>
    ${
      related.length
        ? `
    <div class="mt-5 pt-4 border-top">
      <h2 class="h4 fw-bold mb-3"><i class="bi bi-collection text-primary"></i> Cerita Jamaah Lainnya</h2>
      <div class="row g-3">
        ${related
          .map(
            (item) => `
          <div class="col-md-4">
            <a class="related-article-card fade-up" href="${HCRoutes.buildUrl('cerita', getStoryId(item))}">
              <div class="card-body-pad">
                <span class="badge-soft mb-2"><i class="bi bi-chat-heart"></i>${safeText(item.kategori || "Cerita Jamaah")}</span>
                <p class="article-title h6 mb-1">${safeText(item.judul)}</p>
                <p class="small lead-muted mb-0"><i class="bi bi-person"></i> ${safeText(item.nama)}</p>
              </div>
            </a>
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="text-center mt-4">
        <a class="btn btn-outline-primary" href="pengalaman.html?kategori=${encodeURIComponent(story.kategori || "")}">
          <i class="bi bi-collection"></i> Cerita Lainnya di Kategori ${safeText(story.kategori || "Cerita Jamaah")}
        </a>
      </div>
    </div>`
        : ""
    }
  `;
  bindStoryActions(target);
  document.querySelector("[data-share]")?.addEventListener("click", () =>
    shareContent({
      title: story.judul,
      text: story.pengalaman,
      url: `${HCRoutes.buildUrl("cerita", storyId)}`,
    }),
  );
  HCUtils.initAnimations();
};

const initExperienceForm = () => {
  const form = document.querySelector("#experienceForm");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    const submit = form.querySelector("[type='submit']");
    submit.disabled = true;
    submit.innerHTML =
      "<span class='spinner-border spinner-border-sm'></span> Mengirim...";
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      await HCApi.postExperience(payload);
      form.reset();
      form.classList.remove("was-validated");
      HCUtils.showToast(
        "Pengalaman terkirim. Terimakasih sudah berbagi pengalaman anda.",
      );
    } catch (error) {
      HCUtils.showToast(error.message, "danger");
    } finally {
      submit.disabled = false;
      submit.innerHTML = "<i class='bi bi-send'></i> Kirim Pengalaman";
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  renderHomeContent();
  renderDetail();
  renderCeritaDetail();
  initExperienceForm();
});
