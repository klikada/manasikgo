// assets/js/tata-cara.js
// Seluruh penanganan halaman tata-cara-haji.html & tata-cara-umrah.html
// (fetch + render), termasuk data header (judul, eyebrow, ringkasan,
// sumber, dan isi ".content") maupun interaksi tabbar/dropdown, sekarang
// sepenuhnya ada di sini. Halaman panduan ibadah ini BUKAN "Layanan",
// jadi assets/js/layanan.js sengaja tidak menyentuhnya sama sekali.
//
// PENTING: skrip ini memakai event delegation (listener dipasang di
// document, bukan langsung ke tiap tombol/panel) supaya tetap berfungsi
// meskipun isi ".content" ditimpa secara dinamis lewat data dari Admin
// Panel > TataCara. Kalau listener dipasang langsung ke elemen lama,
// tombol hasil override innerHTML tidak akan punya listener sama sekali.
(() => {
  // Pemetaan nilai atribut [data-layanan] pada halaman ke "jenis" yang
  // dikenali endpoint TataCara (lihat HCApi.getTataCara di api.js).
  const jenisHalaman = {
    "tata-cara-haji": "TataCaraHaji",
    "tata-cara-umrah": "TataCaraUmrah",
  };

  // Mengambil baris header (urutan 0) dari sheet TataCara dan memakainya
  // untuk mengisi judul, eyebrow, ringkasan, sumber, dan isi ".content" —
  // pola kolom sama seperti yang dulu dipakai layanan.js untuk halaman
  // Layanan biasa: waktu->eyebrow, doa_dzikir->ringkasan, deskripsi->isi,
  // catatan->source.
  const renderTataCaraHeader = async () => {
    const root = document.querySelector("[data-layanan]");
    if (!root) return;
    const halaman = root.getAttribute("data-layanan");
    const jenis = jenisHalaman[halaman];
    if (!jenis || !window.HCApi) return;

    const rows = await HCApi.getTataCara(jenis);
    if (!rows || !rows.length) return;
    const row = rows[0];
    const page = {
      judul: row.judul,
      eyebrow: row.waktu,
      ringkasan: row.doa_dzikir,
      isi: row.deskripsi,
      source: row.catatan,
    };

    document.title = `${page.judul} | ManasikGo`;
    document
      .querySelector("meta[name='description']")
      ?.setAttribute("content", (page.ringkasan || "").replace(/<[^>]+>/g, ""));

    const eyebrowEl = document.querySelector("[data-layanan-eyebrow]");
    const titleEl = document.querySelector("[data-layanan-title]");
    const leadEl = document.querySelector("[data-layanan-lead]");
    const crumbEl = document.querySelector("[data-layanan-crumb]");
    const sourceEl = document.querySelector("[data-layanan-source]");
    const bodyEl = document.querySelector("[data-layanan-body]");

    if (eyebrowEl && page.eyebrow) eyebrowEl.textContent = page.eyebrow;
    if (titleEl && page.judul) titleEl.textContent = page.judul;
    if (leadEl && page.ringkasan) leadEl.innerHTML = page.ringkasan;
    if (crumbEl && page.judul) crumbEl.textContent = page.judul;
    if (sourceEl && page.source) sourceEl.textContent = page.source;
    if (bodyEl && page.isi) bodyEl.innerHTML = page.isi;
  };

  const typeInfo = {
    tamattu: {
      title: "Haji Tamattu'",
      sub: "Umrah terlebih dahulu, tahallul, lalu berihram kembali untuk haji pada 8 Dzulhijjah.",
      jenis: "Tamattu",
    },
    ifrad: {
      title: "Haji Ifrad",
      sub: "Haji tanpa didahului umrah — jamaah tetap berihram hingga rangkaian haji selesai.",
      jenis: "Ifrad",
    },
    qiran: {
      title: "Haji Qiran",
      sub: "Haji dan umrah dilaksanakan sekaligus dalam satu ihram.",
      jenis: "Qiran",
    },
    // Dipakai di tata-cara-umrah.html (kontainer #type-umrah). Aman untuk
    // dimuat bersama di tata-cara-haji.html karena elemen #type-umrah tidak
    // ada di halaman itu, sehingga baris ini otomatis dilewati (lihat
    // renderJenisHaji: `if (!container) continue;`).
    umrah: {
      title: "Ibadah Umrah",
      sub: "Ihram dan niat, tawaf, sa'i, lalu tahallul — dapat dilaksanakan kapan saja.",
      jenis: "Umrah",
    },
  };

  const escapeHtml = (value = "") =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  // Ikon jnode disederhanakan dari pola posisi tahap, karena database tidak
  // menyimpan ikon per baris: tahap pertama (ihram/niat) selalu ikon Ka'bah,
  // tahap terakhir (selalu Tawaf Wada') pakai ikon keluar, milestone lain
  // pakai ikon segitiga, tahap biasa pakai ikon lingkaran polos.
  const stepIcon = (step, index, total) => {
    if (index === 0)
      return '<svg class="icon-kaaba" aria-hidden="true"><use href="#icon-kaaba"></use></svg>';
    if (index === total - 1) return '<i class="bi bi-box-arrow-right"></i>';
    if (step.milestone) return '<i class="bi bi-triangle"></i>';
    return '<i class="bi bi-record-circle"></i>';
  };

  // Parser format "Doa / Dzikir": blok per-doa dipisah baris kosong, tiap
  // blok berisi 4 baris berurutan (Label, Arab, Latin, Arti).
  const parseDoaBlocks = (raw) => {
    if (!raw) return [];
    return raw
      .split(/\n\s*\n/)
      .map((block) =>
        block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      )
      .filter((lines) => lines.length)
      .map((lines) => ({
        label: lines[0] || "",
        arab: lines[1] || "",
        latin: lines[2] || "",
        arti: lines[3] || "",
      }));
  };

  // Parser "Catatan Praktis": baris berformat "→ Teks: url" dianggap tautan
  // cepat (mis. ke doa.html#tawaf), sisanya jadi kotak info biasa.
  const parseCatatan = (raw) => {
    if (!raw) return { info: "", links: [] };
    const lines = raw.split("\n").map((l) => l.trim());
    const links = [];
    const infoLines = [];
    lines.forEach((line) => {
      const m = line.match(/^→\s*(.+?):\s*(\S+)$/);
      if (m) links.push({ text: m[1], href: m[2] });
      else if (line) infoLines.push(line);
    });
    return { info: infoLines.join(" "), links };
  };

  const renderDoaBox = (doa) => `
    <div class="doa-box">
      <div class="doa-label">${escapeHtml(doa.label)}</div>
      ${doa.arab ? `<div class="doa-arab">${escapeHtml(doa.arab)}</div>` : ""}
      ${doa.latin ? `<div class="doa-latin">${escapeHtml(doa.latin)}</div>` : ""}
      ${doa.arti ? `<div class="doa-arti">${escapeHtml(doa.arti)}</div>` : ""}
    </div>`;

  const renderStep = (step, index, total) => `
    <div class="jstep${step.milestone ? " milestone" : ""}">
      <div class="jnode">${stepIcon(step, index, total)}</div>
      <div class="jcard">
        ${step.waktu ? `<span class="date">${escapeHtml(step.waktu)}</span>` : ""}
        <h4>${escapeHtml(step.judul)}</h4>
        ${step.deskripsi ? `<p>${escapeHtml(step.deskripsi)}</p>` : ""}
        ${parseDoaBlocks(step.doa_dzikir).map(renderDoaBox).join("")}
        ${(() => {
          const { info, links } = parseCatatan(step.catatan);
          return `
            ${info ? `<div class="info-box"><b><i class="bi bi-lightbulb"></i> Info tambahan</b>${escapeHtml(info)}</div>` : ""}
            ${links.map((l) => `<a class="doa-more-btn" href="${escapeHtml(l.href)}"><i class="bi bi-arrow-repeat"></i> ${escapeHtml(l.text)}</a>`).join("")}
          `;
        })()}
      </div>
    </div>`;

  const renderTypePanel = (rows) => {
    const intro = rows.find(
      (r) => Number(r.urutan) === 0 && r.judul === "__intro__",
    );
    const steps = rows
      .filter((r) => !(Number(r.urutan) === 0 && r.judul === "__intro__"))
      .sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0));
    const kvItems = intro
      ? intro.catatan
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((line) => {
            const idx = line.indexOf(":");
            return idx === -1
              ? { lbl: line, val: "" }
              : {
                  lbl: line.slice(0, idx).trim(),
                  val: line.slice(idx + 1).trim(),
                };
          })
      : [];
    return `
      ${
        intro
          ? `
      <div class="card type-intro">
        ${intro.deskripsi ? `<p>${escapeHtml(intro.deskripsi)}</p>` : ""}
        ${
          kvItems.length
            ? `
        <div class="kv-grid">
          ${kvItems.map((kv) => `<div class="kv"><div class="lbl">${escapeHtml(kv.lbl)}</div><div class="val">${escapeHtml(kv.val)}</div></div>`).join("")}
        </div>`
            : ""
        }
      </div>`
          : ""
      }
      <div class="journey">
        ${steps
          .map((s, i) =>
            renderStep(
              {
                milestone: /^★\s*/.test(s.judul || ""),
                judul: (s.judul || "").replace(/^★\s*/, ""),
                waktu: s.waktu,
                deskripsi: s.deskripsi,
                doa_dzikir: s.doa_dzikir,
                catatan: s.catatan,
              },
              i,
              steps.length,
            ),
          )
          .join("")}
      </div>`;
  };

  const renderJenisHaji = async () => {
    if (!window.HCApi) return;
    for (const [type, meta] of Object.entries(typeInfo)) {
      const container = document.getElementById(`type-${type}`);
      if (!container) continue;
      try {
        const rows = await HCApi.getTataCara(meta.jenis);
        if (rows && rows.length) container.innerHTML = renderTypePanel(rows);
        // Murni dari database — kalau data kosong/gagal, container tetap
        // menampilkan placeholder "Memuat..." bawaan HTML. Tidak ada
        // konten statis fallback yang ditimpa atau dipertahankan.
      } catch (error) {
        console.info(error.message);
      }
    }
  };

  // Ikon per segmen "Ketentuan Haji" — satu untuk daftar poin (rule-list
  // tidak menyimpan ikon per baris), satu lagi untuk consequence-banner
  // (beda dari ikon segmen, mengikuti markup asli tiap tema).
  const ketentuanInfo = {
    syarat: { seg: "seg-syarat", icon: "bi-key" },
    rukun: { seg: "seg-rukun", icon: "bi-exclamation-triangle-fill" },
    wajib: { seg: "seg-wajib", icon: "bi-cash-coin" },
    sunnah: { seg: "seg-sunnah", icon: "bi-check-circle" },
  };

  const renderRuleItem = (item, index) => `
    <div class="rule-item">
      <div class="rule-num">${index + 1}</div>
      <div>
        <h4>${escapeHtml(item.judul)}</h4>
        ${item.deskripsi ? `<p>${escapeHtml(item.deskripsi)}</p>` : ""}
      </div>
    </div>`;

  const renderKetentuanPanel = (rows, icon) => {
    const intro = rows.find(
      (r) => Number(r.urutan) === 0 && r.judul === "__intro__",
    );
    const consequence = rows.find((r) => r.judul === "__consequence__");
    const items = rows
      .filter((r) => r.judul !== "__intro__" && r.judul !== "__consequence__")
      .sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0));
    return `
      ${intro && intro.deskripsi ? `<p class="lead-muted mb-3">${escapeHtml(intro.deskripsi)}</p>` : ""}
      <div class="rule-list">
        ${items.map(renderRuleItem).join("")}
      </div>
      ${
        consequence && consequence.deskripsi
          ? `
      <div class="consequence-banner">
        <i class="bi ${icon}"></i>
        <span>${escapeHtml(consequence.deskripsi)}</span>
      </div>`
          : ""
      }`;
  };

  const renderKetentuan = async () => {
    if (!window.HCApi) return;
    for (const [jenis, meta] of Object.entries(ketentuanInfo)) {
      const container = document.getElementById(meta.seg);
      if (!container) continue;
      try {
        const rows = await HCApi.getTataCara(
          jenis.charAt(0).toUpperCase() + jenis.slice(1),
        );
        if (rows && rows.length)
          container.innerHTML = renderKetentuanPanel(rows, meta.icon);
        // Murni dari database — sama seperti renderJenisHaji(), tidak ada
        // konten statis fallback; placeholder "Memuat..." tetap tampil
        // bila data kosong/gagal.
      } catch (error) {
        console.info(error.message);
      }
    }
  };

  // Urutan render disengaja: tunggu renderTataCaraHeader() selesai dulu
  // (ia bisa menimpa SELURUH isi ".content" / [data-layanan-body], yang
  // juga menjadi induk dari #type-tamattu/#type-ifrad/#type-qiran/
  // #seg-syarat dkk) sebelum renderJenisHaji() & renderKetentuan()
  // mengisi sub-panel di dalamnya. Karena semuanya kini berjalan
  // berurutan dalam satu skrip, tidak ada lagi race condition dengan
  // skrip lain.
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await renderTataCaraHeader();
    } catch (error) {
      console.info(error?.message || error);
    }
    renderJenisHaji();
    renderKetentuan();
    // Label tombol "Jenis Haji" dibuka sesuai jenis yang sedang terpilih
    // (dropdown tamattu/ifrad/qiran yang ber-class "selected" saat ini).
    const activeType = document.querySelector(".dropdown-item.selected");
    const jenisLabelInit = document.querySelector(".jenis-label");
    if (activeType && jenisLabelInit && typeInfo[activeType.dataset.type]) {
      jenisLabelInit.textContent = typeInfo[activeType.dataset.type].title;
    }
  });

  const activatePanel = (tab) => {
    document
      .querySelectorAll(".tab-btn[data-tab]")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".panel")
      .forEach((panel) => panel.classList.remove("active"));
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    const targetPanel = document.getElementById(`panel-${tab}`);
    if (targetBtn) targetBtn.classList.add("active");
    if (targetPanel) targetPanel.classList.add("active");
  };

  const closeDropdown = () => {
    const jenisBtn = document.getElementById("jenisBtn");
    const jenisMenu = document.getElementById("jenisMenu");
    jenisMenu?.classList.remove("show");
    jenisBtn?.classList.remove("open");
  };

  document.addEventListener("click", (event) => {
    // Tombol tab utama (Pengertian, Jenis Haji, Cara Pendaftaran, dst).
    const tabBtn = event.target.closest(".tab-btn[data-tab]");
    if (tabBtn) {
      const tab = tabBtn.dataset.tab;
      if (tab === "jenis") {
        const jenisMenu = document.getElementById("jenisMenu");
        const isOpen = jenisMenu?.classList.contains("show");
        jenisMenu?.classList.toggle("show", !isOpen);
        tabBtn.classList.toggle("open", !isOpen);
        event.stopPropagation();
        return;
      }
      activatePanel(tab);
      return;
    }

    // Tombol "Ganti jenis" di dalam panel Jenis Haji.
    if (event.target.closest("#changeTypeBtn")) {
      event.stopPropagation();
      const jenisBtn = document.getElementById("jenisBtn");
      const jenisMenu = document.getElementById("jenisMenu");
      const willShow = !jenisMenu?.classList.contains("show");
      jenisMenu?.classList.toggle("show", willShow);
      jenisBtn?.classList.toggle("open", willShow);
      jenisBtn?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    // Item dropdown Tamattu / Ifrad / Qiran.
    const dropdownItem = event.target.closest(".dropdown-item[data-type]");
    if (dropdownItem) {
      const type = dropdownItem.dataset.type;
      document
        .querySelectorAll(".dropdown-item")
        .forEach((entry) => entry.classList.remove("selected"));
      dropdownItem.classList.add("selected");
      document
        .querySelectorAll(".type-panel")
        .forEach((panel) => panel.classList.remove("active"));
      const targetTypePanel = document.getElementById(`type-${type}`);
      targetTypePanel?.classList.add("active");
      const titleEl = document.getElementById("jenisTitle");
      const subEl = document.getElementById("jenisSub");
      if (titleEl && typeInfo[type]) titleEl.textContent = typeInfo[type].title;
      if (subEl && typeInfo[type]) subEl.textContent = typeInfo[type].sub;
      // Perbarui label tombol "Jenis Haji" ikut berubah sesuai pilihan.
      const jenisLabel = document.querySelector(".jenis-label");
      if (jenisLabel && typeInfo[type]) {
        jenisLabel.textContent = typeInfo[type].title;
      }
      closeDropdown();
      activatePanel("jenis");
      return;
    }

    // Segmen dalam panel Ketentuan Haji.
    const segBtn = event.target.closest(".seg-btn[data-seg]");
    if (segBtn) {
      document
        .querySelectorAll(".seg-btn")
        .forEach((item) => item.classList.remove("active"));
      document
        .querySelectorAll(".seg-panel")
        .forEach((panel) => panel.classList.remove("active"));
      segBtn.classList.add("active");
      const targetPanel = document.getElementById(`seg-${segBtn.dataset.seg}`);
      targetPanel?.classList.add("active");
      return;
    }

    // Klik di luar dropdown menutup dropdown yang sedang terbuka.
    if (!event.target.closest(".dropdown-wrap")) {
      closeDropdown();
    }
  });
})();
