# TODO: Perbaikan Tata Cara Haji & Umrah

## Batch 1 — Dropdown Jenis Haji Dinamis + Button Aktif Palsu

- [x] `tata-cara-haji.html`: label tombol "Jenis Haji" dibungkus `<span class="jenis-label">` agar bisa di-update dinamis.
- [x] `tata-cara-haji.html`: fallback statis panel ditambahkan di `.content` (pengertian, jenis + 3 sub-panel, pendaftaran, ketentuan).
- [x] `tata-cara-haji.html`: button "Tata Cara Umrah" di "Lihat Juga" diubah ke `btn btn-outline-primary`.
- [x] `assets/js/tata-cara.js`: `.jenis-label` diperbarui saat dropdown dipilih + inisialisasi saat halaman dimuat.
- [x] `assets/css/tata-cara.css`: styling kecil untuk `.jenis-label`.

## Batch 2 — Feedback Lanjutan

- [x] `tata-cara-umrah.html`: button "Tata Cara Haji" di "Lihat Juga" diubah ke `btn btn-outline-primary` agar tidak tampak aktif.
- [x] `tata-cara-umrah.html`: tambah kontainer `#type-umrah` + fallback statis agar journey umrah dirender dinamis dari database.
- [x] `assets/css/tata-cara.css`: perbaikan tampilan mobile untuk kedua halaman:
  - `.panel-head` wrap agar tombol "Ganti jenis" turun ke baris sendiri.
  - Dropdown "Jenis Haji" dipaksa ke kiri + `max-width` agar tidak keluar layar.
  - Journey timeline & jnode diperkecil untuk layar kecil.
  - Doa Arab mengecil otomatis agar tidak meluber.
  - Segmented control lebih responsif.
  - Padding kartu/panel dikecilkan.
  - Breakpoint khusus layar sangat kecil (≤360px).
