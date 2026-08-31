// assets/js/checklist.js
// Checklist perlengkapan Haji & Umrah
//
// PENTING:
// Urutan kategori DAN urutan item mengikuti langsung urutan
// array di assets/js/checklist-data.js.
//
// checklist.js TIDAK memiliki sorting/pengurutan kategori.
// Jadi jika ingin mengubah urutan kategori, cukup pindahkan
// object { cat: ..., items: [...] } di checklist-data.js.
// Tidak perlu mengubah file ini.

(function () {
  "use strict";

  // =========================================================
  // STATE
  // =========================================================

  var state = {
    jenis: "haji",
    gender: "wanita",
    wave: "1",
    bag: "semua",
    open: {}
  };

  // =========================================================
  // STORAGE
  // =========================================================

  var CHECKLIST_STORAGE_KEY = "manasikgo_checklist_progress_v1";
  var checkedItems = {};

  function loadCheckedItems() {
    checkedItems = {};

    try {
      var raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (!raw) return;

      var saved = JSON.parse(raw);

      if (
        saved &&
        saved.items &&
        typeof saved.items === "object"
      ) {
        checkedItems = saved.items;
      }
    } catch (e) {
      checkedItems = {};
    }
  }

  function saveCheckedItems() {
    try {
      localStorage.setItem(
        CHECKLIST_STORAGE_KEY,
        JSON.stringify({ items: checkedItems })
      );
    } catch (e) {
      // Abaikan jika localStorage tidak tersedia.
    }
  }

  // =========================================================
  // NORMALIZE CATEGORY NAME
  // =========================================================
  //
  // Fungsi ini HANYA untuk identitas/state kategori.
  // Tidak pernah dipakai untuk menentukan urutan.
  //
  // Alias lama tetap dipertahankan supaya state accordion dan
  // checklist lama tetap kompatibel.

  function normalizeCategoryName(cat) {
    var value = String(cat || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    if (
      value === "obat-obatan" ||
      value === "obat-obatan ringan"
    ) {
      return "obat-obatan";
    }

    if (
      value === "bekal makanan kering" ||
      value === "makanan kering"
    ) {
      return "makanan kering";
    }

    return value;
  }

  // =========================================================
  // LABEL TAMPILAN KATEGORI
  // =========================================================

  function getCategoryDisplayName(cat) {
    var normalized = normalizeCategoryName(cat);

    switch (normalized) {
      case "pakaian":
        return "Pakaian";

      case "perlengkapan mandi & mencuci":
        return "Perlengkapan Mandi & Mencuci";

      case "alat makan":
        return "Alat Makan";

      case "obat-obatan":
        // Untuk Haji tetap "Obat-obatan".
        // Untuk Umrah, nama asli dipertahankan di bawah.
        return String(cat || "Obat-obatan").toLowerCase() ===
          "obat-obatan ringan"
          ? "Obat-Obatan Ringan"
          : "Obat-obatan";

      case "makanan kering":
        return String(cat || "").toLowerCase() ===
          "bekal makanan kering"
          ? "Bekal Makanan Kering"
          : "Makanan Kering";

      case "dokumen":
        return "Dokumen";

      case "perlengkapan lainnya":
        return "Perlengkapan Lainnya";

      case "pakaian & ihram":
        return "Pakaian & Ihram";

      case "perlengkapan pribadi":
        return "Perlengkapan Pribadi";

      case "dokumen & lainnya":
        return "Dokumen & Lainnya";

      default:
        // Kategori baru dari checklist-data.js langsung tampil.
        return String(cat || "");
    }
  }

  // =========================================================
  // KEY ITEM
  // =========================================================
  //
  // Tidak menggunakan nomor index kategori.
  // Karena itu memindahkan posisi kategori di checklist-data.js
  // tidak menghilangkan centangan lama.
  //
  // id -> n -> index item menjadi identitas item.

  function checklistItemKey(gi, ii, item, cat) {
    var base = item && (item.id || item.n);

    return [
      state.jenis,
      state.gender,
      item && item.wave ? item.wave : "all",
      normalizeCategoryName(cat),
      base || "",
      ii
    ].join("|");
  }

  function isItemChecked(key) {
    return checkedItems[key] === true;
  }

  function toggleItem(key, card) {
    checkedItems[key] = !isItemChecked(key);

    if (!checkedItems[key]) {
      delete checkedItems[key];
    }

    saveCheckedItems();

    card.classList.toggle(
      "is-checked",
      isItemChecked(key)
    );

    var button = card.querySelector("[data-check-item]");

    if (button) {
      button.setAttribute(
        "aria-pressed",
        isItemChecked(key) ? "true" : "false"
      );

      button.setAttribute(
        "aria-label",
        isItemChecked(key)
          ? "Batalkan centang"
          : "Tandai sudah disiapkan"
      );

      button.innerHTML = isItemChecked(key)
        ? '<i class="bi bi-check2"></i>'
        : "";
    }
  }

  // =========================================================
  // ESCAPE HTML
  // =========================================================

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =========================================================
  // AMBIL DATA
  // =========================================================
  //
  // INI BAGIAN KUNCI URUTAN.
  //
  // getData() mengembalikan array sumber APA ADANYA.
  // Tidak ada .sort(), tidak ada CATEGORY_ORDER, dan tidak ada
  // pemetaan posisi kategori.
  //
  // checklist-data.js
  //       ↓
  // getData()
  //       ↓
  // render()
  //       ↓
  // data.forEach()
  //
  // Urutan kategori di halaman = urutan object kategori di data.

  function getData() {
    var data = window.HCChecklistData;

    if (!data) return [];

    if (state.jenis === "haji") {
      return data.haji && Array.isArray(data.haji[state.gender])
        ? data.haji[state.gender]
        : [];
    }

    return data.umrah && Array.isArray(data.umrah[state.gender])
      ? data.umrah[state.gender]
      : [];
  }

  // =========================================================
  // NOTE SESUAI GELOMBANG
  // =========================================================

  function noteFor(item) {
    if (!item) return "";

    if (
      item.note &&
      typeof item.note === "object"
    ) {
      return item.note[state.wave] || "";
    }

    return item.note || "";
  }

  // =========================================================
  // CEK VISIBILITY ITEM
  // =========================================================

  function isVisible(item) {
    if (!item) return false;

    if (state.jenis !== "haji") {
      return true;
    }

    return !item.wave || item.wave === state.wave;
  }

  // =========================================================
  // LABEL TAS
  // =========================================================

  function bagLabel(bag) {
    return bag === "kecil"
      ? '<i class="bi bi-bag-fill" aria-hidden="true"></i> Tas kecil'
      : '<i class="bi bi-suitcase2-fill" aria-hidden="true"></i> Koper besar';
  }

  // =========================================================
  // RENDER ITEM
  // =========================================================

  function renderItem(gi, ii, item, cat) {
    item = item || {};

    var note = noteFor(item);
    var itemKey = checklistItemKey(gi, ii, item, cat);
    var checked = isItemChecked(itemKey);

    return (
      '<article class="hc-item-card ' +
      (checked ? "is-checked" : "") +
      '" data-gi="' +
      escapeHtml(gi) +
      '" data-ii="' +
      escapeHtml(ii) +
      '" data-check-key="' +
      escapeHtml(itemKey) +
      '">' +

        '<div class="hc-item-main">' +
          '<button type="button" ' +
          'class="hc-item-check" ' +
          'data-check-item ' +
          'aria-pressed="' +
          (checked ? "true" : "false") +
          '" aria-label="' +
          (checked
            ? "Batalkan centang"
            : "Tandai sudah disiapkan") +
          '">' +
          (checked
            ? '<i class="bi bi-check2"></i>'
            : "") +
          "</button>" +

          '<div class="hc-item-copy">' +
            '<div class="hc-item-title">' +
              '<span>' +
                escapeHtml(item.n) +
              '</span>' +
              (item.q
                ? "<b>" + escapeHtml(item.q) + "</b>"
                : "") +
            '</div>' +
            (note
              ? "<p>" + escapeHtml(note) + "</p>"
              : "") +
          '</div>' +
        '</div>' +

        '<div class="hc-item-meta">' +
          '<span class="hc-bag ' +
          (item.bag === "kecil"
            ? "small-bag"
            : "large-bag") +
          '" aria-label="' +
          (item.bag === "kecil"
            ? "Tas kecil / kabin"
            : "Koper besar / bagasi") +
          '">' +
            bagLabel(item.bag) +
          '</span>' +
          (item.wave === "2"
            ? '<span class="hc-wave">Khusus Gelombang 2</span>'
            : "") +
        '</div>' +
      '</article>'
    );
  }

  // =========================================================
  // RENDER SEMUA KATEGORI
  // =========================================================
  //
  // TIDAK ADA PENGURUTAN DI SINI.
  // data.forEach() membaca urutan langsung dari checklist-data.js.

  function render(container) {
    var data = getData();
    var html = "";

    if (!Array.isArray(data)) {
      data = [];
    }

    data.forEach(function (group, gi) {
      // Jika satu group rusak/tidak lengkap, lewati group tersebut
      // tanpa membuat seluruh checklist gagal dirender.
      if (
        !group ||
        typeof group !== "object" ||
        !Array.isArray(group.items)
      ) {
        return;
      }

      var rows = [];

      group.items.forEach(function (item, ii) {
        if (
          isVisible(item) &&
          (
            state.bag === "semua" ||
            (item && item.bag === state.bag)
          )
        ) {
          rows.push({ item: item, ii: ii });
        }
      });

      if (!rows.length) return;

      var categoryName = normalizeCategoryName(group.cat);
      var key =
        state.jenis +
        "-" +
        state.gender +
        "-" +
        categoryName;

      var isOpen = state.open[key] === true;

      // =====================================================
      // ICON
      // =====================================================

      var icon = "bi-bag";
      var icons = window.HCChecklistData.icons;

      if (icons && typeof icons === "object") {
        icon =
          icons[group.cat] ||
          icons[getCategoryDisplayName(group.cat)] ||
          "bi-bag";
      }

      // =====================================================
      // CATEGORY CARD
      // =====================================================

      html +=
        '<section class="hc-category-card ' +
        (isOpen ? "is-open" : "") +
        '" data-category-key="' +
        escapeHtml(key) +
        '">' +

          '<button type="button" ' +
          'class="hc-category-header" ' +
          'data-category-toggle ' +
          'aria-expanded="' +
          (isOpen ? "true" : "false") +
          '">' +

            '<span class="hc-category-icon">' +
              '<i class="bi ' +
              escapeHtml(icon) +
              '"></i>' +
            '</span>' +

            '<span class="hc-category-title">' +
              '<small>' +
                rows.length +
                " barang" +
              '</small>' +
              '<strong>' +
                escapeHtml(getCategoryDisplayName(group.cat)) +
              '</strong>' +
            '</span>' +

            '<span class="hc-category-chevron">' +
              '<i class="bi bi-chevron-down"></i>' +
            '</span>' +
          '</button>' +

          '<div class="hc-category-body" ' +
          (isOpen ? "" : "hidden") +
          '>' +
            rows.map(function (o) {
              return renderItem(
                gi,
                o.ii,
                o.item,
                group.cat
              );
            }).join("") +
          '</div>' +
        '</section>';
    });

    container.innerHTML =
      html ||
      '<div class="surface p-4 text-center lead-muted">' +
        "Tidak ada barang yang sesuai dengan filter." +
      '</div>';

    updateSummary(data);
    updateCurrentLabel();
  }

  // =========================================================
  // EVENT ACCORDION + ITEM CHECK
  // =========================================================
  //
  // Event delegation dipakai agar tombol hasil render ulang
  // tetap aktif. Listener cukup dipasang SATU kali pada container.

  function bindChecklistEvents(container) {
    if (!container || container.__hcEventsBound) return;

    container.__hcEventsBound = true;

    container.addEventListener("click", function (event) {
      var checkButton = event.target.closest("[data-check-item]");

      if (checkButton && container.contains(checkButton)) {
        event.preventDefault();
        event.stopPropagation();

        var card = checkButton.closest(".hc-item-card");
        if (!card) return;

        toggleItem(
          card.getAttribute("data-check-key"),
          card
        );
        return;
      }

      var categoryButton = event.target.closest("[data-category-toggle]");

      if (
        categoryButton &&
        container.contains(categoryButton)
      ) {
        event.preventDefault();

        var categoryCard = categoryButton.closest(
          ".hc-category-card"
        );

        if (!categoryCard) return;

        var key = categoryCard.getAttribute("data-category-key");
        var body = categoryCard.querySelector(".hc-category-body");
        var open = categoryCard.classList.toggle("is-open");

        categoryButton.setAttribute(
          "aria-expanded",
          open ? "true" : "false"
        );

        if (body) {
          if (open) {
            body.removeAttribute("hidden");
          } else {
            body.setAttribute("hidden", "");
          }
        }

        state.open[key] = open;
      }
    });
  }

  // =========================================================
  // SUMMARY
  // =========================================================

  function updateSummary(data) {
    var kecil = 0;
    var besar = 0;
    var total = 0;
    var kategori = 0;

    if (!Array.isArray(data)) data = [];

    data.forEach(function (group) {
      if (
        !group ||
        !Array.isArray(group.items)
      ) {
        return;
      }

      var count = 0;

      group.items.forEach(function (item) {
        if (!isVisible(item)) return;

        if (
          state.bag !== "semua" &&
          (!item || item.bag !== state.bag)
        ) {
          return;
        }

        count++;
        total++;

        if (item && item.bag === "kecil") {
          kecil++;
        } else {
          besar++;
        }
      });

      if (count) kategori++;
    });

    function set(selector, value) {
      var el = document.querySelector(selector);
      if (el) el.textContent = value;
    }

    set("[data-sum-kategori]", kategori);
    set("[data-sum-total]", total);
    set("[data-sum-kecil]", kecil);
    set("[data-sum-besar]", besar);
  }

  // =========================================================
  // CURRENT LABEL
  // =========================================================

  function updateCurrentLabel() {
    var el = document.querySelector("[data-current-label]");
    if (!el) return;

    var gender = state.gender === "wanita" ? "Wanita" : "Pria";

    if (state.jenis !== "haji") {
      el.textContent = gender;
      return;
    }

    el.textContent =
      gender +
      " · Gelombang " +
      state.wave;
  }

  // =========================================================
  // ACTIVE BUTTON
  // =========================================================

  function updateActiveButtons() {
    document
      .querySelectorAll("[data-gender-btn]")
      .forEach(function (b) {
        b.classList.toggle(
          "active",
          b.dataset.genderBtn === state.gender
        );
      });

    document
      .querySelectorAll("[data-wave-btn]")
      .forEach(function (b) {
        b.classList.toggle(
          "active",
          b.dataset.waveBtn === state.wave
        );
      });

    var select = document.querySelector("[data-bag-filter]");
    var valueEl = document.querySelector("[data-bag-filter-value]");
    var menu = document.querySelector("[data-bag-filter-menu]");

    var labels = {
      semua: "Semua tas & koper",
      kecil: "Tas kecil / kabin",
      besar: "Koper besar / bagasi"
    };

    if (select) select.value = state.bag;

    if (valueEl) {
      valueEl.textContent = labels[state.bag] || labels.semua;
    }

    if (menu) {
      menu
        .querySelectorAll("[data-bag-option]")
        .forEach(function (option) {
          var active =
            option.dataset.bagOption === state.bag;

          option.classList.toggle("active", active);
          option.setAttribute(
            "aria-selected",
            active ? "true" : "false"
          );
        });
    }
  }

  // =========================================================
  // WAVE INFO
  // =========================================================

  function updateWaveInfo() {
    var el = document.querySelector("[data-wave-info]");

    if (
      !el ||
      !window.HCChecklistData ||
      !window.HCChecklistData.waveInfo
    ) {
      return;
    }

    el.innerHTML =
      '<i class="bi bi-lightbulb"></i>' +
      "<div>" +
      (window.HCChecklistData.waveInfo[state.wave] || "") +
      "</div>";
  }

  // =========================================================
  // RENDER ULANG
  // =========================================================

  function renderAll() {
    var container = document.querySelector("[data-checklist]");

    if (
      !container ||
      !window.HCChecklistData
    ) {
      return;
    }

    bindChecklistEvents(container);
    updateActiveButtons();
    updateWaveInfo();
    render(container);
  }

  // =========================================================
  // CUSTOM BAG FILTER
  // =========================================================

  function bindBagFilter() {
    var wrapper = document.querySelector("[data-bag-select]");
    var trigger = document.querySelector("[data-bag-filter-button]");
    var menu = document.querySelector("[data-bag-filter-menu]");
    var select = document.querySelector("[data-bag-filter]");

    if (
      !wrapper ||
      !trigger ||
      !menu ||
      !select ||
      wrapper.__hcBagEventsBound
    ) {
      return;
    }

    wrapper.__hcBagEventsBound = true;

    function closeMenu() {
      wrapper.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", function (event) {
      event.preventDefault();

      var open = wrapper.classList.toggle("is-open");

      trigger.setAttribute(
        "aria-expanded",
        open ? "true" : "false"
      );
    });

    menu
      .querySelectorAll("[data-bag-option]")
      .forEach(function (option) {
        option.addEventListener("click", function () {
          var value = option.dataset.bagOption;
          if (!value) return;

          state.bag = value;
          select.value = value;
          closeMenu();
          renderAll();
        });
      });

    document.addEventListener("click", function (event) {
      if (!wrapper.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
        trigger.focus();
      }
    });
  }

  // =========================================================
  // BUKA / TUTUP SEMUA
  // =========================================================

  function bindExpandAll() {
    var btn = document.querySelector("[data-expand-all]");

    if (!btn || btn.__hcExpandEventsBound) return;

    btn.__hcExpandEventsBound = true;

    btn.addEventListener("click", function () {
      var cards = document.querySelectorAll(".hc-category-card");

      var shouldOpen = false;

      for (var i = 0; i < cards.length; i++) {
        if (!cards[i].classList.contains("is-open")) {
          shouldOpen = true;
          break;
        }
      }

      cards.forEach(function (card) {
        var key = card.getAttribute("data-category-key");
        var toggle = card.querySelector("[data-category-toggle]");
        var body = card.querySelector(".hc-category-body");

        card.classList.toggle("is-open", shouldOpen);

        if (toggle) {
          toggle.setAttribute(
            "aria-expanded",
            shouldOpen ? "true" : "false"
          );
        }

        if (body) {
          if (shouldOpen) {
            body.removeAttribute("hidden");
          } else {
            body.setAttribute("hidden", "");
          }
        }

        state.open[key] = shouldOpen;
      });

      btn.setAttribute(
        "aria-label",
        shouldOpen ? "Tutup semua kategori" : "Buka semua kategori"
      );

      btn.innerHTML = shouldOpen
        ? '<i class="bi bi-arrows-collapse"></i><span class="hc-expand-label">Tutup semua</span>'
        : '<i class="bi bi-arrows-expand"></i><span class="hc-expand-label">Buka semua</span>';
    });
  }

  // =========================================================
  // INITIALIZE
  // =========================================================

  function renderChecklist(jenis) {
    state.jenis = jenis === "umrah" ? "umrah" : "haji";

    loadCheckedItems();

    // -------------------------------------------------------
    // GENDER
    // -------------------------------------------------------

    document
      .querySelectorAll("[data-gender-btn]")
      .forEach(function (btn) {
        if (btn.__hcGenderEventsBound) return;

        btn.__hcGenderEventsBound = true;

        btn.addEventListener("click", function () {
          state.gender = btn.dataset.genderBtn;
          state.open = {};
          renderAll();
        });
      });

    // -------------------------------------------------------
    // WAVE
    // -------------------------------------------------------

    document
      .querySelectorAll("[data-wave-btn]")
      .forEach(function (btn) {
        if (btn.__hcWaveEventsBound) return;

        btn.__hcWaveEventsBound = true;

        btn.addEventListener("click", function () {
          state.wave = btn.dataset.waveBtn;
          renderAll();
        });
      });

    bindBagFilter();
    bindExpandAll();
    renderAll();
  }

  // =========================================================
  // PUBLIC FUNCTION
  // =========================================================

  window.renderChecklist = renderChecklist;
})();
