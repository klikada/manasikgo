// Halaman Kumpulan Doa (doa.html) — tab per ibadah (Tawaf, Sa'i, Arafah,
// dst) diambil dari DoaStaticData.kategori. Tab bertipe "putaran" (mis.
// Tawaf, Sa'i) dirender sebagai alur baca per putaran dengan indikator
// angka + garis penghubung sticky di bawah tab, dan tombol "Lanjut" di
// akhir halaman (tidak sticky, supaya tidak gampang kepencet tanpa
// sengaja). Tab bertipe "list" (mis. Arafah) dirender sebagai daftar
// kartu doa dengan filter kategori (dropdown + chip, chip disembunyikan
// di mobile).
// Semua isi bacaan (arab/latin/arti) STATIS, diambil dari
// assets/js/doa-data.js (wajib dimuat SEBELUM file ini di HTML). Sistem
// dinamis lama (Google Sheets DoaKategori/DoaPutaran/DoaList + endpoint
// Apps Script doakategori/doaputaran/doalist) sudah dihapus — untuk
// mengubah isi doa, edit langsung assets/js/doa-data.js lalu deploy
// ulang (lihat PANDUAN_DOA_BARU.md).

const DOA_PROGRESS_PREFIX = "hc-doa-progress:";

// Listener dropdown kategori (mode "list") aktif hanya satu per waktu —
// dibersihkan tiap kali render ulang/ganti tab supaya tidak menumpuk
// event listener di document tiap kali orang pindah-pindah kategori.
let doaActiveDropdownCleanup = null;
const doaClearActiveDropdownCleanup = () => {
  if (doaActiveDropdownCleanup) {
    doaActiveDropdownCleanup();
    doaActiveDropdownCleanup = null;
  }
};

// === Offset sticky di bawah navbar ===================================
// Navbar ManasikGo selalu fixed-top (lihat .site-header.fixed-top di
// navbar.js), jadi elemen sticky di halaman ini (indikator putaran &
// dropdown filter kategori) perlu tahu tinggi navbar yang sebenarnya
// supaya saat discroll, elemen itu berhenti tepat DI BAWAH navbar, bukan
// tertutup/terpotong olehnya. Diukur langsung dari DOM (bukan angka
// hardcode) karena tinggi navbar bisa beda antar breakpoint.
const syncDoaStickyOffset = () => {
  const header = document.querySelector(".site-header");
  const h = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
  if (h > 0) {
    document.documentElement.style.setProperty("--hc-header-h", `${h}px`);
  }
};

// === Auto-scroll ke atas konten (dipakai tombol Lanjut, jump select, ===
// === ganti kategori/filter, dll) =====================================
// container.scrollIntoView({block:"start"}) TIDAK cukup di sini: itu
// menaruh bagian paling atas konten persis di y=0 viewport, padahal
// navbar situs selalu fixed-top, jadi judul kartu doa yang seharusnya
// jadi baris pertama malah tertutup navbar (kepotong). Fungsi ini
// menghitung posisi scroll manual yang mengurangi tinggi navbar
// (--hc-header-h, sudah disinkron lewat syncDoaStickyOffset) ditambah
// sedikit jarak napas, supaya bagian atas konten (indikator putaran /
// judul kartu doa) selalu tampil utuh tepat di bawah navbar — bukan
// terpotong olehnya.
const DOA_SCROLL_EXTRA_GAP = 12;
const doaScrollToTop = (container) => {
  if (!container) return;
  // requestAnimationFrame: tunggu satu frame supaya browser sempat
  // reflow dulu (konten/tinggi indikator baru saja berubah lewat
  // innerHTML) sebelum posisi scroll dihitung dari getBoundingClientRect.
  requestAnimationFrame(() => {
    const headerH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--hc-header-h",
        ),
      ) || 0;
    const rect = container.getBoundingClientRect();
    const targetY =
      window.scrollY + rect.top - headerH - DOA_SCROLL_EXTRA_GAP;
    window.scrollTo({ top: Math.max(targetY, 0), behavior: "smooth" });
  });
};

const doaLoadProgress = (kategori) => {
  try {
    const raw = localStorage.getItem(DOA_PROGRESS_PREFIX + kategori);
    if (!raw) return { current: 1, done: [] };
    const parsed = JSON.parse(raw);
    return {
      current: Number(parsed.current) || 1,
      done: Array.isArray(parsed.done) ? parsed.done : [],
    };
  } catch (error) {
    return { current: 1, done: [] };
  }
};

const doaSaveProgress = (kategori, progress) => {
  try {
    localStorage.setItem(
      DOA_PROGRESS_PREFIX + kategori,
      JSON.stringify(progress),
    );
  } catch (error) {
    /* localStorage tidak tersedia — abaikan, cukup tidak persist. */
  }
};

// Kartu bacaan doa. Field opsional `sumber` menampilkan baris rujukan
// (mis. "Al-Qur'an — QS. Al-Baqarah: 201" atau "HR. Bukhari no. 123") di
// bagian bawah kartu, dipisah garis tipis dari teks arti. Field opsional
// `variant: "sunnah"` menambahkan class `doa-card-sunnah` supaya kartu
// tampil dengan aksen warna kuning (dipakai mis. untuk doa sunnah
// tambahan di akhir putaran tawaf).
const doaCardHtml = (item) => `
  <div class="doa-card${item.variant === "sunnah" ? " doa-card-sunnah" : ""} fade-up"${item.id ? ` id="${item.id}"` : ""}>
    ${item.variant === "sunnah" ? `<div class="doa-card-badge"><i class="bi bi-stars"></i> Doa Sunnah</div>` : ""}
    ${item.label ? `<div class="doa-card-label">${item.label}</div>` : ""}
    ${item.keterangan ? `<p class="doa-card-note">${item.keterangan}</p>` : ""}
    ${item.arab ? `<p class="doa-card-arab" lang="ar" dir="rtl">${item.arab}</p>` : ""}
    ${item.latin ? `<p class="doa-card-latin">${item.latin}</p>` : ""}
    ${item.arti ? `<p class="doa-card-arti">${item.arti}</p>` : ""}
    ${item.status ? `<div class="doa-card-status"><i class="bi bi-patch-check"></i> Status: ${item.status}</div>` : ""}
    ${item.sumber ? `<div class="doa-card-source"><i class="bi bi-book"></i> Sumber: ${item.sumber}</div>` : ""}
  </div>
`;

// === Mode "putaran" (mis. Tawaf, Sa'i) ==============================

// Sa'i (dan ibadah "putaran" lain yang belum sempat dipindah datanya ke
// sheet DoaPutaran) masih tersimpan di sheet DoaList dengan kategori_doa
// berpola "Putaran 1".."Putaran 7". Supaya tidak perlu susun ulang sheet,
// kalau DoaPutaran kosong untuk kategori ini, kita susun otomatis dari
// data DoaList tersebut menjadi bentuk yang sama seperti DoaPutaran.
// Baris yang kategori_doa-nya TIDAK berpola "Putaran N" (mis. "Doa
// Tambahan") TIDAK ikut dihitung sebagai putaran tambahan (mis. Sa'i harus
// tetap 7 putaran, bukan 8) — melainkan dikelompokkan per label
// kategori_doa-nya masing-masing sebagai "kategori tambahan" yang bisa
// dipilih lewat dropdown terpisah dari alur putaran.
const putaranFromListRows = (listRows) => {
  const groups = new Map();
  const extraGroups = new Map();
  listRows.forEach((row) => {
    const match = String(row.kategori_doa || "").match(/putaran\s*(\d+)/i);
    if (match) {
      const num = Number(match[1]);
      if (!groups.has(num)) groups.set(num, []);
      groups.get(num).push(row);
    } else {
      const label = String(row.kategori_doa || "").trim() || "Doa Tambahan";
      if (!extraGroups.has(label)) extraGroups.set(label, []);
      extraGroups.get(label).push(row);
    }
  });
  const putaranNums = [...groups.keys()].sort((a, b) => a - b);
  const rows = [];
  putaranNums.forEach((num) => {
    groups.get(num).forEach((r, i) => {
      rows.push({
        putaran: num,
        urutan: i + 1,
        judul_bagian: r.judul,
        keterangan: r.keterangan,
        arab: r.arab,
        latin: r.latin,
        arti: r.arti,
      });
    });
  });
  // Setiap label kategori_doa non-putaran (mis. "Doa Tambahan") jadi 1
  // kategori tersendiri yang dipilih lewat dropdown, bukan putaran ke-8.
  const extras = [...extraGroups.entries()].map(([label, groupRows]) => ({
    label,
    items: groupRows.map((r) => ({
      label: r.judul,
      keterangan: r.keterangan,
      arab: r.arab,
      latin: r.latin,
      arti: r.arti,
    })),
  }));
  return { rows, extras };
};

// Deteksi otomatis: kalau kategori bertipe "list" di sheet DoaKategori
// tapi datanya di sheet DoaList ternyata berpola "Putaran 1", "Putaran 2",
// dst pada kolom kategori_doa (kasus Sa'i sebelum kolom `tipe`-nya sempat
// diubah manual jadi "putaran"), tetap tampilkan sebagai mode putaran
// seperti Tawaf — tidak perlu menunggu sheet diubah.
const looksLikePutaranList = (listRows) => {
  if (!listRows.length) return false;
  const matching = listRows.filter((r) =>
    /putaran\s*\d+/i.test(String(r.kategori_doa || "")),
  ).length;
  return matching / listRows.length >= 0.5;
};

const renderPutaranMode = async (container, kategoriNama) => {
  doaClearActiveDropdownCleanup();
  container.innerHTML = '<div class="skeleton"></div>';
  let rows = getDoaPutaranStatic(kategoriNama);
  let extras = [];
  if (!rows.length) {
    const listRows = getDoaListStatic(kategoriNama);
    const parsed = putaranFromListRows(listRows);
    rows = parsed.rows;
    extras = parsed.extras;
  }
  if (!rows.length && !extras.length) {
    container.innerHTML = `<div class="doa-empty">Bacaan untuk "${kategoriNama}" belum tersedia. Silakan lengkapi di assets/js/doa-data.js.</div>`;
    return;
  }

  // totalPutaran HANYA dihitung dari baris berpola "Putaran N" — kategori
  // tambahan (mis. "Doa Tambahan") tidak menambah jumlah putaran.
  const totalPutaran = rows.length
    ? Math.max(...rows.map((r) => Number(r.putaran) || 1))
    : 0;
  let progress = doaLoadProgress(kategoriNama);
  if (progress.current > totalPutaran) {
    progress.current = Math.max(totalPutaran, 1);
  }
  // extraView: null = sedang di alur putaran; angka = index kategori
  // tambahan (mis. "Doa Tambahan") yang sedang dipilih lewat dropdown.
  // Kalau kategori ini murni berisi kategori tambahan tanpa putaran sama
  // sekali, langsung tampilkan kategori tambahan pertama.
  let extraView = totalPutaran === 0 && extras.length ? 0 : null;

  const renderIndicator = () => {
    const dots = [];
    for (let p = 1; p <= totalPutaran; p++) {
      const isDone = progress.done.includes(p);
      const isCurrent = extraView === null && p === progress.current;
      // Garis penghubung menuju nomor berikutnya "terisi" kalau putaran ini
      // sudah dilewati, supaya alur urutannya kelihatan jelas.
      const lineDone = isDone;
      dots.push(`
        <div class="doa-putaran-step">
          <div class="doa-putaran-dot${isDone ? " is-done" : ""}${isCurrent ? " is-current" : ""}"
               aria-current="${isCurrent ? "true" : "false"}"
               aria-label="Putaran ke-${p}${isDone ? ", sudah dibaca" : ""}">
            <span class="doa-putaran-dot-num">${p}</span>
            <i class="bi bi-check-lg doa-putaran-dot-check"></i>
          </div>
          ${p < totalPutaran ? `<div class="doa-putaran-line${lineDone ? " is-done" : ""}"></div>` : ""}
        </div>
      `);
    }
    return dots.join("");
  };

  const renderJumpSelect = () => `
    <select class="form-select form-select-sm doa-putaran-jump" data-doa-jump aria-label="Lompat ke putaran">
      ${Array.from({ length: totalPutaran }, (_, i) => i + 1)
        .map(
          (p) =>
            `<option value="${p}" ${p === progress.current ? "selected" : ""}>Putaran ${p}</option>`,
        )
        .join("")}
    </select>
  `;

  // Dropdown pemilihan kategori: "Alur Putaran" (kalau ada) + tiap
  // kategori tambahan (mis. "Doa Tambahan") sebagai opsi terpisah, supaya
  // kategori tambahan tidak lagi dipaksakan jadi "putaran ke-8".
  const renderCategorySelect = () => {
    if (!extras.length) return "";
    const options = [
      totalPutaran > 0
        ? `<option value="putaran" ${extraView === null ? "selected" : ""}>Alur Putaran (1–${totalPutaran})</option>`
        : "",
      ...extras.map(
        (ex, i) =>
          `<option value="extra-${i}" ${extraView === i ? "selected" : ""}>${ex.label}</option>`,
      ),
    ].join("");
    return `
      <select class="form-select form-select-sm doa-kategori-select" data-doa-kategori-select aria-label="Pilih kategori doa">
        ${options}
      </select>
    `;
  };

  const renderIndicatorBlock = ({ showReset = false } = {}) => {
    const labelText = showReset
      ? `Semua ${totalPutaran} putaran sudah dibaca`
      : extraView === null
        ? totalPutaran > 0
          ? `Putaran ke-${progress.current} dari ${totalPutaran}`
          : "Doa Tambahan"
        : extras[extraView].label;
    return `
      <div class="doa-putaran-indicator">
        <div class="doa-putaran-indicator-label">
          <span>${labelText}</span>
          <div class="doa-putaran-indicator-controls">
            ${renderCategorySelect()}
            ${extraView === null && totalPutaran > 0 && !showReset ? renderJumpSelect() : ""}
            ${showReset ? `<button type="button" class="btn btn-link btn-sm p-0" data-doa-reset>Ulangi dari awal</button>` : ""}
          </div>
        </div>
        ${
          // Indikator angka putaran cuma relevan saat sedang di alur
          // putaran — disembunyikan saat kategori tambahan (mis. "Doa
          // Tambahan") sedang dipilih, karena tidak ada progres putaran
          // di kategori tambahan itu.
          totalPutaran > 0 && extraView === null
            ? `<div class="doa-putaran-indicator-inner" role="list" aria-label="Progres putaran ${kategoriNama}">
                ${renderIndicator()}
              </div>`
            : ""
        }
      </div>
    `;
  };

  const renderPutaranBody = () => {
    const segments = rows
      .filter((r) => Number(r.putaran) === progress.current)
      .sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0));
    const isLast = progress.current === totalPutaran;
    return `
      <div data-doa-putaran-body>
        ${segments.map((s) => doaCardHtml({
          label: s.judul_bagian,
          keterangan: s.keterangan,
          arab: s.arab,
          latin: s.latin,
          arti: s.arti,
          sumber: s.sumber,
          variant: s.variant,
        })).join("")}
        <div class="doa-lanjut-wrap">
          <button type="button" class="btn btn-primary btn-lg doa-lanjut-btn" data-doa-lanjut>
            ${isLast ? "Selesai — Tandai Putaran Ini Selesai" : `Lanjut ke Putaran ${progress.current + 1}`}
          </button>
          <p class="doa-lanjut-hint">Klik tombol diatas ini untuk melanjutkan putaran</p>
        </div>
      </div>
    `;
  };

  // Konten kategori tambahan (mis. "Doa Tambahan"): daftar kartu doa biasa
  // tanpa mempengaruhi progres/indikator putaran, dengan tombol untuk
  // kembali ke alur putaran (kalau kategori ini memang punya alur putaran).
  const renderExtraBody = (index) => {
    const group = extras[index];
    const cardsHtml = group.items.length
      ? group.items.map((it) => doaCardHtml(it)).join("")
      : '<div class="doa-empty">Belum ada doa pada kategori ini.</div>';
    return `
      <div data-doa-putaran-body>
        <div class="doa-extra-cards">${cardsHtml}</div>
        ${
          totalPutaran > 0
            ? `<div class="doa-lanjut-wrap">
                <button type="button" class="btn btn-outline-primary btn-lg" data-doa-kembali>
                  <i class="bi bi-arrow-left me-1"></i>Kembali ke Alur Putaran
                </button>
              </div>`
            : ""
        }
      </div>
    `;
  };

  const renderAll = () => {
    const finished = totalPutaran > 0 && progress.done.length >= totalPutaran;
    if (extraView === null && finished) {
      container.innerHTML = `
        ${renderIndicatorBlock({ showReset: true })}
        <div class="surface doa-selesai-banner">
          <i class="bi bi-check-circle"></i>
          <h3 class="h5 fw-bold mt-3">${kategoriNama} ${totalPutaran} Putaran Selesai</h3>
          <p class="lead-muted mb-3">Semua bacaan tiap putaran sudah kamu lewati. Kamu bisa mengulang dari putaran pertama kapan saja.</p>
        </div>
      `;
    } else if (extraView !== null) {
      container.innerHTML = `${renderIndicatorBlock()}${renderExtraBody(extraView)}`;
    } else {
      container.innerHTML = `${renderIndicatorBlock()}${renderPutaranBody()}`;
    }
    HCUtils?.initAnimations?.();
    attachHandlers();
  };

  const attachHandlers = () => {
    const resetBtn = container.querySelector("[data-doa-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        progress = { current: 1, done: [] };
        doaSaveProgress(kategoriNama, progress);
        renderAll();
        doaScrollToTop(container);
      });
    }
    const lanjutBtn = container.querySelector("[data-doa-lanjut]");
    if (lanjutBtn) {
      lanjutBtn.addEventListener("click", () => {
        // Menandai putaran saat ini sebagai sudah dibaca/dilewati (baik
        // benar-benar dibaca detail maupun sekadar dilewati) — sesuai
        // permintaan, indikator berubah begitu orang menekan Lanjut.
        if (!progress.done.includes(progress.current)) {
          progress.done.push(progress.current);
        }
        if (progress.current < totalPutaran) {
          progress.current += 1;
        }
        doaSaveProgress(kategoriNama, progress);
        renderAll();
        doaScrollToTop(container);
      });
    }
    const jumpSelect = container.querySelector("[data-doa-jump]");
    if (jumpSelect) {
      jumpSelect.addEventListener("change", () => {
        const target = Number(jumpSelect.value);
        if (target >= 1 && target <= totalPutaran) {
          // Lompat langsung ke putaran pilihan tanpa mengubah status
          // "sudah dibaca" — murni navigasi cepat, beda dari tombol Lanjut.
          progress.current = target;
          doaSaveProgress(kategoriNama, progress);
          renderAll();
          doaScrollToTop(container);
        }
      });
    }
    const kategoriSelect = container.querySelector("[data-doa-kategori-select]");
    if (kategoriSelect) {
      kategoriSelect.addEventListener("change", () => {
        const val = kategoriSelect.value;
        extraView = val === "putaran" ? null : Number(val.replace("extra-", ""));
        renderAll();
        doaScrollToTop(container);
      });
    }
    const kembaliBtn = container.querySelector("[data-doa-kembali]");
    if (kembaliBtn) {
      kembaliBtn.addEventListener("click", () => {
        extraView = null;
        renderAll();  
        doaScrollToTop(container);
      });
    }
  };

  renderAll();
};


// === Mode khusus "Doa Umum" ========================================
// Alur: pilih subkategori utama -> cari/filter subkategori -> baca doa.
// Data doa TIDAK diubah; yang diatur di sini hanya pengelompokan tampilannya.
const renderUmumMode = async (container) => {
  doaClearActiveDropdownCleanup();
  container.innerHTML = '<div class="skeleton"></div>';

  const allRows = getDoaListStatic("Umum");
  if (!allRows.length) {
    container.innerHTML =
      '<div class="doa-empty">Doa umum belum tersedia. Silakan lengkapi assets/js/doa-data.js.</div>';
    return;
  }

  const groups = [
    {
      id: "sebelum-berangkat",
      icon: "bi bi-airplane",
      title: "Sebelum Berangkat",
      description: "Doa sebelum memulai perjalanan ibadah.",
      categories: [
        "Sebelum Berangkat",
        "Titip Keluarga",
        "Yang Pergi Supaya Kembali Lagi",
        "Keluar Rumah",
      ],
    },
    {
      id: "dalam-perjalanan",
      icon: "bi bi-signpost-2",
      title: "Dalam Perjalanan",
      description: "Doa saat kendaraan dan perjalanan menuju tujuan.",
      categories: [
        "Setelah Duduk Di Kendaraan",
        "Kendaraan Mulai Bergerak",
        "Tiba Di Tempat Tujuan",
      ],
    },
    {
      id: "di-makkah",
      icon: "bi bi-square-fill",
      title: "Di Makkah",
      description: "Doa ketika berada di Makkah dan sekitar Masjidil Haram.",
      categories: [
        "Memasuki Kota Makkah",
        "Masuk Masjidil Haram Di Makkah",
        "Ketika Melihat Ka’bah",
        "Melintasi Maqam Ibrahim",
        "Setelah Shalat Sunnat Di Belakang Maqam Ibrahim",
        "Melihat Jabal Rahmah",
      ],
    },
    {
      id: "di-madinah",
      icon: "bi bi-bank",
      title: "Di Madinah",
      description: "Doa ketika memasuki Madinah dan berziarah.",
      categories: [
        "Masuk Kota Madinah",
        "Masuk Masjid Nabawi",
        "Salam Ketika Berada Di Makam Rasulullah Saw",
        "Meninggalkan Madinah",
      ],
    },
    {
      id: "setelah-kembali",
      icon: "bi bi-house-door-fill",
      title: "Setelah Kembali",
      description: "Doa setelah tiba kembali di rumah.",
      categories: [
        "Tiba Di Kampung Halaman",
        "Setelah Sampai Di Depan Pintu Rumah",
      ],
    },
  ];

  const groupedIds = new Set(groups.flatMap((g) => g.categories));
  const otherRows = allRows.filter((r) => !groupedIds.has(r.kategori_doa));
  groups.push({
    id: "doa-lainnya",
    icon: "bi bi-journal-bookmark-fill",
    title: "Doa Lainnya",
    description: "Kumpulan doa lainnya untuk berbagai keperluan.",
    categories: [...new Set(otherRows.map((r) => r.kategori_doa).filter(Boolean))],
  });

  // >>> TAMBAHAN: breadcrumb di header (Beranda / Kumpulan Doa / Doa Umum)
  // diperpanjang jadi 4 tingkat begitu masuk ke salah satu card (mis.
  // "Sebelum Berangkat"), dan dikembalikan lagi ke 3 tingkat saat kembali
  // ke daftar card. Elemennya cuma ada di doa-umum.html
  // (#doaUmumBreadcrumb), jadi aman dipanggil di halaman lain — cukup
  // tidak melakukan apa-apa kalau elemennya tidak ditemukan.
  const updateDoaUmumBreadcrumb = (groupTitle) => {
    const breadcrumb = document.querySelector("#doaUmumBreadcrumb");
    if (!breadcrumb) return;
    breadcrumb.innerHTML = groupTitle
      ? `
        <li class="breadcrumb-item"><a href="index.html">Beranda</a></li>
        <li class="breadcrumb-item"><a href="doa.html">Kumpulan Doa</a></li>
        <li class="breadcrumb-item"><a href="doa-umum.html">Doa Umum</a></li>
        <li class="breadcrumb-item active" aria-current="page">${groupTitle}</li>
      `
      : `
        <li class="breadcrumb-item"><a href="index.html">Beranda</a></li>
        <li class="breadcrumb-item"><a href="doa.html">Kumpulan Doa</a></li>
        <li class="breadcrumb-item active" aria-current="page">Doa Umum</li>
      `;
  };
  // <<< TAMBAHAN

  const getRowsForGroup = (group) =>
    allRows.filter((row) => group.categories.includes(row.kategori_doa));

  const getSubcategory = (group, row) => row.kategori_doa;

  const renderCategoryCards = () => {
    updateDoaUmumBreadcrumb(null); // >>> TAMBAHAN
    container.innerHTML = `
      <div class="doa-umum-category-grid">
        ${groups
          .map(
            (group) => `
              <button type="button" class="doa-umum-category-card" data-doa-umum-group="${group.id}">
                <span class="doa-umum-category-icon" aria-hidden="true"><i class="${group.icon}"></i></span>
                <span class="doa-umum-category-body">
                  <strong>${group.title}</strong>
                  <small>${group.description}</small>
                  <span class="doa-umum-category-count">${getRowsForGroup(group).length} doa</span>
                </span>
                <i class="bi bi-chevron-right" aria-hidden="true"></i>
              </button>
            `,
          )
          .join("")}
      </div>
    `;

    container.querySelectorAll("[data-doa-umum-group]").forEach((button) => {
      button.addEventListener("click", () => {
        const group = groups.find(
          (item) => item.id === button.getAttribute("data-doa-umum-group"),
        );
        if (!group) return;
        history.replaceState(null, "", `#${group.id}`);
        renderGroup(group);
        doaScrollToTop(container);
      });
    });
    HCUtils?.initAnimations?.();
  };

  const renderGroup = (group) => {
    doaClearActiveDropdownCleanup();

    const groupRows = getRowsForGroup(group);
    const subcategoryList = [
      ...new Set(groupRows.map((r) => getSubcategory(group, r)).filter(Boolean)),
    ];

    // Filter kategori dipakai lewat dropdown custom (sama seperti mode
    // "list" di Doa Arafah/Sa'i) supaya perilaku & tampilannya konsisten
    // di semua halaman doa, termasuk di layar mobile.
    const render = (activeFilter) => {
      updateDoaUmumBreadcrumb(group.title); // >>> TAMBAHAN
      const filtered = activeFilter
        ? groupRows.filter((row) => getSubcategory(group, row) === activeFilter)
        : groupRows;

      const cardsHtml = filtered.length
        ? filtered
            .map((doa) =>
              doaCardHtml({
                id: doa.id,
                label: doa.judul,
                keterangan: doa.keterangan,
                arab: doa.arab,
                latin: doa.latin,
                arti: doa.arti,
                sumber: doa.sumber,
              }),
            )
            .join("")
        : '<div class="doa-empty">Tidak ada doa pada kategori ini.</div>';

      const activeLabel = activeFilter || "Semua Doa";

      container.innerHTML = `
            <div class="doa-umum-title">
              <span class="doa-umum-title-icon" aria-hidden="true"><i class="${group.icon}"></i></span>
              <div>
                <h2 class="h4 fw-bold mb-1">Doa ${group.title.replace(/^Doa /, "")}</h2>
                <p class="lead-muted mb-0">${group.description}</p>
              </div>
            </div>
          </div>

          <div class="doa-list-filter">
            <div class="doa-filter-dropdown" data-doa-filter-dropdown>
              <button type="button" class="doa-filter-toggle" data-doa-filter-toggle
                      aria-haspopup="listbox" aria-expanded="false">
                <span data-doa-filter-toggle-label>${activeLabel}</span>
                <i class="bi bi-chevron-down"></i>
              </button>
              <div class="doa-filter-menu" data-doa-filter-menu role="listbox"
                   aria-label="Filter kategori doa" hidden>
                <button type="button"
                        class="doa-filter-option doa-filter-option-all${!activeFilter ? " active" : ""}"
                        data-doa-filter-option="" role="option" aria-selected="${!activeFilter}">
                  Semua Doa
                </button>
                ${subcategoryList
                  .map(
                    (k) =>
                      `<button type="button" class="doa-filter-option${k === activeFilter ? " active" : ""}"
                               data-doa-filter-option="${k}" role="option" aria-selected="${k === activeFilter}">${k}</button>`,
                  )
                  .join("")}
              </div>
            </div>
            ${
              subcategoryList.length
                ? `<div class="doa-list-chips">
                    <button type="button" class="doa-list-chip${!activeFilter ? " active" : ""}" data-doa-chip="">Semua</button>
                    ${subcategoryList
                      .map(
                        (k) =>
                          `<button type="button" class="doa-list-chip${k === activeFilter ? " active" : ""}" data-doa-chip="${k}">${k}</button>`,
                      )
                      .join("")}
                  </div>`
                : ""
            }
          </div>

          <div data-doa-umum-results>${cardsHtml}</div>
        </div>
      `;
      HCUtils?.initAnimations?.();

      const dropdown = container.querySelector("[data-doa-filter-dropdown]");
      const toggle = container.querySelector("[data-doa-filter-toggle]");
      const menu = container.querySelector("[data-doa-filter-menu]");

      const closeMenu = () => {
        if (!menu || menu.hidden) return;
        menu.hidden = true;
        dropdown.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      };
      const openMenu = () => {
        menu.hidden = false;
        dropdown.classList.add("open");
        toggle.setAttribute("aria-expanded", "true");
      };

      toggle?.addEventListener("click", (event) => {
        event.stopPropagation();
        if (menu.hidden) openMenu();
        else closeMenu();
      });
      container.querySelectorAll("[data-doa-filter-option]").forEach((opt) => {
        opt.addEventListener("click", () => {
          render(opt.getAttribute("data-doa-filter-option") || "");
          doaScrollToTop(container);
        });
      });

      // Tutup dropdown saat klik di luar area atau tekan Esc — sama
      // seperti mode "list" (Arafah/Sa'i).
      doaClearActiveDropdownCleanup();
      const onDocClick = (event) => {
        const liveDropdown = container.querySelector("[data-doa-filter-dropdown]");
        if (liveDropdown && !liveDropdown.contains(event.target)) {
          const liveMenu = liveDropdown.querySelector("[data-doa-filter-menu]");
          const liveToggle = liveDropdown.querySelector("[data-doa-filter-toggle]");
          if (liveMenu && !liveMenu.hidden) {
            liveMenu.hidden = true;
            liveDropdown.classList.remove("open");
            liveToggle?.setAttribute("aria-expanded", "false");
          }
        }
      };
      const onKeydown = (event) => {
        if (event.key === "Escape") closeMenu();
      };
      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onKeydown);
      doaActiveDropdownCleanup = () => {
        document.removeEventListener("click", onDocClick);
        document.removeEventListener("keydown", onKeydown);
      };

      container.querySelectorAll("[data-doa-chip]").forEach((chip) => {
        chip.addEventListener("click", () => {
          render(chip.getAttribute("data-doa-chip") || "");
          doaScrollToTop(container);
        });
      });

      container.querySelector("[data-doa-umum-back]")?.addEventListener("click", () => {
        history.replaceState(null, "", "#");
        renderCategoryCards();
        doaScrollToTop(container);
      });
    };

    render("");
  };

  const hash = decodeURIComponent(location.hash.replace(/^#/, "")).toLowerCase();
  const selectedGroup = groups.find((group) => group.id === hash);
  if (selectedGroup) renderGroup(selectedGroup);
  else renderCategoryCards();
};

// === Mode "list" (mis. Sa'i, Arafah) ================================

const renderListMode = async (container, kategoriNama) => {
  doaClearActiveDropdownCleanup();
  container.innerHTML = '<div class="skeleton"></div>';
  const allRows = getDoaListStatic(kategoriNama);
  if (!allRows.length) {
    container.innerHTML = `<div class="doa-empty">Doa untuk "${kategoriNama}" belum tersedia. Silakan lengkapi di assets/js/doa-data.js.</div>`;
    return;
  }

  const kategoriDoaList = [
    ...new Set(allRows.map((r) => r.kategori_doa).filter(Boolean)),
  ];

  // Dropdown kategori dibuat custom (bukan <select> asli) supaya bisa
  // ditata 2 kolom di layar mobile ketika daftar kategorinya panjang
  // (mis. Arafah) — <select> bawaan browser tidak bisa diatur jadi
  // multi-kolom lewat CSS.
  const renderCards = (activeFilter) => {
    const filtered = activeFilter
      ? allRows.filter((r) => r.kategori_doa === activeFilter)
      : allRows;
    const cardsHtml = filtered.length
      ? filtered
          .map((doa) =>
            doaCardHtml({
              id: doa.id,
              label: doa.judul,
              arab: doa.arab,
              latin: doa.latin,
              arti: doa.arti,
              sumber: doa.sumber,
            }),
          )
          .join("")
      : '<div class="doa-empty">Tidak ada doa pada kategori ini.</div>';

    const activeLabel = activeFilter || "Semua kategori doa";

    container.innerHTML = `
      <div class="doa-list-filter">
        <div class="doa-filter-dropdown" data-doa-filter-dropdown>
          <button type="button" class="doa-filter-toggle" data-doa-filter-toggle
                  aria-haspopup="listbox" aria-expanded="false">
            <span data-doa-filter-toggle-label>${activeLabel}</span>
            <i class="bi bi-chevron-down"></i>
          </button>
          <div class="doa-filter-menu" data-doa-filter-menu role="listbox"
               aria-label="Filter kategori doa" hidden>
            <button type="button"
                    class="doa-filter-option doa-filter-option-all${!activeFilter ? " active" : ""}"
                    data-doa-filter-option="" role="option" aria-selected="${!activeFilter}">
              Semua kategori doa
            </button>
            ${kategoriDoaList
              .map(
                (k) =>
                  `<button type="button" class="doa-filter-option${k === activeFilter ? " active" : ""}"
                           data-doa-filter-option="${k}" role="option" aria-selected="${k === activeFilter}">${k}</button>`,
              )
              .join("")}
          </div>
        </div>
        ${
          kategoriDoaList.length
            ? `<div class="doa-list-chips">
                <button type="button" class="doa-list-chip${!activeFilter ? " active" : ""}" data-doa-chip="">Semua</button>
                ${kategoriDoaList
                  .map(
                    (k) =>
                      `<button type="button" class="doa-list-chip${k === activeFilter ? " active" : ""}" data-doa-chip="${k}">${k}</button>`,
                  )
                  .join("")}
              </div>`
            : ""
        }
      </div>
      <div data-doa-list-cards>${cardsHtml}</div>
    `;
    HCUtils?.initAnimations?.();

    const dropdown = container.querySelector("[data-doa-filter-dropdown]");
    const toggle = container.querySelector("[data-doa-filter-toggle]");
    const menu = container.querySelector("[data-doa-filter-menu]");

    const closeMenu = () => {
      if (!menu || menu.hidden) return;
      menu.hidden = true;
      dropdown.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };
    const openMenu = () => {
      menu.hidden = false;
      dropdown.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    };

    toggle?.addEventListener("click", (event) => {
      event.stopPropagation();
      if (menu.hidden) openMenu();
      else closeMenu();
    });
    container.querySelectorAll("[data-doa-filter-option]").forEach((opt) => {
      opt.addEventListener("click", () => {
        renderCards(opt.getAttribute("data-doa-filter-option") || "");
        // Auto-scroll ke atas konten tiap ganti kategori, supaya orang
        // langsung lihat kartu doa yang baru tanpa harus scroll manual
        // dari posisi yang mungkin sudah jauh ke bawah.
        doaScrollToTop(container);
      });
    });

    // Tutup dropdown saat klik di luar area atau tekan Esc. Listener ini
    // dipasang di document (bukan cuma di dalam dropdown) supaya klik di
    // mana pun pada halaman ikut menutupnya — dibersihkan lewat
    // doaActiveDropdownCleanup tiap kali render ulang/ganti tab.
    doaClearActiveDropdownCleanup();
    const onDocClick = (event) => {
      const liveDropdown = container.querySelector("[data-doa-filter-dropdown]");
      if (liveDropdown && !liveDropdown.contains(event.target)) {
        const liveMenu = liveDropdown.querySelector("[data-doa-filter-menu]");
        const liveToggle = liveDropdown.querySelector("[data-doa-filter-toggle]");
        if (liveMenu && !liveMenu.hidden) {
          liveMenu.hidden = true;
          liveDropdown.classList.remove("open");
          liveToggle?.setAttribute("aria-expanded", "false");
        }
      }
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKeydown);
    doaActiveDropdownCleanup = () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKeydown);
    };

    container.querySelectorAll("[data-doa-chip]").forEach((chip) => {
      chip.addEventListener("click", () => {
        renderCards(chip.getAttribute("data-doa-chip") || "");
        // Sama seperti dropdown: auto-scroll ke atas konten tiap ganti
        // kategori lewat chip supaya lebih efisien, tidak perlu scroll
        // manual.
        doaScrollToTop(container);
      });
    });
  };

  renderCards("");
};

// === Inisialisasi halaman doa ======================================

const initDoaPage = async () => {
  const content = document.querySelector("[data-doa-content]");
  if (!content) return;

  syncDoaStickyOffset();
  window.addEventListener("resize", syncDoaStickyOffset);
  window.addEventListener("orientationchange", syncDoaStickyOffset);
  window.addEventListener("load", syncDoaStickyOffset);

  // 1. Mode Halaman Mandiri (mis. doa-tawaf.html, doa-sai.html, doa-arafah.html)
  const singleCategory =
    content.getAttribute("data-kategori") ||
    document.body.getAttribute("data-doa-kategori");

  if (singleCategory) {
    content.innerHTML = '<div class="skeleton"></div>';
    const kategoriList = getDoaKategoriStatic();
    const matched = kategoriList.find(
      (k) =>
        String(k.nama).toLowerCase() === singleCategory.trim().toLowerCase(),
    );
    const tipe = matched ? String(matched.tipe).toLowerCase() : "";

    if (String(singleCategory).trim().toLowerCase() === "umum") {
      await renderUmumMode(content);
      return;
    }

    if (tipe === "putaran") {
      await renderPutaranMode(content, matched ? matched.nama : singleCategory);
      return;
    }

    const listRows = getDoaListStatic(matched ? matched.nama : singleCategory);
    if (looksLikePutaranList(listRows)) {
      await renderPutaranMode(content, matched ? matched.nama : singleCategory);
      return;
    }
    await renderListMode(content, matched ? matched.nama : singleCategory);
    return;
  }

  // 2. Mode Tab (Koleksi banyak kategori pada satu halaman)
  const tabsWrap = document.querySelector("[data-doa-tabs]");
  if (!tabsWrap) return;

  tabsWrap.innerHTML = '<div class="skeleton"></div>';
  const kategoriList = getDoaKategoriStatic();
  if (!kategoriList.length) {
    tabsWrap.innerHTML = "";
    content.innerHTML =
      '<div class="doa-empty">Belum ada kategori doa. Silakan lengkapi assets/js/doa-data.js.</div>';
    return;
  }

  const renderTab = async (item) => {
    const tipe = String(item.tipe).toLowerCase();
    if (tipe === "putaran") {
      await renderPutaranMode(content, item.nama);
      return;
    }
    const listRows = getDoaListStatic(item.nama);
    if (looksLikePutaranList(listRows)) {
      await renderPutaranMode(content, item.nama);
      return;
    }
    await renderListMode(content, item.nama);
  };

  const buildTabs = (activeId) => `
    <div class="doa-tabs" role="tablist" aria-label="Pilih ibadah">
      ${kategoriList
        .map(
          (item) => `
        <button type="button" class="doa-tab-btn${item.id === activeId ? " active" : ""}"
                role="tab" aria-selected="${item.id === activeId ? "true" : "false"}"
                data-doa-tab-id="${item.id}">
          ${item.nama}
        </button>
      `,
        )
        .join("")}
    </div>
  `;

  const hash = location.hash.replace("#", "").trim().toLowerCase();
  const preselected = kategoriList.find(
    (item) => String(item.nama).toLowerCase() === hash,
  );
  let active = preselected || kategoriList[0];

  tabsWrap.innerHTML = `<div class="doa-tabs-wrap">${buildTabs(active.id)}</div>`;
  tabsWrap.querySelectorAll("[data-doa-tab-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const item = kategoriList.find(
        (k) => String(k.id) === btn.getAttribute("data-doa-tab-id"),
      );
      if (!item) return;
      active = item;
      tabsWrap
        .querySelectorAll(".doa-tab-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      history.replaceState(
        null,
        "",
        `#${encodeURIComponent(item.nama.toLowerCase())}`,
      );
      await renderTab(item);
    });
  });

  await renderTab(active);
};

document.addEventListener("DOMContentLoaded", () => {
  initDoaPage();
});
