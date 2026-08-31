// Daftar kategori bersama dipakai oleh field "Kategori" (Artikel, Pengalaman,
// Video/Short, dll) di form Admin. Isinya SEKARANG dimuat otomatis dari sheet
// "Kategori" lewat loadDynamicCategories() setiap admin membuka panel /
// berpindah menu (lihat fungsi di bawah). Array kosong di bawah cuma dipakai
// sebagai fallback sementara sebelum data dari sheet selesai dimuat, atau
// kalau pemanggilan ke sheet Kategori gagal (mis. koneksi terputus).
const CONTENT_CATEGORIES = [
  "Haji",
  "Umrah",
  "Manasik",
  "Persiapan",
  "Doa",
  "Kesehatan",
  "Transportasi",
  "Hotel",
  "Kuliner",
  "Belanja",
  "Budget",
  "Adab",
  "Ziarah",
  "Tips Hemat",
  "Fikih",
  "Regulasi & Keuangan",
  "Wakaf & Sosial",
  "Karier Petugas",
];

// Ambil daftar kategori terbaru dari sheet "Kategori" lewat HCApi, lalu isi
// ulang isi array CONTENT_CATEGORIES di tempat (bukan bikin array baru) --
// supaya semua field yang sudah menyimpan referensi ke CONTENT_CATEGORIES
// (options: CONTENT_CATEGORIES) otomatis ikut ter-update tanpa perlu
// membangun ulang ADMIN_SCHEMA. Kalau gagal atau sheet kosong, daftar bawaan
// di atas tetap dipakai supaya form tidak pernah kosong sama sekali.
const loadDynamicCategories = async () => {
  try {
    const categories = await HCApi.getCategories();
    const names = (categories || [])
      .map((item) => (item && item.nama ? String(item.nama).trim() : ""))
      .filter(Boolean);
    if (names.length) {
      CONTENT_CATEGORIES.length = 0;
      names.forEach((name) => CONTENT_CATEGORIES.push(name));
    }
  } catch (error) {
    console.info(
      "Gagal memuat kategori dari sheet Kategori, memakai daftar bawaan:",
      error.message,
    );
  }
};

const ADMIN_SCHEMA = {
  Artikel: {
    label: "Artikel",
    icon: "bi-newspaper",
    group: "Konten",
    fields: [
      { key: "judul", label: "Judul", type: "text", required: true },
      {
        key: "slug",
        label: "Slug (URL)",
        type: "text",
        required: true,
        hint: "Huruf kecil, pisahkan dengan tanda hubung, contoh: tips-hemat-umrah",
      },
      {
        key: "kategori",
        label: "Kategori",
        type: "select",
        options: CONTENT_CATEGORIES,
        required: true,
      },
      { key: "gambar", label: "Gambar", type: "image" },
      { key: "ringkasan", label: "Ringkasan", type: "textarea", rows: 2 },
      {
        key: "isi",
        label: "Isi Artikel (HTML)",
        type: "textarea",
        rows: 8,
        richHtml: true,
      },
      { key: "penulis", label: "Penulis", type: "text" },
      { key: "tanggal", label: "Tanggal", type: "date" },
      {
        key: "sumber_referensi",
        label: "Rujukan / Sumber",
        type: "textarea",
        rows: 2,
        hint: 'Contoh: Kemenag RI, kemenag.go.id (diakses Juli 2026). Tampil sebagai kotak "Rujukan & catatan sumber" di halaman artikel.',
      },
      {
        key: "views",
        label: "Jumlah Dibaca (Views)",
        type: "number",
        hint: "Otomatis bertambah tiap kali artikel dibuka pengunjung. Dipakai untuk menentukan Artikel Populer. Bisa disesuaikan manual bila perlu.",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Publish", "Draft"],
      },
    ],
  },
  Pengalaman: {
    label: "Pengalaman Jamaah",
    icon: "bi-people",
    group: "Konten",
    fields: [
      { key: "nama", label: "Nama", type: "text", required: true },
      { key: "asal", label: "Asal Kota", type: "text" },
      { key: "judul", label: "Judul Cerita", type: "text", required: true },
      {
        key: "kategori",
        label: "Kategori",
        type: "select",
        options: CONTENT_CATEGORIES,
        required: true,
      },
      { key: "pengalaman", label: "Cerita", type: "textarea", rows: 5 },
      { key: "tips", label: "Tips", type: "textarea", rows: 2 },
      { key: "tanggal", label: "Tanggal", type: "date" },
      { key: "like", label: "Jumlah Like", type: "number" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Publish", "Draft"],
      },
    ],
  },
  Kategori: {
    label: "Kategori",
    icon: "bi-tags",
    group: "Konten",
    fields: [
      { key: "nama", label: "Nama Kategori", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text" },
      {
        key: "icon",
        label: "Ikon (kelas Bootstrap Icons)",
        type: "text",
        hint: "Contoh: bi-suitcase2",
      },
    ],
  },
  FAQ: {
    label: "FAQ",
    icon: "bi-question-circle",
    group: "Konten",
    fields: [
      { key: "pertanyaan", label: "Pertanyaan", type: "text", required: true },
      { key: "jawaban", label: "Jawaban", type: "textarea", rows: 4 },
      { key: "kategori", label: "Kategori", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Publish", "Draft"],
      },
    ],
  },
  Istilah: {
    label: "Istilah / Kamus",
    icon: "bi-journal-text",
    group: "Panduan",
    fields: [
      { key: "judul", label: "Judul Istilah", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "kategori", label: "Kategori", type: "text" },
      { key: "ringkasan", label: "Ringkasan", type: "textarea", rows: 2 },
      {
        key: "isi",
        label: "Isi Lengkap (HTML)",
        type: "textarea",
        rows: 5,
        richHtml: true,
      },
      {
        key: "sumber_referensi",
        label: "Rujukan / Sumber",
        type: "textarea",
        rows: 2,
        hint: 'Contoh: BPKH, bpkh.go.id (diakses Juli 2026). Tampil sebagai kotak "Rujukan & catatan sumber" di halaman istilah.',
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Publish", "Draft"],
      },
    ],
  },
  TataCara: {
    label: "Tata Cara Ibadah",
    icon: "bi-list-check",
    group: "Panduan",
    fields: [
      {
        key: "jenis",
        label: "Jenis Haji / Ketentuan",
        type: "select",
        options: [
          "Tamattu",
          "Ifrad",
          "Qiran",
          "Umrah",
          "Syarat",
          "Rukun",
          "Wajib",
          "Sunnah",
          "TataCaraHaji",
          "TataCaraUmrah",
        ],
        required: true,
        hint: "Pilih TataCaraHaji/TataCaraUmrah untuk mengedit kerangka utama halaman. Pilih yang lain untuk mengedit langkah-langkahnya.",
      },
      { key: "urutan", label: "Urutan", type: "number", required: true },
      {
        key: "judul",
        label: "Judul Tahapan / Halaman",
        type: "text",
        required: true,
      },
      {
        key: "deskripsi",
        label: "Deskripsi / Isi HTML",
        type: "textarea",
        rows: 6,
        richHtml: true,
        hint: "Untuk langkah ibadah isi dengan penjelasan singkat. Khusus untuk jenis TataCaraHaji/Umrah, ini berisi kode kerangka HTML halamannya.",
      },
      {
        key: "waktu",
        label: "Waktu / Eyebrow (Khusus Halaman)",
        type: "text",
        hint: "Contoh: 9 Dzulhijjah. (Khusus TataCaraHaji/Umrah diisi label kecil seperti 'Panduan Ibadah')",
      },
      {
        key: "doa_dzikir",
        label: "Doa / Ringkasan (Khusus Halaman)",
        type: "textarea",
        rows: 5,
        hint: "Bisa lebih dari satu doa. Setiap doa ditulis 4 baris berurutan: Label, Lafal Arab, Latin, lalu Arti. Pisahkan antar-doa dengan satu baris kosong. (Khusus TataCaraHaji/Umrah diisi ringkasan halaman)",
      },
      {
        key: "catatan",
        label: "Catatan Praktis / Sumber Referensi",
        type: "textarea",
        rows: 2,
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Publish", "Draft"],
      },
    ],
  },
  Persiapan: {
    label: "Checklist Persiapan",
    icon: "bi-suitcase2",
    group: "Panduan",
    fields: [
      { key: "kategori", label: "Kategori", type: "text", required: true },
      { key: "item", label: "Item", type: "text", required: true },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Publish", "Draft"],
      },
    ],
  },
  PersiapanTimeline: {
    label: "Timeline Persiapan",
    icon: "bi-calendar-check",
    group: "Panduan",
    fields: [
      {
        key: "waktu",
        label: "Waktu (contoh: H-30)",
        type: "text",
        required: true,
      },
      { key: "deskripsi", label: "Deskripsi", type: "textarea", rows: 2 },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Publish", "Draft"],
      },
    ],
  },
  Peta: {
    label: "Peta (Lokasi Penting)",
    icon: "bi-geo-alt",
    group: "Info Praktis",
    fields: [
      { key: "nama", label: "Nama", type: "text", required: true },
      {
        key: "kategori",
        label: "Kategori",
        type: "select",
        options: ["Peta", "Ziarah", "Transportasi"],
        hint: "Semua kategori di sini tampil di halaman peta.html, dikelompokkan otomatis (Masjid/Tempat Ibadah, Ziarah, Transportasi, dst). Hotel/Kuliner/Belanja kini artikel biasa, lihat menu Artikel.",
      },
      { key: "lokasi", label: "Lokasi", type: "text" },
      { key: "deskripsi", label: "Deskripsi", type: "textarea", rows: 3 },
      { key: "rating", label: "Rating", type: "text" },
      { key: "jarak", label: "Jarak", type: "text" },
      { key: "estimasi", label: "Estimasi", type: "text" },
      { key: "harga", label: "Harga", type: "text" },
      { key: "maps", label: "Link Google Maps", type: "text" },
      { key: "gambar", label: "Gambar", type: "image" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Publish", "Draft"],
      },
    ],
  },
  Download: {
    label: "Download Center",
    icon: "bi-download",
    group: "Info Praktis",
    fields: [
      { key: "judul", label: "Judul", type: "text", required: true },
      { key: "deskripsi", label: "Deskripsi", type: "textarea", rows: 2 },
      {
        key: "kategori",
        label: "Kategori",
        type: "select",
        options: CONTENT_CATEGORIES,
        required: true,
        hint: 'Dipakai untuk filter di halaman Download Center, mis. kartu "Transportasi" di beranda menuju download.html?kategori=Transportasi.',
      },
      {
        key: "file",
        label: "Link File (PDF/dokumen)",
        type: "text",
        hint: "Link unduhan asli (boleh dari Google Drive, hosting PDF, atau link internet lain). Isi salah satu: Link File (dokumen) ATAU Gambar (infografis). Tidak perlu diisi dua-duanya.",
      },
      {
        key: "gambar",
        label: "Gambar (infografis)",
        type: "image",
        hint: "Untuk item berupa gambar/infografis yang bisa diunduh langsung. Kosongkan jika item ini berupa dokumen/file di atas.",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Publish", "Draft"],
      },
    ],
  },
  Video: {
    label: "Video",
    icon: "bi-play-btn",
    group: "Info Praktis",
    fields: [
      { key: "judul", label: "Judul", type: "text", required: true },
      {
        key: "kategori",
        label: "Kategori",
        type: "select",
        options: CONTENT_CATEGORIES,
        required: true,
      },
      {
        key: "tipe",
        label: "Tipe Konten",
        type: "select",
        options: ["Video", "Short"],
        hint: '"Video" untuk video biasa (16:9). "Short" untuk konten vertikal (Reels/Shorts/TikTok, 9:16).',
      },
      {
        key: "platform",
        label: "Platform",
        type: "select",
        options: ["YouTube", "TikTok", "Instagram"],
      },
      {
        key: "youtube",
        label: "Link Video / Short",
        type: "text",
        hint: "Tempel link asli dari platform-nya, sistem otomatis mengubah ke format embed. YouTube: link watch/shorts/youtu.be apa saja. TikTok: link lengkap berisi /video/ID (contoh: tiktok.com/@akun/video/123...). Instagram: link Reel/Post (contoh: instagram.com/reel/ID/).",
      },
      { key: "deskripsi", label: "Deskripsi", type: "textarea", rows: 2 },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Publish", "Draft"],
      },
    ],
  },
  Layanan: {
    label: "Layanan (Badal, Fikih, Wakaf, Rekrutmen)",
    icon: "bi-briefcase-fill",
    group: "Layanan",
    fields: [
      {
        key: "halaman",
        label: "Halaman",
        type: "select",
        options: ["badal", "fikih", "wakaf-quran", "rekrutmen-petugas"],
        required: true,
        hint: "Menentukan halaman mana yang menampilkan konten ini.",
      },
      {
        key: "eyebrow",
        label: "Eyebrow (label kecil di atas judul)",
        type: "text",
        hint: "Contoh: Layanan · Badal Umroh",
      },
      { key: "judul", label: "Judul Halaman", type: "text", required: true },
      { key: "ringkasan", label: "Ringkasan", type: "textarea", rows: 2 },
      {
        key: "isi",
        label: "Isi Halaman (HTML)",
        type: "textarea",
        rows: 8,
        richHtml: true,
        hint: 'Konten utama halaman, termasuk section FAQ singkat di bagian bawah. Kartu "Pesan Jasa" (form ke WhatsApp admin) di badal.html/wakaf-quran.html bersifat statis dan tidak diatur dari sini.',
      },
      {
        key: "sumber_referensi",
        label: "Rujukan / Sumber",
        type: "textarea",
        rows: 2,
        hint: 'Tampil sebagai kotak "Rujukan & catatan sumber" di halaman.',
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Publish", "Draft"],
      },
    ],
  },
  Pesanan: {
    label: "Pesanan (dari Member)",
    icon: "bi-cart-check",
    group: "Layanan",
    fields: [
      {
        key: "user_id",
        label: "ID User",
        type: "text",
        hint: "ID member yang memesan",
      },
      {
        key: "layanan",
        label: "Layanan",
        type: "select",
        options: ["badal_umroh", "wakaf_quran", "panitia_haji"],
        required: true,
      },
      { key: "nama_pemesan", label: "Nama Pemesan", type: "text" },
      { key: "whatsapp_pemesan", label: "WhatsApp", type: "text" },
      {
        key: "data_pesanan",
        label: "Data Pesanan (JSON)",
        type: "textarea",
        rows: 3,
        hint: 'Data tambahan pesanan dalam format JSON, mis. {"untuk":"Almarhum ayah saya"} untuk Badal Umroh.',
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["pending", "diproses", "selesai", "ditolak"],
      },
      {
        key: "catatan_admin",
        label: "Catatan Admin",
        type: "textarea",
        rows: 2,
      },
      { key: "tanggal_pesan", label: "Tanggal Pesan", type: "date" },
      {
        key: "petugas_badal_id",
        label: "Petugas Pelaksana (khusus Badal Umroh)",
        type: "text", // otomatis dijadikan dropdown nama petugas oleh openFormSmart() saat form dibuka
        hint: 'Pilih dari dropdown nama petugas (diisi otomatis dari menu "Petugas Badal"). Wajib diisi bersama status "selesai" agar sertifikat menampilkan nama & tanda tangan petugas yang benar. Cara lebih cepat: gunakan tombol "Terima" di tabel pesanan.',
      },
      {
        key: "tanggal_pelaksanaan_hijri",
        label: "Tanggal Pelaksanaan (Hijriah)",
        type: "text",
        hint: 'Tanggal badal umroh dilaksanakan, format bebas. Contoh: "12 Rabiul Awal 1448 H". Tampil di sertifikat.',
      },
    ],
  },
  PetugasBadal: {
    label: "Petugas Badal",
    icon: "bi-person-badge-fill",
    group: "Layanan",
    fields: [
      { key: "nama", label: "Nama Petugas", type: "text", required: true },
      {
        key: "ttd",
        label: "Tanda Tangan (gambar)",
        type: "image",
        hint: "Tempel link gambar tanda tangan, atau unggah file dari perangkat (PNG latar transparan lebih rapi). Tampil pada sertifikat Badal Umroh.",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Publish", "Draft"],
        hint: 'Hanya petugas berstatus "Publish" yang bisa dipilih untuk pesanan Badal Umroh.',
      },
    ],
  },
};

const state = {
  token: "",
  currentUser: null,
  currentSheet: null,
  rows: [],
  editingId: null,
  users: [],
  editingUserId: null,
  petugasBadalOptions: null, // cache {value,label}[] dari sheet PetugasBadal, dipakai di dropdown penugasan
  badalPendingVerification: null, // cache Set<pesanan_id> tracking badal yang menunggu verifikasi admin
};

const ADMIN_ROLES = ["super_admin", "penulis"];

// Sheet konten yang boleh diakses role "penulis" (label tampilan: "Pengelola
// Konten"). Dicerminkan juga di backend (appscript/Code.gs, PENULIS_CONTENT_SHEETS)
// supaya pembatasan bukan cuma sembunyi-sembunyi di sidebar. Artikel &
// Pengalaman (Cerita Jemaah) diutamakan -- ditampilkan di grup "Prioritas".
const PENULIS_CONTENT_SHEETS = ["Artikel", "Pengalaman", "Kategori", "FAQ"];
const PENULIS_PRIORITY_SHEETS = ["Artikel", "Pengalaman"];

const els = {};
const qs = (selector) => document.querySelector(selector);

const showToast = (message, variant = "success") => {
  const container = document.querySelector(".toast-container");
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${variant} border-0`;
  toast.setAttribute("role", "alert");
  toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  container.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { delay: 3200 });
  bsToast.show();
  toast.addEventListener("hidden.bs.toast", () => toast.remove());
};

const showAlert = (message, variant = "danger") => {
  const alertBox = qs("#adminAlert");
  alertBox.textContent = message;
  alertBox.className = `alert alert-${variant} py-2 small`;
};
const hideAlert = () => qs("#adminAlert")?.classList.add("d-none");

// === Login ===
// Admin Panel TIDAK lagi punya form login sendiri. Login/register memakai
// satu sistem yang sama untuk seluruh situs lewat login.html/daftar.html
// (HCAuth, assets/js/auth.js). Di sini kita hanya memeriksa sesi yang sudah
// ada: kalau belum login atau rolenya bukan super_admin/penulis, pengunjung
// diarahkan ke login.html. Setelah login di sana, dia otomatis diarahkan
// kembali ke admin.html (lihat parameter ?redirect= di login.html).
const initLogin = async () => {
  await window.HCAuth.me(); // sinkronkan sesi ke server (menolak sesi basi/nonaktif)
  const user = window.HCAuth.requireRole(
    ADMIN_ROLES,
    "login.html?redirect=admin.html",
  );
  if (!user) return; // requireRole sudah redirect ke login.html

  state.token = window.HCAuth.getToken();
  state.currentUser = user;
  tryEnterApp();
};

const tryEnterApp = async () => {
  qs("#authCheckScreen").classList.add("d-none");
  qs("#adminApp").classList.remove("d-none");
  renderUserChip();
  await loadDynamicCategories();
  try {
    buildSidebar();
    navigateToView("dashboard");
  } catch (error) {
    console.error("Gagal membangun menu admin:", error);
    showAlert(
      "Berhasil login, tetapi menu konten gagal dimuat. Coba muat ulang halaman.",
    );
  }
};

const renderUserChip = () => {
  const user = state.currentUser;
  if (!user) return;
  const initial = (user.nama || "?").trim().charAt(0).toUpperCase() || "?";
  qs("#adminUserChipAvatar").textContent = initial;
  qs("#adminUserChipName").textContent = user.nama || "-";
  qs("#adminUserChipRole").textContent = roleLabel(user.role);
  qs("#adminUserChip").classList.toggle(
    "admin-user-chip--super",
    user.role === "super_admin",
  );
};

const showView = (view) => {
  qs("#dashboardView").classList.toggle("d-none", view !== "dashboard");
  qs("#contentView").classList.toggle("d-none", view !== "content");
  qs("#usersView").classList.toggle("d-none", view !== "users");
  qs("#profileView").classList.toggle("d-none", view !== "profile");
};

// Dipakai bareng oleh tombol sidebar & kartu aksi cepat di dashboard supaya
// tidak ada logika navigasi yang dobel.
const setActiveSidebarButton = (matcher) => {
  const sidebar = qs("#adminSidebar");
  sidebar
    .querySelectorAll("button[data-sheet], button[data-view]")
    .forEach((button) => {
      button.classList.toggle("active", matcher(button));
    });
};

const navigateToSheet = (sheet) => {
  setActiveSidebarButton((button) => button.dataset.sheet === sheet);
  showView("content");
  selectSheet(sheet);
  qs("#adminSidebar").classList.remove("show");
};

const navigateToView = (view) => {
  setActiveSidebarButton((button) => button.dataset.view === view);
  showView(view);
  if (view === "users") loadUsers();
  if (view === "profile") loadProfile();
  if (view === "dashboard") loadDashboard();
  qs("#adminSidebar").classList.remove("show");
};

// === Sidebar: tampilan berbeda untuk Super Admin vs Pengelola Konten ===
// Super Admin: grup "Prioritas" berisi Pengguna & Pesanan (paling sering
// dipakai), lalu seluruh grup konten/panduan/info/layanan lain di bawahnya.
// Pengelola Konten: HANYA melihat menu konten (Artikel & Pengalaman
// diutamakan di grup "Prioritas", sisanya di "Konten Lainnya") -- tidak ada
// menu Pengguna/Pesanan/Layanan/Panduan/Info Praktis sama sekali, sejalan
// dengan pembatasan yang juga ditegakkan di backend (requireContentAccess_).
const buildSidebar = () => {
  const sidebar = qs("#adminSidebar");
  const isSuperAdmin = state.currentUser && state.currentUser.role === "super_admin";

  let html = `<button type="button" data-view="dashboard"><i class="bi bi-grid-1x2-fill"></i> Beranda</button>`;

  if (isSuperAdmin) {
    html += `
      <div class="admin-sidebar-group-title admin-sidebar-group-title--priority"><i class="bi bi-star-fill"></i> Prioritas</div>
      <button type="button" data-view="users" class="admin-sidebar-priority"><i class="bi bi-people-fill"></i> Pengguna</button>
      <button type="button" data-sheet="Pesanan" class="admin-sidebar-priority"><i class="bi bi-cart-check-fill"></i> Pesanan Masuk</button>
    `;
    const groups = {};
    Object.entries(ADMIN_SCHEMA).forEach(([sheet, config]) => {
      if (sheet === "Pesanan") return; // sudah tampil di grup Prioritas di atas
      groups[config.group] = groups[config.group] || [];
      groups[config.group].push({ sheet, ...config });
    });
    html += Object.entries(groups)
      .map(
        ([group, items]) => `
      <div class="admin-sidebar-group-title">${group}</div>
      ${items.map((item) => `<button type="button" data-sheet="${item.sheet}"><i class="bi ${item.icon}"></i> ${item.label}</button>`).join("")}
    `,
      )
      .join("");
  } else {
    const priorityItems = PENULIS_PRIORITY_SHEETS.map(
      (sheet) => ({ sheet, ...ADMIN_SCHEMA[sheet] }),
    );
    const otherItems = PENULIS_CONTENT_SHEETS.filter(
      (sheet) => !PENULIS_PRIORITY_SHEETS.includes(sheet),
    ).map((sheet) => ({ sheet, ...ADMIN_SCHEMA[sheet] }));
    html += `
      <div class="admin-sidebar-group-title admin-sidebar-group-title--priority"><i class="bi bi-star-fill"></i> Prioritas</div>
      ${priorityItems.map((item) => `<button type="button" data-sheet="${item.sheet}" class="admin-sidebar-priority"><i class="bi ${item.icon}"></i> ${item.label}</button>`).join("")}
      <div class="admin-sidebar-group-title">Konten Lainnya</div>
      ${otherItems.map((item) => `<button type="button" data-sheet="${item.sheet}"><i class="bi ${item.icon}"></i> ${item.label}</button>`).join("")}
    `;
  }

  html += `
    <div class="admin-sidebar-group-title">Akun</div>
    <button type="button" data-view="profile"><i class="bi bi-person-circle"></i> Profil Saya</button>
  `;

  sidebar.innerHTML = html;
  sidebar.querySelectorAll("button[data-sheet]").forEach((button) => {
    button.addEventListener("click", () => navigateToSheet(button.dataset.sheet));
  });
  sidebar.querySelectorAll("button[data-view]").forEach((button) => {
    button.addEventListener("click", () => navigateToView(button.dataset.view));
  });
};

// === Beranda / Dashboard: ringkasan berbeda untuk Super Admin vs
// Pengelola Konten, dibangun dari data yang sama yang dipakai menu konten
// (HCApi.adminList) supaya tidak perlu endpoint baru di backend. ===
const statCard = (icon, value, label, tone = "primary") => `
  <div class="admin-stat-card admin-stat-card--${tone}">
    <div class="admin-stat-card-icon"><i class="bi ${icon}"></i></div>
    <div class="admin-stat-card-value">${value}</div>
    <div class="admin-stat-card-label">${label}</div>
  </div>
`;

const quickAction = (view, sheet, icon, title, desc) => `
  <button type="button" class="admin-quick-card" ${view ? `data-dash-view="${view}"` : `data-dash-sheet="${sheet}"`}>
    <span class="admin-quick-card-icon"><i class="bi ${icon}"></i></span>
    <span class="admin-quick-card-body">
      <span class="admin-quick-card-title">${title}</span>
      <span class="admin-quick-card-desc">${desc}</span>
    </span>
    <i class="bi bi-arrow-right admin-quick-card-arrow"></i>
  </button>
`;

const wireDashboardActions = () => {
  qs("#dashboardQuick")
    .querySelectorAll("[data-dash-view]")
    .forEach((el) =>
      el.addEventListener("click", () => navigateToView(el.dataset.dashView)),
    );
  qs("#dashboardQuick")
    .querySelectorAll("[data-dash-sheet]")
    .forEach((el) =>
      el.addEventListener("click", () => navigateToSheet(el.dataset.dashSheet)),
    );
  qs("#dashboardRecent")
    .querySelectorAll("[data-dash-sheet]")
    .forEach((el) =>
      el.addEventListener("click", () => navigateToSheet(el.dataset.dashSheet)),
    );
};

const pesananRow = (row) => `
  <button type="button" class="admin-recent-row" data-dash-sheet="Pesanan">
    <span class="admin-recent-row-icon admin-recent-row-icon--warning"><i class="bi bi-hourglass-split"></i></span>
    <span class="admin-recent-row-body">
      <span class="admin-recent-row-title">${escapeHtml(row.nama_pemesan || "Tanpa nama")}</span>
      <span class="admin-recent-row-meta">${escapeHtml(row.layanan || "-")} &middot; ${escapeHtml(row.whatsapp_pemesan || "-")}</span>
    </span>
    <span class="badge-soft">Menunggu</span>
  </button>
`;

const contentRow = (row) => `
  <button type="button" class="admin-recent-row" data-dash-sheet="${row.__type === "Artikel" ? "Artikel" : "Pengalaman"}">
    <span class="admin-recent-row-icon"><i class="bi ${row.__type === "Artikel" ? "bi-newspaper" : "bi-people"}"></i></span>
    <span class="admin-recent-row-body">
      <span class="admin-recent-row-title">${escapeHtml(row.judul || "Tanpa judul")}</span>
      <span class="admin-recent-row-meta">${row.__type} &middot; ${escapeHtml(row.status || "-")}</span>
    </span>
    <i class="bi bi-chevron-right lead-muted"></i>
  </button>
`;

const loadDashboard = async () => {
  const user = state.currentUser;
  const isSuperAdmin = user.role === "super_admin";
  qs("#dashboardGreeting").textContent = `Halo, ${user.nama || ""}`;
  qs("#dashboardSubtitle").textContent = isSuperAdmin
    ? "Ringkasan Pengguna & Pesanan masuk, plus seluruh konten ManasikGo."
    : "Ringkasan Artikel & Cerita Jemaah yang Anda kelola.";
  const statsGrid = qs("#dashboardStats");
  const quick = qs("#dashboardQuick");
  const recentWrap = qs("#dashboardRecent");
  statsGrid.innerHTML = `<div class="text-center py-5 w-100"><div class="spinner-border text-primary"></div></div>`;
  quick.innerHTML = "";
  recentWrap.innerHTML = "";

  try {
    if (isSuperAdmin) {
      const [users, pesanan, artikel, pengalaman] = await Promise.all([
        HCApi.usersList(state.token),
        HCApi.adminList("Pesanan", state.token),
        HCApi.adminList("Artikel", state.token),
        HCApi.adminList("Pengalaman", state.token),
      ]);
      const pendingCount = pesanan.filter((p) => p.status === "pending").length;
      const selesaiCount = pesanan.filter((p) => p.status === "selesai").length;
      const memberCount = users.filter((u) => u.role === "member").length;
      statsGrid.innerHTML = [
        statCard("bi-people-fill", users.length, "Total Pengguna", "primary"),
        statCard("bi-person-check-fill", memberCount, "Member Terdaftar", "gold"),
        statCard("bi-hourglass-split", pendingCount, "Pesanan Menunggu", "warning"),
        statCard("bi-check-circle-fill", selesaiCount, "Pesanan Selesai", "success"),
        statCard("bi-newspaper", artikel.length, "Total Artikel", "muted"),
        statCard("bi-people", pengalaman.length, "Total Cerita Jemaah", "muted"),
      ].join("");
      quick.innerHTML = [
        quickAction(
          "users",
          null,
          "bi-people-fill",
          "Kelola Pengguna",
          "Atur akun Super Admin, Pengelola Konten, dan Member.",
        ),
        quickAction(
          null,
          "Pesanan",
          "bi-cart-check-fill",
          "Kelola Pesanan",
          "Tinjau & proses pesanan Badal Umroh, Wakaf, dan Panitia.",
        ),
      ].join("");
      const recentPending = pesanan
        .filter((p) => p.status === "pending")
        .slice(0, 5);
      recentWrap.innerHTML = recentPending.length
        ? `<h2 class="h6 fw-bold mb-3"><i class="bi bi-hourglass-split text-warning"></i> Pesanan Menunggu Diproses</h2>${recentPending.map(pesananRow).join("")}`
        : `<p class="lead-muted small mb-0">Tidak ada pesanan yang menunggu diproses saat ini.</p>`;
    } else {
      const [artikel, pengalaman] = await Promise.all([
        HCApi.adminList("Artikel", state.token),
        HCApi.adminList("Pengalaman", state.token),
      ]);
      const artikelPublish = artikel.filter((a) => a.status === "Publish").length;
      const artikelDraft = artikel.filter((a) => a.status === "Draft").length;
      const pengalamanPublish = pengalaman.filter(
        (a) => a.status === "Publish",
      ).length;
      const pengalamanDraft = pengalaman.filter((a) => a.status === "Draft").length;
      statsGrid.innerHTML = [
        statCard("bi-newspaper", artikel.length, "Total Artikel", "primary"),
        statCard("bi-check-circle-fill", artikelPublish, "Artikel Publish", "success"),
        statCard("bi-pencil-square", artikelDraft, "Artikel Draft", "warning"),
        statCard("bi-people-fill", pengalaman.length, "Total Cerita Jemaah", "gold"),
        statCard("bi-check-circle", pengalamanPublish, "Cerita Publish", "success"),
        statCard("bi-pencil", pengalamanDraft, "Cerita Draft", "warning"),
      ].join("");
      quick.innerHTML = [
        quickAction(
          null,
          "Artikel",
          "bi-file-earmark-plus-fill",
          "Tulis Artikel Baru",
          "Tambahkan artikel edukasi seputar haji & umrah.",
        ),
        quickAction(
          null,
          "Pengalaman",
          "bi-chat-heart-fill",
          "Tulis Cerita Jemaah",
          "Bagikan pengalaman & tips dari jemaah.",
        ),
      ].join("");
      const recentItems = [
        ...artikel.map((a) => ({ ...a, __type: "Artikel" })),
        ...pengalaman.map((a) => ({ ...a, __type: "Cerita Jemaah" })),
      ].slice(-6).reverse();
      recentWrap.innerHTML = recentItems.length
        ? `<h2 class="h6 fw-bold mb-3"><i class="bi bi-clock-history"></i> Konten Terbaru</h2>${recentItems.map(contentRow).join("")}`
        : `<p class="lead-muted small mb-0">Belum ada konten. Mulai tulis artikel atau cerita jemaah pertama Anda.</p>`;
    }
  } catch (error) {
    statsGrid.innerHTML = `<div class="alert alert-danger py-2 small w-100">${error.message || "Gagal memuat ringkasan dashboard."}</div>`;
  }
  wireDashboardActions();
};

const selectSheet = async (sheet) => {
  state.currentSheet = sheet;
  const config = ADMIN_SCHEMA[sheet];
  qs("#activeSheetLabel").textContent = config.group;
  qs("#activeSheetTitle").textContent = config.label;
  qs("#addBtn").disabled = false;
  hideAlert();
  // Muat ulang daftar kategori kalau menu ini punya field kategori dinamis,
  // supaya kategori yang baru saja ditambah/diubah di menu "Kategori"
  // langsung tersedia di dropdown tanpa perlu logout/login ulang.
  if (config.fields.some((field) => field.options === CONTENT_CATEGORIES)) {
    await loadDynamicCategories();
  }
  renderTableHead(config);
  qs("#tableBody").innerHTML =
    `<tr><td colspan="${config.fields.length + 1}" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>`;
  try {
    state.rows = await HCApi.adminList(sheet, state.token);
    if (sheet === "Pesanan") {
      await loadBadalPendingVerifications(true);
    }
    renderTableBody(config);
  } catch (error) {
    showAlert(error.message || "Gagal memuat data.");
    qs("#tableBody").innerHTML =
      `<tr><td colspan="${config.fields.length + 1}" class="text-center py-4 lead-muted">Gagal memuat data.</td></tr>`;
  }
};

const visibleFields = (config) => {
  const nonTextarea = config.fields.filter(
    (field) => field.type !== "textarea",
  );
  const statusField = nonTextarea.find((field) => field.key === "status");
  const others = nonTextarea.filter((field) => field.key !== "status");
  const trimmed = others.slice(0, statusField ? 4 : 5);
  return statusField ? [...trimmed, statusField] : trimmed;
};

const renderTableHead = (config) => {
  const fields = visibleFields(config);
  qs("#tableHeadRow").innerHTML =
    fields.map((field) => `<th>${field.label}</th>`).join("") +
    `<th class="text-end">Aksi</th>`;
};

const renderTableBody = (config, filterText = "") => {
  const fields = visibleFields(config);
  // Tombol toggle cepat (Publish/Draft) HANYA relevan untuk sheet yang
  // memang memakai kosakata status Publish/Draft (Artikel, FAQ, dll).
  // Sheet seperti Pesanan punya kosakata status sendiri
  // (pending/diproses/selesai/ditolak) yang harus diubah lewat form Edit
  // biasa -- kalau tombol ini dipaksa tampil, klik "Publish sekarang"
  // pada baris Pesanan akan menimpa status pesanan (mis. "selesai")
  // menjadi "Publish", yang membuat verifikasi sertifikat gagal.
  const statusField = config.fields.find((field) => field.key === "status");
  const hasStatus =
    !!statusField &&
    Array.isArray(statusField.options) &&
    statusField.options.includes("Publish") &&
    statusField.options.includes("Draft");
  // Tombol cepat "Terima" khusus sheet Pesanan layanan badal_umroh: alih-alih
  // buka form Edit lengkap, admin cukup pilih nama petugas dari dropdown dan
  // status otomatis diset "diproses" (lihat openAssignPetugasModal()).
  const isPesananSheet = state.currentSheet === "Pesanan";
  let rows = state.rows;
  if (filterText) {
    const keyword = filterText.toLowerCase();
    rows = rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(keyword),
      ),
    );
  }
  if (!rows.length) {
    qs("#tableBody").innerHTML =
      `<tr><td colspan="${fields.length + 1}" class="text-center py-4 lead-muted">Belum ada data. Klik "Tambah Baru" untuk mulai mengisi.</td></tr>`;
    return;
  }
  qs("#tableBody").innerHTML = rows
    .map((row) => {
      const showAssignBtn =
        isPesananSheet &&
        row.layanan === "badal_umroh" &&
        row.status === "pending";
      const showVerifyBtn =
        isPesananSheet &&
        row.layanan === "badal_umroh" &&
        state.badalPendingVerification &&
        state.badalPendingVerification.has(String(row.id));
      return `
    <tr>
      ${fields.map((field) => `<td class="cell-truncate">${renderCellValue(row, field)}</td>`).join("")}
      <td class="text-end text-nowrap">
        ${hasStatus ? `<button class="btn btn-sm ${row.status === "Publish" ? "btn-outline-warning" : "btn-outline-success"}" type="button" data-toggle-status="${row.id}" title="${row.status === "Publish" ? "Jadikan Draft" : "Publish sekarang"}"><i class="bi ${row.status === "Publish" ? "bi-eye-slash" : "bi-check-circle"}"></i></button>` : ""}
        ${showVerifyBtn ? `<button class="btn btn-sm btn-warning" type="button" data-verify-badal="${row.id}" title="Petugas sudah mengirim rute tracking -- verifikasi & tandai pesanan selesai"><i class="bi bi-patch-check"></i> Verifikasi</button>` : ""}
        ${showAssignBtn ? `<button class="btn btn-sm btn-outline-success" type="button" data-assign-petugas="${row.id}" title="Terima pesanan & tugaskan petugas"><i class="bi bi-person-check"></i> Terima</button>` : ""}
        <button class="btn btn-sm btn-outline-primary" type="button" data-edit="${row.id}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" type="button" data-delete="${row.id}"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `;
    })
    .join("");
  qs("#tableBody")
    .querySelectorAll("[data-edit]")
    .forEach((button) => {
      button.addEventListener("click", () =>
        openFormSmart(
          config,
          state.rows.find((row) => String(row.id) === button.dataset.edit),
        ),
      );
    });
  qs("#tableBody")
    .querySelectorAll("[data-toggle-status]")
    .forEach((button) => {
      button.addEventListener("click", () =>
        handleToggleStatus(button.dataset.toggleStatus),
      );
    });
  qs("#tableBody")
    .querySelectorAll("[data-verify-badal]")
    .forEach((button) => {
      button.addEventListener("click", () =>
        handleVerifyBadal(button.dataset.verifyBadal),
      );
    });
  qs("#tableBody")
    .querySelectorAll("[data-assign-petugas]")
    .forEach((button) => {
      button.addEventListener("click", () =>
        openAssignPetugasModal(
          state.rows.find(
            (row) => String(row.id) === button.dataset.assignPetugas,
          ),
        ),
      );
    });
  qs("#tableBody")
    .querySelectorAll("[data-delete]")
    .forEach((button) => {
      button.addEventListener("click", () =>
        handleDelete(button.dataset.delete),
      );
    });
};

const renderCellValue = (row, field) => {
  const value = row[field.key];
  if (field.type === "image" && value) {
    return `<img class="cell-image-thumb" src="${value}" alt="" loading="lazy" onerror="this.style.opacity=0.3">`;
  }
  if (field.type === "select" && field.key === "status") {
    return `<span class="badge-soft" style="${value === "Draft" ? "background:#fef3c7;color:#92400e;border-color:#fde68a;" : ""}">${value || "-"}</span>`;
  }
  return value !== undefined && value !== ""
    ? value
    : '<span class="lead-muted">-</span>';
};

// === Form modal (create/edit) ===
const openForm = (config, row = null) => {
  state.editingId = row ? row.id : null;
  qs("#formModalTitle").textContent = row
    ? `Edit ${config.label}`
    : `Tambah ${config.label}`;
  qs("#formFields").innerHTML = config.fields
    .map((field) => renderFieldInput(field, row))
    .join("");
  config.fields
    .filter((field) => field.type === "image")
    .forEach((field) => wireImageField(field));
  config.fields
    .filter((field) => field.type === "video" || field.type === "audio")
    .forEach((field) => wireMediaField(field));
  config.fields
    .filter((field) => field.type === "textarea" && field.richHtml)
    .forEach((field) => wireHtmlEditorField(field));
  new bootstrap.Modal(qs("#formModal")).show();
};

// Cache daftar Petugas Badal (id + nama) dipakai untuk mengisi dropdown
// pilihan petugas di form Pesanan & modal "Terima & Tugaskan", supaya admin
// tidak perlu mengetik/menghafal id petugas (mis. "ptg-001") secara manual.
const loadPetugasBadalOptions = async (forceReload = false) => {
  if (state.petugasBadalOptions && !forceReload) return state.petugasBadalOptions;
  try {
    const rows = await HCApi.adminList("PetugasBadal", state.token);
    state.petugasBadalOptions = rows.map((row) => ({
      value: row.id,
      label: row.nama + (row.status === "Draft" ? " (nonaktif)" : ""),
    }));
  } catch (error) {
    console.warn("Gagal memuat daftar Petugas Badal:", error.message);
    state.petugasBadalOptions = [];
  }
  return state.petugasBadalOptions;
};

// Pembungkus openForm(): khusus sheet Pesanan, field "petugas_badal_id"
// (semula input teks polos, isinya id seperti "ptg-001") diubah dulu jadi
// dropdown berisi NAMA petugas dari sheet PetugasBadal, supaya admin
// memilih dari nama, bukan mengetik/menghafal id. Kalau daftar petugas
// gagal dimuat (mis. offline), field dibiarkan tetap input teks biasa
// sebagai fallback supaya admin masih bisa mengisi id secara manual.
const openFormSmart = async (config, row = null) => {
  if (config === ADMIN_SCHEMA.Pesanan) {
    const options = await loadPetugasBadalOptions();
    const field = config.fields.find((f) => f.key === "petugas_badal_id");
    if (field && options.length) {
      field.type = "select";
      field.options = [
        { value: "", label: "-- Belum ditugaskan --" },
        ...options,
      ];
    }
  }
  openForm(config, row);
};

const renderFieldInput = (field, row) => {
  const value = row ? (row[field.key] ?? "") : "";
  const requiredAttr = field.required ? "required" : "";
  const hint = field.hint ? `<div class="form-text">${field.hint}</div>` : "";
  if (field.type === "textarea" && field.richHtml) {
    return `
      <div class="mb-3" data-html-editor-field="${field.key}">
        <label class="form-label small fw-bold">${field.label}</label>
        <div class="html-editor-toolbar" role="toolbar" aria-label="Format teks">
          <button class="html-editor-btn" type="button" data-html-cmd="p" title="Paragraf biasa">P</button>
          <button class="html-editor-btn html-editor-btn-heading" type="button" data-html-cmd="h2" title="Judul Bagian (H2) &mdash; bagian utama">H2</button>
          <button class="html-editor-btn html-editor-btn-heading" type="button" data-html-cmd="h3" title="Sub Bagian (H3) &mdash; turunan dari H2">H3</button>
          <button class="html-editor-btn html-editor-btn-heading" type="button" data-html-cmd="h4" title="Sub-sub Bagian (H4) &mdash; turunan dari H3">H4</button>
          <span class="html-editor-sep" aria-hidden="true"></span>
          <button class="html-editor-btn" type="button" data-html-cmd="bold" title="Tebal"><i class="bi bi-type-bold"></i></button>
          <button class="html-editor-btn" type="button" data-html-cmd="italic" title="Miring"><i class="bi bi-type-italic"></i></button>
          <button class="html-editor-btn" type="button" data-html-cmd="ul" title="Daftar bullet"><i class="bi bi-list-ul"></i></button>
          <button class="html-editor-btn" type="button" data-html-cmd="ol" title="Daftar bernomor"><i class="bi bi-list-ol"></i></button>
          <button class="html-editor-btn" type="button" data-html-cmd="quote" title="Kutipan"><i class="bi bi-quote"></i></button>
          <button class="html-editor-btn" type="button" data-html-cmd="link" title="Tautan"><i class="bi bi-link-45deg"></i></button>
        </div>
        <textarea class="form-control html-editor-textarea" name="${field.key}" rows="${field.rows || 3}" data-html-editor-input ${requiredAttr}>${escapeHtml(value)}</textarea>
        <div class="form-text">Blok (pilih) teks lalu klik <strong>H2/H3/H4</strong> untuk menandai judul bagian &mdash; tidak perlu ketik tag HTML manual. H2 = bagian utama, H3 = sub-bagian, H4 = detail terdalam, berurutan tanpa lompat level. Jangan pakai H1 di sini karena judul di atas sudah otomatis jadi H1 halaman.</div>
        <div class="html-editor-outline" data-html-editor-outline>
          <p class="small fw-bold mb-2 text-primary"><i class="bi bi-list-nested"></i> Pratinjau struktur Daftar Isi</p>
          <div data-html-editor-outline-body></div>
        </div>
        ${hint}
      </div>`;
  }
  if (field.type === "textarea") {
    return `<div class="mb-3"><label class="form-label small fw-bold">${field.label}</label><textarea class="form-control" name="${field.key}" rows="${field.rows || 3}" ${requiredAttr}>${escapeHtml(value)}</textarea>${hint}</div>`;
  }
  if (field.type === "select") {
    return `<div class="mb-3"><label class="form-label small fw-bold">${field.label}</label><select class="form-select" name="${field.key}" ${requiredAttr}>${field.options
      .map((option) => {
        const optValue =
          option && typeof option === "object" ? option.value : option;
        const optLabel =
          option && typeof option === "object" ? option.label : option;
        return `<option value="${escapeHtml(optValue)}" ${String(value) === String(optValue) ? "selected" : ""}>${escapeHtml(optLabel)}</option>`;
      })
      .join("")}</select>${hint}</div>`;
  }
  if (field.type === "number") {
    return `<div class="mb-3"><label class="form-label small fw-bold">${field.label}</label><input class="form-control" type="number" name="${field.key}" value="${value}" ${requiredAttr}>${hint}</div>`;
  }
  if (field.type === "date") {
    return `<div class="mb-3"><label class="form-label small fw-bold">${field.label}</label><input class="form-control" type="date" name="${field.key}" value="${value}" ${requiredAttr}></div>`;
  }
  if (field.type === "image") {
    return `
      <div class="mb-3" data-image-field="${field.key}">
        <label class="form-label small fw-bold">${field.label}</label>
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <img class="image-field-preview" src="${value || "assets/images/article-placeholder.svg"}" alt="Pratinjau">
          <div class="flex-grow-1" style="min-width:220px;">
            <input class="form-control form-control-sm mb-2" type="text" name="${field.key}" value="${escapeHtml(value)}" placeholder="Tempel link gambar (https://...)">
            <div class="d-flex gap-2 align-items-center">
              <input class="form-control form-control-sm" type="file" accept="image/*" data-image-upload>
              <button type="button" class="btn btn-sm btn-outline-danger flex-shrink-0" data-media-delete-btn ${value ? "" : "disabled"} title="Hapus file dari Cloudinary"><i class="bi bi-trash"></i></button>
            </div>
            <div class="small text-muted mt-1 d-none" data-media-progress><span class="spinner-border spinner-border-sm"></span> Mengunggah ke Cloudinary...</div>
          </div>
        </div>
        <div class="form-text">Tempel link gambar dari internet (termasuk link share Google Drive), atau unggah file langsung dari perangkat. Tombol <i class="bi bi-trash"></i> menghapus file dari Cloudinary (hanya aktif untuk file hasil upload, bukan link eksternal).</div>
      </div>`;
  }
  if (field.type === "video" || field.type === "audio") {
    const accept = field.type === "video" ? "video/*" : "audio/*";
    const previewTag =
      field.type === "video"
        ? `<video class="media-field-preview" controls style="max-width:260px;max-height:160px;background:#000;" ${value ? `src="${escapeHtml(value)}"` : ""}></video>`
        : `<audio class="media-field-preview" controls style="width:260px;" ${value ? `src="${escapeHtml(value)}"` : ""}></audio>`;
    return `
      <div class="mb-3" data-media-field="${field.key}">
        <label class="form-label small fw-bold">${field.label}</label>
        <div class="d-flex align-items-center gap-3 flex-wrap">
          ${previewTag}
          <div class="flex-grow-1" style="min-width:220px;">
            <input class="form-control form-control-sm mb-2" type="text" name="${field.key}" value="${escapeHtml(value)}" placeholder="Tempel link ${field.type === "video" ? "video" : "audio"} (https://...)">
            <div class="d-flex gap-2 align-items-center">
              <input class="form-control form-control-sm" type="file" accept="${accept}" data-media-upload>
              <button type="button" class="btn btn-sm btn-outline-danger flex-shrink-0" data-media-delete-btn ${value ? "" : "disabled"} title="Hapus file dari Cloudinary"><i class="bi bi-trash"></i></button>
            </div>
            <div class="small text-muted mt-1 d-none" data-media-progress><span class="spinner-border spinner-border-sm"></span> Mengunggah ke Cloudinary...</div>
          </div>
        </div>
        <div class="form-text">Tempel link ${field.type === "video" ? "video" : "audio"} dari internet, atau unggah file langsung dari perangkat (otomatis tersimpan ke Cloudinary). Tombol <i class="bi bi-trash"></i> menghapus file dari Cloudinary (hanya aktif untuk file hasil upload, bukan link eksternal).</div>
      </div>`;
  }
  return `<div class="mb-3"><label class="form-label small fw-bold">${field.label}</label><input class="form-control" type="text" name="${field.key}" value="${escapeHtml(value)}" ${requiredAttr}>${hint}</div>`;
};

// Cek di sisi client apakah sebuah URL adalah hasil upload Cloudinary
// (dipakai untuk menentukan apakah tombol "Hapus file" perlu memanggil
// API penghapusan, atau cukup mengosongkan field kalau isinya link
// eksternal seperti YouTube/Drive).
const isCloudinaryUrlClient_ = (url) =>
  typeof url === "string" && url.indexOf("res.cloudinary.com/") !== -1;

// Dipakai bersama oleh wireImageField & wireMediaField: mengaktifkan
// tombol "Hapus file". Kalau isi field adalah URL Cloudinary, tombol
// memanggil action "deletemedia" (file benar-benar dihapus dari akun
// Cloudinary) baru mengosongkan field. Kalau isinya link eksternal
// (bukan upload Cloudinary), tombol cukup mengosongkan field tanpa
// memanggil API apa pun.
const wireMediaDeleteButton = (wrapper, urlInput, preview, placeholderSrc) => {
  const deleteBtn = wrapper.querySelector("[data-media-delete-btn]");
  if (!deleteBtn) return;
  const syncState = () => {
    deleteBtn.disabled = !urlInput.value;
  };
  urlInput.addEventListener("input", syncState);
  syncState();
  deleteBtn.addEventListener("click", async () => {
    const currentUrl = urlInput.value;
    if (!currentUrl) return;
    if (!isCloudinaryUrlClient_(currentUrl)) {
      urlInput.value = "";
      preview.src = placeholderSrc;
      syncState();
      return;
    }
    if (
      !confirm(
        "Hapus file ini dari Cloudinary? File akan hilang permanen dan tidak bisa dikembalikan.",
      )
    )
      return;
    deleteBtn.disabled = true;
    try {
      await HCApi.adminDeleteMedia(currentUrl, state.token);
      urlInput.value = "";
      preview.src = placeholderSrc;
      showToast("File berhasil dihapus dari Cloudinary.");
    } catch (error) {
      showToast(error.message || "Gagal menghapus file.", "danger");
    } finally {
      syncState();
    }
  });
};

const wireImageField = (field) => {
  const wrapper = qs(`[data-image-field="${field.key}"]`);
  if (!wrapper) return;
  const urlInput = wrapper.querySelector(`input[name="${field.key}"]`);
  const fileInput = wrapper.querySelector("[data-image-upload]");
  const preview = wrapper.querySelector(".image-field-preview");
  urlInput.addEventListener("input", () => {
    preview.src = urlInput.value || "assets/images/article-placeholder.svg";
  });
  urlInput.addEventListener("change", () => {
    urlInput.value = normalizeImageUrl(urlInput.value);
    preview.src = urlInput.value || "assets/images/article-placeholder.svg";
  });
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    preview.src = URL.createObjectURL(file);
    try {
      const uploadedUrl = await HCApi.adminUploadImage(file, state.token);
      urlInput.value = uploadedUrl;
      preview.src = uploadedUrl;
      showToast("Gambar berhasil diunggah.");
    } catch (error) {
      showToast(error.message || "Gagal mengunggah gambar.", "danger");
    }
  });
  wireMediaDeleteButton(
    wrapper,
    urlInput,
    preview,
    "assets/images/article-placeholder.svg",
  );
};

// Sama seperti wireImageField, tapi untuk field bertipe "video"/"audio":
// file dipilih -> tampil preview lokal (URL.createObjectURL) -> diunggah
// ke Cloudinary lewat adminUploadMedia -> input link diisi otomatis
// dengan URL Cloudinary hasil upload.
const wireMediaField = (field) => {
  const wrapper = qs(`[data-media-field="${field.key}"]`);
  if (!wrapper) return;
  const urlInput = wrapper.querySelector(`input[name="${field.key}"]`);
  const fileInput = wrapper.querySelector("[data-media-upload]");
  const preview = wrapper.querySelector(".media-field-preview");
  const progress = wrapper.querySelector("[data-media-progress]");
  urlInput.addEventListener("change", () => {
    preview.src = urlInput.value || "";
  });
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    preview.src = URL.createObjectURL(file);
    progress?.classList.remove("d-none");
    try {
      const media = await HCApi.adminUploadMedia(file, state.token);
      urlInput.value = media.url;
      preview.src = media.url;
      showToast(
        field.type === "video"
          ? "Video berhasil diunggah."
          : "Audio berhasil diunggah.",
      );
    } catch (error) {
      showToast(error.message || "Gagal mengunggah file.", "danger");
    } finally {
      progress?.classList.add("d-none");
    }
  });
  wireMediaDeleteButton(wrapper, urlInput, preview, "");
};

// === Editor "Isi (HTML)": toolbar heading H2-H4 + pratinjau struktur TOC ===
// Textarea tetap menyimpan HTML mentah (sesuai format yang dipakai
// buildArticleTableOfContents di article.js), tapi penulis konten tidak
// perlu mengetik tag secara manual: blok teks lalu klik tombol, tag
// disisipkan otomatis di posisi kursor/seleksi.
const HTML_EDITOR_TAGS = {
  h2: { tag: "h2", placeholder: "Judul Bagian" },
  h3: { tag: "h3", placeholder: "Judul Sub Bagian" },
  h4: { tag: "h4", placeholder: "Judul Detail" },
  bold: { tag: "strong", placeholder: "teks tebal" },
  italic: { tag: "em", placeholder: "teks miring" },
  quote: { tag: "blockquote", placeholder: "Kutipan" },
};

// Ambil urutan H2/H3/H4 dari string HTML mentah di textarea, dipakai
// untuk menggambar pratinjau struktur Daftar Isi secara real-time.
const parseHeadingOutline = (html) => {
  try {
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    return [...doc.querySelectorAll("h2, h3, h4")].map((el) => ({
      level: Number(el.tagName.slice(1)),
      text: el.textContent.trim() || "(judul kosong)",
    }));
  } catch (error) {
    return [];
  }
};

// Render daftar heading berjenjang + tandai kalau ada level yang
// "lompat" (mis. H4 muncul tanpa H3 sebelumnya, atau bagian pertama
// langsung H3/H4) supaya penulis konten sadar itu melanggar kaidah
// heading yang benar untuk SEO.
const renderHeadingOutline = (headings) => {
  if (!headings.length) {
    return `<p class="small lead-muted mb-0">Belum ada judul bagian (H2/H3/H4). Tambahkan minimal satu H2 supaya artikel punya struktur Daftar Isi yang baik.</p>`;
  }
  let lastLevel = 1; // H1 dianggap sudah dipakai oleh judul artikel/halaman
  return headings
    .map((item) => {
      const skipped = item.level > lastLevel + 1;
      lastLevel = item.level;
      const indent = (item.level - 2) * 18;
      const warning = skipped
        ? `<i class="bi bi-exclamation-triangle-fill text-warning ms-1" title="Lompat level: sebaiknya H${item.level} didahului H${item.level - 1}"></i>`
        : "";
      return `<div class="html-editor-outline-item" style="padding-left:${indent}px"><span class="badge-soft html-editor-outline-badge">H${item.level}</span> ${escapeHtml(item.text)}${warning}</div>`;
    })
    .join("");
};

// Sisipkan tag HTML di sekitar teks yang sedang diblok (atau di posisi
// kursor kalau tidak ada seleksi) menggunakan textarea.setRangeText,
// jadi kaidah H1-H4 tidak perlu diketik manual oleh penulis konten.
const applyHtmlEditorCommand = (textarea, cmd) => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  let insert;

  if (cmd === "p") {
    insert = `<p>${selected || "Paragraf baru"}</p>`;
  } else if (cmd === "ul" || cmd === "ol") {
    const lines = (selected || "Poin pertama\nPoin kedua")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const items = lines.map((line) => `  <li>${line}</li>`).join("\n");
    insert = `<${cmd}>\n${items}\n</${cmd}>`;
  } else if (cmd === "link") {
    const url = window.prompt("Masukkan URL tautan:", "https://");
    if (url === null) return;
    insert = `<a href="${url}">${selected || "teks tautan"}</a>`;
  } else if (HTML_EDITOR_TAGS[cmd]) {
    const { tag, placeholder } = HTML_EDITOR_TAGS[cmd];
    insert = `<${tag}>${selected || placeholder}</${tag}>`;
  } else {
    return;
  }

  textarea.setRangeText(insert, start, end, "end");
  textarea.focus();
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
};

const wireHtmlEditorField = (field) => {
  const wrapper = qs(`[data-html-editor-field="${field.key}"]`);
  if (!wrapper) return;
  const textarea = wrapper.querySelector("[data-html-editor-input]");
  const outlineBody = wrapper.querySelector("[data-html-editor-outline-body]");
  if (!textarea) return;

  wrapper.querySelectorAll("[data-html-cmd]").forEach((button) => {
    button.addEventListener("click", () =>
      applyHtmlEditorCommand(textarea, button.dataset.htmlCmd),
    );
  });

  const updateOutline = () => {
    if (!outlineBody) return;
    outlineBody.innerHTML = renderHeadingOutline(
      parseHeadingOutline(textarea.value),
    );
  };
  textarea.addEventListener("input", updateOutline);
  updateOutline();
};

const escapeHtml = (value) => String(value ?? "").replace(/"/g, "&quot;");

// Link Google Drive hasil "Share" (mis. .../file/d/FILE_ID/view?usp=sharing
// atau ...open?id=FILE_ID) tidak bisa langsung dipakai sebagai src gambar --
// perlu diubah ke format "uc?export=view&id=FILE_ID" supaya tampil sebagai
// gambar biasa. Dipakai setiap ada field tempel-link gambar (termasuk foto
// profil penulis) supaya admin tinggal tempel link Drive apa adanya.
const normalizeImageUrl = (url) => {
  const value = String(url || "").trim();
  if (!value || !/drive\.google\.com/.test(value)) return value;
  const fileMatch = value.match(/\/file\/d\/([^/]+)/);
  const idParamMatch = value.match(/[?&]id=([^&]+)/);
  const fileId = fileMatch ? fileMatch[1] : idParamMatch ? idParamMatch[1] : "";
  if (!fileId) return value;
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

qs("#entryForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const config = ADMIN_SCHEMA[state.currentSheet];
  const formData = new FormData(event.target);
  const payload = {};
  config.fields.forEach((field) => {
    payload[field.key] = formData.get(field.key) || "";
  });
  const submitBtn = qs("#formSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';
  try {
    if (state.editingId) {
      await HCApi.adminUpdate(
        state.currentSheet,
        state.editingId,
        payload,
        state.token,
      );
      showToast("Data berhasil diperbarui.");
    } else {
      await HCApi.adminCreate(state.currentSheet, payload, state.token);
      showToast("Data berhasil ditambahkan.");
    }
    bootstrap.Modal.getInstance(qs("#formModal")).hide();
    selectSheet(state.currentSheet);
  } catch (error) {
    showToast(error.message || "Gagal menyimpan data.", "danger");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-check2"></i> Simpan';
  }
});

const handleToggleStatus = async (id) => {
  const row = state.rows.find((item) => String(item.id) === String(id));
  if (!row) return;
  const nextStatus = row.status === "Publish" ? "Draft" : "Publish";
  try {
    await HCApi.adminUpdate(
      state.currentSheet,
      id,
      { ...row, status: nextStatus },
      state.token,
    );
    showToast(
      nextStatus === "Publish" ? "Data dipublish." : "Data dijadikan draft.",
    );
    selectSheet(state.currentSheet);
  } catch (error) {
    showToast(error.message || "Gagal mengubah status.", "danger");
  }
};

const handleDelete = async (id) => {
  if (!confirm("Hapus data ini? Tindakan tidak bisa dibatalkan.")) return;
  try {
    await HCApi.adminDelete(state.currentSheet, id, state.token);
    showToast("Data berhasil dihapus.");
    selectSheet(state.currentSheet);
  } catch (error) {
    showToast(error.message || "Gagal menghapus data.", "danger");
  }
};

// Tombol cepat "Verifikasi" khusus baris Pesanan Badal Umroh yang
// tracking-nya sudah dikirim petugas (status "menunggu_verifikasi").
// Memverifikasi sekaligus menandai Pesanan menjadi "selesai" di sisi
// server (lihat action "badal_verify" di Code.gs), jadi admin tidak perlu
// buka form Edit terpisah untuk mengubah status.
const handleVerifyBadal = async (pesananId) => {
  if (
    !confirm(
      "Verifikasi rute tracking petugas untuk pesanan ini? Pesanan akan otomatis ditandai \"selesai\".",
    )
  )
    return;
  try {
    await HCApi.verifyBadalTracking(pesananId, state.token);
    showToast("Tracking diverifikasi & pesanan ditandai selesai.");
    await loadBadalPendingVerifications(true);
    selectSheet(state.currentSheet);
  } catch (error) {
    showToast(error.message || "Gagal memverifikasi tracking.", "danger");
  }
};

// Cache daftar pesanan_id Badal Umroh yang tracking-nya menunggu
// verifikasi, dipakai renderTableBody() untuk menampilkan tombol
// "Verifikasi" hanya pada baris yang relevan.
const loadBadalPendingVerifications = async (forceReload = false) => {
  if (state.badalPendingVerification && !forceReload)
    return state.badalPendingVerification;
  try {
    const rows = await HCApi.getBadalPendingVerifications(state.token);
    state.badalPendingVerification = new Set(
      rows.map((row) => String(row.pesanan_id)),
    );
  } catch (error) {
    console.warn(
      "Gagal memuat daftar tracking menunggu verifikasi:",
      error.message,
    );
    state.badalPendingVerification = new Set();
  }
  return state.badalPendingVerification;
};

// === Modal cepat "Terima & Tugaskan Petugas" (khusus Pesanan Badal Umroh) ===
// Alternatif lebih ringkas dari form Edit lengkap: admin cukup pilih nama
// petugas dari dropdown, opsional isi tanggal pelaksanaan, lalu Simpan --
// otomatis mengubah status pesanan jadi "diproses" dan mengisi
// petugas_badal_id. Memakai action generik "update" (HCApi.adminUpdate) yang
// sama seperti form Edit biasa, jadi field lain pada baris tetap
// dipertahankan.
const openAssignPetugasModal = async (row) => {
  if (!row) return;
  const options = await loadPetugasBadalOptions();
  let untuk = "";
  try {
    untuk = JSON.parse(row.data_pesanan || "{}").untuk || "";
  } catch (error) {
    untuk = "";
  }
  qs("#assignPesananInfo").textContent =
    (row.nama_pemesan || "Pemesan") + (untuk ? " — untuk " + untuk : "");
  qs("#assignPesananId").value = row.id;
  qs("#assignPetugasAlert").classList.add("d-none");
  const select = qs("#assignPetugasSelect");
  select.innerHTML = options.length
    ? options
        .map(
          (option) =>
            `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`,
        )
        .join("")
    : '<option value="">Belum ada data di menu "Petugas Badal"</option>';
  if (row.petugas_badal_id) select.value = row.petugas_badal_id;
  qs("#assignTanggalHijri").value = row.tanggal_pelaksanaan_hijri || "";
  new bootstrap.Modal(qs("#assignPetugasModal")).show();
};

qs("#assignPetugasForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const alertBox = qs("#assignPetugasAlert");
  alertBox.classList.add("d-none");
  const id = qs("#assignPesananId").value;
  const petugasId = qs("#assignPetugasSelect").value;
  const tanggal = qs("#assignTanggalHijri").value.trim();
  if (!petugasId) {
    alertBox.textContent =
      'Pilih petugas terlebih dahulu (atau tambahkan datanya dulu di menu "Petugas Badal").';
    alertBox.classList.remove("d-none");
    return;
  }
  const submitBtn = qs("#assignPetugasSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';
  try {
    await HCApi.adminUpdate(
      "Pesanan",
      id,
      {
        status: "diproses",
        petugas_badal_id: petugasId,
        tanggal_pelaksanaan_hijri: tanggal,
      },
      state.token,
    );
    showToast("Pesanan diterima & petugas berhasil ditugaskan.");
    bootstrap.Modal.getInstance(qs("#assignPetugasModal")).hide();
    selectSheet(state.currentSheet);
  } catch (error) {
    alertBox.textContent = error.message || "Gagal menyimpan penugasan.";
    alertBox.classList.remove("d-none");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-check2"></i> Terima & Simpan';
  }
});

// === Panel Profil Saya (penulis & super_admin mengatur avatar sendiri) ===
const loadProfile = () => {
  const user = state.currentUser;
  qs("#profileAlert").classList.add("d-none");
  qs("#profileNama").value = user.nama || "";
  qs("#profileWhatsapp").value = user.whatsapp || "";
  qs("#profileFotoUrl").value = user.foto || "";
  qs("#profilePassword").value = "";
  qs("#profileAvatarPreview").src =
    user.foto || "assets/images/article-placeholder.svg";
  qs("#profileRoleBadge").textContent = roleLabel(user.role);
};

const wireProfileImageField = () => {
  const urlInput = qs("#profileFotoUrl");
  const fileInput = qs("#profileFotoUpload");
  const preview = qs("#profileAvatarPreview");
  if (!urlInput || !fileInput || !preview) return;
  urlInput.addEventListener("input", () => {
    preview.src = urlInput.value || "assets/images/article-placeholder.svg";
  });
  urlInput.addEventListener("change", () => {
    urlInput.value = normalizeImageUrl(urlInput.value);
    preview.src = urlInput.value || "assets/images/article-placeholder.svg";
  });
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    preview.src = URL.createObjectURL(file);
    try {
      const uploadedUrl = await HCApi.adminUploadImage(file, state.token);
      urlInput.value = uploadedUrl;
      preview.src = uploadedUrl;
      showToast("Foto profil berhasil diunggah.");
    } catch (error) {
      showToast(error.message || "Gagal mengunggah foto.", "danger");
    }
  });
};

qs("#profileForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const alertBox = qs("#profileAlert");
  alertBox.classList.add("d-none");
  const submitBtn = qs("#profileSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';
  try {
    const password = qs("#profilePassword").value;
    const updatedUser = await HCApi.updateProfile(
      {
        nama: qs("#profileNama").value.trim(),
        whatsapp: qs("#profileWhatsapp").value.trim(),
        foto: normalizeImageUrl(qs("#profileFotoUrl").value.trim()),
        password: password || undefined,
      },
      state.token,
    );
    // Sinkronkan sesi lokal (localStorage) supaya nama/foto terbaru langsung
    // terpakai di navbar & tidak tertimpa balik oleh data lama saat reload.
    window.HCAuth.setSession({ token: state.token, user: updatedUser });
    state.currentUser = updatedUser;
    window.hcAuthRenderNav();
    showToast("Profil berhasil diperbarui.");
    loadProfile();
  } catch (error) {
    alertBox.textContent = error.message || "Gagal memperbarui profil.";
    alertBox.classList.remove("d-none");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-check2"></i> Simpan Profil';
  }
});

// === Panel Pengguna (khusus super_admin) ===
const roleLabel = (role) => {
  if (role === "super_admin") return "Super Admin";
  if (role === "penulis") return "Pengelola Konten";
  if (role === "petugas_badal") return "Petugas Badal";
  return "Member";
};

const loadUsers = async () => {
  const tbody = qs("#usersTableBody");
  tbody.innerHTML =
    '<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>';
  qs("#usersAlert").classList.add("d-none");
  try {
    state.users = await HCApi.usersList(state.token);
    renderUsersTable();
  } catch (error) {
    qs("#usersAlert").textContent = error.message || "Gagal memuat pengguna.";
    qs("#usersAlert").classList.remove("d-none");
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center py-4 lead-muted">Gagal memuat data.</td></tr>';
  }
};

const renderUsersTable = () => {
  const tbody = qs("#usersTableBody");
  if (!state.users.length) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center py-4 lead-muted">Belum ada pengguna.</td></tr>';
    return;
  }
  tbody.innerHTML = state.users
    .map(
      (user) => `
    <tr>
      <td>${escapeHtml(user.nama)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(user.whatsapp || "-")}</td>
      <td><span class="badge-soft">${roleLabel(user.role)}</span></td>
      <td><span class="badge-soft" style="${user.status === "nonaktif" ? "background:#fee2e2;color:#991b1b;border-color:#fecaca;" : ""}">${user.status}</span></td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-primary" type="button" data-edit-user="${user.id}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" type="button" data-delete-user="${user.id}"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `,
    )
    .join("");
  tbody.querySelectorAll("[data-edit-user]").forEach((button) => {
    button.addEventListener("click", () =>
      openUserForm(
        state.users.find((user) => String(user.id) === button.dataset.editUser),
      ),
    );
  });
  tbody.querySelectorAll("[data-delete-user]").forEach((button) => {
    button.addEventListener("click", () =>
      handleDeleteUser(button.dataset.deleteUser),
    );
  });
};

const openUserForm = (user = null) => {
  state.editingUserId = user ? user.id : null;
  qs("#userFormModalTitle").textContent = user
    ? "Edit Pengguna"
    : "Tambah Pengguna";
  qs("#userFormAlert").classList.add("d-none");
  qs("#userFormId").value = user ? user.id : "";
  qs("#userFormNama").value = user ? user.nama : "";
  qs("#userFormEmail").value = user ? user.email : "";
  qs("#userFormEmail").disabled = Boolean(user); // email tidak bisa diubah setelah dibuat
  qs("#userFormWhatsapp").value = user ? user.whatsapp || "" : "";
  qs("#userFormRole").value = user ? user.role : "penulis";
  qs("#userFormPassword").value = "";
  qs("#userFormPassword").required = !user;
  qs("#userFormPasswordHint").textContent = user
    ? "Kosongkan jika tidak ingin mengubah password."
    : "Minimal 8 karakter.";
  new bootstrap.Modal(qs("#userFormModal")).show();
};

qs("#addUserBtn")?.addEventListener("click", () => openUserForm());

qs("#userEntryForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const alertBox = qs("#userFormAlert");
  alertBox.classList.add("d-none");
  const id = qs("#userFormId").value;
  const password = qs("#userFormPassword").value;
  const submitBtn = qs("#userFormSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';
  try {
    if (id) {
      await HCApi.usersUpdate(
        {
          id,
          nama: qs("#userFormNama").value.trim(),
          whatsapp: qs("#userFormWhatsapp").value.trim(),
          role: qs("#userFormRole").value,
          password: password || undefined,
        },
        state.token,
      );
      showToast("Pengguna berhasil diperbarui.");
    } else {
      await HCApi.usersCreate(
        {
          nama: qs("#userFormNama").value.trim(),
          email: qs("#userFormEmail").value.trim(),
          whatsapp: qs("#userFormWhatsapp").value.trim(),
          role: qs("#userFormRole").value,
          password,
        },
        state.token,
      );
      showToast("Akun berhasil dibuat.");
    }
    bootstrap.Modal.getInstance(qs("#userFormModal")).hide();
    loadUsers();
  } catch (error) {
    alertBox.textContent = error.message || "Gagal menyimpan pengguna.";
    alertBox.classList.remove("d-none");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-check2"></i> Simpan';
  }
});

const handleDeleteUser = async (id) => {
  if (!confirm("Hapus pengguna ini? Tindakan tidak bisa dibatalkan.")) return;
  try {
    await HCApi.usersDelete(id, state.token);
    showToast("Pengguna berhasil dihapus.");
    loadUsers();
  } catch (error) {
    showToast(error.message || "Gagal menghapus pengguna.", "danger");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  wireProfileImageField();

  qs("#addBtn").addEventListener("click", () => {
    if (!state.currentSheet) return;
    openFormSmart(ADMIN_SCHEMA[state.currentSheet]);
  });

  qs("#searchInput").addEventListener("input", (event) => {
    if (!state.currentSheet) return;
    renderTableBody(ADMIN_SCHEMA[state.currentSheet], event.target.value);
  });

  qs("#sidebarToggle").addEventListener("click", () =>
    qs("#adminSidebar").classList.toggle("show"),
  );

  qs("#logoutBtn").addEventListener("click", () => {
    window.HCAuth.logout();
    window.location.href = "login.html";
  });
});