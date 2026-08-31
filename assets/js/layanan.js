const renderLayananPage = async () => {
  const root = document.querySelector("[data-layanan]");
  if (!root) return;
  const halaman = root.getAttribute("data-layanan");

  // Halaman tata-cara-haji & tata-cara-umrah BUKAN bagian dari Layanan.
  // Keduanya adalah panduan ibadah, dan penanganannya (fetch data +
  // pengisian [data-layanan-title]/[data-layanan-body] dkk) sepenuhnya
  // dilakukan oleh assets/js/tata-cara.js. layanan.js cukup berhenti di
  // sini supaya tidak ada dua skrip yang berebut menimpa elemen yang sama.
  if (halaman === "tata-cara-haji" || halaman === "tata-cara-umrah") return;

  const page = await HCApi.getLayanan(halaman);

  // If neither Apps Script nor the local fallback returned data, keep the
  // static HTML already in the page untouched instead of blanking it out.
  if (!page) return;

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

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await renderLayananPage();
  } catch (error) {
    console.info(error?.message || error);
  }
});
