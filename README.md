<<<<<<< HEAD
# ManasikGo

ManasikGo adalah website statis untuk portal informasi Haji dan Umrah Indonesia. Frontend dibuat dengan HTML5, CSS3, Bootstrap 5, Bootstrap Icons, Poppins, dan Vanilla JavaScript ES6. Backend sederhana memakai Google Spreadsheet dan Google Apps Script tanpa MySQL.

Versi terbaru juga menambahkan modul **Knowledge Center** untuk pengetahuan umum, kamus istilah, waktu Indonesia-Arab Saudi, jadwal shalat, panduan durasi ibadah, infografis, panduan persiapan, budget planner, konverter mata uang, transportasi, hotel, kuliner, belanja, peta, download center, video, dan FAQ 200 pertanyaan.

## Struktur Project

```text
manasikgo/
  index.html
  artikel.html
  detail.html
  kategori.html
  pengalaman.html
  tentang.html
  kontak.html
  kirim.html
  faq.html
  pengetahuan.html
  istilah.html
  istilah-detail.html
  waktu.html
  jadwal-shalat.html     (redirect ke waktu.html, digabung sejak update ini)
  panduan-waktu.html
  infografis.html
  checklist-perlengkapan.html
  budget.html
  kurs.html
  peta.html
  download.html          (redirect ke infografis.html, digabung sejak update ini)
  video.html
  404.html
  assets/css/style.css
  assets/css/responsive.css
  assets/css/animation.css
  assets/js/app.js
  assets/js/api.js
  assets/js/search.js
  assets/js/darkmode.js
  assets/js/article.js
  assets/js/content-data.js
  assets/js/knowledge.js
  assets/js/tools.js
  assets/js/faq-data.js
  assets/images/hero-haji.svg
  assets/images/article-placeholder.svg
  assets/icons/favicon.svg
  appscript/Code.gs
  appscript/appsscript.json
  robots.txt
  sitemap.xml
  manifest.json
  README.md
```

## Cara Membuat Google Spreadsheet

1. Buka Google Sheets dan buat spreadsheet baru bernama `ManasikGo Database`.
2. Buat sheet utama: `Artikel`, `Pengalaman`, dan `Kategori`.
3. Untuk Knowledge Center, siapkan juga sheet opsional: `Istilah`, `FAQ`, `Peta`, `JadwalShalat`, `Download`, `Video`, dan `Layanan`.
4. Isi header `Artikel`: `id`, `judul`, `slug`, `kategori`, `gambar`, `ringkasan`, `isi`, `penulis`, `tanggal`, `status`.
5. Isi header `Pengalaman`: `id`, `nama`, `asal`, `judul`, `kategori`, `pengalaman`, `tips`, `foto`, `tanggal`, `like`, `status`.
6. Isi header `Kategori`: `id`, `nama`, `slug`, `icon`.
7. Isi header `Istilah`: `id`, `judul`, `slug`, `kategori`, `ringkasan`, `isi`, `status`.
8. Isi header `FAQ`: `id`, `pertanyaan`, `jawaban`, `kategori`, `status`.
9. Isi header `Peta`: `id`, `nama`, `kategori`, `lokasi`, `deskripsi`, `rating`, `jarak`, `estimasi`, `harga`, `maps`, `gambar`, `status`. Kolom `kategori` boleh diisi `Peta`, `Ziarah`, atau `Transportasi` — ketiganya tetap tampil semua di `peta.html`, hanya dikelompokkan otomatis di tampilan.
10. Isi header `JadwalShalat`: `id`, `kota`, `subuh`, `dzuhur`, `ashar`, `maghrib`, `isya`, `tanggal`, `sumber`, `status`.
11. Isi header `Download`: `id`, `judul`, `deskripsi`, `file`, `gambar`, `status`. Isi salah satu `file` (link dokumen) atau `gambar` (URL gambar/infografis) per baris — tidak perlu diisi dua-duanya. (Sheet `Infografis` yang dulu terpisah sudah digabung ke sini, lihat changelog di bawah.)
12. Isi header `Video`: `id`, `judul`, `kategori`, `youtube`, `deskripsi`, `status`.
13. Gunakan status `Draft`, `Publish`, atau `Reject`. Website hanya menampilkan data dengan status `Publish`.

## Riwayat & Verifikasi Live Tracking Badal Umroh

Sheet `BadalTracking` (satu baris ringkasan per pesanan) dan `BadalTrackingPoints` (log setiap titik koordinat, dipakai untuk menggambar rute & export GPX) dibuat otomatis oleh `setupSheets()`. Kalau spreadsheet Anda sudah pernah dipakai versi sebelumnya, jalankan `setupSheets()` sekali lagi dari editor Apps Script supaya sheet `BadalTrackingPoints` dan kolom baru (`finished_at`, `verified_at`, `verified_by`) di `BadalTracking` ikut dibuat — kalau kolom-kolom baru itu tidak ada, fitur riwayat/verifikasi tetap jalan (statusnya tetap tersimpan), hanya saja waktu selesai/verifikasi tidak tercatat rinci.

Alur status tracking (`BadalTracking.status`): `belum_mulai` → `berlangsung` (petugas menekan "Mulai Badal") → `menunggu_verifikasi` (petugas menekan "Selesai", seluruh rute sudah terekam) → `selesai` (admin menekan "Verifikasi" di Admin Panel, yang otomatis juga mengubah status `Pesanan` menjadi `selesai`).

## Cara Membuat Google Apps Script

1. Dari spreadsheet, buka `Extensions > Apps Script`.
2. Salin isi `appscript/Code.gs` ke editor Apps Script.
3. Buka `Project Settings`, aktifkan opsi untuk melihat manifest, lalu sesuaikan manifest dengan `appscript/appsscript.json`.
4. Jalankan fungsi `setupSheets()` sekali untuk memastikan sheet dan header tersedia.
5. Berikan izin akses saat Google meminta otorisasi.

## Cara Deploy Apps Script

1. Klik `Deploy > New deployment`.
2. Pilih tipe `Web app`.
3. Set `Execute as` menjadi `Me`.
4. Set `Who has access` menjadi `Anyone`.
5. Klik `Deploy`, lalu salin URL Web App.

## Cara Menghubungkan Website dengan Apps Script

1. Buka `assets/js/api.js`.
2. Ganti nilai berikut:

```js
appsScriptUrl: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"
```

3. Isi dengan URL Web App dari Apps Script.
4. Jika memakai domain sendiri, ubah `siteUrl` menjadi domain final website.
5. Setelah URL terpasang, halaman artikel, detail, kategori, pengalaman, dan form kirim pengalaman akan memakai data dari Spreadsheet.

## Cara Upload ke Hosting

1. Upload seluruh isi folder `manasikgo` ke `public_html`, `htdocs`, atau root hosting statis.
2. Pastikan file `index.html`, `robots.txt`, `sitemap.xml`, dan `manifest.json` berada di root domain.
3. Untuk Netlify, Vercel, Cloudflare Pages, atau GitHub Pages, deploy sebagai static site tanpa build command.
4. Atur halaman 404 hosting agar mengarah ke `404.html`.

## Cara Optimasi SEO

1. Ubah domain placeholder `https://klikada.github.io/manasikgo` pada meta canonical, sitemap, dan konfigurasi JS sesuai domain final.
2. Gunakan judul artikel yang jelas, slug pendek, dan ringkasan unik.
3. Isi kolom `gambar` dengan URL gambar yang relevan dan ringan.
4. Pastikan setiap artikel memiliki heading `h2` dan `h3` yang rapi pada kolom `isi`.
5. Kompres gambar dan gunakan format WebP untuk aset produksi.
6. Audit rutin memakai Lighthouse, PageSpeed Insights, dan Google Search Console.

## Cara Submit Sitemap ke Google Search Console

1. Buka Google Search Console.
2. Tambahkan properti domain.
3. Verifikasi domain sesuai metode yang disediakan Google.
4. Masuk ke menu `Sitemaps`.
5. Submit `https://domain-anda.com/sitemap.xml`.
6. Pantau halaman terindeks, Core Web Vitals, dan masalah crawling.

## Cara Maintenance Website

1. Tambah artikel baru di sheet `Artikel` dengan status `Draft`.
2. Review judul, slug, ringkasan, gambar, isi, tanggal, dan penulis.
3. Ubah status menjadi `Publish` untuk menampilkan artikel.
4. Untuk menyembunyikan konten, ubah status menjadi `Draft` atau `Reject`.
5. Review kiriman jamaah di sheet `Pengalaman`.
6. Bersihkan data spam dan publikasi hanya cerita yang layak.
7. Backup spreadsheet secara berkala.
8. Perbarui sitemap jika menambah halaman statis baru.

## Fitur Knowledge Center

Halaman tambahan yang tersedia:

```text
pengetahuan.html       Pengetahuan umum Haji dan Umrah
istilah.html           Kamus istilah alfabetis
istilah-detail.html    Detail istilah berdasarkan slug
waktu.html             Jam WIB, Arab Saudi, Hijriah, dan jadwal shalat Mekkah/Madinah/Jakarta realtime (jadwal-shalat.html kini redirect ke sini)
panduan-waktu.html     Estimasi durasi tawaf, sa'i, tahallul, wukuf, jumrah, mabit, tawaf wada
infografis.html        Infografis sekaligus Download Center (PDF, checklist, e-book) - download.html kini redirect ke sini
checklist-perlengkapan.html         Panduan persiapan dokumen, ibadah, pribadi, kesehatan, keuangan
budget.html            Kalkulator estimasi biaya
kurs.html              Konverter Rupiah, Riyal, Dollar
peta.html              Peta kategori lokasi dengan pratinjau dan tombol rute
video.html             Embed video YouTube
```

Halaman `transportasi.html`, `hotel.html`, `kuliner.html`, dan `belanja.html` sudah dihapus. Kontennya kini menjadi artikel penuh pada sheet `Artikel` dengan kategori `Transportasi`, `Hotel`, `Kuliner`, dan `Belanja`, dan dapat diakses lewat `artikel.html?kategori=NamaKategori` (tautan ini dipakai di beranda dan footer).

## Infografis dengan Gambar

Sheet `Infografis` sekarang punya kolom `gambar` untuk menyimpan URL gambar infografis.

1. Admin membuka `admin.html`, memilih menu `Infografis`, lalu menambah/mengedit entri.
2. Pada field `Gambar Infografis`, admin bisa mengunggah file gambar (JPG/PNG) langsung dari perangkat. Gambar otomatis tersimpan di folder Google Drive `ManasikGo Uploads` dan URL-nya diisi otomatis ke field tersebut.
3. Setelah status diubah menjadi `Publish`, gambar tersebut akan tampil di `infografis.html` beserta tombol `Download Gambar` yang bisa dipakai pengunjung untuk mengunduh gambar tersebut ke perangkat mereka.
4. Jika field `gambar` masih kosong, halaman akan menampilkan ilustrasi placeholder sebagai gantinya.

Beberapa halaman saat ini memakai data fallback dari:

```text
assets/js/content-data.js
assets/js/faq-data.js
```

Struktur Apps Script sudah disiapkan agar data tersebut bisa dipindahkan ke Google Spreadsheet secara bertahap. Untuk pengembangan berikutnya, halaman frontend cukup diarahkan mengambil data dari action Apps Script seperti `istilah`, `faq`, `peta`, `jadwalshalat`, `download`, dan `video`.

## Catatan Jadwal, Tarif, dan Kurs

Data jadwal shalat, tarif transportasi, harga hotel, dan kurs mata uang dapat berubah sewaktu-waktu. Jangan menuliskannya sebagai fakta tetap. Simpan data dinamis tersebut di Spreadsheet atau integrasikan dengan API resmi saat website masuk tahap produksi.

## Alur Pengambilan Data dari Spreadsheet ke HTML

Alur data ManasikGo berjalan seperti ini:

```text
Google Spreadsheet
  -> Google Apps Script
  -> URL Web App / API JSON
  -> JavaScript fetch()
  -> Tampilan HTML
```

### 1. Data Disimpan di Google Spreadsheet

Google Spreadsheet berfungsi sebagai database sederhana. Website membaca data dari tiga sheet utama:

```text
Artikel
Pengalaman
Kategori
```

Sheet `Artikel` memiliki struktur:

```text
id | judul | slug | kategori | gambar | ringkasan | isi | penulis | tanggal | status
```

Contoh data artikel:

```text
art-001 | Checklist Persiapan Haji | checklist-persiapan-haji | Persiapan | assets/images/article-placeholder.svg | Panduan persiapan haji... | <h2>Dokumen</h2><p>Siapkan paspor...</p> | Redaksi ManasikGo | 2026-07-14 | Publish
```

Kolom paling penting adalah `status`.

```text
Publish = tampil di website
Draft   = belum tampil
Reject  = tidak tampil
```

Jadi admin cukup mengubah status di Google Spreadsheet. Jika status artikel atau pengalaman diubah menjadi `Publish`, data tersebut akan tampil di website saat halaman dimuat ulang.

### 2. Apps Script Membaca Spreadsheet

File backend berada di:

```text
appscript/Code.gs
```

Saat website meminta data, Apps Script menerima request melalui fungsi:

```js
function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = (params.action || "artikel").toLowerCase();

  if (action === "artikel") {
    return jsonResponse({
      success: true,
      data: getPublishedRows(SHEETS.artikel)
    });
  }
}
```

Jika request memiliki parameter:

```text
?action=artikel
```

maka Apps Script membaca sheet `Artikel`.

### 3. Baris Spreadsheet Diubah Menjadi JSON

Apps Script membaca semua data spreadsheet dengan:

```js
function getRows(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  const values = sheet.getDataRange().getValues();
}
```

Baris pertama spreadsheet dianggap sebagai nama kolom. Baris berikutnya dianggap sebagai isi data.

Contoh data spreadsheet:

```text
judul: Checklist Persiapan Haji
slug: checklist-persiapan-haji
kategori: Persiapan
status: Publish
```

akan diubah menjadi JSON:

```json
{
  "judul": "Checklist Persiapan Haji",
  "slug": "checklist-persiapan-haji",
  "kategori": "Persiapan",
  "status": "Publish"
}
```

### 4. Apps Script Memfilter Data Publish

Website hanya boleh menerima data yang statusnya `Publish`.

Proses filter dilakukan oleh fungsi:

```js
function getPublishedRows(sheetName) {
  return getRows(sheetName).filter(function (row) {
    return row.status === "Publish";
  });
}
```

Dengan begitu artikel berstatus `Draft` atau `Reject` tidak akan tampil di website.

### 5. Apps Script Mengirim Response JSON

Setelah data dibaca dan difilter, Apps Script mengirim response dalam format JSON:

```js
function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Contoh URL API artikel:

```text
https://script.google.com/macros/s/AKfycbxxxx/exec?action=artikel
```

Contoh response:

```json
{
  "success": true,
  "data": [
    {
      "id": "art-001",
      "judul": "Checklist Persiapan Haji",
      "slug": "checklist-persiapan-haji",
      "kategori": "Persiapan",
      "status": "Publish"
    }
  ]
}
```

### 6. JavaScript Website Mengambil Data dengan fetch()

File frontend yang bertugas menghubungi Apps Script adalah:

```text
assets/js/api.js
```

Di dalam file tersebut terdapat konfigurasi:

```js
const HC_CONFIG = {
  appsScriptUrl: "URL_APPS_SCRIPT_KAMU",
  siteUrl: "https://klikada.github.io/manasikgo"
};
```

URL Apps Script dipakai oleh fungsi:

```js
const requestJson = async (params = {}, options = {}) => {
  const url = new URL(HC_CONFIG.appsScriptUrl);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, options);
  return response.json();
};
```

Saat halaman membutuhkan artikel, JavaScript memanggil:

```js
HCApi.getArticles()
```

Fungsi tersebut akan mengambil data dari Apps Script:

```js
async getArticles() {
  const data = await requestJson({ action: "artikel" });
  return onlyPublished(data.data || data);
}
```

Browser kemudian memanggil URL:

```text
https://script.google.com/macros/s/AKfycbxxxx/exec?action=artikel
```

### 7. Data Dibentuk Menjadi Kartu Artikel

Setelah data JSON diterima, JavaScript mengubah data menjadi HTML.

Fungsi pembuat kartu artikel berada di:

```text
assets/js/app.js
```

Contoh:

```js
const createArticleCard = (article) => `
  <div class="col-md-6 col-lg-4">
    <article class="article-card fade-up">
      <a href="detail.html?slug=${encodeURIComponent(article.slug)}">
        <img src="${article.gambar}" alt="${article.judul}">
      </a>

      <div class="card-body-pad">
        <span class="badge-soft">${article.kategori}</span>
        <h3>${article.judul}</h3>
        <p>${article.ringkasan}</p>
      </div>
    </article>
  </div>
`;
```

Data dari Spreadsheet masuk ke bagian berikut:

```text
article.judul     -> judul artikel
article.slug      -> URL detail artikel
article.gambar    -> gambar artikel
article.kategori  -> label kategori
article.ringkasan -> deskripsi singkat
```

### 8. Homepage Menampilkan Artikel Terbaru

Di file:

```text
index.html
```

terdapat elemen kosong:

```html
<div class="row g-4" data-latest-articles></div>
```

Elemen ini diisi otomatis oleh JavaScript dari file:

```text
assets/js/article.js
```

Kode yang menjalankan prosesnya:

```js
const renderHomeContent = async () => {
  const latest = document.querySelector("[data-latest-articles]");
  const articles = await HCApi.getArticles();

  latest.innerHTML = articles
    .slice(0, 3)
    .map(HCUtils.createArticleCard)
    .join("");
};
```

Artinya:

```text
1. Cari elemen data-latest-articles
2. Ambil artikel dari Spreadsheet
3. Ambil 3 artikel pertama
4. Ubah setiap artikel menjadi kartu HTML
5. Masukkan hasilnya ke homepage
```

### 9. Halaman Artikel Menampilkan Semua Artikel

Di file:

```text
artikel.html
```

terdapat elemen:

```html
<div class="row g-4" data-article-list></div>
```

Elemen ini diisi oleh:

```text
assets/js/search.js
```

Alurnya:

```text
User membuka artikel.html
  -> search.js berjalan
  -> HCApi.getArticles() dipanggil
  -> fetch ke Apps Script dengan action=artikel
  -> Apps Script membaca sheet Artikel
  -> Apps Script mengirim JSON
  -> JavaScript membuat kartu artikel
  -> data-article-list terisi artikel
```

Halaman ini juga mendukung:

```text
Live search
Filter kategori
Pagination
```

### 10. Halaman Detail Artikel

Saat user klik artikel, link yang dibuka berbentuk:

```text
detail.html?slug=checklist-persiapan-haji
```

File:

```text
assets/js/article.js
```

mengambil nilai `slug` dari URL:

```js
const slug = getParam("slug");
const article = await HCApi.getArticle(slug);
```

Lalu `assets/js/api.js` memanggil Apps Script:

```js
async getArticle(slug) {
  const data = await requestJson({
    action: "detail",
    slug
  });

  return data.data || data;
}
```

URL API yang dipanggil:

```text
https://script.google.com/macros/s/AKfycbxxxx/exec?action=detail&slug=checklist-persiapan-haji
```

Apps Script mencari artikel dengan slug yang sama:

```js
function getArticleDetail(slug) {
  const article = getPublishedRows(SHEETS.artikel).find(function (row) {
    return row.slug === slug;
  });

  return article;
}
```

Jika artikel ditemukan dan statusnya `Publish`, artikel akan tampil di `detail.html`.

### 11. Alur Kirim Pengalaman Jamaah

User mengisi form di:

```text
kirim.html
```

Field yang dikirim:

```text
Nama
Judul
Kategori
Pengalaman
Foto
Persetujuan
```

Saat tombol kirim ditekan, JavaScript menjalankan:

```js
HCApi.postExperience(payload)
```

Data dikirim ke Apps Script dengan method `POST`:

```js
fetch(HC_CONFIG.appsScriptUrl, {
  method: "POST",
  body: JSON.stringify({
    action: "pengalaman",
    ...payload
  })
});
```

Apps Script menerima data melalui:

```js
function doPost(e) {
  const payload = JSON.parse(e.postData.contents || "{}");
  appendExperience(payload);
}
```

Lalu data ditambahkan ke sheet `Pengalaman`:

```js
sheet.appendRow([
  id,
  nama,
  judul,
  kategori,
  pengalaman,
  foto,
  tanggal,
  "Draft"
]);
```

Status pengalaman baru otomatis menjadi:

```text
Draft
```

Artinya cerita jamaah tidak langsung tampil. Admin harus membuka Google Spreadsheet, mengecek isi cerita, lalu mengubah status dari `Draft` menjadi `Publish`.

### 12. Ringkasan Alur Lengkap

```text
Admin mengisi Google Spreadsheet
  -> Status data dibuat Publish
  -> Apps Script membaca sheet
  -> Apps Script memfilter status Publish
  -> Apps Script mengirim JSON
  -> JavaScript fetch JSON
  -> JavaScript membuat HTML
  -> Website menampilkan artikel, kategori, dan pengalaman
```

Untuk form pengalaman:

```text
User mengisi form kirim pengalaman
  -> JavaScript mengirim POST ke Apps Script
  -> Apps Script menambah baris ke sheet Pengalaman
  -> Status otomatis Draft
  -> Admin review di Spreadsheet
  -> Admin ubah status menjadi Publish
  -> Pengalaman tampil di website
```

## Pembaruan: Sheet Tambahan (Full Knowledge Center dari Spreadsheet)

Selain `Artikel`, `Pengalaman`, dan `Kategori`, spreadsheet sekarang juga memakai sheet berikut agar seluruh Knowledge Center bisa diedit tanpa menyentuh kode:

```text
Istilah            Pengetahuan Umum + Kamus Istilah (istilah.html, istilah-detail.html, pengetahuan.html)
FAQ                200 pertanyaan (faq.html)
Peta               Lokasi penting jamaah: kategori Peta/Ziarah/Transportasi, semuanya tampil di peta.html (dikelompokkan otomatis, bukan difilter)
JadwalShalat       Mekkah, Madinah, Jakarta, ditampilkan realtime di waktu.html (jadwal-shalat.html redirect ke sana)
Download           Semua unduhan (dokumen PDF/checklist/e-book via kolom `file`, ATAU gambar panduan visual via kolom `gambar`), tampil satu grid di download.html "Download Center" (infografis.html redirect ke sana)
Video              Video edukasi (video.html)
PanduanWaktu       Estimasi durasi tawaf, sa'i, wukuf, dll (panduan-waktu.html)
Persiapan          Checklist dokumen, perlengkapan, kesehatan, keuangan (checklist-perlengkapan.html)
Checklist Perlengkapan  Tips H-180 s.d. hari keberangkatan (checklist-perlengkapan.html)
Kurs               Kurs Rupiah, Riyal, Dollar (kurs.html)
Layanan            Konten halaman Badal Umroh, Fikih, Wakaf Al-Qur'an, Rekrutmen Petugas (badal.html, fikih.html, wakaf-quran.html, rekrutmen-petugas.html)
```

Kolom `Pengalaman` diperbarui menjadi: `id, nama, asal, judul, kategori, pengalaman, tips, foto, tanggal, like, status` (sebelumnya belum ada `asal`, `tips`, `like`) agar sesuai dengan form `kirim.html` dan `appscript/Code.gs`.

Jalankan `setupSheets()` di Apps Script untuk membuat sheet-sheet baru ini secara otomatis (headernya saja), lalu isi datanya dari `ManasikGo_Database.xlsx` yang sudah disiapkan berisi contoh data lengkap untuk seluruh sheet.

Frontend (`assets/js/api.js`, `knowledge.js`, `tools.js`, `faq-data.js`, dan skrip di `peta.html`/`download.html`/`video.html`/`jadwal-shalat.html`) sudah diperbarui memakai pola yang sama seperti fitur Artikel: coba ambil data dari Apps Script terlebih dahulu, dan otomatis jatuh ke data fallback lokal (`content-data.js`/`faq-data.js`) bila `appsScriptUrl` belum diisi atau request gagal. Jadi tampilan tetap identik di mode demo, dan langsung memakai data spreadsheet begitu Apps Script terhubung.

## Sistem Login & Role (satu sistem untuk seluruh situs)

Situs ini hanya punya **satu** sistem login/registrasi, dipakai bersama oleh pengunjung biasa maupun pengelola konten. Tidak ada lagi halaman/form login admin terpisah.

- `login.html` — halaman Masuk untuk **semua role** (member, penulis, super_admin). Setelah berhasil login, pengguna otomatis diarahkan ke halaman yang sesuai rolenya: `akun.html` untuk member, `admin.html` untuk penulis/super_admin.
- `daftar.html` — halaman Daftar, **khusus mendaftar sebagai member** (pengunjung tidak bisa daftar sendiri jadi penulis/super_admin lewat form publik).
- `admin.html` — Admin Panel. Saat dibuka, otomatis memeriksa sesi login: kalau belum login atau rolenya bukan `penulis`/`super_admin`, langsung diarahkan ke `login.html` (lalu dibalikkan lagi ke `admin.html` setelah login berhasil).
- Akun `penulis`/`super_admin` pertama dibuat lewat fungsi `seedSuperAdmin()` di Apps Script (jalankan sekali secara manual dari editor Apps Script). Setelahnya, akun baru (penulis maupun super_admin lain) dibuat dari menu **Pengguna** di Admin Panel oleh super_admin.

**Tiga role dan hak aksesnya:**

| Role | Konten (Artikel, Pengalaman, dll) | Menu "Pengguna" (akun-akun) | Halaman publik |
|---|---|---|---|
| `super_admin` | CRUD penuh | Lihat & kelola semua akun (tambah/edit/nonaktifkan/hapus/ubah role) | ✔️ |
| `penulis` | CRUD penuh | **Tidak bisa** melihat/mengakses sama sekali (menu tersembunyi di UI, dan ditolak juga di server bila dipaksa lewat API) | ✔️ |
| `member` | Tidak bisa masuk Admin Panel | Tidak relevan (hanya mengelola profil sendiri di `akun.html`) | ✔️ |

Pembatasan ini ditegakkan di **dua lapis**: di frontend (`assets/js/admin.js` menyembunyikan menu Pengguna dari `penulis`) dan di backend (`appscript/Code.gs`, fungsi `requireRole_` menolak aksi `users_list`/`users_create`/`users_update`/`users_delete` untuk role selain `super_admin`, walau seseorang mencoba memanggil API-nya langsung).

**Sebelum dipakai:**
1. Deploy `appscript/Code.gs` sebagai Web App (Execute as: Me, Who has access: Anyone), lalu isi URL-nya ke `appsScriptUrl` di `assets/js/api.js`.
2. Jalankan `setSessionSecret()` sekali dari editor Apps Script (lihat komentar di fungsi tersebut) untuk mengaktifkan tanda tangan token sesi.
3. Jalankan `seedSuperAdmin()` sekali untuk membuat akun `super_admin` pertama, lalu login lewat `login.html` dan buat akun `penulis`/`super_admin` lain dari menu Pengguna.

**Fitur Admin Panel:**
- Tambah, edit, dan hapus data untuk setiap jenis konten (CRUD penuh) lewat tabel dan form.
- Untuk field gambar: bisa **tempel link gambar** dari internet, atau **unggah file dari perangkat** — file yang diunggah otomatis disimpan ke folder Google Drive "ManasikGo Uploads" dan tautannya otomatis terisi.
- Pencarian cepat di setiap tabel, serta status Publish/Draft agar konten baru bisa disiapkan dulu sebelum tayang.
- Sesi login memakai token bertanda tangan (HMAC) dengan masa berlaku, bukan password polos yang dicek ulang tiap aksi. Proteksi brute-force dasar juga aktif di login (`user_login`): beberapa kali salah beruntun untuk satu email membuat email itu terkunci sementara.

**Catatan keamanan:** sistem lama yang memakai satu password admin tunggal (dicek lewat `ADMIN_PASSWORD` di Script Properties) sudah **dihapus total**, termasuk fallback-nya di `requireRole_`. Kalau proyek kamu masih menyimpan `ADMIN_PASSWORD` lama di Script Properties, itu tidak lagi dipakai dan aman dihapus/dilupakan.

## Catatan Produksi

Mode demo aktif saat `appsScriptUrl` belum diisi. Dalam mode ini website memakai data fallback lokal agar tampilan tetap bisa diuji. Untuk produksi, wajib memasang URL Apps Script dan mengganti semua placeholder domain dengan domain final.

## Changelog Rombak (2026-07-19): Positioning "Ensiklopedia"

Perubahan pada revisi ini, berangkat dari analisis kekuatan/kelemahan konten:

**1. Homepage lebih menonjolkan diferensiasi**
- Hero diganti jadi positioning "Ensiklopedia Haji & Umrah" dengan tagline yang menyebut topik yang jarang dibahas tuntas di tempat lain.
- Trust bar baru di bawah kotak pencarian hero (angka konten, sumber resmi, tanggal update konten).
- Section baru "Topik yang Jarang Dibahas Tuntas di Tempat Lain" tepat di bawah panel "Tips cepat" homepage, isinya 5 kartu menuju halaman Ensiklopedia baru.

**2. Lima halaman Ensiklopedia baru (topik yang sebelumnya kosong/setengah jalan)**
Setiap halaman memakai struktur tetap: **Definisi & rujukan resmi → Panduan praktis/akses → Saran**, plus kotak "Rujukan & catatan sumber" dan FAQ singkat:
- `badal.html` — Badal Haji & Umrah
- `tabungan-investasi.html` — Tabungan & Investasi Haji (BPKH, cara bedakan dari skema ilegal)
- `fikih.html` — Fikih Haji & Umrah (rukun, wajib, jenis haji, dam, istitha'ah)
- `wakaf-quran.html` — Wakaf Al-Qur'an Masjidil Haram
- `rekrutmen-petugas.html` — Rekrutmen Petugas Haji (PPIH)

Navigasi ke kelima halaman ini ditambahkan sebagai dropdown **"Ensiklopedia"** di nav utama, dan kolom baru di footer — konsisten di seluruh 22 halaman statis.

**3. Database (`ManasikGo_Database_v2.xlsx`) disinkronkan**
- 4 kategori baru di sheet `Kategori`: Fikih, Regulasi & Keuangan, Wakaf & Sosial, Karier Petugas.
- 2 istilah baru di sheet `Istilah`: Wakaf Al-Qur'an, PPIH.
- 5 artikel ringkasan baru di sheet `Artikel` yang menautkan ke masing-masing halaman Ensiklopedia.
- 6 entri baru di sheet `FAQ` untuk topik-topik tersebut.
- Kolom baru **`sumber_referensi`** ditambahkan ke sheet `Artikel` dan `Istilah` agar setiap konten bisa mencantumkan rujukan sumbernya secara terstruktur (bukan cuma disebut di teks body).
- Data fallback JS (`assets/js/api.js`, `assets/js/content-data.js`) disinkronkan agar kategori/artikel/istilah baru tetap tampil walau Apps Script belum terhubung.

**4. Rekomendasi lanjutan (belum dikerjakan di revisi ini)**
- Integrasi API resmi untuk data yang sifatnya berubah cepat: kurs (Bank Indonesia), jadwal shalat (mis. Aladhan API), kalender Hijriah — saat ini `jadwalShalat` dan `Kurs` masih data statis dengan catatan "Referensi awal, sesuaikan sumber resmi".
- Data Kemenag/BPKH/Nusuk sebaiknya tetap dikutip manual dengan tanggal update jelas karena tidak ada API publik resminya — bukan di-scrape otomatis.

## Update (2026-07-19, lanjutan): Integrasi API Realtime untuk Kurs

- `waktu.html` (jadwal shalat) **sudah** memakai Aladhan API secara live sejak versi sebelumnya (`assets/js/tools.js` fungsi `fetchPrayerCity`), method kalkulasi `20` (KEMENAG Indonesia) untuk Jakarta dan `4` (Umm Al-Qura, Makkah) untuk Mekkah/Madinah — bukan data statis, kecuali API benar-benar tidak terjangkau, baru turun ke fallback Apps Script lalu data statis lokal.
- `kurs.html` **sebelumnya** hanya membaca sheet `Kurs` (harus diupdate manual) dengan fallback statis 1 SAR = Rp4.300 / 1 USD = Rp16.200. **Sekarang** memakai live rate dari **ExchangeRate-API** (`https://open.er-api.com/v6/latest/USD`, gratis, tanpa API key, update harian), dikonversi ke basis IDR untuk SAR dan USD. Urutan fallback: API realtime → sheet `Kurs` (Apps Script) → nilai default statis.
- UI kurs.html menampilkan status sumber data secara transparan (nama sumber, waktu update, nilai kurs saat ini) lewat elemen `[data-kurs-status]`, sama seperti pola yang sudah dipakai di widget jadwal shalat.
- Catatan penting: kurs dari API publik bersifat referensi (mid-market rate), **bukan** kurs jual-beli transaksi bank/money changer — sudah diberi disclaimer di halaman.

## Update (2026-07-19, lanjutan): Sinkronisasi Admin & Rombak Homepage

**1. Admin Panel disinkronkan ulang dengan yang tampil di frontend**
- Kolom `sumber_referensi` (Artikel, Istilah) sudah ada di database sejak update sebelumnya tapi belum ada di form admin, dan khusus Istilah malah sengaja dibuang oleh `assets/js/api.js` sebelum sampai ke halaman. Sekarang: field "Rujukan / Sumber" ditambahkan ke form Artikel & Istilah di admin, `api.js` meneruskan datanya, dan `detail.html`/`istilah-detail.html` menampilkannya sebagai kotak "Rujukan & catatan sumber" (kalau kosong, kotak tidak ditampilkan).
- `appscript/Code.gs` — `MANAGED_SHEETS.Artikel` dan `.Istilah` belum memuat `sumber_referensi`, artinya kalau `setupSheets()` dijalankan di spreadsheet baru, kolom ini tidak akan pernah dibuat. Sudah ditambahkan.
- Dropdown kategori di form Artikel/Pengalaman (`CONTENT_CATEGORIES` di `admin.js`) belum memuat 4 kategori baru (Fikih, Regulasi & Keuangan, Wakaf & Sosial, Karier Petugas) yang sudah ada di sheet `Kategori` — admin jadi tidak bisa menandai artikel baru dengan kategori ini. Sudah ditambahkan.
- Field "Kategori" di form Direktori disederhanakan: sebelumnya dropdown wajib diisi padahal isinya cuma satu pilihan tetap ("Peta"), karena Transportasi/Hotel/Kuliner/Belanja sudah pindah jadi Artikel biasa.

**2. Lima halaman Ensiklopedia kini bisa dikelola dari Admin Panel**
- Sheet baru **`Ensiklopedia`** (`id, halaman, eyebrow, judul, ringkasan, isi, sumber_referensi, status`) menyimpan konten `badal.html`, `tabungan-investasi.html`, `fikih.html`, `wakaf-quran.html`, dan `rekrutmen-petugas.html`, yang sebelumnya HTML statis dan tidak bisa diedit tanpa menyentuh kode.
- Menu admin baru "Ensiklopedia" (grup tersendiri di sidebar) memakai pola yang sama seperti Artikel: field `isi` berupa HTML bebas untuk seluruh isi halaman (termasuk section FAQ singkat), plus field terpisah untuk judul, eyebrow, ringkasan, dan rujukan/sumber.
- Kelima halaman ditandai `data-ensiklopedia="..."` dan diambil lewat `assets/js/ensiklopedia.js` menggunakan action baru `ensiklopedia` di Apps Script. Sama seperti fitur lain di situs ini: HTML asli tetap ada sebagai fallback statis di dalam file, dan hanya ditimpa kalau data dari Apps Script (atau fallback lokal `HCEnsiklopedia` di `content-data.js`) berhasil diambil — jadi tampilan tetap identik di mode demo maupun kalau Apps Script gagal diakses.
- `ManasikGo_Database_v3.xlsx` (pembaruan dari `_v2`) sudah memuat sheet `Ensiklopedia` terisi 5 baris sesuai konten asli kelima halaman, siap diimpor ke Google Sheets.

**3. Perbaikan homepage (`index.html`)**
- Section "Tips Cepat" dihapus karena 3 kartunya (Cek Dokumen, Pengetahuan, Atur Budget) 100% duplikat dari kartu yang sudah ada di section "Panduan Ibadah" dan "Info Praktis Jamaah".
- Section "Info Praktis Jamaah" dirampingkan dari 12 ke 8 kartu: kartu "Jadwal Shalat & Waktu" dan "Jam & Hijriah" dibuang (selain duplikat widget realtime di atasnya, anchor `#jadwal-shalat` dan `#jam-hijriah` yang dipakai ternyata tidak ada di `waktu.html` — link mati), begitu juga kartu "Infografis & Download" dan "Video" (duplikat section preview masing-masing).
- Ditambahkan subjudul singkat di "Info Praktis Jamaah" agar cakupannya (biaya, kurs, transportasi, akomodasi, lokasi, istilah) jelas berbeda dari "Panduan Ibadah".

## Changelog Rombak (2026-07-21): Menu "Ensiklopedia" -> "Layanan"

**Perubahan menu & konsolidasi**
- Dropdown navbar dan kolom footer **"Ensiklopedia"** diganti nama jadi **"Layanan"** di seluruh halaman (id elemen `ensiklopediaDropdown` -> `layananDropdown`).
- **"Badal Haji & Umrah"** dan **"Tabungan & Investasi Haji"** digabung/disederhanakan menjadi satu item **"Badal Umroh"** saja. Halaman `badal.html` ditulis ulang fokus ke jasa badal umroh (referensi khusus badal haji/PIHK dihapus, memakai PPIU).
- Halaman dan menu **"Tabungan & Investasi Haji"** (`tabungan-investasi.html`) **dihapus total** dari navbar, footer, homepage, sheet `Ensiklopedia`, dan artikel fallback di `api.js`.
- **"Wakaf Al-Qur'an"** tetap ada di menu Layanan.

**Fitur pesan jasa lewat WhatsApp**
- `badal.html` dan `wakaf-quran.html` masing-masing mendapat kartu form "Pesan Jasa" (nama, no. WhatsApp, catatan) yang saat submit membuka chat WhatsApp admin dengan pesan template terisi otomatis.
- Nomor WhatsApp admin di kedua file masih **nomor dummy** (`6281234567890`) — cari komentar `// TODO: ganti dengan nomor WhatsApp admin resmi` di bagian bawah kedua file dan ganti dengan nomor asli (format `62xxxxxxxxxx`) sebelum go-live.
- Kartu ini bersifat statis (di luar `data-ensiklopedia-body`) sehingga tidak ikut tertimpa saat admin mengedit isi halaman lewat Admin Panel.

**Admin Panel**
- Ditambahkan grup sidebar baru **"Layanan"** di `admin.js` yang memetakan ke sheet `Ensiklopedia` (field: halaman, eyebrow, judul, ringkasan, isi, sumber_referensi, status) — sebelumnya sheet ini sudah ada di backend (`Code.gs`/`MANAGED_SHEETS`) tapi belum punya form di Admin Panel.
- Opsi halaman di form kini hanya: `badal`, `fikih`, `wakaf-quran`, `rekrutmen-petugas` (tanpa `tabungan-investasi`).

**Data**
- `content-data.js` (`HCEnsiklopedia`): entry `badal` ditulis ulang jadi Badal Umroh, entry `tabungan-investasi` dihapus, eyebrow `wakaf-quran` diubah jadi "Layanan · Wakaf Al-Qur'an".
- Sheet `Ensiklopedia` di `ManasikGo_Database.xlsx` (salinan referensi) disesuaikan sama: baris `tabungan-investasi` dihapus, baris `badal` & `wakaf-quran` disinkronkan. **Perubahan yang sama perlu diterapkan manual ke Google Sheet produksi** karena backend sebenarnya bersumber dari sana, bukan dari file xlsx ini.

## Changelog Rombak (2026-07-25): Rapikan fitur & database yang tumpang tindih

**1. Sheet `Direktori` -> `Peta` (rename penuh, bukan cuma UI)**
- Sheet `Direktori` di spreadsheet **di-rename jadi `Peta`**, karena isinya memang hanya dipakai oleh `peta.html` (bukan Transportasi/Hotel/Kuliner/Belanja lagi seperti dulu — itu sudah pindah ke sheet `Artikel`).
- **Bug diperbaiki:** `peta.html` sebelumnya cuma menarik baris berkategori `"Peta"` lewat `HCApi.getDirectory("Peta")`, padahal sheet ini sudah berisi 3 kategori (`Peta`, `Ziarah`, `Transportasi`). Akibatnya 6 dari 12 lokasi (mis. Jabal Rahmah, Masjid Quba, Jabal Uhud, Bandara Jeddah) **tidak pernah tampil** di halaman. Sekarang `peta.html` memanggil `HCApi.getPeta()` tanpa filter kategori, dan seluruh lokasi tampil, dikelompokkan otomatis ke: Masjid & Tempat Ibadah, Ziarah & Wisata Sejarah, Transportasi, Kesehatan & Layanan, Keuangan, Lokasi Manasik.
- Backend: `SHEETS.direktori`/`SHEETS.ensiklopedia` di `Code.gs` menjadi `SHEETS.peta`/`SHEETS.layanan`, action Apps Script `direktori`/`ensiklopedia` menjadi `peta`/`layanan`, `MANAGED_SHEETS.Direktori`/`.Ensiklopedia` menjadi `.Peta`/`.Layanan`.
- Frontend: `api.js` (`getDirectory` -> `getPeta`, `getEnsiklopedia` -> `getLayanan`), `content-data.js` (`HCEnsiklopedia` -> `HCLayanan`), file `ensiklopedia.js` diganti nama jadi `layanan.js` (fungsi `renderEnsiklopediaPage` -> `renderLayananPage`, semua atribut `data-ensiklopedia-*` -> `data-layanan-*`) dan dipakai ulang di `badal.html`, `fikih.html`, `wakaf-quran.html`, `rekrutmen-petugas.html`.
- Admin Panel: form "Direktori Lokasi (Peta)" jadi "Peta (Lokasi Penting)", dropdown kategori kini `Peta`/`Ziarah`/`Transportasi` (sebelumnya cuma `Peta`, jadi baris Ziarah/Transportasi yang sudah ada di data tidak bisa dipilih ulang dari form).
- Sisa teks "Ensiklopedia" yang masih tampil di UI (hero homepage, kartu highlight homepage, eyebrow `fikih.html`/`rekrutmen-petugas.html`) diganti jadi "Layanan" agar konsisten dengan nama menu Layanan yang sudah ada sejak 2026-07-21.
- `ManasikGo_Database.xlsx`: sheet `Direktori` -> `Peta`, sheet `Ensiklopedia` -> `Layanan` (isi baris tidak berubah). **Perubahan nama sheet yang sama perlu diterapkan manual di Google Sheet produksi** (klik kanan tab sheet -> Rename), karena backend bersumber dari sana.

**2. Download Center & Infografis dirapikan jadi satu tampilan yang jelas**
- Halaman `download.html` sudah redirect ke `infografis.html#unduhan` sejak sebelumnya (tidak diubah), tapi isi `infografis.html` sekarang benar-benar tampil sebagai **Download Center**: judul halaman jadi "Download Center & Infografis", dan kontennya dipecah jadi dua section berlabel jelas — **"Dokumen & Panduan Unduhan"** (dari sheet `Download`: PDF/checklist/e-book) dan **"Infografis"** (dari sheet `Infografis`: gambar) — bukan lagi satu grid campur aduk tanpa judul.
- Sheet `Download` dan `Infografis` di database **tetap terpisah** (jenis datanya beda: link file vs gambar), yang digabung hanya tampilannya di frontend jadi satu halaman "Download Center".

## Changelog Rombak (2026-07-25, lanjutan): Infografis dihapus total, digabung ke Download

Setelah dicek ulang, konten sheet `Infografis` (10 baris: Alur Haji, Alur Umrah, Checklist, dst) ternyata memang tumpang tindih dengan `Download` — sama-sama "panduan visual/dokumen yang bisa diunduh", cuma beda format (gambar vs file). Diputuskan digabung total, bukan sekadar ditampilkan berdampingan:

**Database**
- Sheet `Infografis` **dihapus dari spreadsheet**. Ke-10 barisnya dipindahkan jadi baris baru di sheet `Download` (id `dl-010` s.d. `dl-019`), dengan kolom `gambar` diisi URL gambar dan kolom `file` dikosongkan.
- Kolom `kategori` di sheet `Download` **juga dihapus** (bukan cuma di Infografis) — dianggap tidak esensial untuk daftar sependek ini, dan menyederhanakan skema. Header `Download` sekarang: `id, judul, deskripsi, file, gambar, status`. Isi salah satu `file` (dokumen) atau `gambar` (visual unduhan), tidak wajib dua-duanya.
- **Perubahan skema ini WAJIB diterapkan manual ke Google Sheet produksi**: hapus sheet `Infografis`, hapus kolom `kategori` di `Download`, tambah kolom `gambar` di `Download`, lalu salin baris eks-Infografis ke situ. `ManasikGo_Database.xlsx` yang dilampirkan sudah mencerminkan struktur akhir ini sebagai referensi.

**Backend (`Code.gs`)**
- `SHEETS.infografis` dan action `"infografis"` dihapus total. `MANAGED_SHEETS.Infografis` dihapus. `MANAGED_SHEETS.Download` diperbarui jadi `[id, judul, deskripsi, file, gambar, status]`.

**Frontend**
- `api.js`: `getInfografis()` dihapus. `getDownloads()` sekarang mengembalikan field `gambar`, tidak lagi `kategori`.
- `admin.js`: menu admin "Infografis" dihapus (tidak ada halaman terpisah lagi). Form "Download Center" kini punya field "Link File" **atau** "Gambar (infografis)" — admin isi salah satu tergantung jenis kontennya.
- `knowledge.js`: fungsi render infografis+download yang tadinya dua section terpisah, disatukan jadi satu fungsi `renderInfographics()` yang menghasilkan **satu grid tunggal** — kartu bergambar (dari kolom `gambar`) dan kartu berkas (dari kolom `file`) tampil berdampingan tanpa pemisah section lagi, karena memang satu jenis konten yang sama: "sesuatu yang bisa diunduh".
- **File `infografis.html` dan `download.html` ditukar peran**: sebelumnya `infografis.html` adalah halaman asli dan `download.html` redirect ke sana; sekarang dibalik — **`download.html` adalah halaman asli**, dan `infografis.html` jadi halaman redirect kecil ke `download.html` (untuk kompatibilitas bila ada yang masih bookmark/link ke URL lama). Semua link navigasi, footer (26 halaman), homepage, dan `sitemap.xml` sudah diarahkan ke `download.html`.

## Update (2026-08-01): Avatar Penulis (foto profil tampil di semua artikel)

Sebelumnya kolom `penulis` di sheet `Artikel` cuma teks nama bebas, tanpa foto. Sekarang penulis (akun role `penulis` atau `super_admin`) bisa mengatur foto profilnya sendiri, dan foto itu otomatis tampil sebagai avatar di samping namanya di **semua** tempat artikel ditampilkan (kartu Beranda, halaman Artikel, artikel terkait, dan halaman Detail) — tanpa perlu mengedit satu per satu artikelnya.

**Database**
- Kolom baru **`foto`** ditambahkan ke sheet `Users` (header sekarang: `id, nama, email, whatsapp, password_hash, role, status, tanggal_daftar, foto`). Kolom ini menyimpan URL foto profil.
- **Perubahan skema ini WAJIB diterapkan manual ke Google Sheet produksi**: tambahkan kolom `foto` di ujung sheet `Users` (kalau menjalankan `setupSheets()` di spreadsheet baru, kolom ini otomatis dibuat).
- Pencocokan avatar berbasis **nama**: backend mencari akun di sheet `Users` yang nilai `nama`-nya sama persis (tanpa membedakan huruf besar/kecil dan spasi berlebih) dengan isi kolom `penulis` di baris Artikel. Jadi field "Nama" di Profil Saya harus diisi sama persis dengan yang ditulis di kolom "Penulis" saat membuat artikel. Kalau tidak ada yang cocok (mis. `penulis` diisi "Redaksi ManasikGo"), artikel tetap tampil normal, hanya avatarnya jadi lingkaran inisial huruf "R" (fallback), bukan foto.

**Backend (`Code.gs`)**
- `publicUser_()` sekarang ikut mengirim field `foto`.
- Action `artikel` dan `detail` di `doGet` memakai `withAuthorPhotoList_()` / `withAuthorPhoto_()` untuk menyisipkan field `penulis_foto` ke setiap artikel sebelum dikirim ke frontend.
- Action baru **`user_update_profile`**: dipakai untuk update profil akun sendiri (nama, whatsapp, foto, password baru opsional). Berbeda dari `users_update` yang khusus super_admin mengelola akun **orang lain** — aksi ini hanya bisa mengubah data akun milik pemilik token itu sendiri, dan tidak bisa mengubah `role`/`status`.

**Frontend**
- `assets/js/api.js`: `HCApi.updateProfile(payload, token)` memanggil action `user_update_profile`.
- `assets/js/admin.js`: menu sidebar baru **"Profil Saya"** (tersedia untuk role `penulis` maupun `super_admin`) berisi form foto profil (tempel link ATAU unggah file — sama seperti field gambar Artikel), nama, whatsapp, dan ganti password.
- Link Google Drive hasil "Share" (`.../file/d/FILE_ID/view?usp=sharing` atau `...open?id=FILE_ID`) otomatis dikonversi ke format yang bisa langsung dipakai sebagai gambar (`.../uc?export=view&id=FILE_ID`) lewat fungsi `normalizeImageUrl()` — dipakai baik di field foto profil maupun field gambar Artikel/konten lain yang sudah ada.
- `assets/js/app.js` & `assets/js/article.js`: kartu artikel Beranda, halaman Artikel, artikel terkait, dan halaman Detail sekarang menampilkan avatar penulis (`article.penulis_foto`) di samping nama, dengan fallback lingkaran inisial huruf pertama nama kalau foto belum diisi atau link-nya gagal dimuat.
- Mode demo/fallback lokal (`content-data.js`, dipakai saat Apps Script belum terhubung) tidak mengenal `penulis_foto`, jadi otomatis jatuh ke avatar inisial — tampilan tetap konsisten, tidak ada gambar rusak.

## Update (2026-08-01, lanjutan): CTA Cerita Jamaah, Sosial Media Footer, dan Kategori Download Center

**1. Halaman Detail Artikel: ajakan berbagi pengalaman haji**
- `assets/js/article.js` (`renderDetail`) menambahkan kotak CTA baru di bawah konten artikel (dan kotak "Rujukan & catatan sumber" bila ada): penjelasan singkat mengajak pembaca yang sudah pernah menunaikan haji/umrah untuk membagikan cerita mereka, dengan tombol menuju `kirim.html` (form kirim pengalaman, hasilnya tampil di `pengalaman.html` setelah disetujui admin).
- Styling baru `.share-experience-cta` / `.share-experience-icon` ditambahkan di `assets/css/style.css`.

**2. Footer: ikon media sosial**
- Blok `.footer-social` (ikon TikTok, Instagram, X) ditambahkan ke kolom brand footer di seluruh halaman publik (30 file HTML sekaligus, tidak termasuk `admin.html` dan halaman redirect kecil `404.html`/`infografis.html`/`jadwal-shalat.html`).
- **Link masih placeholder** (`https://www.tiktok.com/@manasikgo`, `https://www.instagram.com/manasikgo`, `https://x.com/manasikgo`) — cari string `footer-social` di tiap file dan ganti ke akun resmi ManasikGo sebelum go-live.

**3. Download Center: kategori & perbaikan tombol unduh**
- Kolom **`kategori`** ditambahkan kembali ke sheet `Download` (sempat dihapus di perubahan 2026-07-25). Header sekarang: `id, judul, deskripsi, kategori, file, gambar, status`. **Perubahan skema ini WAJIB diterapkan manual ke Google Sheet produksi**: tambahkan kolom `kategori` (letakkan setelah `deskripsi`), isi nilainya memakai nama kategori yang sama seperti sheet `Kategori` (Persiapan, Manasik, Umrah, Doa, Kesehatan, Transportasi, dst). `ManasikGo_Database.xlsx` yang dilampirkan sudah memuat kolom ini terisi untuk 19 baris contoh.
- Backend: `MANAGED_SHEETS.Download` di `Code.gs` diperbarui memuat `kategori`.
- Frontend: `api.js` (`getDownloads()`) meneruskan field `kategori`. `admin.js` menambah field "Kategori" (dropdown dari sheet `Kategori`, sama seperti Artikel) ke form Download Center.
- `download.html` + `assets/js/knowledge.js`: halaman Download Center sekarang punya dropdown **Filter Kategori** yang membaca/menulis parameter URL `?kategori=...` (pola yang sama seperti filter kategori di `artikel.html`). Kartu "Transportasi" di beranda (section "Info Praktis Jamaah") sekarang menuju `download.html?kategori=Transportasi` alih-alih `artikel.html?kategori=Transportasi`.
- **Perbaikan tombol unduh**: sebelumnya tombol memaksa atribut `download="..."` pada gambar thumbnail (`gambar`), yang tidak berfungsi untuk resource cross-origin (browser cuma membuka gambar mentah, bukan benar-benar mengunduh). Sekarang tombol selalu mengarah ke link asli yang tersedia dan dibuka di tab baru: prioritas ke kolom `file` (link Google Drive/PDF hosting/link internet lain), baru jika kosong memakai link `gambar` sebagai alternatif — biar layanan tujuan (Google Drive dll) yang menangani proses unduhnya, bukan website ini yang mencoba "mencuri" gambar thumbnail.
- **Catatan kualitas data**: sebagian besar baris contoh di sheet `Download` saat ini kolom `gambar`-nya berisi URL thumbnail cache Google Images (`encrypted-tbn0.gstatic.com`) tanpa link `file` asli — ini kemungkinan besar akar masalah "download gambar" yang dilaporkan sebelumnya. Disarankan admin mengisi kolom `file` dengan link Google Drive/PDF resmi untuk tiap item lewat Admin Panel agar tombol unduh mengarah ke sumber yang valid.

## Update (2026-08-04): Sertifikat Badal Umroh Lengkap, Rekrutmen PPIH, dan Detail Cerita Jamaah

**1. Sheet baru `PetugasBadal` + sertifikat Badal Umroh yang lebih lengkap**
- Sheet baru **`PetugasBadal`** (`id, nama, ttd, status`) menyimpan data petugas pelaksana jasa Badal Umroh: nama dan URL gambar tanda tangan. Dikelola lewat menu Admin Panel baru **"Petugas Badal"** (grup Layanan), field `ttd` mendukung tempel link atau unggah file seperti field gambar lainnya.
- Sheet `Pesanan` mendapat 2 kolom baru: **`petugas_badal_id`** (ID petugas dari sheet `PetugasBadal`) dan **`tanggal_pelaksanaan_hijri`** (mis. "12 Rabiul Awal 1448 H"). Keduanya diisi admin lewat form Pesanan saat menandai pesanan Badal Umroh sebagai "selesai". **Perubahan skema ini WAJIB diterapkan manual ke Google Sheet produksi**: tambahkan kolom `petugas_badal_id` dan `tanggal_pelaksanaan_hijri` di ujung sheet `Pesanan`, dan buat sheet baru `PetugasBadal` (atau jalankan `setupSheets()` di spreadsheet baru — kedua perubahan ini otomatis dibuat).
- Backend (`Code.gs`): action GET baru `petugasbadal`, `pesanan_update` menerima field `petugas_badal_id`/`tanggal_pelaksanaan_hijri`, dan `getSertifikatPublicData()` sekarang ikut mengembalikan nama & tanda tangan petugas, tanggal pelaksanaan, serta nama pelaksana badal.
- Halaman baru **`sertifikat-badal.html`** — sertifikat potrait A4 yang bisa dicetak/disimpan sebagai PDF, berisi: kode sertifikat, nama yang dibadalkan, nama pemesan, tanggal pelaksanaan (Hijriah), lafaz niat badal umrah (Arab, Latin, terjemahan), nama & tanda tangan petugas pelaksana, nama pelaksana badal (ManasikGo), dan kode QR verifikasi (mengarah ke `verifikasi-sertifikat.html`). Diakses lewat `sertifikat-badal.html?id=ID_PESANAN`.
- `akun.html`: modal sertifikat (tab "Sertifikat Badal") mendapat tombol baru **"Buka Sertifikat Lengkap"** yang membuka `sertifikat-badal.html` di tab baru, di samping tombol cetak cepat yang sudah ada.

**2. Konten "Rekrutmen Petugas Haji" diperjelas menjadi "Informasi Rekrutmen PPIH"**
- Judul, eyebrow, dan ringkasan halaman `rekrutmen-petugas.html` (serta fallback `HCLayanan` di `content-data.js` dan sheet `Layanan`) diperbarui dari "Rekrutmen Petugas Haji (PPIH)" menjadi **"Informasi Rekrutmen PPIH"**, konsisten dengan label menu navbar/footer yang sudah lebih dulu memakai istilah ini. Sebutan "Rekrutmen Petugas Haji" yang tersisa di `login.html`, `daftar.html`, dan `tentang.html` turut disamakan menjadi "Rekrutmen PPIH". Isi konten (definisi PPIH, syarat, tahapan seleksi, FAQ) tidak diubah karena sudah membahas PPIH secara lengkap.

**3. Halaman baru `detail-pengalaman.html` (detail cerita jemaah, mirip halaman artikel)**
- Setiap kartu cerita di `pengalaman.html` (dan slider cerita jamaah di beranda) kini punya tombol **"Baca Selengkapnya"** menuju `detail-pengalaman.html?id=ID_CERITA`.
- Halaman baru ini memakai layout yang sama persis dengan `detail.html` (breadcrumb, judul besar, meta info, foto, konten penuh, tombol suka/bagikan, kotak tips, CTA kirim cerita, dan "Cerita Jamaah Lainnya" di kategori yang sama) tetapi sumber datanya dari sheet `Pengalaman`, bukan `Artikel`.
- `assets/js/article.js`: fungsi baru `renderCeritaDetail()` (dipanggil otomatis saat elemen `[data-cerita-detail]` ada di halaman) dan `getRelatedStories()`. `assets/js/api.js`: fungsi baru `HCApi.getExperience(id)` untuk mengambil satu cerita berdasarkan ID (dibangun di atas `getExperiences()` yang sudah ada, jadi tetap konsisten dengan pola fallback lokal).

## Update (2026-08-06): Tata Cara Haji & Umrah Dipisah Jadi Halaman Sendiri + Dibuat Dinamis

**1. `tata-cara.html` dipecah menjadi `tata-cara-haji.html` dan `tata-cara-umrah.html`**
- Halaman lama `tata-cara.html` (satu halaman berisi tab Haji + Umrah) sekarang jadi halaman **redirect** otomatis (mengikuti pola `jadwal-shalat.html`): tautan lama tetap jalan, `#umrah` diarahkan ke `tata-cara-umrah.html`, selain itu ke `tata-cara-haji.html`.
- `tata-cara-haji.html`: berisi tab Pengertian, Jenis Haji (Tamattu'/Ifrad/Qiran), Cara Pendaftaran, dan Ketentuan Haji — konten sama persis dengan `tata-cara.html` lama, hanya tab "Tata Cara Umrah" dilepas dan diganti tombol menuju halaman baru.
- `tata-cara-umrah.html`: halaman baru berisi rangkaian tata cara umrah (journey ihram → tawaf → sa'i → tahallul) yang sebelumnya jadi salah satu tab di `tata-cara.html`.
- Semua tautan internal yang sebelumnya menunjuk ke `tata-cara.html`/`tata-cara.html#haji`/`tata-cara.html#umrah` (di `index.html`, `assets/js/footer.js`, `doa.html`) sudah diperbarui ke dua halaman baru ini. `sitemap.xml` juga sudah ditambahkan.

**2. Data tata cara kini tersimpan di database & dapat diedit lewat Admin Panel**
- Kedua halaman baru memuat section **"Ringkasan Tahapan"** yang sepenuhnya dinamis dari sheet **`TataCara`** (lewat `HCApi.getTataCara()` yang sebelumnya sudah ada di `api.js` tapi belum pernah dipakai di halaman manapun). Tambah/ubah/hapus/urutkan tahapan haji atau umrah lewat menu Admin Panel **"Tata Cara Ibadah"** — tanpa perlu mengubah kode.
  - Skema admin `TataCara` (`assets/js/admin.js`) ditambah field `waktu`, `doa_dzikir`, dan `catatan` yang sebelumnya sudah ada di header sheet & `Code.gs` tapi belum bisa diisi lewat form admin.
- Konten detail (tabbar/panel di halaman Haji, dan blok journey di halaman Umrah) dibungkus `data-layanan="tata-cara-haji"` / `"tata-cara-umrah"` + `data-layanan-body`, memakai pola yang sama seperti `fikih.html`/`badal.html`. Artinya seluruh konten (termasuk teks, tabel perbandingan, doa) juga bisa **ditimpa penuh** lewat Admin Panel > Layanan (isi field "isi" dengan HTML), tanpa kehilangan tampilan bawaan yang sudah dirancang kalau field itu dikosongkan.
  - Skema admin `Layanan` menambahkan opsi halaman `tata-cara-haji` dan `tata-cara-umrah`.
  - `content-data.js` (`HCLayanan`) dan sheet `Layanan` di database mendapat entri baru untuk kedua halaman ini (kolom `isi` sengaja dikosongkan supaya tampilan bawaan di HTML yang dipakai secara default).
- **`assets/js/ibadah.js`** (`initTataCara`): sekarang mendukung dua mode — mode tab (`[data-jenis-tab]`, dipakai kalau satu halaman menampilkan Haji & Umrah sekaligus) dan mode tetap satu jenis lewat atribut `data-jenis` pada container `[data-tatacara-list]` (dipakai di dua halaman baru ini, karena satu halaman = satu jenis, tidak perlu tab pemilih).
- **`assets/js/tata-cara.js`** (baru): logika tab/dropdown/segmen di `tata-cara-haji.html`, ditulis dengan *event delegation* (listener dipasang di `document`, bukan langsung ke tombol) supaya tetap berfungsi walau isi `.content` ditimpa ulang oleh `layanan.js` setelah admin mengisi konten dari sheet `Layanan`.
- **Backend tidak perlu diubah** — `Code.gs` sudah punya endpoint `tatacara` dan CRUD generik (`admin_list`/`create`/`update`/`delete`) untuk sheet `TataCara` maupun `Layanan` sejak sebelumnya.

**Migrasi ke Spreadsheet produksi:** kalau Google Sheet Anda sudah dibuat sebelum update ini, sheet `TataCara` dan `Layanan` seharusnya sudah ada (dibuat otomatis oleh `setupSheets()`). Tambahkan saja dua baris baru di sheet `Layanan` (halaman `tata-cara-haji` dan `tata-cara-umrah`) — lihat `ManasikGo_Database_updated.xlsx` terbaru sebagai contoh isian, atau biarkan kosong karena kedua halaman sudah punya tampilan bawaan sendiri di HTML.

## Update (2026-08-07): Bersih-bersih Database — Kolom Peta Diaktifkan, Sheet `Doa` Lama Dihapus

Audit menyeluruh terhadap semua sheet database dibandingkan dengan kode frontend, untuk mencari kolom yang tidak pernah ditampilkan dan tabel yang sudah tidak terpakai.

**1. Sheet `Peta`: kolom yang sudah ada di database tapi belum pernah tampil, sekarang diaktifkan**
- Kolom `lokasi`, `deskripsi`, `rating`, `jarak`, `estimasi`, `harga`, dan `gambar` sudah lama ada di header sheet `Peta` dan bisa diisi lewat form Admin Panel, tapi `peta.html` sebelumnya hanya membaca `nama`, `kategori`, dan `maps` — jadi isian kolom-kolom itu tidak pernah terlihat pengunjung.
- `peta.html` sekarang menampilkan kartu lokasi yang lebih lengkap: foto lokasi (`gambar`), nama kota/area (`lokasi`), deskripsi singkat (`deskripsi`), serta chip info rating, jarak, estimasi waktu tempuh, dan harga (kalau kolom terkait diisi — chip yang kosong otomatis disembunyikan, tidak menampilkan kolom kosong).
- Styling baru (`.mini-map-thumb`, `.mini-map-body`, `.mini-map-meta`, `.mini-map-chip`) ditambahkan di `assets/css/style.css`.
- **Tidak ada perubahan skema** — kolom-kolom ini sudah ada di database, jadi tidak perlu migrasi manual apa pun di Google Sheet produksi.

**2. Sheet `Doa` (lama) dihapus total — sudah digantikan sistem `DoaKategori`/`DoaPutaran`/`DoaList`**
- Sejak `doa.html` dipindah ke sistem kategori-putaran-daftar (`DoaKategori` → `DoaPutaran`/`DoaList`), sheet `Doa` yang lama (kolom: `jenis`, `judul`, `arab`, `latin`, `arti`) tidak pernah dibaca lagi oleh halaman manapun — tapi menu "Kumpulan Doa" masih ada di Admin Panel, sehingga admin bisa mengisi data yang tidak akan pernah tampil ke pengunjung.
- Dihapus: sheet `Doa` dari database, entri `doa: "Doa"` dari `SHEETS` dan `Doa: [...]` dari `MANAGED_SHEETS` di `Code.gs`, action `doa` di `doGet()`, menu "Kumpulan Doa" dari `ADMIN_SCHEMA` di `admin.js`, dan fungsi `getDoa()` yang sudah tidak dipanggil di `assets/js/api.js`.
- **Perubahan ini WAJIB diterapkan manual di Google Sheet produksi**: hapus tab sheet `Doa` (klik kanan tab → Delete). Data doa yang masih relevan sudah tercakup penuh di sheet `DoaList`.
- Kategori konten "Doa" untuk Artikel (sheet `Kategori`, dropdown `CONTENT_CATEGORIES`) **tidak terpengaruh** — itu hal yang berbeda dari sheet `Doa` yang dihapus ini.

## Update (2026-08-07, lanjutan): Sheet `TataCara` Dirombak — Isi Lama Tidak Pernah Tampil, Diganti Rincian 3 Jenis Haji

**Temuan:** 18 baris lama di sheet `TataCara` (alur umum Haji 12 tahap + Umrah 6 tahap) ternyata **tidak pernah dirender** di halaman manapun — `assets/js/ibadah.js` (`initTataCara`) mencari elemen `[data-tatacara-list]` yang tidak ada baik di `tata-cara-haji.html` maupun `tata-cara-umrah.html`. Sementara itu, konten tab "Jenis Haji" (Tamattu'/Ifrad/Qiran) di `tata-cara-haji.html` — termasuk definisi, status dam, dan rangkaian doa tiap tahap — selama ini statis di HTML, tidak bisa diedit lewat Admin Panel.

**Perubahan:**
- Sheet `TataCara` dikosongkan dari data lama, diisi ulang dengan rincian lengkap Haji **Tamattu'** (9 baris), **Ifrad** (10 baris), **Qiran** (9 baris) — total 28 baris, diambil apa adanya dari HTML asli (bukan ditulis ulang) supaya teks Arab/Latin/terjemahan tetap presisi.
- Skema baris: `urutan=0` + `judul="__intro__"` = teks pengantar jenis haji tsb (kolom `deskripsi` = paragraf pembuka, kolom `catatan` = ringkasan poin format `Label: Nilai` satu per baris, mis. "Status Dam: Wajib (Dam Tamattu')"). `urutan` 1 dst = tahapan perjalanan ibadah berurutan.
- Kolom `judul` diawali `★ ` untuk menandai tahap penting (milestone) di garis waktu — mis. `★ d. Wukuf di Arafah`.
- Kolom `doa_dzikir` mendukung lebih dari satu doa per tahap: tiap doa ditulis 4 baris berurutan (Label, Arab, Latin, Arti), antar-doa dipisah satu baris kosong.
- Kolom `catatan` menyimpan kotak info tambahan sebagai teks biasa, dan baris berformat `→ Teks: url` dikenali otomatis sebagai tautan cepat (mis. ke `doa.html#tawaf`).
- `tata-cara-haji.html` (via `assets/js/tata-cara.js`, fungsi baru `renderJenisHaji()`) sekarang mengambil ketiga jenis haji dari `HCApi.getTataCara(jenis)` saat halaman dimuat dan merender ulang panel Tamattu'/Ifrad/Qiran secara dinamis, memakai struktur HTML & class CSS yang sama seperti sebelumnya (`type-intro`, `kv-grid`, `journey`, `jstep`, `doa-box`, `info-box`, `doa-more-btn`) — jadi tampilan tetap identik. Kalau data dari Apps Script kosong/gagal diambil, konten statis bawaan HTML tetap tampil sebagai fallback (tidak ditimpa kosong).
- **Penyederhanaan yang disengaja:** badge ringkas ("pill") di atas kartu pengantar dihapus karena isinya duplikat dari `kv-grid` di bawahnya (sama-sama merangkum status dam/tahallul/tawaf qudum) — sekarang cukup satu tempat (`kv-grid`) yang diedit admin. Ikon garis waktu (`jnode`) disederhanakan jadi pola otomatis berdasar posisi (tahap pertama = ikon Ka'bah, tahap terakhir = ikon keluar, milestone lain = ikon segitiga, tahap biasa = ikon lingkaran) karena ikon spesifik per tahap tidak disimpan sebagai data — kalau butuh ikon custom per tahap lagi, perlu kolom baru.
- Skema Admin Panel `TataCara` (`assets/js/admin.js`) diperbarui: dropdown "Jenis Haji" sekarang `Tamattu`/`Ifrad`/`Qiran` (sebelumnya `Haji`/`Umrah`), field "Doa / Dzikir" & hint form disesuaikan dengan format 4-baris di atas.
- **Tahapan umum Umrah (`tata-cara-umrah.html`) tidak diubah** — halaman itu tetap statis seperti sebelumnya, karena tidak diminta pada revisi ini dan datanya juga tidak sedang orphan dari sisi tampilan (kontennya tunggal, tidak berjenis-jenis seperti Haji).
- **Perubahan ini WAJIB diterapkan manual ke Google Sheet produksi**: hapus semua baris lama di sheet `TataCara`, lalu salin 28 baris baru dari `ManasikGo_Database_updated.xlsx` (kolom & urutan header tidak berubah, jadi tinggal salin isinya).

## Update (2026-08-07, lanjutan 2): Bugfix Panel "Tamattu" Tidak Muncul + Konten Jenis Haji Diperkaya dari Dokumen Sumber

**1. Bugfix: `filterByJenis` di `Code.gs` sekarang menormalkan nilai `jenis`**
- **Akar masalah:** panel "Tamattu" di `tata-cara-haji.html` tidak menerima data dari Apps Script (Ifrad/Qiran normal), sementara Ifrad/Qiran tidak bermasalah. Penyebabnya: perbandingan `filterByJenis` di `Code.gs` bersifat *exact match* (`row.jenis.toLowerCase() === jenis.toLowerCase()`), sedangkan `tata-cara.js` selalu mengirim query `jenis="Tamattu"` (tanpa tanda kutip). Kalau kolom `jenis` di baris Tamattu pada Google Sheet produksi tertulis **"Tamattu'"** (memakai apostrof — sangat mudah tersalin begitu dari dokumen sumber yang menulis "Haji Tamattu'"), perbandingan gagal dan baris itu tidak pernah cocok, sehingga panel Tamattu tidak pernah ter-update (fallback ke HTML statis, yang isinya tidak reflect data admin).
- **Perbaikan:** fungsi baru `normalizeJenisValue_()` — trim spasi, lowercase, dan buang semua varian tanda kutip tunggal/apostrof (`'` `’` `‘` `` ` ``) — dipakai di kedua sisi perbandingan pada `filterByJenis()`. Sekarang "Tamattu", "Tamattu'", " tamattu " semuanya dianggap sama.
- **Migrasi:** tidak perlu ubah data di Google Sheet — cukup update `Code.gs` di Apps Script Editor lalu **Deploy > Manage deployments > Edit > New version**. Namun disarankan tetap mengecek kolom `jenis` di sheet `TataCara` produksi agar konsisten dengan dropdown Admin Panel (`Tamattu`/`Ifrad`/`Qiran`, tanpa apostrof).

**2. Konten Tamattu/Ifrad/Qiran diperkaya dari dokumen sumber `Panduan_Ibadah_Haji.docx`**
- Dokumen sumber ternyata memuat beberapa kotak "Info Tambahan" yang lebih detail dari isi sheet `TataCara` sebelumnya: **Murur** (skema jamaah lansia/disabilitas/risiko tinggi di Muzdalifah), **Tanazul Mina** (skema menginap di hotel Makkah alih-alih tenda Mina), **Tawaf Qudum** (penjelasan status sunnah), dan **Tawaf Ifadah** (penjelasan rukun haji + info transportasi bus gratis ke terminal Jamarat dekat Bin Dawood Supermarket, serta pembatasan akses taksi selama masa Iduladha/Tasyrik).
- Seluruh 28 baris Tamattu/Ifrad/Qiran di sheet `TataCara` (`ManasikGo_Database_fixed.xlsx`) diperbarui: deskripsi tahapan diperpanjang mengikuti redaksi dokumen sumber, dan kolom `catatan` (kotak info tambahan) diisi dengan penjelasan Murur/Tanazul Mina/Tawaf Qudum/Tawaf Ifadah yang sebelumnya tidak ada atau terlalu ringkas.
- **Konten statis fallback di `tata-cara-haji.html`** (3 panel `#type-tamattu`/`#type-ifrad`/`#type-qiran`) turut disamakan persis dengan data baru di atas — dibuat lewat generator yang mereplikasi logika `renderTypePanel()`/`renderStep()` di `assets/js/tata-cara.js`, supaya markup HTML & class CSS tetap identik dan tampilan tidak berubah walau data dari Apps Script gagal diambil.
- **Perubahan ini WAJIB diterapkan manual ke Google Sheet produksi**: timpa 28 baris di sheet `TataCara` dengan isi terbaru dari `ManasikGo_Database_fixed.xlsx` (header & urutan kolom tidak berubah).

## Update (2026-08-07, lanjutan 3): Panel Tamattu'/Ifrad Tidak Muncul di Produksi + "Ketentuan Haji" Dijadikan Dinamis

**1. Kenapa panel "Haji Tamattu'" dan "Haji Ifrad" macet di "Memuat tahapan dari data tata cara..."**
- Kode di repo ini (termasuk bugfix `normalizeJenisValue_()` pada update sebelumnya) **sudah benar** — jika data gagal/kosong, `renderJenisHaji()` di `assets/js/tata-cara.js` sengaja membiarkan konten statis bawaan HTML tampil sebagai fallback, bukan menampilkan teks "Memuat tahapan...". Teks itu tidak ada sama sekali di file manapun pada repo ini.
- **Kesimpulan:** situs yang di-screenshot (live) masih menjalankan versi kode/Apps Script **lama**, dari sebelum rangkaian bugfix di atas diterapkan — jadi permintaan ke Apps Script gagal (jenis "Tamattu'" ber-apostrof tidak cocok dengan query "Tamattu", atau endpoint lama belum punya fallback yang baik) dan UI lama menampilkan indikator loading yang tidak pernah selesai.
- **Yang perlu dilakukan supaya perbaikan ini aktif di situs live** (tidak bisa dilakukan dari sini karena memerlukan akses ke Apps Script Editor & hosting Anda):
  1. Salin ulang `appscript/Code.gs` dari paket ini ke Apps Script Editor produksi, lalu **Deploy > Manage deployments > Edit > New version**.
  2. Timpa sheet `TataCara` di Google Sheet produksi dengan isi terbaru dari `ManasikGo_Database_fixed.xlsx` (lihat poin 2 di bawah — sekarang juga berisi data `Syarat`/`Rukun`/`Wajib`/`Sunnah`).
  3. Unggah ulang seluruh file statis (html/css/js) dari paket ini ke hosting Anda.

**2. Konten disamakan lagi dengan `Panduan_Ibadah_Haji.docx` + "Ketentuan Haji" kini data-driven**
- Baris Tamattu langkah "Wukuf di Arafah" sebelumnya masih menampilkan doa lengkap secara inline di kolom `doa_dzikir` (tidak konsisten dengan baris Ifrad/Qiran yang sudah hanya memuat tautan `→ Lihat Doa Arafah: doa.html#arafah`) — kini disamakan: kolom `doa_dzikir` dikosongkan, tautan ke `doa.html#arafah` tetap di `catatan`. Pola ini memang disengaja untuk doa Arafah, Sa'i, dan Tawaf di seluruh baris `TataCara`: diarahkan ke halaman Doa, bukan ditulis ulang di sini.
- Sheet `TataCara` bertambah **34 baris baru** dengan `jenis` = `Syarat`, `Rukun`, `Wajib`, `Sunnah` — mengisi tab "Ketentuan Haji" yang sebelumnya statis penuh di HTML. Skema baris sama seperti Tamattu/Ifrad/Qiran/Umrah: `urutan=0` + judul `__intro__` = paragraf pembuka segmen (kolom `deskripsi`), `urutan` 1–9 = tiap poin (Judul Tahapan = nama poin, `deskripsi` = penjelasan), dan baris baru `urutan=99` + judul `__consequence__` = teks banner konsekuensi di bawah daftar.
- `assets/js/tata-cara.js` mendapat fungsi baru `renderKetentuan()` yang mengambil keempat `jenis` di atas lewat `HCApi.getTataCara()` dan merender ulang `#seg-syarat`/`#seg-rukun`/`#seg-wajib`/`#seg-sunnah` — memakai class `rule-list`/`rule-item`/`rule-num`/`consequence-banner` yang sama persis, jadi tampilan tidak berubah. Kalau data kosong/gagal diambil, konten statis bawaan HTML tetap tampil (fallback, sama seperti pola Jenis Haji).
- Skema Admin Panel `TataCara` (`assets/js/admin.js`) diperbarui: dropdown "Jenis Haji / Ketentuan" menambahkan opsi `Umrah`, `Syarat`, `Rukun`, `Wajib`, `Sunnah`, dan hint form dijelaskan untuk kedua pola pengisian.
- **Backend tidak perlu diubah** — `filterByJenis` di `Code.gs` sudah generik terhadap nilai `jenis` apa pun.
- **Perubahan ini WAJIB diterapkan manual ke Google Sheet produksi**: timpa sheet `TataCara` dengan isi terbaru `ManasikGo_Database_fixed.xlsx` (34 baris baru ditambahkan di akhir, header & urutan kolom tidak berubah), lalu unggah ulang `assets/js/tata-cara.js` dan `assets/js/admin.js`.
=======
# manasikgo
>>>>>>> f8d003a57511a62569bbad66e15e81778f96b56d
