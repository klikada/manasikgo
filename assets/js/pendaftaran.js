/**
 * Data & render statis "Cara Pendaftaran Haji".
 *
 * Konten ini SENGAJA statis (bukan dari Admin Panel/API) karena mengikuti
 * alur resmi pendaftaran haji reguler Kementerian Agama. Satu-satunya
 * sumber teksnya ada di file ini (assets/js/pendaftaran.js) — halaman
 * tata-cara-haji.html hanya menyediakan kontainer kosong saja
 * (#pendaftaranContent) supaya tidak ada konten yang dobel/ditulis dua
 * kali di tempat berbeda. Sebelumnya konten ini juga ada sebagai halaman
 * terpisah "pendaftaran-haji.html" — halaman itu sudah dihapus dan
 * digabung ke sini supaya tidak ada duplikasi.
 * Panel ini dilindungi dari penimpaan innerHTML oleh data TataCara/API,
 * lihat renderTataCaraHeader() di assets/js/tata-cara.js.
 */
const pendaftaranHajiData = [
  {
    nomor: 1,
    judul: "Buka Rekening & Setor Awal",
    paragraf:
      "Buku rekening haji dan lakukan setoran awal Rp 25 juta di Bank Syariah.",
  },
  {
    nomor: 2,
    judul: "Daftar ke Kankemenag ",
    paragraf:
      "Datangi Kementrian Haji dan Umroh setempat untuk pendaftaran resmi.",
  },
  {
    nomor: 3,
    judul: "Ambil Nomor Porsi ",
    paragraf:
      "Kembali ke Bank Syariah untuk memperoleh dan mencetak nomor porsi haji.",
  },
 
  

];

const pendaftaranHajiNote =
  'Setelah nomor porsi terbit, jamaah menunggu jadwal keberangkatan sesuai antrean. Setelah masuk daftar calon jamaah yang berangkat tahunn berjalan,Kemenag akan menghubungi untuk menandatangani pertanyaan kesanggupan berangkat, pengumuman biasanya disampaikan setiap bulan Muharram. Bisa dilihat di Teknis Pelaksanaan.';

const escapeHtmlPendaftaran = (value = "") =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const renderPendaftaranStep = (step) => `
  <div class="step">
    <div class="num">${step.nomor}</div>
    <h4>${escapeHtmlPendaftaran(step.judul)}</h4>
    <p>${step.paragraf}</p>
  </div>`;

function renderPendaftaranHaji() {
  const container = document.getElementById("pendaftaranContent");
  if (!container) return;

  const stepsHtml = pendaftaranHajiData.map(renderPendaftaranStep).join("");

  container.innerHTML = `
    <div class="stepper">${stepsHtml}</div>
    <div class="reg-note">
      <i class="bi bi-info-circle"></i> ${pendaftaranHajiNote}
    </div>`;
}

// Konten ini statis: tidak pernah diambil dari Admin Panel/API.
// File dimuat di bagian akhir tata-cara-haji.html, setelah #pendaftaranContent
// sudah tersedia. Render SEKARANG, bukan menunggu DOMContentLoaded, supaya
// tata-cara.js boleh menyimpan/memindahkan node ini saat mengambil data API
// tanpa kehilangan isi 2 langkah statis.
renderPendaftaranHaji();
