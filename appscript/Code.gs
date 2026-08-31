// ============================================================
// KONFIGURASI CLOUDINARY -- dipakai untuk menyimpan semua file
// media (gambar, video, audio) yang diunggah lewat Admin Panel.
// Ganti tiga nilai di bawah dengan kredensial akun Cloudinary
// Anda (buka https://cloudinary.com/console, kredensial ada di
// bagian atas Dashboard): Cloud Name, API Key, API Secret.
//
// CATATAN KEAMANAN: API Secret di bawah ini AMAN ditulis di sini
// karena Code.gs hanya berjalan di server Apps Script dan tidak
// pernah dikirim ke browser pengguna. Yang tidak aman adalah
// menaruh API Secret di file JavaScript sisi client (assets/js).
// Kalau nanti mau lebih rapi, nilai-nilai ini juga bisa dipindah
// ke Script Properties (menu Project Settings di editor Apps
// Script) dengan pola yang sama seperti getSessionSecret_() di
// bawah, tapi menaruhnya langsung di sini seperti sekarang juga
// sudah cukup aman selama file ini tidak dibagikan ke publik.
// ============================================================
const CLOUDINARY_CONFIG = {
  cloudName: "f82xrdas", // contoh: "dxyzabc12"
  apiKey: "512546983649782", // contoh: "123456789012345"
  apiSecret: "SgKYsBigt2Zs_HTNYXiJSy6l0cA",
  folder: "DataMedia", // folder utama tempat semua upload disimpan di Cloudinary
};

// === Sesi login multi-role (super admin / penulis / member) ===
// Ini SATU-SATUNYA sistem login di seluruh situs (dulu ada 2: sistem
// password admin tunggal di sini + sistem role di Users. Sekarang sistem
// password tunggal sudah dihapus total). Semua login -- publik (navbar,
// login.html) maupun Admin Panel (admin.html) -- lewat action
// user_login/user_register di sheet Users, dibedakan lewat kolom "role".
// Sama seperti password admin di atas, "kunci" untuk menandatangani sesi
// login (token) TIDAK ditulis langsung di kode, tapi disimpan di Script
// Properties supaya tidak ikut kelihatan/ter-copy kalau file ini dibagikan.
//
// CARA SET (cukup sekali):
//   1. Buka project Apps Script ini di script.google.com
//   2. Di dropdown pilihan fungsi pilih "setSessionSecret"
//   3. Isi SECRET_BARU di fungsi setSessionSecret() paling bawah file ini
//      dengan string acak yang panjang (misal 32+ karakter bebas).
//   4. Klik Run sekali, lalu kosongkan lagi nilainya.
function getSessionSecret_() {
  const secret =
    PropertiesService.getScriptProperties().getProperty("SESSION_SECRET");
  if (!secret) {
    throw new Error(
      "Session secret belum diset. Jalankan fungsi setSessionSecret() sekali dari editor Apps Script.",
    );
  }
  return secret;
}

function setSessionSecret() {
  const SECRET_BARU = ""; // <-- isi sementara dengan string acak panjang, lalu Run, lalu kosongkan lagi
  if (!SECRET_BARU || SECRET_BARU.length < 20) {
    throw new Error(
      "Isi SECRET_BARU dengan string acak minimal 20 karakter sebelum Run.",
    );
  }
  PropertiesService.getScriptProperties().setProperty(
    "SESSION_SECRET",
    SECRET_BARU,
  );
  Logger.log("Session secret berhasil disimpan.");
}

// Hash password dengan salt acak (bukan plain text) memakai SHA-256 bawaan
// Apps Script. Format tersimpan: "<salt>$<hex digest>".
function hashPassword_(password, salt) {
  const usedSalt = salt || Utilities.getUuid();
  const digestBytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    usedSalt + ":" + password,
  );
  const hex = digestBytes
    .map(function (b) {
      const v = (b < 0 ? b + 256 : b).toString(16);
      return v.length === 1 ? "0" + v : v;
    })
    .join("");
  return usedSalt + "$" + hex;
}

function verifyPassword_(password, stored) {
  if (!stored || String(stored).indexOf("$") === -1) return false;
  const salt = String(stored).split("$")[0];
  return hashPassword_(password, salt) === stored;
}

// Token sesi sederhana ala JWT: base64url(payload JSON) + "." +
// base64url(HMAC-SHA256(payload, SESSION_SECRET)). Tidak terenkripsi (jangan
// taruh data rahasia di payload), tapi tidak bisa dipalsukan tanpa tahu
// SESSION_SECRET, dan punya masa berlaku (exp) supaya sesi lama otomatis basi.
function signToken_(payloadObj) {
  const payloadB64 = Utilities.base64EncodeWebSafe(
    JSON.stringify(payloadObj),
  ).replace(/=+$/, "");
  const signatureBytes = Utilities.computeHmacSha256Signature(
    payloadB64,
    getSessionSecret_(),
  );
  const signatureB64 = Utilities.base64EncodeWebSafe(signatureBytes).replace(
    /=+$/,
    "",
  );
  return payloadB64 + "." + signatureB64;
}

function verifyToken_(token) {
  if (!token || typeof token !== "string" || token.indexOf(".") === -1) {
    throw new Error("Token tidak valid. Silakan login kembali.");
  }
  const parts = token.split(".");
  const payloadB64 = parts[0];
  const signatureB64 = parts[1];
  const expectedSigBytes = Utilities.computeHmacSha256Signature(
    payloadB64,
    getSessionSecret_(),
  );
  const expectedSigB64 = Utilities.base64EncodeWebSafe(
    expectedSigBytes,
  ).replace(/=+$/, "");
  if (expectedSigB64 !== signatureB64) {
    throw new Error("Token tidak valid atau telah diubah.");
  }
  let payload;
  try {
    payload = JSON.parse(
      Utilities.newBlob(
        Utilities.base64DecodeWebSafe(payloadB64),
      ).getDataAsString(),
    );
  } catch (e) {
    throw new Error("Token tidak valid.");
  }
  if (!payload.exp || Date.now() > payload.exp) {
    throw new Error("Sesi telah berakhir, silakan login kembali.");
  }
  return payload;
}

const SHEETS = {
  artikel: "Artikel",
  pengalaman: "Pengalaman",
  kategori: "Kategori",
  istilah: "Istilah",
  layanan: "Layanan",
  faq: "FAQ",
  peta: "Peta",
  download: "Download",
  video: "Video",
  persiapan: "Persiapan",
  persiapanTimeline: "PersiapanTimeline",
  tataCara: "TataCara",
  users: "Users",
  petugasBadal: "PetugasBadal",
  badalTracking: "BadalTracking",
  badalTrackingPoints: "BadalTrackingPoints",
};

// Sheet "Users" SENGAJA tidak dimasukkan ke MANAGED_SHEETS (generic CRUD
// admin_list/create/update/delete di bawah), supaya password_hash tidak
// pernah ikut terkirim ke frontend lewat aksi generik itu. Semua akses ke
// sheet Users lewat aksi khusus (user_register, user_login, users_list,
// users_create, users_update, users_delete) di bagian bawah file ini.
const USERS_HEADERS = [
  "id",
  "nama",
  "email",
  "whatsapp",
  "password_hash",
  "role", // super_admin | penulis | petugas_badal | member
  "status", // aktif | nonaktif
  "tanggal_daftar",
  "foto", // URL foto profil / avatar penulis, tampil di seluruh kartu & detail artikel
];

// Sheet "Pesanan" untuk menyimpan order dari member dashboard
const PESANAN_HEADERS = [
  "id",
  "user_id",
  "layanan", // badal_umroh | wakaf_quran | panitia_haji
  "nama_pemesan",
  "whatsapp_pemesan",
  "data_pesanan", // JSON string berisi field tambahan
  "status", // pending | diproses | selesai | ditolak
  "catatan_admin",
  "tanggal_pesan",
  "petugas_badal_id", // diisi admin: id petugas dari sheet PetugasBadal (khusus layanan badal_umroh)
  "tanggal_pelaksanaan_hijri", // diisi admin: tanggal pelaksanaan badal, format bebas mis. "12 Rabiul Awal 1448 H"
];

// Sheet "PetugasBadal" untuk data petugas pelaksana jasa Badal Umroh, dipakai
// untuk mengisi nama & tanda tangan pada sertifikat Badal Umroh.
const PETUGAS_BADAL_HEADERS = ["id", "nama", "ttd", "status"];

// Sheet "BadalTracking" menyimpan posisi live petugas Badal Umroh, SATU baris
// per pesanan (di-upsert, bukan log semua titik), dipakai untuk fitur
// "Lacak Live" di akun.html (dokumentasi realtime maps). Petugas mengirim
// update lewat halaman petugas-badal.html (tombol "Mulai Badal"), lalu
// pemesan memantau lewat polling berkala (bukan sheet ini diedit manual).
const BADAL_TRACKING_HEADERS = [
  "id",
  "pesanan_id",
  "petugas_user_id", // id akun Users (role petugas_badal) yang mengirim posisi
  "lat",
  "lng",
  "status", // berlangsung | menunggu_verifikasi | selesai
  "started_at",
  "updated_at",
  "finished_at", // diisi saat petugas menekan "Selesai" (status -> menunggu_verifikasi)
  "verified_at", // diisi saat admin memverifikasi (status -> selesai)
  "verified_by", // id akun admin (Users) yang memverifikasi
];

// Sheet "BadalTrackingPoints" menyimpan SETIAP titik koordinat yang dikirim
// petugas selama live tracking berlangsung (bukan cuma posisi terakhir),
// dipakai untuk menggambar rute lengkap ala Strava + bukti riwayat & export
// GPX di akun.html setelah pelaksanaan selesai/diverifikasi.
const BADAL_TRACKING_POINTS_HEADERS = [
  "id",
  "pesanan_id",
  "lat",
  "lng",
  "recorded_at",
];

// Sheet-sheet yang boleh dikelola lewat Admin Panel (create/update/delete generik).
const MANAGED_SHEETS = {
  Artikel: [
    "id",
    "judul",
    "slug",
    "kategori",
    "gambar",
    "ringkasan",
    "isi",
    "penulis",
    "tanggal",
    "sumber_referensi",
    "views",
    "status",
  ],
  Pengalaman: [
    "id",
    "nama",
    "asal",
    "judul",
    "kategori",
    "pengalaman",
    "tips",
    "tanggal",
    "like",
    "status",
  ],
  Kategori: ["id", "nama", "slug", "icon"],
  Istilah: [
    "id",
    "judul",
    "slug",
    "kategori",
    "ringkasan",
    "isi",
    "sumber_referensi",
    "status",
  ],
  Layanan: [
    "id",
    "halaman",
    "eyebrow",
    "judul",
    "ringkasan",
    "isi",
    "sumber_referensi",
    "status",
  ],
  FAQ: ["id", "pertanyaan", "jawaban", "kategori", "status"],
  Peta: [
    "id",
    "nama",
    "kategori",
    "lokasi",
    "deskripsi",
    "rating",
    "jarak",
    "estimasi",
    "harga",
    "maps",
    "gambar",
    "status",
  ],
  Download: [
    "id",
    "judul",
    "deskripsi",
    "kategori",
    "file",
    "gambar",
    "status",
  ],
  Video: [
    "id",
    "judul",
    "kategori",
    "tipe",
    "platform",
    "youtube",
    "deskripsi",
    "status",
  ],
  Pesanan: [
    "id",
    "user_id",
    "layanan",
    "nama_pemesan",
    "whatsapp_pemesan",
    "data_pesanan",
    "status",
    "catatan_admin",
    "tanggal_pesan",
    "petugas_badal_id",
    "tanggal_pelaksanaan_hijri",
  ],
  PetugasBadal: ["id", "nama", "ttd", "status"],
  Persiapan: ["id", "kategori", "item", "status"],
  PersiapanTimeline: ["id", "waktu", "deskripsi", "status"],
  TataCara: [
    "id",
    "jenis",
    "urutan",
    "judul",
    "deskripsi",
    "waktu",
    "doa_dzikir",
    "catatan",
    "status",
  ],
};

// Beberapa sheet punya kosakata status sendiri (bukan Publish/Draft biasa).
// Dipakai oleh createRow/updateRow untuk validasi, dan oleh Admin Panel
// (renderTableBody di admin.js) untuk menyembunyikan tombol toggle
// Publish/Draft pada sheet-sheet ini karena tombol itu tidak relevan.
const CUSTOM_STATUS_OPTIONS = {
  // pending: baru dibuat member, belum ditinjau admin
  // diproses: sedang dikerjakan/ditindaklanjuti admin
  // selesai: pesanan tuntas -- SATU-SATUNYA status yang dianggap valid
  //          untuk verifikasi sertifikat Badal Umroh (lihat
  //          getSertifikatPublicData). Jangan biarkan status Pesanan
  //          ke-default ke "Draft" (nilai generik sheet lain) karena
  //          verifikasi sertifikat akan selalu gagal.
  // ditolak: pesanan tidak dilanjutkan
  Pesanan: ["pending", "diproses", "selesai", "ditolak"],
};

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = (params.action || "artikel").toLowerCase();
  try {
    if (action === "artikel")
      return jsonResponse({
        success: true,
        data: withAuthorPhotoList_(getPublishedRows(SHEETS.artikel)),
      });
    if (action === "detail")
      return jsonResponse({
        success: true,
        data: withAuthorPhoto_(getArticleDetail(params.slug)),
      });
    if (action === "pengalaman")
      return jsonResponse({
        success: true,
        data: getPublishedRows(SHEETS.pengalaman),
      });
    if (action === "kategori")
      return jsonResponse({ success: true, data: getRows(SHEETS.kategori) });
    if (action === "istilah")
      return jsonResponse({
        success: true,
        data: getPublishedRows(SHEETS.istilah),
      });
    if (action === "layanan")
      return jsonResponse({
        success: true,
        data: filterByHalaman(getPublishedRows(SHEETS.layanan), params.halaman),
      });
    if (action === "faq")
      return jsonResponse({
        success: true,
        data: getPublishedRows(SHEETS.faq),
      });
    if (action === "peta")
      return jsonResponse({
        success: true,
        data: filterByKategori(getPublishedRows(SHEETS.peta), params.kategori),
      });
    if (action === "download")
      return jsonResponse({
        success: true,
        data: getPublishedRows(SHEETS.download),
      });
    if (action === "video")
      return jsonResponse({
        success: true,
        data: getPublishedRows(SHEETS.video),
      });
    if (action === "persiapan")
      return jsonResponse({
        success: true,
        data: getPublishedRows(SHEETS.persiapan),
      });
    if (action === "persiapantimeline")
      return jsonResponse({
        success: true,
        data: getPublishedRows(SHEETS.persiapanTimeline),
      });
    if (action === "tatacara")
      return jsonResponse({
        success: true,
        data: filterByJenis(getPublishedRows(SHEETS.tataCara), params.jenis),
      });
    if (action === "sertifikat_verify")
      return jsonResponse({
        success: true,
        data: getSertifikatPublicData(params.id),
      });
    if (action === "petugasbadal")
      return jsonResponse({
        success: true,
        data: getPublishedRows(SHEETS.petugasBadal),
      });
    // Polling posisi live petugas Badal Umroh untuk 1 pesanan (dipakai oleh
    // widget "Lacak Live" di akun.html). Sengaja bisa diakses tanpa token
    // (dipanggil berulang tiap beberapa detik dari browser pemesan), tapi
    // data yang dikembalikan sangat terbatas (cuma lat/lng/status/waktu
    // update) dan hanya untuk pesanan badal_umroh -- pola yang sama seperti
    // "sertifikat_verify" di atas. id pesanan (mis. "psn-1735...") bukan
    // angka tebakan dan tidak membocorkan data pemesan lain.
    if (action === "badal_track_get")
      return jsonResponse({
        success: true,
        data: getBadalTrackingPublicData_(params.pesanan_id || params.id),
      });
    // Riwayat lengkap titik koordinat (rute) untuk 1 pesanan -- dipakai
    // widget "Lacak Live"/"Riwayat Tracking" di akun.html untuk menggambar
    // jalur (polyline) ala Strava dan untuk membuat file .gpx di sisi
    // browser. Sama seperti "badal_track_get", sengaja publik tapi terbatas
    // (cuma lat/lng/waktu, tanpa data pribadi) dan hanya untuk badal_umroh.
    if (action === "badal_track_points")
      return jsonResponse({
        success: true,
        data: getBadalTrackPointsPublicData_(params.pesanan_id || params.id),
      });

    // Admin_list & admin_sheets sengaja TIDAK ada di sini (GET) lagi —
    // dulu password ikut kelihatan di URL (?password=...), yang bisa
    // nyangkut di riwayat browser / log. Sekarang keduanya cuma bisa
    // diakses lewat POST, lihat doPost() di bawah.

    // === DIAGNOSTIK: cek spreadsheet mana yang sedang dipakai backend ===
    // Buka "<url_web_app>/exec?action=debug_spreadsheet" di browser untuk
    // konfirmasi persis Google Sheet mana yang aktif dibaca/ditulis oleh
    // deployment ini. Berguna kalau data yang dibuat/dihapus/diubah lewat
    // Admin Panel tidak terlihat di Google Sheet yang sedang Anda buka --
    // kemungkinan besar sheet itu adalah COPY, sedangkan deployment ini
    // masih terikat (bound) ke sheet ASLI yang berbeda.
    if (action === "debug_spreadsheet") {
      const ss = getSpreadsheet();
      return jsonResponse({
        success: true,
        spreadsheet_name: ss.getName(),
        spreadsheet_id: ss.getId(),
        spreadsheet_url: ss.getUrl(),
        sheet_list: ss.getSheets().map(function (s) {
          return s.getName();
        }),
      });
    }

    return jsonResponse(
      { success: false, message: "Action tidak dikenal." },
      400,
    );
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 500);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(
      e && e.postData ? e.postData.contents || "{}" : "{}",
    );
    const action = (payload.action || "").toLowerCase();

    if (action === "pengalaman") {
      appendExperience(payload);
      return jsonResponse({
        success: true,
        message: "Pengalaman berhasil dikirim sebagai Draft.",
      });
    }
    if (action === "like_pengalaman") {
      const result = likeExperience(payload.id);
      return jsonResponse({
        success: true,
        message: "Like berhasil dicatat.",
        data: result,
        like: result.like,
      });
    }
    if (action === "unlike_pengalaman") {
      const result = unlikeExperience(payload.id);
      return jsonResponse({
        success: true,
        message: "Like berhasil dibatalkan.",
        data: result,
        like: result.like,
      });
    }
    if (action === "view_artikel") {
      const result = incrementArticleViews(payload.slug);
      return jsonResponse({
        success: true,
        message: "Views berhasil dicatat.",
        data: result,
        views: result.views,
      });
    }
    if (action === "admin_list") {
      const actor = requireRole_(payload, ["super_admin", "penulis"]);
      const sheet = requireManagedSheet(payload.sheet);
      requireContentAccess_(actor, sheet);
      return jsonResponse({
        success: true,
        data: getRows(sheet),
        headers: MANAGED_SHEETS[sheet],
      });
    }
    if (action === "admin_sheets") {
      requireRole_(payload, ["super_admin", "penulis"]);
      return jsonResponse({ success: true, data: MANAGED_SHEETS });
    }
    if (action === "create") {
      const actor = requireRole_(payload, ["super_admin", "penulis"]);
      const sheet = requireManagedSheet(payload.sheet);
      requireContentAccess_(actor, sheet);
      const row = createRow(sheet, payload.data || {});
      return jsonResponse({
        success: true,
        message: "Data berhasil ditambahkan.",
        data: row,
      });
    }
    if (action === "update") {
      const actor = requireRole_(payload, ["super_admin", "penulis"]);
      const sheet = requireManagedSheet(payload.sheet);
      requireContentAccess_(actor, sheet);
      const row = updateRow(sheet, payload.id, payload.data || {});
      return jsonResponse({
        success: true,
        message: "Data berhasil diperbarui.",
        data: row,
      });
    }
    if (action === "delete") {
      const actor = requireRole_(payload, ["super_admin", "penulis"]);
      const sheet = requireManagedSheet(payload.sheet);
      requireContentAccess_(actor, sheet);
      deleteRow(sheet, payload.id);
      return jsonResponse({ success: true, message: "Data berhasil dihapus." });
    }
    if (action === "uploadimage") {
      requireRole_(payload, ["super_admin", "penulis"]);
      const url = uploadImage(
        payload.filename,
        payload.mimeType,
        payload.base64,
      );
      return jsonResponse({ success: true, url: url });
    }
    // Upload generik untuk gambar/video/audio (dipakai field bertipe
    // "video"/"audio"/"media" di Admin Panel). Beda dengan "uploadimage"
    // di atas, action ini menerima segala jenis media dan memberi tahu
    // frontend resource_type + format hasil uploadnya.
    if (action === "uploadmedia") {
      requireRole_(payload, ["super_admin", "penulis"]);
      const media = uploadMedia(
        payload.filename,
        payload.mimeType,
        payload.base64,
      );
      return jsonResponse({ success: true, url: media.url, media: media });
    }
    // Hapus satu file dari Cloudinary secara manual -- dipakai tombol
    // "Hapus file" di field gambar/video/audio pada Admin Panel.
    if (action === "deletemedia") {
      requireRole_(payload, ["super_admin", "penulis"]);
      deleteFromCloudinaryByUrl_(payload.url);
      return jsonResponse({ success: true, message: "File berhasil dihapus." });
    }
    // === Login/registrasi multi-role (navbar "Masuk", halaman daftar member) ===
    if (action === "user_register") {
      const user = registerUser_(payload);
      const session = issueSession_(user);
      return jsonResponse({
        success: true,
        message: "Pendaftaran berhasil.",
        token: session.token,
        user: session.user,
      });
    }
    if (action === "user_login") {
      const user = loginUser_(payload);
      const session = issueSession_(user);
      return jsonResponse({
        success: true,
        message: "Login berhasil.",
        token: session.token,
        user: session.user,
      });
    }
    if (action === "user_me") {
      const claims = verifyToken_(payload.token);
      const user = getUserById_(claims.id);
      if (!user || String(user.status) !== "aktif") {
        throw new Error("Sesi tidak valid, silakan login kembali.");
      }
      return jsonResponse({ success: true, user: publicUser_(user) });
    }
    // Update profil sendiri (nama, whatsapp, foto/avatar) -- dipakai oleh
    // menu "Profil Saya" di Admin Panel supaya penulis bisa mengatur foto
    // profilnya sendiri tanpa perlu akses menu "Pengguna" (khusus
    // super_admin). Beda dengan users_update: aksi ini hanya boleh mengubah
    // data akun milik diri sendiri (tidak menerima "id" dari payload sama
    // sekali, role diambil dari token), dan tidak bisa mengubah role/status.
    if (action === "user_update_profile") {
      const actor = requireRole_(payload, ["super_admin", "penulis", "member"]);
      const sheet = getUsersSheet_();
      const headers = findHeaderRow(sheet);
      const rowIndex = findRowIndexById(sheet, headers, actor.id);
      if (rowIndex === -1) throw new Error("Pengguna tidak ditemukan.");
      if (payload.nama) {
        sheet
          .getRange(rowIndex, headers.indexOf("nama") + 1)
          .setValue(sanitize(payload.nama));
      }
      if (payload.whatsapp !== undefined) {
        sheet
          .getRange(rowIndex, headers.indexOf("whatsapp") + 1)
          .setValue(sanitizeCellValue(sanitize(payload.whatsapp)));
      }
      if (payload.foto !== undefined) {
        sheet
          .getRange(rowIndex, headers.indexOf("foto") + 1)
          .setValue(sanitizeCellValue(String(payload.foto || "").trim()));
      }
      if (payload.password) {
        if (String(payload.password).length < 8) {
          throw new Error("Password minimal 8 karakter.");
        }
        sheet
          .getRange(rowIndex, headers.indexOf("password_hash") + 1)
          .setValue(hashPassword_(payload.password));
      }
      return jsonResponse({
        success: true,
        message: "Profil berhasil diperbarui.",
        user: publicUser_(getUserById_(actor.id)),
      });
    }
    // === Manajemen pengguna (khusus role super_admin) ===
    if (action === "users_list") {
      requireRole_(payload, ["super_admin"]);
      return jsonResponse({
        success: true,
        data: getRows(SHEETS.users).map(publicUser_),
      });
    }
    if (action === "users_create") {
      requireRole_(payload, ["super_admin"]);
      const role =
        ["super_admin", "penulis", "petugas_badal", "member"].indexOf(
          payload.role,
        ) !== -1
          ? payload.role
          : "penulis";
      const nama = sanitize(payload.nama);
      const email = String(payload.email || "")
        .trim()
        .toLowerCase();
      const whatsapp = sanitize(payload.whatsapp);
      const password = String(payload.password || "");
      if (!nama || !email || !password) {
        throw new Error("Nama, email, dan password wajib diisi.");
      }
      if (!isValidEmail_(email)) throw new Error("Format email tidak valid.");
      if (password.length < 8) throw new Error("Password minimal 8 karakter.");
      if (getUserByEmail_(email)) throw new Error("Email sudah terdaftar.");
      const sheet = getUsersSheet_();
      const id = "usr-" + new Date().getTime();
      sheet.appendRow([
        id,
        nama,
        email,
        sanitizeCellValue(whatsapp),
        hashPassword_(password),
        role,
        "aktif",
        new Date(),
      ]);
      return jsonResponse({
        success: true,
        message: "Akun berhasil dibuat.",
        data: publicUser_(getUserByEmail_(email)),
      });
    }
    if (action === "users_update") {
      const actor = requireRole_(payload, ["super_admin"]);
      const sheet = getUsersSheet_();
      const headers = findHeaderRow(sheet);
      const rowIndex = findRowIndexById(sheet, headers, payload.id);
      if (rowIndex === -1) throw new Error("Pengguna tidak ditemukan.");
      if (payload.role !== undefined) {
        if (
          ["super_admin", "penulis", "petugas_badal", "member"].indexOf(
            payload.role,
          ) === -1
        ) {
          throw new Error("Role tidak dikenal.");
        }
        if (
          String(payload.id) === String(actor.id) &&
          payload.role !== "super_admin"
        ) {
          throw new Error("Tidak bisa mengubah role akun sendiri.");
        }
        sheet
          .getRange(rowIndex, headers.indexOf("role") + 1)
          .setValue(payload.role);
      }
      if (payload.status !== undefined) {
        if (["aktif", "nonaktif"].indexOf(payload.status) === -1) {
          throw new Error("Status tidak dikenal.");
        }
        if (String(payload.id) === String(actor.id)) {
          throw new Error("Tidak bisa menonaktifkan akun sendiri.");
        }
        sheet
          .getRange(rowIndex, headers.indexOf("status") + 1)
          .setValue(payload.status);
      }
      if (payload.nama) {
        sheet
          .getRange(rowIndex, headers.indexOf("nama") + 1)
          .setValue(sanitize(payload.nama));
      }
      if (payload.whatsapp !== undefined) {
        sheet
          .getRange(rowIndex, headers.indexOf("whatsapp") + 1)
          .setValue(sanitizeCellValue(sanitize(payload.whatsapp)));
      }
      if (payload.password) {
        if (String(payload.password).length < 8) {
          throw new Error("Password minimal 8 karakter.");
        }
        sheet
          .getRange(rowIndex, headers.indexOf("password_hash") + 1)
          .setValue(hashPassword_(payload.password));
      }
      return jsonResponse({
        success: true,
        message: "Pengguna berhasil diperbarui.",
      });
    }
    if (action === "users_delete") {
      const actor = requireRole_(payload, ["super_admin"]);
      if (String(payload.id) === String(actor.id)) {
        throw new Error("Tidak bisa menghapus akun sendiri.");
      }
      const rows = getRows(SHEETS.users);
      const target = rows.find(function (r) {
        return String(r.id) === String(payload.id);
      });
      if (!target) throw new Error("Pengguna tidak ditemukan.");
      if (target.role === "super_admin") {
        const remaining = rows.filter(function (r) {
          return (
            r.role === "super_admin" && String(r.id) !== String(payload.id)
          );
        });
        if (remaining.length === 0) {
          throw new Error("Tidak bisa menghapus super admin terakhir.");
        }
      }
      deleteRow(SHEETS.users, payload.id);
      return jsonResponse({
        success: true,
        message: "Pengguna berhasil dihapus.",
      });
    }
    // === Pesanan (order dari member dashboard) ===
    if (action === "pesanan_list") {
      requireRole_(payload, ["super_admin", "member"]);
      const all = getRows("Pesanan");
      if (payload.user_id) {
        const filtered = all.filter(function (r) {
          return String(r.user_id) === String(payload.user_id);
        });
        return jsonResponse({ success: true, data: filtered });
      }
      return jsonResponse({ success: true, data: all });
    }
    if (action === "pesanan_create") {
      requireRole_(payload, ["super_admin", "member"]);
      const sheet = getSpreadsheet().getSheetByName("Pesanan");
      if (!sheet) throw new Error("Sheet Pesanan tidak ditemukan.");
      const id = "psn-" + new Date().getTime();
      sheet.appendRow([
        id,
        String(payload.user_id || ""),
        String(payload.layanan || ""),
        sanitizeCellValue(sanitize(payload.nama_pemesan)),
        sanitizeCellValue(sanitize(payload.whatsapp_pemesan)),
        sanitizeCellValue(sanitize(JSON.stringify(payload.data_pesanan || {}))),
        "pending",
        "",
        new Date(),
      ]);
      return jsonResponse({
        success: true,
        message: "Pesanan berhasil dibuat.",
        data: { id: id },
      });
    }
    if (action === "pesanan_update") {
      requireRole_(payload, ["super_admin"]);
      const sheet = getSpreadsheet().getSheetByName("Pesanan");
      if (!sheet) throw new Error("Sheet Pesanan tidak ditemukan.");
      const headers = findHeaderRow(sheet);
      const rowIndex = findRowIndexById(sheet, headers, payload.id);
      if (rowIndex === -1) throw new Error("Pesanan tidak ditemukan.");
      if (payload.status !== undefined) {
        const statusCol = headers.indexOf("status");
        if (
          ["pending", "diproses", "selesai", "ditolak"].indexOf(
            payload.status,
          ) === -1
        ) {
          throw new Error("Status tidak valid.");
        }
        sheet.getRange(rowIndex, statusCol + 1).setValue(payload.status);
      }
      if (payload.catatan_admin !== undefined) {
        const catatanCol = headers.indexOf("catatan_admin");
        sheet
          .getRange(rowIndex, catatanCol + 1)
          .setValue(sanitizeCellValue(sanitize(payload.catatan_admin)));
      }
      // Petugas pelaksana & tanggal pelaksanaan (khusus badal_umroh), dipakai
      // untuk mengisi sertifikat Badal Umroh begitu pesanan ditandai selesai.
      if (payload.petugas_badal_id !== undefined) {
        const col = headers.indexOf("petugas_badal_id");
        if (col > -1) {
          sheet
            .getRange(rowIndex, col + 1)
            .setValue(sanitizeCellValue(sanitize(payload.petugas_badal_id)));
        }
      }
      if (payload.tanggal_pelaksanaan_hijri !== undefined) {
        const col = headers.indexOf("tanggal_pelaksanaan_hijri");
        if (col > -1) {
          sheet
            .getRange(rowIndex, col + 1)
            .setValue(
              sanitizeCellValue(sanitize(payload.tanggal_pelaksanaan_hijri)),
            );
        }
      }
      return jsonResponse({
        success: true,
        message: "Pesanan berhasil diperbarui.",
      });
    }
    // === Live tracking Badal Umroh (khusus role petugas_badal) ===
    // Alur: petugas login di petugas-badal.html -> lihat pesanan yang
    // ditugaskan admin ke namanya -> klik "Mulai Badal" -> browser mengirim
    // lokasi berkala lewat badal_track_update -> pemesan memantau lewat
    // polling badal_track_get (GET, lihat doGet) di akun.html.
    if (action === "badal_my_pesanan") {
      const actor = requireRole_(payload, ["petugas_badal"]);
      const petugas = getPetugasBadalForUser_(actor);
      if (!petugas) {
        // Nama akun belum cocok dengan data di sheet PetugasBadal (dibuat
        // admin lewat menu Layanan > Petugas Badal) -- sama seperti pola
        // pencocokan avatar penulis, dicocokkan lewat nama, bukan id.
        return jsonResponse({ success: true, data: [] });
      }
      const pesananRows = getRows("Pesanan").filter(function (r) {
        return (
          r.layanan === "badal_umroh" &&
          String(r.petugas_badal_id) === String(petugas.id) &&
          (r.status === "diproses" || r.status === "selesai")
        );
      });
      const tracking = getRows(SHEETS.badalTracking);
      const data = pesananRows.map(function (r) {
        let extra = {};
        try {
          extra = JSON.parse(r.data_pesanan || "{}");
        } catch (e) {
          extra = {};
        }
        const t = tracking.find(function (x) {
          return String(x.pesanan_id) === String(r.id);
        });
        return {
          id: r.id,
          nama_pemesan: r.nama_pemesan,
          untuk: extra.untuk || "",
          status: r.status,
          tanggal_pelaksanaan_hijri: r.tanggal_pelaksanaan_hijri || "",
          tracking_status: t ? t.status : "belum_mulai",
          tracking_updated_at: t ? t.updated_at : "",
        };
      });
      return jsonResponse({ success: true, data: data });
    }
    if (action === "badal_track_start") {
      const actor = requireRole_(payload, ["petugas_badal"]);
      const pesanan = requireOwnBadalPesanan_(actor, payload.pesanan_id);
      upsertBadalTracking_(
        pesanan.id,
        actor.id,
        payload.lat,
        payload.lng,
        "berlangsung",
        "started_at",
      );
      appendBadalTrackPoint_(pesanan.id, payload.lat, payload.lng);
      return jsonResponse({
        success: true,
        message: "Live tracking dimulai.",
      });
    }
    if (action === "badal_track_update") {
      const actor = requireRole_(payload, ["petugas_badal"]);
      const pesanan = requireOwnBadalPesanan_(actor, payload.pesanan_id);
      upsertBadalTracking_(
        pesanan.id,
        actor.id,
        payload.lat,
        payload.lng,
        "berlangsung",
        null,
      );
      appendBadalTrackPoint_(pesanan.id, payload.lat, payload.lng);
      return jsonResponse({ success: true });
    }
    // Petugas menekan "Selesai" -> BELUM langsung ditandai "selesai" final.
    // Statusnya jadi "menunggu_verifikasi" dulu, lengkap dengan seluruh
    // rekaman titik koordinat (BadalTrackingPoints) sebagai bukti riwayat
    // perjalanan, supaya admin bisa meninjau lalu memverifikasi lewat aksi
    // "badal_verify" di bawah sebelum pesanan resmi ditandai selesai.
    if (action === "badal_track_stop") {
      const actor = requireRole_(payload, ["petugas_badal"]);
      const pesanan = requireOwnBadalPesanan_(actor, payload.pesanan_id);
      upsertBadalTracking_(
        pesanan.id,
        actor.id,
        payload.lat,
        payload.lng,
        "menunggu_verifikasi",
        "finished_at",
      );
      appendBadalTrackPoint_(pesanan.id, payload.lat, payload.lng);
      return jsonResponse({
        success: true,
        message:
          "Live tracking selesai dikirim. Menunggu verifikasi admin sebelum pesanan ditandai selesai.",
      });
    }
    // Admin meninjau lalu memverifikasi hasil rekaman tracking petugas
    // (dipanggil dari Admin Panel, tombol "Verifikasi" khusus baris Pesanan
    // Badal Umroh berstatus "menunggu_verifikasi"). Sekali diverifikasi:
    // BadalTracking -> "selesai" dan Pesanan -> "selesai" sekaligus.
    if (action === "badal_verify") {
      const actor = requireRole_(payload, ["super_admin"]);
      const pesananId = payload.pesanan_id;
      const pesanan = getRows("Pesanan").find(function (r) {
        return String(r.id) === String(pesananId);
      });
      if (!pesanan || pesanan.layanan !== "badal_umroh") {
        throw new Error("Pesanan Badal Umroh tidak ditemukan.");
      }
      const tracking = getRows(SHEETS.badalTracking).find(function (r) {
        return String(r.pesanan_id) === String(pesananId);
      });
      if (!tracking || tracking.status !== "menunggu_verifikasi") {
        throw new Error(
          "Tracking pesanan ini belum dikirim petugas (atau sudah diverifikasi sebelumnya).",
        );
      }
      markBadalTrackingVerified_(pesananId, actor.id);
      updateRow("Pesanan", pesananId, { status: "selesai" });
      return jsonResponse({
        success: true,
        message: "Tracking diverifikasi & pesanan ditandai selesai.",
      });
    }
    // Daftar pesanan Badal Umroh yang tracking-nya sudah dikirim petugas
    // ("Selesai") tapi belum diverifikasi admin -- dipakai Admin Panel untuk
    // menampilkan tombol "Verifikasi" hanya pada baris yang relevan.
    if (action === "badal_pending_verifications") {
      requireRole_(payload, ["super_admin"]);
      const rows = getRows(SHEETS.badalTracking).filter(function (r) {
        return r.status === "menunggu_verifikasi";
      });
      return jsonResponse({
        success: true,
        data: rows.map(function (r) {
          return {
            pesanan_id: r.pesanan_id,
            finished_at: formatCell(r.finished_at),
          };
        }),
      });
    }
    if (action === "oembed_proxy") {
      const platform = (payload.platform || "").toLowerCase();
      const url = String(payload.url || "").trim();
      if (!url) throw new Error("URL tidak disertakan.");
      if (platform === "instagram") {
        const result = proxyInstagramOembed(url);
        return jsonResponse({ success: true, data: result });
      }
      if (platform === "tiktok") {
        const result = proxyTiktokOembed(url);
        return jsonResponse({ success: true, data: result });
      }
      throw new Error("Platform oEmbed tidak dikenal: " + platform);
    }
    return jsonResponse(
      { success: false, message: "Action POST tidak dikenal." },
      400,
    );
  } catch (error) {
    return jsonResponse({ success: false, message: error.message }, 500);
  }
}

function requireManagedSheet(sheetName) {
  if (!MANAGED_SHEETS[sheetName]) {
    throw new Error(
      "Sheet '" + sheetName + "' tidak dikelola lewat Admin Panel.",
    );
  }
  return sheetName;
}

// Role "penulis" (label tampilan: "Pengelola Konten") hanya boleh
// membuat/mengubah/menghapus/melihat sheet konten murni -- TIDAK boleh
// menyentuh Pesanan, Layanan, PetugasBadal, Peta, Download, Video, dsb
// walau tahu nama sheet-nya (mis. lewat DevTools), supaya pembatasan akses
// di Admin Panel (sidebar) benar-benar ditegakkan di server, bukan cuma
// disembunyikan di tampilan. super_admin selalu bebas mengakses semua sheet.
var PENULIS_CONTENT_SHEETS = ["Artikel", "Pengalaman", "Kategori", "FAQ"];
function requireContentAccess_(user, sheetName) {
  if (
    user.role === "penulis" &&
    PENULIS_CONTENT_SHEETS.indexOf(sheetName) === -1
  ) {
    throw new Error(
      "Pengelola Konten hanya dapat mengakses menu Artikel, Cerita Jemaah, Kategori, dan FAQ.",
    );
  }
}

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getRows(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet " + sheetName + " tidak ditemukan.");
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(function (header) {
    return String(header).trim();
  });
  return values
    .slice(1)
    .filter(function (row) {
      // Baris dianggap data valid hanya jika kolom pertama (id) benar-benar
      // terisi. Sebelumnya baris dianggap valid kalau ADA SATU SAJA sel yang
      // tidak kosong di baris tersebut, sehingga baris "hantu" (id/judul
      // kosong tapi ada sisa isi di kolom lain, mis. spasi nyasar atau angka
      // 0 di kolom views) ikut terhitung sebagai data dan bikin jumlah di
      // admin panel lebih besar dari jumlah baris yang sebenarnya lengkap.
      var id = row[0];
      return id !== "" && id !== null && String(id).trim() !== "";
    })
    .map(function (row) {
      return headers.reduce(function (object, header, index) {
        object[header] = formatCell(row[index]);
        return object;
      }, {});
    });
}

// Sama seperti getRows(), TAPI TIDAK memformat nilai lewat formatCell().
// getRows() memotong SETIAP kolom bertipe Date menjadi string "yyyy-MM-dd"
// (tanpa jam) -- cocok untuk kolom tanggal biasa (mis. "tanggal_pesan"),
// tapi kalau dipakai untuk kolom yang butuh presisi jam (started_at/
// updated_at/finished_at di BadalTracking, recorded_at di
// BadalTrackingPoints), jamnya sudah keburu hilang SEBELUM sempat
// diformat ulang oleh formatCellDateTime_() -- karena begitu sudah jadi
// string, formatCellDateTime_() (yang cuma memproses objek Date asli)
// tidak bisa mengembalikan jamnya lagi. getRowsRaw_() mengembalikan nilai
// APA ADANYA dari sheet (Date tetap objek Date), supaya pemanggilnya bisa
// memilih sendiri mau diformat pakai formatCell() (tanggal saja) atau
// formatCellDateTime_() (lengkap jam) sesuai kebutuhan kolom masing-masing.
function getRowsRaw_(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet " + sheetName + " tidak ditemukan.");
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(function (header) {
    return String(header).trim();
  });
  return values
    .slice(1)
    .filter(function (row) {
      var id = row[0];
      return id !== "" && id !== null && String(id).trim() !== "";
    })
    .map(function (row) {
      return headers.reduce(function (object, header, index) {
        object[header] = row[index];
        return object;
      }, {});
    });
}

function getPublishedRows(sheetName) {
  return getRows(sheetName).filter(function (row) {
    return row.status === "Publish";
  });
}

// Data publik untuk verifikasi sertifikat Badal Umroh lewat scan QR.
// Sengaja hanya mengembalikan field terbatas (tanpa whatsapp/email) supaya
// aman diakses publik tanpa login. Hanya pesanan badal_umroh berstatus
// "selesai" yang dianggap valid untuk diverifikasi.
function getSertifikatPublicData(id) {
  if (!id) return null;
  const rows = getRows("Pesanan");
  const row = rows.find(function (r) {
    return String(r.id) === String(id);
  });
  if (!row) return null;
  if (row.layanan !== "badal_umroh" || row.status !== "selesai") return null;

  let extra = {};
  try {
    extra = JSON.parse(row.data_pesanan || "{}");
  } catch (e) {
    extra = {};
  }

  // Cari data petugas pelaksana (nama & tanda tangan) yang ditugaskan admin
  // untuk pesanan ini, dipakai untuk mengisi sertifikat.
  let petugasNama = "";
  let petugasTtd = "";
  if (row.petugas_badal_id) {
    const petugas = getRows(SHEETS.petugasBadal).find(function (p) {
      return String(p.id) === String(row.petugas_badal_id);
    });
    if (petugas) {
      petugasNama = petugas.nama || "";
      petugasTtd = petugas.ttd || "";
    }
  }

  return {
    id: row.id,
    kode: "HC-BDL-" + String(row.id).replace(/^psn-/, ""),
    nama_pemesan: row.nama_pemesan,
    untuk: extra.untuk || "",
    tanggal_pesan: row.tanggal_pesan,
    status: row.status,
    petugas_nama: petugasNama,
    petugas_ttd: petugasTtd,
    tanggal_pelaksanaan_hijri: row.tanggal_pelaksanaan_hijri || "",
    pelaksana_badal: "HajiCerdas",
  };
}

function filterByKategori(rows, kategori) {
  if (!kategori) return rows;
  return rows.filter(function (row) {
    return (
      String(row.kategori || "").toLowerCase() ===
      String(kategori).toLowerCase()
    );
  });
}

function filterByHalaman(rows, halaman) {
  if (!halaman) return rows;
  return rows.filter(function (row) {
    return (
      String(row.halaman || "").toLowerCase() === String(halaman).toLowerCase()
    );
  });
}

// Menormalkan nilai kolom "jenis" sebelum dibandingkan: trim spasi,
// lowercase, dan buang semua varian tanda kutip tunggal/apostrof (' ’ ‘ `).
// BUGFIX: baris "Tamattu" di sheet TataCara sempat diisi manual sebagai
// "Tamattu'" (menyalin ejaan dari dokumen sumber, mis. "Haji Tamattu'"),
// sehingga tidak pernah cocok dengan query jenis="Tamattu" yang dikirim
// tata-cara.js — akibatnya panel Tamattu tidak pernah menerima data baru
// dari Apps Script (Ifrad/Qiran tetap normal karena ejaannya tidak
// mengandung apostrof). Normalisasi ini membuat "Tamattu", "Tamattu'",
// " tamattu " semua dianggap sama.
function normalizeJenisValue_(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['’‘`]/g, "");
}

function filterByJenis(rows, jenis) {
  if (!jenis) return rows;
  const target = normalizeJenisValue_(jenis);
  return rows.filter(function (row) {
    return normalizeJenisValue_(row.jenis) === target;
  });
}

function getArticleDetail(slug) {
  const article = getPublishedRows(SHEETS.artikel).find(function (row) {
    return row.slug === slug;
  });
  if (!article) throw new Error("Artikel tidak ditemukan atau belum publish.");
  return article;
}

function appendExperience(payload) {
  const sheet = getSpreadsheet().getSheetByName(SHEETS.pengalaman);
  if (!sheet) throw new Error("Sheet Pengalaman tidak ditemukan.");
  const id = "exp-" + new Date().getTime();
  sheet.appendRow([
    id,
    sanitizeCellValue(sanitize(payload.nama)),
    sanitizeCellValue(sanitize(payload.asal)),
    sanitizeCellValue(sanitize(payload.judul)),
    sanitizeCellValue(sanitize(payload.kategori)),
    sanitizeCellValue(sanitize(payload.pengalaman)),
    sanitizeCellValue(sanitize(payload.tips)),
    sanitizeCellValue(sanitize(payload.foto || "")),
    new Date(),
    0,
    "Draft",
  ]);
}

function likeExperience(id) {
  return updateExperienceLike(id, 1);
}

function unlikeExperience(id) {
  return updateExperienceLike(id, -1);
}

function updateExperienceLike(id, delta) {
  const sheet = getSpreadsheet().getSheetByName(SHEETS.pengalaman);
  if (!sheet) throw new Error("Sheet Pengalaman tidak ditemukan.");
  const headers = findHeaderRow(sheet);
  const rowIndex = findRowIndexById(sheet, headers, id);
  if (rowIndex === -1) throw new Error("Pengalaman tidak ditemukan.");
  const likeColumn = headers.indexOf("like");
  if (likeColumn === -1) throw new Error("Kolom like tidak ditemukan.");
  const statusColumn = headers.indexOf("status");
  if (statusColumn !== -1) {
    const status = sheet.getRange(rowIndex, statusColumn + 1).getValue();
    if (String(status) !== "Publish")
      throw new Error("Pengalaman belum publish.");
  }
  const cell = sheet.getRange(rowIndex, likeColumn + 1);
  const current = Number(cell.getValue()) || 0;
  const next = Math.max(0, current + Number(delta || 0));
  cell.setValue(next);
  return { id: id, like: next };
}

// Menambah 1 setiap kali artikel dibuka (dipanggil dari halaman detail.html,
// dibatasi 1x per slug per sesi browser lewat sessionStorage di frontend
// supaya refresh berulang tidak menggelembungkan angka populer secara tidak wajar).
function incrementArticleViews(slug) {
  if (!slug) throw new Error("Slug artikel tidak valid.");
  const sheet = getSpreadsheet().getSheetByName(SHEETS.artikel);
  if (!sheet) throw new Error("Sheet Artikel tidak ditemukan.");
  const headers = findHeaderRow(sheet);
  const slugColumn = headers.indexOf("slug");
  const viewsColumn = headers.indexOf("views");
  if (slugColumn === -1) throw new Error("Kolom slug tidak ditemukan.");
  if (viewsColumn === -1)
    throw new Error(
      "Kolom views belum ada di sheet Artikel. Jalankan migrateArtikelColumns() sekali dari editor Apps Script.",
    );
  const values = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][slugColumn]) === String(slug)) {
      rowIndex = i + 1; // 1-indexed sheet row
      break;
    }
  }
  if (rowIndex === -1) throw new Error("Artikel tidak ditemukan.");
  const cell = sheet.getRange(rowIndex, viewsColumn + 1);
  const next = (Number(cell.getValue()) || 0) + 1;
  cell.setValue(next);
  return { slug: slug, views: next };
}

// Jalankan SEKALI secara manual dari editor Apps Script (pilih fungsi ini,
// klik Run) kalau sheet "Artikel" sudah ada sebelumnya dan belum punya
// kolom "views". Fungsi ini menambahkan kolom yang belum ada di
// akhir header tanpa mengubah data lain, lalu mengisi "views" kosong = 0.
function migrateArtikelColumns() {
  const sheet = getSpreadsheet().getSheetByName(SHEETS.artikel);
  if (!sheet) throw new Error("Sheet Artikel tidak ditemukan.");
  const headers = findHeaderRow(sheet);
  const required = MANAGED_SHEETS.Artikel;
  const missing = required.filter(function (header) {
    return headers.indexOf(header) === -1;
  });
  missing.forEach(function (header) {
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
  });
  if (missing.length) {
    SpreadsheetApp.flush();
    const newHeaders = findHeaderRow(sheet);
    const viewsColumn = newHeaders.indexOf("views");
    const lastRow = sheet.getLastRow();
    if (viewsColumn !== -1 && lastRow > 1) {
      const range = sheet.getRange(2, viewsColumn + 1, lastRow - 1, 1);
      const values = range.getValues().map(function (row) {
        return [row[0] === "" || row[0] === null ? 0 : row[0]];
      });
      range.setValues(values);
    }
  }
  return { added: missing };
}

// Jalankan SEKALI secara manual dari editor Apps Script (pilih fungsi ini,
// klik Run) kalau sheet "Video" sudah ada sebelumnya dan belum punya kolom
// "tipe" (Video/Short) dan "platform" (YouTube/TikTok/Instagram). Fungsi ini
// menambahkan kolom yang belum ada di akhir header tanpa mengubah data lain,
// lalu mengisi baris lama dengan tipe="Video" dan platform="YouTube" supaya
// video-video yang sudah ada tetap tampil seperti sebelumnya.
function migrateVideoColumns() {
  const sheet = getSpreadsheet().getSheetByName(SHEETS.video);
  if (!sheet) throw new Error("Sheet Video tidak ditemukan.");
  const headers = findHeaderRow(sheet);
  const required = MANAGED_SHEETS.Video;
  const missing = required.filter(function (header) {
    return headers.indexOf(header) === -1;
  });
  missing.forEach(function (header) {
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
  });
  if (missing.length) {
    SpreadsheetApp.flush();
    const newHeaders = findHeaderRow(sheet);
    const lastRow = sheet.getLastRow();
    const tipeColumn = newHeaders.indexOf("tipe");
    const platformColumn = newHeaders.indexOf("platform");
    if (tipeColumn !== -1 && lastRow > 1) {
      const range = sheet.getRange(2, tipeColumn + 1, lastRow - 1, 1);
      const values = range.getValues().map(function (row) {
        return [row[0] === "" || row[0] === null ? "Video" : row[0]];
      });
      range.setValues(values);
    }
    if (platformColumn !== -1 && lastRow > 1) {
      const range = sheet.getRange(2, platformColumn + 1, lastRow - 1, 1);
      const values = range.getValues().map(function (row) {
        return [row[0] === "" || row[0] === null ? "YouTube" : row[0]];
      });
      range.setValues(values);
    }
  }
  return { added: missing };
}

// === Generic CRUD dipakai oleh Admin Panel ===

function findHeaderRow(sheet) {
  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(function (header) {
      return String(header).trim();
    });
}

function findRowIndexById(sheet, headers, id) {
  const idColumn = headers.indexOf("id");
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idColumn]) === String(id)) return i + 1; // 1-indexed sheet row
  }
  return -1;
}

function createRow(sheetName, data) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet " + sheetName + " tidak ditemukan.");
  const headers = findHeaderRow(sheet);
  const prefix = sheetName.substring(0, 3).toLowerCase();
  const id =
    data.id && String(data.id).trim()
      ? String(data.id).trim()
      : prefix + "-" + new Date().getTime();
  const customStatusOptions = CUSTOM_STATUS_OPTIONS[sheetName];
  const row = headers.map(function (header) {
    if (header === "id") return id;
    if (header === "status") {
      if (customStatusOptions) {
        const value = data.status || customStatusOptions[0];
        if (customStatusOptions.indexOf(value) === -1) {
          throw new Error(
            "Status tidak valid untuk " +
              sheetName +
              ". Pilihan yang diperbolehkan: " +
              customStatusOptions.join(", ") +
              ".",
          );
        }
        return value;
      }
      if (!data.status) return "Draft";
    }
    if (header === "views" && (data.views === undefined || data.views === ""))
      return 0;
    return data[header] !== undefined ? sanitizeCellValue(data[header]) : "";
  });
  sheet.appendRow(row);
  return headers.reduce(function (obj, header, index) {
    obj[header] = row[index];
    return obj;
  }, {});
}

function updateRow(sheetName, id, data) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet " + sheetName + " tidak ditemukan.");
  const headers = findHeaderRow(sheet);
  const rowIndex = findRowIndexById(sheet, headers, id);
  if (rowIndex === -1)
    throw new Error(
      "Data dengan id '" + id + "' tidak ditemukan di " + sheetName + ".",
    );
  const current = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  const customStatusOptions = CUSTOM_STATUS_OPTIONS[sheetName];
  const updated = headers.map(function (header, index) {
    if (header === "id") return current[index];
    if (
      header === "status" &&
      customStatusOptions &&
      data.status !== undefined &&
      customStatusOptions.indexOf(data.status) === -1
    ) {
      throw new Error(
        "Status tidak valid untuk " +
          sheetName +
          ". Pilihan yang diperbolehkan: " +
          customStatusOptions.join(", ") +
          ".",
      );
    }
    return data[header] !== undefined
      ? sanitizeCellValue(data[header])
      : current[index];
  });
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updated]);
  return headers.reduce(function (obj, header, index) {
    obj[header] = updated[index];
    return obj;
  }, {});
}

function deleteRow(sheetName, id) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet " + sheetName + " tidak ditemukan.");
  const headers = findHeaderRow(sheet);
  const rowIndex = findRowIndexById(sheet, headers, id);
  if (rowIndex === -1)
    throw new Error(
      "Data dengan id '" + id + "' tidak ditemukan di " + sheetName + ".",
    );
  // Sebelum baris dihapus, cek semua kolomnya -- kalau ada URL Cloudinary
  // (foto/video/audio yang diunggah lewat Admin Panel), hapus juga filenya
  // dari Cloudinary supaya tidak jadi sampah (orphan file) yang numpuk.
  const rowValues = sheet
    .getRange(rowIndex, 1, 1, headers.length)
    .getValues()[0];
  deleteRowMediaFromCloudinary_(rowValues);
  sheet.deleteRow(rowIndex);
}

// ============================================================
// UPLOAD MEDIA (GAMBAR / VIDEO / AUDIO) KE CLOUDINARY
// ============================================================
// Semua file yang diunggah dari Admin Panel (foto artikel, avatar,
// tanda tangan, video, audio, dll) disimpan di Cloudinary, bukan lagi
// di Google Drive. Alurnya:
//   1. Browser membaca file jadi base64 (lihat adminUploadImage /
//      adminUploadMedia di assets/js/api.js) lalu kirim ke sini lewat
//      action "uploadimage" (khusus gambar, kompatibel dengan kode
//      lama) atau "uploadmedia" (gambar/video/audio, generik).
//   2. uploadToCloudinary_() menandatangani request pakai API Secret
//      (SHA1) lalu mengirim file ke Cloudinary lewat UrlFetchApp.
//   3. Untuk gambar, parameter format:"webp" disertakan supaya
//      Cloudinary OTOMATIS mengonversi & menyimpan gambar sebagai
//      .webp (lebih ringan) begitu selesai diupload -- jadi konversinya
//      terjadi sekali saat upload, bukan setiap kali gambar diakses.

// Menentukan resource_type Cloudinary dari MIME type file.
// Cloudinary menyimpan file audio (mp3, wav, m4a, dst) di bawah
// resource_type "video" (tidak ada resource_type "audio" tersendiri).
function cloudinaryResourceType_(mimeType) {
  const mime = String(mimeType || "").toLowerCase();
  if (mime.indexOf("image/") === 0) return "image";
  if (mime.indexOf("video/") === 0) return "video";
  if (mime.indexOf("audio/") === 0) return "video";
  return "raw"; // dokumen/file lain (pdf, dll) kalau suatu saat dibutuhkan
}

// Bikin signature SHA1 sesuai spesifikasi Cloudinary: semua parameter
// (selain file, cloud_name, resource_type, api_key, signature) diurutkan
// alfabetis, digabung "key=value&key=value...", ditambah API Secret di
// akhir, lalu di-hash SHA1 dan diubah ke heksadesimal.
function cloudinarySignature_(params, apiSecret) {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map((key) => key + "=" + params[key]).join("&");
  const digestBytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_1,
    toSign + apiSecret,
    Utilities.Charset.UTF_8,
  );
  return digestBytes
    .map((b) => {
      const hex = (b < 0 ? b + 256 : b).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
}

// Fungsi inti: unggah satu file (base64) ke Cloudinary lewat signed
// upload. Mengembalikan objek JSON asli dari Cloudinary (berisi
// secure_url, public_id, resource_type, format, bytes, duration, dst).
function uploadToCloudinary_(filename, mimeType, base64Data, options) {
  if (!base64Data) throw new Error("Data file kosong.");
  if (
    !CLOUDINARY_CONFIG.cloudName ||
    CLOUDINARY_CONFIG.cloudName.indexOf("GANTI_DENGAN") === 0
  ) {
    throw new Error(
      "Cloudinary belum dikonfigurasi. Isi CLOUDINARY_CONFIG di Code.gs dengan Cloud Name, API Key, dan API Secret dari akun Cloudinary Anda.",
    );
  }
  options = options || {};
  const resourceType =
    options.resourceType || cloudinaryResourceType_(mimeType);
  const bytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(
    bytes,
    mimeType || "application/octet-stream",
    filename || "upload",
  );

  const timestamp = Math.floor(Date.now() / 1000);
  // paramsToSign HARUS berisi persis parameter (selain file/api_key)
  // yang nanti benar-benar dikirim di body request, karena signature
  // dihitung dari kombinasi parameter ini.
  const paramsToSign = {
    timestamp: timestamp,
    folder: CLOUDINARY_CONFIG.folder,
  };
  // Gambar otomatis dikonversi & disimpan sebagai .webp saat upload.
  if (resourceType === "image") {
    paramsToSign.format = "webp";
  }

  const signature = cloudinarySignature_(
    paramsToSign,
    CLOUDINARY_CONFIG.apiSecret,
  );

  const payload = {
    file: blob,
    api_key: CLOUDINARY_CONFIG.apiKey,
    timestamp: String(timestamp),
    signature: signature,
    folder: paramsToSign.folder,
  };
  if (paramsToSign.format) payload.format = paramsToSign.format;

  const response = UrlFetchApp.fetch(
    "https://api.cloudinary.com/v1_1/" +
      CLOUDINARY_CONFIG.cloudName +
      "/" +
      resourceType +
      "/upload",
    { method: "post", payload: payload, muteHttpExceptions: true },
  );

  const result = JSON.parse(response.getContentText());
  if (result.error) {
    throw new Error("Upload Cloudinary gagal: " + result.error.message);
  }
  return result;
}

// Simpan gambar yang diunggah (base64) ke Cloudinary, otomatis
// dikonversi ke format WebP saat upload (lihat uploadToCloudinary_).
// Dipakai oleh action "uploadimage" -- dipanggil dari setiap field
// bertipe "image" di Admin Panel, jadi tetap kompatibel tanpa perlu
// mengubah pemanggilnya.
function uploadImage(filename, mimeType, base64Data) {
  const result = uploadToCloudinary_(filename, mimeType, base64Data, {
    resourceType: "image",
  });
  return result.secure_url;
}

// Simpan file media apa pun (gambar/video/audio) ke Cloudinary. Dipakai
// oleh action "uploadmedia" (field bertipe "video"/"audio"/"media" di
// Admin Panel). Mengembalikan info lengkap supaya frontend tahu jenis
// filenya dan bisa menampilkan preview yang sesuai (img/video/audio).
function uploadMedia(filename, mimeType, base64Data) {
  const result = uploadToCloudinary_(filename, mimeType, base64Data);
  return {
    url: result.secure_url,
    resourceType: result.resource_type, // "image" | "video" (video & audio sama-sama "video" di Cloudinary)
    format: result.format,
    bytes: result.bytes,
    durationSeconds: result.duration || null, // hanya ada untuk video/audio
  };
}

// ============================================================
// HAPUS FILE DARI CLOUDINARY
// ============================================================
// Dipakai oleh dua alur:
//   1. Tombol "Hapus file" manual di field gambar/video/audio pada Admin
//      Panel (action "deletemedia") -- penulis/admin sengaja menghapus
//      satu file media dari sebuah data.
//   2. Otomatis lewat deleteRow() di atas -- saat sebuah BARIS DATA
//      dihapus dari Admin Panel, semua URL Cloudinary yang ada di
//      baris itu ikut dihapus filenya, supaya tidak jadi sampah (orphan
//      file) yang numpuk terus di akun Cloudinary.

// Cek apakah sebuah nilai adalah URL Cloudinary -- supaya tidak salah
// hapus kalau isi field ternyata link lain (YouTube, TikTok, link Drive
// lama, dll).
function isCloudinaryUrl_(value) {
  return (
    typeof value === "string" && value.indexOf("res.cloudinary.com/") !== -1
  );
}

// Ambil resource_type & public_id dari secure_url Cloudinary. Format URL
// standar (tanpa transformasi, sesuai cara kita upload di atas):
// https://res.cloudinary.com/<cloud>/<resource_type>/upload/v<versi>/<public_id>.<ext>
function parseCloudinaryUrl_(url) {
  const match = String(url).match(
    /res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\/(?:[^/]+\/)*?v\d+\/([^?#]+)\.[a-zA-Z0-9]+(?:[?#].*)?$/,
  );
  if (!match) return null;
  return { resourceType: match[1], publicId: match[2] };
}

// Hapus satu file Cloudinary berdasarkan URL-nya (signed request ke
// endpoint /destroy). Kalau URL-nya bukan URL Cloudinary atau polanya
// tidak dikenali, fungsi ini diam saja (dianggap "skip", bukan error) --
// supaya aman dipanggil untuk field yang isinya campuran link eksternal
// & upload Cloudinary.
function deleteFromCloudinaryByUrl_(url) {
  if (!isCloudinaryUrl_(url)) return { skipped: true };
  const parsed = parseCloudinaryUrl_(url);
  if (!parsed) return { skipped: true };

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = { public_id: parsed.publicId, timestamp: timestamp };
  const signature = cloudinarySignature_(
    paramsToSign,
    CLOUDINARY_CONFIG.apiSecret,
  );

  const response = UrlFetchApp.fetch(
    "https://api.cloudinary.com/v1_1/" +
      CLOUDINARY_CONFIG.cloudName +
      "/" +
      parsed.resourceType +
      "/destroy",
    {
      method: "post",
      payload: {
        public_id: parsed.publicId,
        api_key: CLOUDINARY_CONFIG.apiKey,
        timestamp: String(timestamp),
        signature: signature,
      },
      muteHttpExceptions: true,
    },
  );
  const result = JSON.parse(response.getContentText());
  // Cloudinary balas result:"ok" kalau berhasil, result:"not found" kalau
  // filenya memang sudah tidak ada -- keduanya dianggap sukses di sini.
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(
      "Gagal menghapus file Cloudinary: " + (result.result || "unknown"),
    );
  }
  return result;
}

// Dipanggil dari deleteRow(): scan semua kolom satu baris data, hapus
// setiap URL Cloudinary yang ditemukan. Kalau salah satu gagal dihapus
// (mis. Cloudinary sedang bermasalah), proses tetap lanjut ke URL
// berikutnya -- baris data di sheet tetap terhapus seperti biasa, error
// cuma dicatat di log (Executions) supaya tidak mengganggu pengguna.
function deleteRowMediaFromCloudinary_(rowValues) {
  rowValues.forEach((value) => {
    if (!isCloudinaryUrl_(value)) return;
    try {
      deleteFromCloudinaryByUrl_(value);
    } catch (error) {
      console.error(
        "Gagal menghapus media Cloudinary saat hapus baris: " + error.message,
      );
    }
  });
}

// Proxy oEmbed Instagram: Apps Script server-to-server tidak punya
// masalah CORS, jadi bisa ambil thumbnail_url dari Instagram lewat
// endpoint oEmbed publik mereka (tanpa autentikasi).
function proxyInstagramOembed(sourceUrl) {
  const response = UrlFetchApp.fetch(
    "https://www.instagram.com/oembed?url=" + encodeURIComponent(sourceUrl),
    { muteHttpExceptions: true },
  );
  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error("Instagram oEmbed gagal: HTTP " + code);
  }
  const data = JSON.parse(response.getContentText());
  return {
    thumbnail_url: data.thumbnail_url || "",
    title: data.title || "",
    author_name: data.author_name || "",
  };
}

// Proxy oEmbed TikTok: sama seperti Instagram, panggil dari server
// supaya tidak terhalang CORS browser.
function proxyTiktokOembed(sourceUrl) {
  const response = UrlFetchApp.fetch(
    "https://www.tiktok.com/oembed?url=" + encodeURIComponent(sourceUrl),
    { muteHttpExceptions: true },
  );
  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error("TikTok oEmbed gagal: HTTP " + code);
  }
  const data = JSON.parse(response.getContentText());
  return {
    thumbnail_url: data.thumbnail_url || "",
    title: data.title || "",
    author_name: data.author_name || "",
  };
}

function sanitize(value) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim();
}

// Cegah "formula injection": kalau ada isian (dari admin panel MAUPUN
// form publik "Kirim Pengalaman") yang diawali =, +, -, atau @, Google
// Sheets bisa menganggapnya rumus aktif saat sheet dibuka manual —
// berpotensi menjalankan hal yang tidak diinginkan (mis. IMPORTXML ke
// server luar). Diberi awalan tanda kutip satu supaya dipaksa jadi teks
// biasa (tanda kutipnya sendiri tidak ikut tampil di sel).
function sanitizeCellValue(value) {
  if (typeof value !== "string") return value;
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function formatCell(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd",
    );
  }
  return value;
}

// Sama seperti formatCell(), tapi mempertahankan jam:menit:detik (bukan
// dipotong jadi tanggal saja) -- dipakai untuk titik-titik BadalTrackingPoints
// supaya timestamp tiap titik rute akurat saat dijadikan file GPX.
function formatCellDateTime_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return value.toISOString();
  }
  return value;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// Jalankan SEKALI secara manual dari editor Apps Script untuk membuat akun
// super_admin PERTAMA (sesudah ini, akun super_admin/penulis lain dibuat
// lewat menu "Pengguna" di Admin Panel, bukan lewat fungsi ini lagi).
// Isi NAMA/EMAIL/PASSWORD_BARU di bawah dulu, pilih fungsi seedSuperAdmin
// di dropdown editor, klik Run, lalu kosongkan lagi PASSWORD_BARU.
function seedSuperAdmin() {
  const NAMA = ""; // <-- isi nama super admin
  const EMAIL = ""; // <-- isi email login super admin
  const PASSWORD_BARU = ""; // <-- isi sementara, lalu Run, lalu kosongkan lagi
  if (!NAMA || !EMAIL || !PASSWORD_BARU) {
    throw new Error("Isi NAMA, EMAIL, dan PASSWORD_BARU sebelum Run.");
  }
  if (!isValidEmail_(EMAIL)) throw new Error("Format EMAIL tidak valid.");
  if (PASSWORD_BARU.length < 8) {
    throw new Error("PASSWORD_BARU minimal 8 karakter.");
  }
  const spreadsheet = getSpreadsheet();
  createSheetIfMissing(spreadsheet, SHEETS.users, USERS_HEADERS);
  if (getUserByEmail_(EMAIL)) {
    throw new Error("Email tersebut sudah terdaftar di sheet Users.");
  }
  const sheet = getUsersSheet_();
  const id = "usr-" + new Date().getTime();
  sheet.appendRow([
    id,
    NAMA,
    EMAIL.trim().toLowerCase(),
    "",
    hashPassword_(PASSWORD_BARU),
    "super_admin",
    "aktif",
    new Date(),
  ]);
  Logger.log("Akun super_admin berhasil dibuat untuk " + EMAIL);
}

function setupSheets() {
  const spreadsheet = getSpreadsheet();
  Object.keys(MANAGED_SHEETS).forEach(function (name) {
    createSheetIfMissing(spreadsheet, name, MANAGED_SHEETS[name]);
  });
  createSheetIfMissing(spreadsheet, SHEETS.users, USERS_HEADERS);
  createSheetIfMissing(
    spreadsheet,
    SHEETS.badalTracking,
    BADAL_TRACKING_HEADERS,
  );
  createSheetIfMissing(
    spreadsheet,
    SHEETS.badalTrackingPoints,
    BADAL_TRACKING_POINTS_HEADERS,
  );
}

// === Users: helper baca/tulis + logika login/registrasi/role ===

function getUsersSheet_() {
  const sheet = getSpreadsheet().getSheetByName(SHEETS.users);
  if (!sheet) {
    throw new Error(
      "Sheet Users belum dibuat. Jalankan setupSheets() sekali dari editor Apps Script.",
    );
  }
  return sheet;
}

function getUserByEmail_(email) {
  const sheet = getUsersSheet_();
  const headers = findHeaderRow(sheet);
  const emailCol = headers.indexOf("email");
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (
      String(values[i][emailCol]).toLowerCase() === String(email).toLowerCase()
    ) {
      return headers.reduce(function (obj, header, index) {
        obj[header] = values[i][index];
        return obj;
      }, {});
    }
  }
  return null;
}

function getUserById_(id) {
  const sheet = getUsersSheet_();
  const headers = findHeaderRow(sheet);
  const rowIndex = findRowIndexById(sheet, headers, id);
  if (rowIndex === -1) return null;
  const values = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  return headers.reduce(function (obj, header, index) {
    obj[header] = values[index];
    return obj;
  }, {});
}

// Versi user yang aman dikirim ke frontend (tanpa password_hash).
function publicUser_(user) {
  return {
    id: user.id,
    nama: user.nama,
    email: user.email,
    whatsapp: user.whatsapp,
    role: user.role,
    status: user.status,
    tanggal_daftar: formatCell(user.tanggal_daftar),
    foto: user.foto || "",
  };
}

// Peta nama penulis (huruf kecil, dirapikan spasinya) -> URL foto profil,
// dipakai supaya avatar penulis otomatis tampil di kartu/detail artikel
// hanya dengan mencocokkan kolom "penulis" (teks bebas) di sheet Artikel
// dengan kolom "nama" akun penulis/super_admin di sheet Users. Kalau nama
// penulis tidak cocok dengan akun manapun (mis. "Redaksi HajiCerdas"),
// artikel tetap tampil seperti biasa hanya tanpa foto (avatar inisial).
function getAuthorPhotoMap_() {
  const map = {};
  getRows(SHEETS.users).forEach(function (user) {
    if (!user.foto) return;
    const key = String(user.nama || "")
      .trim()
      .toLowerCase();
    if (key) map[key] = user.foto;
  });
  return map;
}

function withAuthorPhoto_(article) {
  if (!article) return article;
  const map = getAuthorPhotoMap_();
  const key = String(article.penulis || "")
    .trim()
    .toLowerCase();
  return Object.assign({}, article, { penulis_foto: map[key] || "" });
}

function withAuthorPhotoList_(articles) {
  const map = getAuthorPhotoMap_();
  return articles.map(function (article) {
    const key = String(article.penulis || "")
      .trim()
      .toLowerCase();
    return Object.assign({}, article, { penulis_foto: map[key] || "" });
  });
}

// Mencocokkan akun login role "petugas_badal" dengan barisnya di sheet
// PetugasBadal (dikelola admin lewat menu Layanan > Petugas Badal) lewat
// nama -- pola yang sama seperti getAuthorPhotoMap_() di atas untuk avatar
// penulis. Kalau nama di Profil Saya akun petugas tidak sama persis dengan
// nama yang ditulis admin di menu Petugas Badal, pesanan tidak akan
// ditemukan (petugas tidak melihat pesanan apa pun di dashboardnya).
function getPetugasBadalForUser_(user) {
  const key = String((user && user.nama) || "")
    .trim()
    .toLowerCase();
  if (!key) return null;
  return (
    getRows(SHEETS.petugasBadal).find(function (p) {
      return (
        String(p.nama || "")
          .trim()
          .toLowerCase() === key
      );
    }) || null
  );
}

// Memastikan pesanan yang dipakai untuk aksi live tracking benar-benar
// ditugaskan admin ke petugas yang sedang login (lewat pencocokan nama di
// atas) -- mencegah petugas mengirim/menghentikan lokasi untuk pesanan
// petugas lain.
function requireOwnBadalPesanan_(actor, pesananId) {
  if (!pesananId) throw new Error("ID pesanan tidak disertakan.");
  const petugas = getPetugasBadalForUser_(actor);
  if (!petugas) {
    throw new Error(
      "Akun Anda belum terhubung ke data Petugas Badal. Hubungi admin.",
    );
  }
  const pesanan = getRows("Pesanan").find(function (r) {
    return String(r.id) === String(pesananId);
  });
  if (!pesanan || pesanan.layanan !== "badal_umroh") {
    throw new Error("Pesanan tidak ditemukan.");
  }
  if (String(pesanan.petugas_badal_id) !== String(petugas.id)) {
    throw new Error("Pesanan ini bukan ditugaskan kepada Anda.");
  }
  return pesanan;
}

// Upsert (update kalau sudah ada barisnya untuk pesanan ini, insert kalau
// belum) 1 baris status/posisi terakhir di sheet BadalTracking. lat/lng
// boleh null/undefined khusus saat menghentikan tracking (mis. GPS gagal
// saat itu juga) -- baris yang sudah ada akan mempertahankan koordinat
// terakhirnya. stampField opsional: nama kolom timestamp tambahan yang mau
// diisi waktu sekarang (mis. "started_at" saat mulai, "finished_at" saat
// petugas menekan "Selesai"), null kalau tidak perlu. Ditulis berbasis
// header (bukan indeks kolom tetap) supaya tahan kalau header sheet
// ditambah/diurut ulang.
function upsertBadalTracking_(pesananId, petugasUserId, lat, lng, status, stampField) {
  const hasCoords = lat !== null && lat !== undefined && lng !== null && lng !== undefined;
  const latNum = hasCoords ? Number(lat) : null;
  const lngNum = hasCoords ? Number(lng) : null;
  if (hasCoords && (!isFinite(latNum) || !isFinite(lngNum))) {
    throw new Error("Koordinat lokasi tidak valid.");
  }
  const sheet = getSpreadsheet().getSheetByName(SHEETS.badalTracking);
  if (!sheet) {
    throw new Error(
      "Sheet BadalTracking belum dibuat. Jalankan setupSheets() sekali dari editor Apps Script.",
    );
  }
  const headers = findHeaderRow(sheet);
  const idCol = headers.indexOf("pesanan_id");
  const values = sheet.getDataRange().getValues();
  const now = new Date();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(pesananId)) {
      const rowIndex = i + 1;
      if (hasCoords) {
        sheet.getRange(rowIndex, headers.indexOf("lat") + 1).setValue(latNum);
        sheet.getRange(rowIndex, headers.indexOf("lng") + 1).setValue(lngNum);
      }
      sheet.getRange(rowIndex, headers.indexOf("status") + 1).setValue(status);
      sheet
        .getRange(rowIndex, headers.indexOf("updated_at") + 1)
        .setValue(now);
      if (stampField && headers.indexOf(stampField) !== -1) {
        sheet.getRange(rowIndex, headers.indexOf(stampField) + 1).setValue(now);
      }
      return;
    }
  }
  if (!hasCoords) {
    throw new Error("Lokasi awal belum tersedia untuk pesanan ini.");
  }
  const row = headers.map(function (header) {
    if (header === "id") return "trk-" + now.getTime();
    if (header === "pesanan_id") return pesananId;
    if (header === "petugas_user_id") return petugasUserId;
    if (header === "lat") return latNum;
    if (header === "lng") return lngNum;
    if (header === "status") return status;
    if (header === "started_at") return now;
    if (header === "updated_at") return now;
    return "";
  });
  sheet.appendRow(row);
}

// Menyimpan SATU titik koordinat ke sheet BadalTrackingPoints (dipanggil
// setiap kali petugas mulai/mengirim/menghentikan tracking, selama
// koordinatnya ada). Sengaja "diam saja" (tidak melempar error) kalau
// koordinat kosong atau sheet-nya belum dibuat, supaya fitur utama (posisi
// live) tetap jalan walau fitur riwayat/GPX ini gagal.
function appendBadalTrackPoint_(pesananId, lat, lng) {
  const hasCoords = lat !== null && lat !== undefined && lng !== null && lng !== undefined;
  if (!hasCoords) return;
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!isFinite(latNum) || !isFinite(lngNum)) return;
  const sheet = getSpreadsheet().getSheetByName(SHEETS.badalTrackingPoints);
  if (!sheet) return;
  const now = new Date();
  sheet.appendRow([
    "pt-" + now.getTime() + "-" + Math.floor(Math.random() * 1000),
    pesananId,
    latNum,
    lngNum,
    now,
  ]);
}

// Data publik (tanpa login) untuk widget "Lacak Live" di akun.html. Sengaja
// hanya lat/lng/status/waktu, tidak ada nama pemesan atau data pribadi lain.
function getBadalTrackingPublicData_(pesananId) {
  if (!pesananId) return null;
  const pesanan = getRows("Pesanan").find(function (r) {
    return String(r.id) === String(pesananId);
  });
  if (!pesanan || pesanan.layanan !== "badal_umroh") return null;
  const t = getRowsRaw_(SHEETS.badalTracking).find(function (r) {
    return String(r.pesanan_id) === String(pesananId);
  });
  if (!t) return { status: "belum_mulai" };
  return {
    status: t.status,
    lat: Number(t.lat),
    lng: Number(t.lng),
    // PENTING: pakai formatCellDateTime_() (jam:menit:detik), BUKAN
    // formatCell() (cuma "yyyy-MM-dd" tanpa jam). Kalau dipotong jadi
    // tanggal saja, browser mem-parsing "2026-08-27" sebagai tengah malam
    // UTC, yang begitu dikonversi ke waktu lokal WIB (+7) selalu jadi
    // 07:00:00 -- makanya "Mulai" & "Selesai" selalu tampil sama-sama
    // 07.00.00 padahal waktunya beda. PENTING JUGA: t di sini berasal dari
    // getRowsRaw_() (bukan getRows()), supaya nilai Date-nya masih objek
    // Date asli saat sampai ke formatCellDateTime_() -- kalau lewat
    // getRows() dulu, formatCell() di dalamnya sudah keburu memotong
    // jam/menit/detiknya duluan sebelum sempat diformat ulang di sini.
    updated_at: formatCellDateTime_(t.updated_at),
    started_at: formatCellDateTime_(t.started_at),
    finished_at: t.finished_at ? formatCellDateTime_(t.finished_at) : "",
  };
}

// Riwayat lengkap titik koordinat (rute) 1 pesanan, dipakai untuk
// menggambar polyline "riwayat perjalanan" ala Strava + membuat file GPX di
// sisi browser (akun.html). Publik seperti getBadalTrackingPublicData_
// (hanya lat/lng/waktu, tanpa data pribadi), tapi tetap disaring hanya
// untuk pesanan layanan badal_umroh yang benar-benar ada.
function getBadalTrackPointsPublicData_(pesananId) {
  if (!pesananId) return [];
  const pesanan = getRows("Pesanan").find(function (r) {
    return String(r.id) === String(pesananId);
  });
  if (!pesanan || pesanan.layanan !== "badal_umroh") return [];
  const sheet = getSpreadsheet().getSheetByName(SHEETS.badalTrackingPoints);
  if (!sheet) return [];
  // getRowsRaw_() (bukan getRows()) supaya recorded_at masih objek Date
  // asli saat sampai ke formatCellDateTime_() -- lihat catatan di
  // getBadalTrackingPublicData_() untuk detail bug-nya.
  return getRowsRaw_(SHEETS.badalTrackingPoints)
    .filter(function (r) {
      return String(r.pesanan_id) === String(pesananId);
    })
    .map(function (r) {
      return {
        lat: Number(r.lat),
        lng: Number(r.lng),
        recorded_at: formatCellDateTime_(r.recorded_at),
      };
    })
    .sort(function (a, b) {
      return new Date(a.recorded_at) - new Date(b.recorded_at);
    });
}

// Menandai 1 baris BadalTracking sebagai sudah diverifikasi admin (dipanggil
// dari aksi "badal_verify"). Terpisah dari upsertBadalTracking_ karena
// dipanggil oleh admin (bukan petugas), dan mengisi kolom verified_at/
// verified_by yang tidak relevan untuk upsert biasa.
function markBadalTrackingVerified_(pesananId, adminUserId) {
  const sheet = getSpreadsheet().getSheetByName(SHEETS.badalTracking);
  if (!sheet) {
    throw new Error(
      "Sheet BadalTracking belum dibuat. Jalankan setupSheets() sekali dari editor Apps Script.",
    );
  }
  const headers = findHeaderRow(sheet);
  const idCol = headers.indexOf("pesanan_id");
  const values = sheet.getDataRange().getValues();
  const now = new Date();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(pesananId)) {
      const rowIndex = i + 1;
      sheet.getRange(rowIndex, headers.indexOf("status") + 1).setValue("selesai");
      sheet.getRange(rowIndex, headers.indexOf("updated_at") + 1).setValue(now);
      if (headers.indexOf("verified_at") !== -1) {
        sheet.getRange(rowIndex, headers.indexOf("verified_at") + 1).setValue(now);
      }
      if (headers.indexOf("verified_by") !== -1) {
        sheet
          .getRange(rowIndex, headers.indexOf("verified_by") + 1)
          .setValue(adminUserId);
      }
      return;
    }
  }
  throw new Error("Data tracking untuk pesanan ini tidak ditemukan.");
}

function issueSession_(user) {
  const token = signToken_({
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // berlaku 30 hari
  });
  return { token: token, user: publicUser_(user) };
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

// Pendaftaran mandiri oleh pengunjung situs -> SELALU jadi role "member"
// (tidak bisa daftar sendiri jadi penulis/super admin lewat form publik).
function registerUser_(payload) {
  const nama = sanitize(payload.nama);
  const email = String(payload.email || "")
    .trim()
    .toLowerCase();
  const whatsapp = sanitize(payload.whatsapp);
  const password = String(payload.password || "");

  if (!nama || !email || !password) {
    throw new Error("Nama, email, dan password wajib diisi.");
  }
  if (!isValidEmail_(email)) throw new Error("Format email tidak valid.");
  if (password.length < 8) throw new Error("Password minimal 8 karakter.");

  const cache = CacheService.getScriptCache();
  const throttleKey = "register_throttle_" + email;
  if (cache.get(throttleKey)) {
    throw new Error("Mohon tunggu sebentar sebelum mencoba mendaftar lagi.");
  }

  if (getUserByEmail_(email)) {
    throw new Error("Email sudah terdaftar. Silakan login.");
  }

  cache.put(throttleKey, "1", 30);
  const sheet = getUsersSheet_();
  const id = "usr-" + new Date().getTime();
  sheet.appendRow([
    id,
    nama,
    email,
    sanitizeCellValue(whatsapp),
    hashPassword_(password),
    "member",
    "aktif",
    new Date(),
  ]);
  return getUserByEmail_(email);
}

function loginUser_(payload) {
  const email = String(payload.email || "")
    .trim()
    .toLowerCase();
  const password = String(payload.password || "");
  if (!email || !password) throw new Error("Email dan password wajib diisi.");

  const cache = CacheService.getScriptCache();
  const lockKey = "login_lockout_" + email;
  if (cache.get(lockKey)) {
    throw new Error(
      "Terlalu banyak percobaan login yang gagal. Coba lagi dalam beberapa menit.",
    );
  }

  const user = getUserByEmail_(email);
  const failKey = "login_fail_" + email;
  if (!user || !verifyPassword_(password, user.password_hash)) {
    const current = Number(cache.get(failKey) || 0) + 1;
    cache.put(failKey, String(current), 600);
    if (current >= 8) cache.put(lockKey, "1", 900);
    throw new Error("Email atau password salah.");
  }
  if (String(user.status) !== "aktif") {
    throw new Error("Akun ini sedang dinonaktifkan. Hubungi admin.");
  }
  cache.remove(failKey);
  return user;
}

// Dipakai untuk melindungi aksi admin panel (konten & manajemen pengguna).
// Satu-satunya cara: token sesi dari login berbasis role (Users) --
// tidak ada lagi fallback password admin tunggal.
function requireRole_(payload, allowedRoles) {
  if (!payload || !payload.token) {
    throw new Error("Autentikasi diperlukan. Silakan login kembali.");
  }
  const claims = verifyToken_(payload.token);
  const user = getUserById_(claims.id);
  if (!user || String(user.status) !== "aktif") {
    throw new Error("Sesi tidak valid, silakan login kembali.");
  }
  if (allowedRoles.indexOf(user.role) === -1) {
    throw new Error("Anda tidak memiliki akses untuk aksi ini.");
  }
  return user;
}

function createSheetIfMissing(spreadsheet, name, headers) {
  const sheet =
    spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  sheet
    .getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#ccfbf1");
}

// Jalankan SEKALI SAJA secara manual dari editor Apps Script (pilih fungsi
// ini di dropdown lalu klik "Run") kalau sheet BadalTracking Anda dibuat
// sebelum kolom finished_at/verified_at/verified_by ditambahkan, dan sudah
// terlanjur berisi data -- createSheetIfMissing() otomatis melewati sheet
// yang sudah tidak kosong (getLastRow() > 0), jadi header baru tidak pernah
// ditambahkan otomatis lewat setupSheets(). Fungsi ini aman dijalankan
// berkali-kali: hanya menambah kolom header yang BELUM ADA di paling kanan,
// tidak menyentuh/menghapus data yang sudah ada sama sekali.
function migrateBadalTrackingHeaders() {
  const sheet = getSpreadsheet().getSheetByName(SHEETS.badalTracking);
  if (!sheet) {
    throw new Error(
      "Sheet BadalTracking belum ada. Jalankan setupSheets() dulu.",
    );
  }
  const existingHeaders = findHeaderRow(sheet);
  const missing = BADAL_TRACKING_HEADERS.filter(function (header) {
    return existingHeaders.indexOf(header) === -1;
  });
  if (missing.length === 0) {
    Logger.log("Semua kolom BadalTracking sudah lengkap, tidak ada yang perlu ditambahkan.");
    return;
  }
  const startCol = existingHeaders.length + 1;
  sheet
    .getRange(1, startCol, 1, missing.length)
    .setValues([missing])
    .setFontWeight("bold")
    .setBackground("#ccfbf1");
  Logger.log("Kolom ditambahkan: " + missing.join(", "));
}
