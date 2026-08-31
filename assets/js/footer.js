// assets/js/footer.js
// Footer ManasikGo - SATU sumber untuk semua halaman.
// Cukup taruh <script src="assets/js/footer.js"></script> (TANPA atribut
// defer/async) di body, gantikan blok <footer>...</footer> yang dulu
// diulang di tiap file.
//
// Mau ubah link atau kolom footer? Edit HTML di bawah ini SEKALI SAJA,
// otomatis berlaku ke semua halaman.
(function () {
  // Bila build SSG (build.js) sudah membake markup footer ke HTML, jangan
  // menulis ulang (menghindari duplikat).
  if (document.querySelector(".footer")) return;
  document.write(
    '<footer class="footer">' +
      '<div class="container">' +
      '<div class="row g-4">' +
      '<div class="col-lg-4">' +
      '<div class="d-flex align-items-center mb-2 footer-brand-row">' +
      '<img src="assets/images/logo.png" alt="ManasikGo" class="footer-logo" height="36" />' +
      '<span class="footer-brand-name">ManasikGo</span>' +
      "</div>" +
      "<p>Portal edukasi Haji dan Umrah yang membantu jamaah Indonesia mempersiapkan ibadah dengan informasi yang rapi dan mudah dipahami.</p>" +
      '<div class="footer-social mt-3" aria-label="Ikuti ManasikGo di media sosial">' +
      '<a href="https://www.facebook.com/manasikgo" target="_blank" rel="noopener" aria-label="Facebook ManasikGo"><i class="bi bi-facebook"></i></a>' +
      '<a href="https://www.tiktok.com/@manasikgo" target="_blank" rel="noopener" aria-label="TikTok ManasikGo"><i class="bi bi-tiktok"></i></a>' +
      '<a href="https://www.instagram.com/manasikgo" target="_blank" rel="noopener" aria-label="Instagram ManasikGo"><i class="bi bi-instagram"></i></a>' +
      '<a href="https://x.com/manasikgo" target="_blank" rel="noopener" aria-label="X (Twitter) ManasikGo"><i class="bi bi-twitter-x"></i></a>' +
      "</div>" +
      "</div>" +
      '<div class="col-6 col-lg-2">' +
      '<h3 class="h6 text-white">Konten</h3>' +
      '<a class="d-block" href="artikel.html">Artikel</a>' +
      '<a class="d-block" href="pengalaman.html">Pengalaman</a>' +
      '<a class="d-block" href="faq.html">FAQ</a>' +
      '<a class="d-block" href="istilah.html">Kamus Istilah</a>' +
      "</div>" +
      '<div class="col-6 col-lg-2">' +
      '<h3 class="h6 text-white">Panduan Ibadah</h3>' +
      '<a class="d-block" href="tata-cara-haji.html">Tata Cara Haji</a>' +
      '<a class="d-block" href="tata-cara-umrah.html">Tata Cara Umrah</a>' +
      '<a class="d-block" href="doa.html">Kumpulan Doa</a>' +
      '<a class="d-block" href="checklist-perlengkapan.html">Checklist Perlengkapan</a>' +
      '<a class="d-block" href="waktu.html#jadwal">Jadwal Shalat &amp; Waktu</a>' +
      "</div>" +
      '<div class="col-6 col-lg-2">' +
      '<h3 class="h6 text-white">Info Jamaah</h3>' +
      '<a class="d-block" href="artikel.html?kategori=Transportasi">Transportasi</a>' +
      '<a class="d-block" href="artikel.html?kategori=Hotel">Hotel</a>' +
      '<a class="d-block" href="artikel.html?kategori=Kuliner">Kuliner</a>' +
      '<a class="d-block" href="artikel.html?kategori=Belanja">Belanja</a>' +
      '<a class="d-block" href="budget.html">Budget Planner</a>' +
      '<a class="d-block" href="peta.html">Peta</a>' +
      '<a class="d-block" href="download.html">Download Center</a>' +
      "</div>" +
      '<div class="col-6 col-lg-2">' +
      '<h3 class="h6 text-white">Layanan</h3>' +
      '<a class="d-block" href="doa.html">Kumpulan Doa</a>' +
      '<a class="d-block" href="badal.html">Badal Umroh</a>' +
      '<a class="d-block" href="wakaf-quran.html">Wakaf Al-Qur\'an</a>' +
      '<a class="d-block" href="rekrutmen-petugas.html">Informasi Rekrutmen PPIH</a>' +
      "</div>" +
      '<div class="col-6 col-lg-2">' +
      '<h3 class="h6 text-white">Lainnya</h3>' +
      '<a class="d-block" href="kirim.html">Kirim Pengalaman</a>' +
      '<a class="d-block" href="kontak.html">Kontak</a>' +
      '<a class="d-block" href="tentang.html">Tentang</a>' +
      "</div>" +
      "</div>" +
      '<hr class="border-secondary my-4">' +
      '<div class="d-flex flex-wrap justify-content-between gap-2">' +
      '<p class="small mb-0">&copy; 2026 ManasikGo. Semua hak dilindungi.</p>' +
      "</div>" +
      "</div>" +
      "</footer>",
  );
})();
