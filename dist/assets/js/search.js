const normalize = (value = "") => value.toString().toLowerCase().trim();
const escapeHtml = (value = "") =>
  value
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Flexible field detector: some data sources may use 'title'/'category'
// instead of Indonesian keys. Try a list of candidates per logical field.
const getArticleProp = (article = {}, prop) => {
  const map = {
    judul: ["judul", "title", "judul_artikel", "nama", "name"],
    ringkasan: ["ringkasan", "summary", "excerpt", "deskripsi", "description"],
    isi: ["isi", "content", "body"],
    kategori: ["kategori", "category", "kat"],
    penulis: ["penulis", "author", "writer"],
    slug: ["slug", "slug_artikel", "id", "url", "permalink"],
    views: ["views", "view", "hits"],
    tanggal: ["tanggal", "date", "created_at", "created"],
  };
  const candidates = map[prop] || [prop];
  for (const key of candidates) {
    if (
      Object.prototype.hasOwnProperty.call(article, key) &&
      article[key] != null
    )
      return article[key];
  }
  return "";
};

// Gabungan "kata" yang bisa dicari: judul, ringkasan, ISI artikel (HTML
// dibuang dulu), kategori, dan penulis. Jadi pencarian tidak lagi
// terbatas pada judul/ringkasan saja, tapi benar-benar universal ke seluruh
// isi artikel.
const getArticleHaystack = (article) =>
  normalize(
    [
      getArticleProp(article, "judul"),
      getArticleProp(article, "ringkasan"),
      HCUtils.stripHtml(getArticleProp(article, "isi") || ""),
      getArticleProp(article, "kategori"),
      getArticleProp(article, "penulis"),
      getArticleProp(article, "slug"),
    ]
      .filter(Boolean)
      .join(" "),
  );

const getKeywordTerms = (query = "") =>
  normalize(query).split(/\s+/).filter(Boolean);

const getArticleSuggestionScore = (article, query = "") => {
  const keyword = normalize(query);
  if (!keyword) return 0;
  const terms = getKeywordTerms(keyword);
  const title = normalize(getArticleProp(article, "judul") || "");
  const haystack = getArticleHaystack(article);
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

const getArticleSuggestions = (articles, query = "") => {
  const keyword = normalize(query);
  if (!keyword) return [];
  return articles
    .map((article) => ({
      article,
      score: getArticleSuggestionScore(article, keyword),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ article }) => article);
};

// Pencarian universal: query dipecah per kata, dan SEMUA kata harus
// ditemukan di suatu tempat pada artikel (judul/ringkasan/isi/kategori/
// penulis) — bukan cuma dicocokkan sebagai satu frasa utuh persis.
const filterArticles = (articles, query = "", category = "") => {
  const keyword = normalize(query);
  const selectedCategory = normalize(category);
  const tokens = keyword.split(/\s+/).filter(Boolean);
  return articles.filter((article) => {
    const haystack = getArticleHaystack(article);
    const matchKeyword =
      !tokens.length || tokens.every((token) => haystack.includes(token));
    const articleCategory = normalize(
      getArticleProp(article, "kategori") || "",
    );
    const matchCategory =
      !selectedCategory ||
      articleCategory === selectedCategory ||
      haystack.includes(selectedCategory);
    return matchKeyword && matchCategory;
  });
};

const sortArticles = (articles, mode = "terbaru") => {
  const sorted = articles.slice();
  if (mode === "populer") {
    sorted.sort(
      (a, b) =>
        (Number(getArticleProp(b, "views")) || 0) -
        (Number(getArticleProp(a, "views")) || 0),
    );
  } else {
    sorted.sort(
      (a, b) =>
        new Date(getArticleProp(b, "tanggal") || getArticleProp(b, "date")) -
        new Date(getArticleProp(a, "tanggal") || getArticleProp(a, "date")),
    );
  }
  return sorted;
};

const initArticleSearch = async () => {
  const list = document.querySelector("[data-article-list]");
  if (!list) return;
  const searchInput = document.querySelector("[data-search-input]");
  const categoryInput = document.querySelector("[data-category-filter]");
  const sortInput = document.querySelector("[data-sort-filter]");
  const updateActiveSuggestion = () => {
    if (!suggestBox) return;
    const buttons = Array.from(
      suggestBox.querySelectorAll(".search-suggest-item"),
    );
    buttons.forEach((btn, idx) => {
      if (idx === activeSuggestIndex) {
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        try {
          btn.scrollIntoView({ block: "nearest" });
        } catch (e) {
          // ignore
        }
      } else {
        btn.classList.remove("active");
        btn.removeAttribute("aria-selected");
      }
    });
  };
  const pagination = document.querySelector("[data-pagination]");
  const count = document.querySelector("[data-result-count]");
  const suggestBox = document.querySelector("[data-search-suggestions]");
  const perPage = 6;
  let page = 1;
  let activeSuggestIndex = -1;
  let articles = await HCApi.getArticles();
  // also load global categories (sheet or fallback) so suggestions include
  // categories that may not be used by any article yet (e.g. "Hotel")
  let remoteCategories = [];
  try {
    const cats = await HCApi.getCategories();
    remoteCategories = (cats || [])
      .map((c) =>
        typeof c === "string" ? c : c.nama || c.name || c.category || "",
      )
      .filter(Boolean);
  } catch (e) {
    remoteCategories = [];
  }
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get("q");
  if (searchInput && initialQuery) searchInput.value = initialQuery;
  const initialCategory = params.get("kategori");
  const initialSort = params.get("urutan");
  if (sortInput && (initialSort === "populer" || initialSort === "terbaru"))
    sortInput.value = initialSort;

  const categories = [
    ...new Set(
      [
        ...articles.map((item) => getArticleProp(item, "kategori")),
        ...remoteCategories,
      ].filter(Boolean),
    ),
  ];
  if (categoryInput) {
    const baseHtml = `<option value="">Semua kategori</option>`;
    const optionsHtml = categories
      .map((item) => `<option value="${item}">${item}</option>`)
      .join("");
    if (!categoryInput.children.length) {
      categoryInput.innerHTML = baseHtml + optionsHtml;
    } else {
      // append any missing categories to existing select (avoid overwriting server-side rendered options)
      const existing = Array.from(categoryInput.options).map((o) =>
        String(o.value),
      );
      categories.forEach((item) => {
        if (!existing.includes(item)) {
          const opt = document.createElement("option");
          opt.value = item;
          opt.textContent = item;
          categoryInput.appendChild(opt);
        }
      });
    }
  }
  if (categoryInput && initialCategory) {
    const match = categories.find(
      (item) => normalize(item) === normalize(initialCategory),
    );
    if (match) categoryInput.value = match;
  }

  const renderSuggestions = () => {
    if (!suggestBox) return;
    const keyword = normalize(searchInput?.value);
    if (!keyword) {
      suggestBox.innerHTML = "";
      suggestBox.classList.remove("show");
      return;
    }
    // Suggestions from article matches
    const matches = getArticleSuggestions(articles, keyword);
    // Also include matching categories as suggestions (up to 3)
    const matchingCategories = (categories || [])
      .filter((cat) => normalize(cat).includes(keyword))
      .slice(0, 3);

    if (!matches.length && !matchingCategories.length) {
      suggestBox.innerHTML = "";
      suggestBox.classList.remove("show");
      return;
    }
    const keywordLabel = searchInput?.value?.trim() || "";

    // Category suggestion buttons (appear first)
    const categoryHtml = matchingCategories
      .map(
        (cat) => `
        <button
          class="search-suggest-item search-suggest-category"
          type="button"
          role="option"
          data-suggest-category="${escapeHtml(cat)}"
          aria-label="Cari kategori ${escapeHtml(cat)}"
          title="Cari kategori ${escapeHtml(cat)}"
        >
          <i class="bi bi-tags"></i>
          <span class="d-flex flex-column align-items-start">
            <span class="fw-semibold">${escapeHtml(cat)}</span>
            <small class="text-muted">Kategori</small>
          </span>
        </button>
      `,
      )
      .join("");

    const articleHtml = matches
      .map((article) => {
        const rawTitle = getArticleProp(article, "judul") || "";
        const rawCategory = getArticleProp(article, "kategori") || "Artikel";
        const rawSlug = getArticleProp(article, "slug") || "";
        const title = escapeHtml(rawTitle);
        const category = escapeHtml(rawCategory);
        const label = `Buka artikel ${rawTitle}`;
        return `
          <button
            class="search-suggest-item"
            type="button"
            role="option"
            data-suggest-query="${escapeHtml(rawTitle)}"
            data-suggest-slug="${escapeHtml(rawSlug)}"
            aria-label="${label}"
            title="${label}"
          >
            <i class="bi bi-file-earmark-text"></i>
            <span class="d-flex flex-column align-items-start">
              <span class="fw-semibold">${title}</span>
              <small class="text-muted">${category}</small>
            </span>
          </button>
        `;
      })
      .join("");

    suggestBox.innerHTML = `${categoryHtml}${articleHtml}`;
    suggestBox.setAttribute(
      "aria-label",
      keywordLabel
        ? `Saran pencarian untuk "${keywordLabel}"`
        : "Saran pencarian artikel",
    );
    window.HCUtils?.positionSuggestBox?.(searchInput, suggestBox);
    suggestBox.classList.add("show");
  };

  const render = () => {
    const filtered = filterArticles(
      articles,
      searchInput?.value,
      categoryInput?.value,
    );
    const results = sortArticles(filtered, sortInput?.value);
    const totalPages = Math.max(1, Math.ceil(results.length / perPage));
    page = Math.min(page, totalPages);
    const start = (page - 1) * perPage;
    const items = results.slice(start, start + perPage);
    const keyword = normalize(searchInput?.value);
    if (items.length) {
      list.innerHTML = items.map(HCUtils.createArticleCard).join("");
    } else {
      list.innerHTML = `
        <div class="col-12">
          <div class="surface p-4 text-center">
            <p class="mb-0">Artikel dengan kata kunci "${searchInput?.value || ""}" belum ditemukan.</p>
          </div>
        </div>
      `;
    }
    if (count)
      count.textContent = keyword
        ? `${results.length} artikel ditemukan untuk "${searchInput.value}"`
        : `${results.length} artikel ditemukan`;
    if (pagination) {
      pagination.innerHTML = Array.from(
        { length: totalPages },
        (_, index) => `
        <li class="page-item ${page === index + 1 ? "active" : ""}">
          <button class="page-link" type="button" data-page="${index + 1}" aria-label="Halaman ${index + 1}">${index + 1}</button>
        </li>
      `,
      ).join("");
    }
    HCUtils.initAnimations();
  };

  searchInput?.addEventListener("input", () => {
    page = 1;
    renderSuggestions();
    render();
  });
  searchInput?.addEventListener("focus", renderSuggestions);
  // Keyboard navigation for suggestion box: ArrowDown/ArrowUp to move,
  // Enter to accept, Escape to close.
  searchInput?.addEventListener("keydown", (event) => {
    const key = event.key;
    const isVisible = suggestBox && suggestBox.classList.contains("show");
    const buttons = suggestBox
      ? Array.from(suggestBox.querySelectorAll(".search-suggest-item"))
      : [];
    if (!buttons.length) return;
    if (key === "ArrowDown") {
      event.preventDefault();
      activeSuggestIndex = Math.min(activeSuggestIndex + 1, buttons.length - 1);
      updateActiveSuggestion();
    } else if (key === "ArrowUp") {
      event.preventDefault();
      activeSuggestIndex = Math.max(activeSuggestIndex - 1, 0);
      updateActiveSuggestion();
    } else if (key === "Enter") {
      if (isVisible && activeSuggestIndex >= 0 && buttons[activeSuggestIndex]) {
        event.preventDefault();
        buttons[activeSuggestIndex].click();
      }
    } else if (key === "Escape") {
      if (isVisible) {
        suggestBox.classList.remove("show");
        activeSuggestIndex = -1;
      }
    }
  });
  document.addEventListener("click", (event) => {
    if (!suggestBox) return;
    if (
      event.target.closest("[data-search-input]") ||
      event.target.closest("[data-search-suggestions]")
    )
      return;
    suggestBox.classList.remove("show");
  });
  suggestBox?.addEventListener("click", (event) => {
    const button = event.target.closest(
      "[data-suggest-query],[data-suggest-category]",
    );
    if (!button || !searchInput) return;
    // If a category suggestion was clicked, set category filter and clear query
    if (button.dataset.suggestCategory) {
      if (categoryInput) categoryInput.value = button.dataset.suggestCategory;
      searchInput.value = "";
    } else if (button.dataset.suggestSlug) {
      // If suggestion has slug, open article detail page directly
      const slug = button.dataset.suggestSlug;
      if (slug) {
        // Navigate to detail page with slug param
        window.location.href = HCRoutes.buildUrl("artikel", slug);
        return;
      }
    } else if (button.dataset.suggestQuery) {
      // Article suggestion without slug: fill query with article title and clear category filter
      searchInput.value = button.dataset.suggestQuery;
      if (categoryInput) categoryInput.value = "";
    }
    suggestBox.classList.remove("show");
    page = 1;
    render();
  });
  categoryInput?.addEventListener("change", () => {
    page = 1;
    render();
  });
  sortInput?.addEventListener("change", () => {
    page = 1;
    render();
  });
  pagination?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button) return;
    page = Number(button.dataset.page);
    render();
  });
  render();
};

const filterExperiences = (experiences, query = "", category = "") => {
  const keyword = normalize(query);
  const selectedCategory = normalize(category);
  return experiences.filter((story) => {
    const haystack = normalize(
      `${story.judul} ${story.pengalaman} ${story.kategori} ${story.nama} ${story.asal} ${story.tips}`,
    );
    const matchKeyword = !keyword || haystack.includes(keyword);
    const matchCategory =
      !selectedCategory || normalize(story.kategori) === selectedCategory;
    return matchKeyword && matchCategory;
  });
};

const initExperienceSearch = async () => {
  const list = document.querySelector("[data-experience-list]");
  if (!list) return;
  const searchInput = document.querySelector("[data-search-input]");
  const categoryInput = document.querySelector("[data-category-filter]");
  const count = document.querySelector("[data-result-count]");
  let experiences = await HCApi.getExperiences();
  experiences = experiences
    .slice()
    .sort((a, b) => getStoryLike(b) - getStoryLike(a));

  const initialQuery = new URLSearchParams(location.search).get("q");
  if (searchInput && initialQuery) searchInput.value = initialQuery;
  const initialCategory = new URLSearchParams(location.search).get("kategori");

  const categories = [
    ...new Set(experiences.map((item) => item.kategori).filter(Boolean)),
  ];
  if (categoryInput && !categoryInput.children.length) {
    categoryInput.innerHTML = `<option value="">Semua kategori</option>${categories.map((item) => `<option value="${item}">${item}</option>`).join("")}`;
  }
  if (categoryInput && initialCategory) {
    const match = categories.find(
      (item) => normalize(item) === normalize(initialCategory),
    );
    if (match) categoryInput.value = match;
  }

  const render = () => {
    const results = filterExperiences(
      experiences,
      searchInput?.value,
      categoryInput?.value,
    );
    list.innerHTML = results.length
      ? results
          .map((story) => createStoryCard(story, { headingLevel: 2 }))
          .join("")
      : `<div class="col-12"><div class="surface p-4 text-center">Cerita pengalaman belum ditemukan.</div></div>`;
    if (count) count.textContent = `${results.length} cerita ditemukan`;
    bindStoryActions(list);
    HCUtils.initAnimations();
  };

  searchInput?.addEventListener("input", render);
  categoryInput?.addEventListener("change", render);
  render();
};

document.addEventListener("DOMContentLoaded", () => {
  initArticleSearch();
  initExperienceSearch();
});
