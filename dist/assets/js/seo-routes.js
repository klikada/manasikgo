// seo-routes.js
// Helper URL untuk halaman berbasis slug/id (artikel, istilah, cerita
// jamaah).
//
// CATATAN PENTING: sebelumnya file ini membangun URL "bersih" seperti
// /artikel/nama-slug dan mengandalkan rewrite server (_redirects untuk
// Netlify, vercel.json untuk Vercel, .htaccess untuk Apache) supaya URL itu
// diam-diam diarahkan ke file aslinya (mis. detail.html?slug=nama-slug).
// Itu SEBABNYA klik ke "Cerita Jemaah" (dan artikel/istilah) bisa gagal
// (404) saat project dibuka langsung dari file, atau saat di-hosting di
// tempat yang tidak menjalankan rewrite tsb — termasuk GitHub Pages, yang
// tidak memproses _redirects/vercel.json/.htaccess sama sekali.
//
// Supaya link internal selalu jalan di HOSTING APA PUN (GitHub Pages,
// Netlify, Vercel, Apache, atau bahkan dibuka langsung dari file lokal)
// tanpa perlu setup rewrite tambahan, buildUrl() sekarang langsung menunjuk
// ke file HTML aslinya dengan query string (mis. detail-pengalaman.html?id=..).
// Ini otomatis relatif terhadap folder saat ini, jadi tetap aman dipakai di
// subpath seperti https://klikada.github.io/manasikgo/.
window.HCRoutes = (function () {
  // File tujuan asli untuk tiap jenis halaman detail.
  const TARGET_FILE = {
    artikel: "detail.html",
    istilah: "istilah-detail.html",
    cerita: "detail-pengalaman.html",
  };
  const PARAM_NAME = {
    artikel: "slug",
    istilah: "slug",
    cerita: "id",
  };

  // Ambil segmen setelah prefix di path, mis. getSlugFromPath("artikel")
  // pada "/artikel/checklist-persiapan-haji" -> "checklist-persiapan-haji".
  // Tetap dipertahankan untuk kompatibilitas mundur kalau ada server yang
  // sudah terlanjur di-setup dengan rewrite URL bersih di atas.
  const getSlugFromPath = (prefix) => {
    const parts = location.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf(prefix);
    if (idx !== -1 && parts[idx + 1]) {
      try {
        return decodeURIComponent(parts[idx + 1]);
      } catch (e) {
        return parts[idx + 1];
      }
    }
    return null;
  };

  // Baca slug/id: coba query string dulu (cara utama sekarang), fallback ke
  // path bersih lama supaya link/bookmark lama tetap terbaca.
  const getSlug = (prefix, paramName) =>
    new URLSearchParams(location.search).get(paramName) ||
    getSlugFromPath(prefix);

  // Bangun URL yang langsung menunjuk ke file asli + query string, relatif
  // terhadap folder saat ini supaya tetap benar walau site di-hosting di
  // subpath (mis. GitHub Pages project page).
  const buildUrl = (prefix, value) => {
    const file = TARGET_FILE[prefix] || `${prefix}.html`;
    const param = PARAM_NAME[prefix] || "slug";
    return `${file}?${param}=${encodeURIComponent(value)}`;
  };

  return { getSlugFromPath, getSlug, buildUrl };
})();
