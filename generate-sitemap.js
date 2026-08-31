/**
 * generate-sitemap.js
 * --------------------
 * sitemap.xml sebelumnya cuma berisi 20 halaman statis (index, artikel.html,
 * dst) -- TIDAK SATU PUN artikel atau istilah individual (mis.
 * detail.html?slug=badal-umroh-panduan) ada di dalamnya, padahal itu
 * konten utama yang justru paling penting untuk diindeks Google.
 *
 * Karena artikel & istilah dikelola lewat Google Sheets/Apps Script (bukan
 * file statis), sitemap tidak bisa "sekali generate lalu selesai" -- akan
 * basi begitu ada artikel/istilah baru. Jalankan script ini setiap kali
 * ada konten baru dipublish (atau jadwalkan via cron/GitHub Actions),
 * supaya sitemap.xml selalu sinkron dengan isi Google Sheets.
 *
 * Cara pakai:
 *   node generate-sitemap.js
 *
 * Script ini menulis ulang sitemap.xml di folder yang sama.
 *
 * CATATAN URL: sitemap ini memakai format `/detail.html?slug=...` dan
 * `/istilah-detail.html?slug=...` (BUKAN URL bersih /artikel/nama-slug),
 * supaya link di sitemap selalu bisa diakses tanpa tergantung rewrite rule
 * server (_redirects/.htaccess/vercel.json). Ini penting terutama untuk
 * hosting seperti GitHub Pages yang tidak memproses rewrite tsb sama
 * sekali -- URL bersih akan 404 di sana. Kalau nanti pindah ke hosting yang
 * rewrite-nya aktif dan ingin pakai URL bersih lagi, ganti loc di bawah ke
 * `/artikel/${slug}` dan `/istilah/${slug}`.
 */

const fs = require("fs");
const path = require("path");

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwmA9_2u401HLsSkMx9ofK6LNF7QqY350UolsOxqO4h9ApMdK7hCydopZgzlfJ5Psohgw/exec";
const SITE_URL = "https://klikada.github.io/manasikgo";

// CLI sederhana agar SSG build.js bisa paksa keluaran & scope halaman statis:
//   node generate-sitemap.js --pages dist --out dist/sitemap.xml
const argv = process.argv.slice(2);
const argOf = (name) => {
  const i = argv.indexOf(name);
  return i !== -1 ? argv[i + 1] : undefined;
};
const OUTPUT_PATH = argOf("--out") || path.join(__dirname, "sitemap.xml");
const PAGES_DIR = argOf("--pages");

// Halaman statis (bukan hasil generate dari Sheets) -- daftar ini yang
// sebelumnya sudah ada di sitemap.xml, dipertahankan apa adanya.
const STATIC_PAGES = [
  { loc: "/", priority: "1.0" },
  { loc: "/artikel.html", priority: "0.9" },
  { loc: "/kategori.html", priority: "0.8" },
  { loc: "/pengalaman.html", priority: "0.8" },
  { loc: "/faq.html", priority: "0.7" },
  { loc: "/tentang.html", priority: "0.7" },
  { loc: "/kontak.html", priority: "0.6" },
  { loc: "/kirim.html", priority: "0.6" },
  { loc: "/pengetahuan.html", priority: "0.8" },
  { loc: "/istilah.html", priority: "0.8" },
  { loc: "/tata-cara-haji.html", priority: "0.9" },
  { loc: "/tata-cara-umrah.html", priority: "0.9" },
  { loc: "/waktu.html", priority: "0.7" },
  { loc: "/download.html", priority: "0.7" },
  { loc: "/checklist-perlengkapan.html", priority: "0.8" },
  { loc: "/perlengkapan-haji.html", priority: "0.8" },
  { loc: "/perlengkapan-umroh.html", priority: "0.8" },
  { loc: "/budget.html", priority: "0.7" },
  { loc: "/kurs.html", priority: "0.7" },
  { loc: "/peta.html", priority: "0.7" },
  { loc: "/video.html", priority: "0.6" },
  { loc: "/doa.html", priority: "0.8" },
  { loc: "/doa-tawaf.html", priority: "0.8" },
  { loc: "/doa-sai.html", priority: "0.8" },
  { loc: "/doa-arafah.html", priority: "0.8" },
];

const fetchJson = async (action) => {
  const url = `${APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${action}: HTTP ${res.status}`);
  const data = await res.json();
  return data.data || data;
};

const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const urlTag = ({ loc, priority, lastmod }) => {
  const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
  return `  <url><loc>${escapeXml(SITE_URL + loc)}</loc>${lastmodTag}<priority>${priority}</priority></url>`;
};

const toDateOnly = (value) => {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
};

async function main() {
  const urls = STATIC_PAGES.map(urlTag);

  // Auto-scan halaman statis: setiap *.html yang tidak dipakai sebagai
  // halaman sementara/redirect/internal dimasukkan ke sitemap. Dipakai
  // saat --pages diberikan (build SSG); tanpanya, tetap himpunan statis
  // eksplisit di atas agar kompatibel dengan pemakaian lama.
  if (PAGES_DIR) {
    const dir = fs.existsSync(PAGES_DIR) ? PAGES_DIR : __dirname;
    const NON_SEO_PAGES = new Set([
      // 404, admin, halaman butuh sesi/login
      "404.html", "admin.html", "akun.html", "login.html", "daftar.html",
      "petugas-badal.html", "sertifikat-badal.html", "verifikasi-sertifikat.html",
      // halaman dinamis per slug/id (diwakili URL ?slug=... dari artikel/istilah)
      "detail.html", "istilah-detail.html", "detail-pengalaman.html",
      // halaman redirect kompatibilitas (targetnya halaman lain)
      "jadwal-shalat.html", "tata-cara.html", "infografis.html", "download.html",
    ]);
    const htmlFiles = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".html") && !f.startsWith("_"))
      .filter((f) => !urls.some((u) => u.includes(`/${f}`) || u.includes(`/${f.replace(".html","")}`)));
    for (const f of htmlFiles) {
      if (NON_SEO_PAGES.has(f)) continue;
      urls.push(urlTag({ loc: `/${f}`, priority: "0.6" }));
    }
  }

  try {
    const articles = await fetchJson("artikel");
    const published = (Array.isArray(articles) ? articles : []).filter(
      (a) => (a.status || "Publish") === "Publish" && a.slug,
    );
    published.forEach((a) => {
      urls.push(
        urlTag({
          loc: `/detail.html?slug=${encodeURIComponent(a.slug)}`,
          priority: "0.8",
          lastmod: toDateOnly(a.tanggal),
        }),
      );
    });
    console.log(`✓ ${published.length} artikel ditambahkan ke sitemap.`);
  } catch (error) {
    console.warn(`! Gagal mengambil data artikel (${error.message}) -- bagian artikel dilewati.`);
  }

  try {
    const terms = await fetchJson("istilah");
    const published = (Array.isArray(terms) ? terms : []).filter(
      (t) => (t.status || "Publish") === "Publish" && t.slug,
    );
    published.forEach((t) => {
      urls.push(
        urlTag({
          loc: `/istilah-detail.html?slug=${encodeURIComponent(t.slug)}`,
          priority: "0.6",
        }),
      );
    });
    console.log(`✓ ${published.length} istilah ditambahkan ke sitemap.`);
  } catch (error) {
    console.warn(`! Gagal mengambil data istilah (${error.message}) -- bagian istilah dilewati.`);
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join("\n") +
    `\n</urlset>\n`;

  fs.writeFileSync(OUTPUT_PATH, xml, "utf8");
  console.log(`✓ sitemap.xml ditulis ulang (${urls.length} URL total) di ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error("Gagal generate sitemap:", error.message);
  process.exit(1);
});
