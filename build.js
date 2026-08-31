/**
 * build.js — SSG ManasikGo
 * -------------------------
 * Pipeline build-time (stdlib Node saja, nol dependency):
 *   1. Ambil markup nav & footer langsung dari assets/js/navbar.js & footer.js
 *      (satu-satunya sumber markup) dengan mengeksekusi document.write-nya di
 *      Node. Halaman yang memuat navbar.js/footer.js sekarang sudah menyertakan
 *      markup statisnya (guard runtime di JS mencegah render ganda).
 *   2. Bake nav & footer ke dalam markup HTML setiap halaman -> dist/.
 *      Halaman tanpa tag navbar.js (404.html, admin.html, halaman redirect
 *      kecil) disalin apa adanya.
 *   3. Salin aset statis (assets/, manifest.json, CNAME, robots.txt,
 *      _redirects, vercel.json) ke dist/.
 *   4. Generate sitemap.xml ke dist/ (scan halaman dist + fetch artikel/istilah
 *      dari Apps Script lewat generate-sitemap.js).
 *
 * Pakai:  npm run build             # clean dist & build penuh
 *         npm run build -- --no-sitemap   # lewati sitemap (mis. offline)
 *
 * ponytail: partial-markup adalah nav/footer via navbar.js & footer.js; head
 *           tiap halaman masih ditulis manual. Naikkan ke head-partial bila
 *           jumlah halaman bertambah banyak; sekarang masih terjangkau.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname);
const DIST = path.join(ROOT, "dist");
const STATIC_ROOT_FILES = [
  "manifest.json", "CNAME", "robots.txt", "_redirects", "vercel.json",
];
const SKIP_FILES = new Set([
  "generate-sitemap.js", "build.js",
]);

// ============================================================================
// 1) Ekstrak markup nav & footer dari navbar.js / footer.js (satu sumber)
// ============================================================================
function extractMarkup(file, pathname) {
  const code = readFile(path.join(ROOT, "assets/js", file));
  let output = "";
  const noop = () => {};
  const noopObj = {
    addEventListener: noop, removeEventListener: noop,
    classList: { toggle: noop, add: noop, remove: noop },
    setAttribute: noop, removeAttribute: noop,
  };
  const sandbox = {
    console: { log: noop, warn: noop, error: noop },
    document: {
      write: (html) => { output += html; },
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      createElement: () => noopObj,
      addEventListener: noop,
    },
    location: { pathname: pathname || "/index.html", hash: "", search: "" },
    window: {
      addEventListener: noop, removeEventListener: noop,
      matchMedia: () => ({ matches: false, addEventListener: noop }),
      matchMediaSync: undefined, requestAnimationFrame: noop,
      scrollY: 0, innerHeight: 800,
    },
    navigator: { userAgent: "node" },
    localStorage: { getItem: () => null },
    requestAnimationFrame: noop,
    Intl,
    Date,
  };
  vm.runInNewContext(code, sandbox, { filename: file });
  return output;
}

// ============================================================================
// 2) Bake halaman -> dist/
// ============================================================================
function buildPages(nav) {
  if (fs.existsSync(DIST))
    fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  const footer = extractMarkup("footer.js");
  let count = 0;
  for (const file of fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"))) {
    if (SKIP_FILES.has(file.toLowerCase())) continue;
    let out = readFile(path.join(ROOT, file));
    const nav = extractMarkup("navbar.js", "/" + file);
    out = out.replace(
      /<script src="assets\/js\/navbar\.js"><\/script>/,
      nav + '\n    <script src="assets/js/navbar.js"></script>'
    );
    out = out.replace(
      /<script src="assets\/js\/footer\.js"[^>]*><\/script>/,
      footer + "\n    $&"
    );
    fs.writeFileSync(path.join(DIST, file), out);
    count++;
  }
  console.log(`✓ ${count} halaman dibake ke dist/`);
}

// ============================================================================
// 3) Salin aset statis
// ============================================================================
function copyStatic() {
  fs.cpSync(path.join(ROOT, "assets"), path.join(DIST, "assets"), { recursive: true });
  for (const f of STATIC_ROOT_FILES) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) fs.cpSync(p, path.join(DIST, f), { recursive: true });
  }
  console.log("✓ aset statis disalin ke dist/");
}

// ============================================================================
// 4) Sitemap (statis + artikel/istilah dari Apps Script) -> dist/
// ============================================================================
function buildSitemap(skip) {
  const rootSite = path.join(ROOT, "sitemap.xml");
  if (skip) {
    console.log("= sitemap dilewati (--no-sitemap)");
    if (fs.existsSync(rootSite)) {
      fs.copyFileSync(rootSite, path.join(DIST, "sitemap.xml"));
      console.log("= sitemap.xml root disalin (tanpa fetch Apps Script)");
    }
    return;
  }
  const { spawnSync } = require("child_process");
  const res = spawnSync(
    "node", ["generate-sitemap.js", "--pages", "dist", "--out", "dist/sitemap.xml"],
    { cwd: ROOT, stdio: "inherit" }
  );
  if (res.status !== 0) {
    console.warn("! fetch Apps Script gagal (offline) — sitemap statis tetap digenerate");
  }
}

// ============================================================================
// 5) Verifikasi (runnable check)
// ============================================================================
function verify() {
  let errors = 0;
  for (const file of fs.readdirSync(DIST).filter((f) => f.endsWith(".html"))) {
    const html = readFile(path.join(DIST, file));
    if (html.includes("assets/js/navbar.js") && !html.includes('class="site-header')) {
      console.error(`✗ ${file}: navbar.js ada tapi markup navbar tidak dibake`);
      errors++;
    }
    if (html.includes("assets/js/footer.js") && !html.includes('class="footer')) {
      console.error(`✗ ${file}: footer.js ada tapi markup footer tidak dibake`);
      errors++;
    }
    if (html.includes("{{") && html.includes("}}")) {
      console.error(`✗ ${file}: sisa token template belum terisi`);
      errors++;
    }
  }
  if (!fs.existsSync(path.join(DIST, "sitemap.xml"))) {
    console.error("✗ sitemap.xml tidak ada di dist/");
    errors++;
  }
  console.log(
    errors === 0
      ? "✓ verifikasi lolos (bake, token, sitemap OK)"
      : `✗ verifikasi gagal: ${errors} error`
  );
  if (errors > 0) process.exitCode = 1;
}

// ============================================================================
// main
// ============================================================================
function readFile(p) { return fs.readFileSync(p, "utf8"); }

function main() {
  const skipSitemap = process.argv.includes("--no-sitemap");
  buildPages();
  copyStatic();
  buildSitemap(skipSitemap);
  verify();
  console.log("✓ build selesai. Deploy isi folder dist/ ke hosting statis.");
}

main();