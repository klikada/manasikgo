const HC_CONFIG = {
  appsScriptUrl:
    "https://script.google.com/macros/s/AKfycbw0MxKKAQ7yE3xPE8M_AT2uRDBd5q_4AvBtkVGPZe-QJTx3-ViXHyPm0OtsL6-QRAXcjA/exec",
  siteUrl: "https://klikada.github.io/manasikgo",
  // Nomor WhatsApp admin (format 62xxxxxxxxxx, tanpa +/spasi/tanda hubung).
  // Satu-satunya tempat pengaturan — dipakai di badal.html, wakaf-quran.html,
  // rekrutmen-petugas.html, dan akun.html supaya cukup diganti di sini saja.
  waNumber: "#",
};

const fallbackArticles = [
  {
    id: "art-001",
    judul: "Checklist Persiapan Haji dari Dokumen sampai Kesehatan",
    slug: "checklist-persiapan-haji",
    kategori: "Persiapan",
    gambar: "assets/images/article-placeholder.svg",
    ringkasan:
      "Panduan ringkas untuk memastikan dokumen, perlengkapan, obat pribadi, dan kesiapan fisik sebelum keberangkatan.",
    isi: "<h2>Mulai dari dokumen utama</h2><p>Pastikan paspor, visa, bukti vaksin, identitas, dan dokumen perjalanan tersimpan dalam map tahan air. Simpan salinan digital di ponsel dan penyimpanan cloud.</p><h2>Siapkan fisik bertahap</h2><p>Latihan berjalan kaki 30-45 menit per hari membantu tubuh beradaptasi dengan ritme ibadah di Tanah Suci. Konsultasikan obat rutin dengan dokter sebelum berangkat.</p><blockquote>Persiapan terbaik adalah yang dimulai jauh sebelum koper ditutup.</blockquote>",
    penulis: "Redaksi ManasikGo",
    tanggal: "2026-07-01",
    status: "Publish",
  },
  {
    id: "art-002",
    judul: "Tips Hemat Umrah tanpa Mengurangi Kenyamanan Ibadah",
    slug: "tips-hemat-umrah",
    kategori: "Tips Hemat",
    gambar: "assets/images/article-placeholder.svg",
    ringkasan:
      "Cara memilih paket, mengatur belanja, dan memaksimalkan transportasi agar biaya perjalanan tetap terkontrol.",
    isi: "<h2>Pilih waktu dengan cermat</h2><p>Biaya umrah dapat berbeda menurut musim. Bandingkan paket, jarak hotel, fasilitas makan, dan rekam jejak penyelenggara sebelum memutuskan.</p><h2>Buat batas belanja</h2><p>Tentukan daftar oleh-oleh sejak awal agar pengeluaran lebih terarah. Prioritaskan kebutuhan ibadah, komunikasi, dan kesehatan.</p>",
    penulis: "Redaksi ManasikGo",
    tanggal: "2026-06-24",
    status: "Publish",
  },
  {
    id: "art-003",
    judul: "Panduan Transportasi Jamaah di Makkah dan Madinah",
    slug: "panduan-transportasi-makkah-madinah",
    kategori: "Transportasi",
    gambar: "assets/images/article-placeholder.svg",
    ringkasan:
      "Kenali opsi bus, taksi resmi, titik jemput, dan kebiasaan mobilitas jamaah agar perjalanan lebih tenang.",
    isi: "<h2>Kenali titik kumpul</h2><p>Catat nama hotel, nomor rombongan, dan lokasi pintu masjid terdekat. Gunakan kartu identitas jamaah setiap kali keluar.</p><h2>Gunakan transportasi resmi</h2><p>Ikuti arahan petugas dan hindari tawaran kendaraan tanpa kejelasan tarif. Berangkat lebih awal saat waktu padat.</p>",
    penulis: "Tim Lapangan",
    tanggal: "2026-06-12",
    status: "Publish",
  },
  {
    id: "art-044",
    judul: "Badal Umroh: Panduan &amp; Layanan",
    slug: "badal-umroh-panduan",
    kategori: "Fikih",
    gambar: "assets/images/article-placeholder.svg",
    ringkasan:
      "Dasar hukum, syarat sah, cara memilih penyelenggara resmi, dan cara memesan jasa badal umroh.",
    isi: '<p>Baca panduan lengkapnya di <a href="badal.html">halaman Badal Umroh</a>: definisi &amp; dasar hukum, kapan badal boleh dilakukan, cara memilih penyelenggara PPIU resmi, serta cara memesan jasa badal umroh lewat WhatsApp admin.</p>',
    penulis: "Tim ManasikGo",
    tanggal: "2026-07-19",
    status: "Publish",
  },
  {
    id: "art-046",
    judul: "Fikih Haji dan Umrah: Ringkasan Praktis",
    slug: "fikih-haji-umrah-ringkasan",
    kategori: "Fikih",
    gambar: "assets/images/article-placeholder.svg",
    ringkasan:
      "Rukun, wajib, jenis pelaksanaan haji, dam, dan istitha'ah kesehatan dirangkum ringkas.",
    isi: "<p>Baca panduan lengkapnya di <a href=\"fikih.html\">halaman Fikih Haji &amp; Umrah</a>: rukun vs wajib, tabel jenis haji Tamattu'/Ifrad/Qiran, penjelasan dam, istitha'ah kesehatan, dan catatan khilafiyah antar mazhab.</p>",
    penulis: "Tim ManasikGo",
    tanggal: "2026-07-19",
    status: "Publish",
  },
  {
    id: "art-047",
    judul: "Wakaf Al-Qur'an Masjidil Haram",
    slug: "wakaf-quran-masjidil-haram",
    kategori: "Wakaf & Sosial",
    gambar: "assets/images/article-placeholder.svg",
    ringkasan:
      "Program wakaf mushaf Al-Qur'an, landasan fikihnya, dan cara berwakaf lewat lembaga resmi dari Indonesia.",
    isi: '<p>Baca panduan lengkapnya di <a href="wakaf-quran.html">halaman Wakaf Al-Qur\'an</a>: apa itu wakaf mushaf, landasan fikih wakaf, panduan ikut program lewat lembaga terdaftar BWI, dan cara menghindari penggalangan dana palsu.</p>',
    penulis: "Tim ManasikGo",
    tanggal: "2026-07-19",
    status: "Publish",
  },
  {
    id: "art-048",
    judul: "Informasi Rekrutmen PPIH: Panduan Lengkap",
    slug: "rekrutmen-petugas-haji-ppih",
    kategori: "Karier Petugas",
    gambar: "assets/images/article-placeholder.svg",
    ringkasan:
      "Skema PPIH, syarat umum, tahapan seleksi, dan cara memantau pengumuman resmi rekrutmen PPIH.",
    isi: '<p>Baca panduan lengkapnya di <a href="rekrutmen-petugas.html">halaman Informasi Rekrutmen PPIH</a>: jenis PPIH (Kloter, Arab Saudi, non-kloter), syarat umum, tahapan seleksi, dan peringatan bahwa proses ini tidak dipungut biaya.</p>',
    penulis: "Tim ManasikGo",
    tanggal: "2026-07-19",
    status: "Publish",
  },
];

// Data demo petugas pelaksana Badal Umroh, dipakai saat appsScriptUrl belum
// terhubung supaya halaman sertifikat tetap bisa ditampilkan/di-preview.
const fallbackPetugasBadal = [
  { id: "ptg-001", nama: "Ust. Ahmad Fauzi, S.Ag", ttd: "", status: "Publish" },
  { id: "ptg-002", nama: "Ust. Muhammad Ridwan", ttd: "", status: "Publish" },
  {
    id: "ptg-003",
    nama: "Ustadzah Siti Nur Aisyah",
    ttd: "",
    status: "Publish",
  },
];

const fallbackCategories = [
  { id: "kat-001", nama: "Persiapan", slug: "persiapan", icon: "bi-suitcase2" },
  { id: "kat-002", nama: "Manasik", slug: "manasik", icon: "bi-list-check" },
  { id: "kat-003", nama: "Umrah", slug: "umrah", icon: "bi-compass" },
  { id: "kat-004", nama: "Doa", slug: "doa", icon: "bi-journal-text" },
  {
    id: "kat-005",
    nama: "Kesehatan",
    slug: "kesehatan",
    icon: "bi-heart-pulse",
  },
  {
    id: "kat-006",
    nama: "Transportasi",
    slug: "transportasi",
    icon: "bi-bus-front",
  },
  { id: "kat-007", nama: "Hotel", slug: "hotel", icon: "bi-building" },
  { id: "kat-008", nama: "Kuliner", slug: "kuliner", icon: "bi-cup-hot" },
  { id: "kat-009", nama: "Belanja", slug: "belanja", icon: "bi-bag-check" },
  { id: "kat-010", nama: "Budget", slug: "budget", icon: "bi-cash-coin" },
  { id: "kat-011", nama: "Adab", slug: "adab", icon: "bi-stars" },
  { id: "kat-012", nama: "Ziarah", slug: "ziarah", icon: "bi-geo-alt" },
  { id: "kat-013", nama: "Fikih", slug: "fikih", icon: "bi-book" },
  {
    id: "kat-014",
    nama: "Regulasi & Keuangan",
    slug: "regulasi-keuangan",
    icon: "bi-cash-coin",
  },
  {
    id: "kat-015",
    nama: "Wakaf & Sosial",
    slug: "wakaf-sosial",
    icon: "bi-book-half",
  },
  {
    id: "kat-016",
    nama: "Karier Petugas",
    slug: "karier-petugas",
    icon: "bi-briefcase",
  },
];

const fallbackExperiences = [
  // Umrah
  {
    id: "exp-001",
    nama: "Ahmad Fauzi",
    asal: "Bandung",
    judul: "Pengalaman Pertama Umrah Bersama Orang Tua",
    kategori: "Umrah",
    pengalaman:
      "Perjalanan umrah pertama saya bersama orang tua sangat berkesan. Tantangan terbesar adalah menjaga stamina ayah dan ibu, terutama saat berjalan dari hotel ke masjid. Dengan persiapan obat, sandal yang nyaman, dan jadwal istirahat yang cukup, ibadah terasa lebih tenang.",
    tips: "Siapkan obat pribadi dan sandal nyaman untuk orang tua.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-13",
    like: 18,
    status: "Publish",
  },
  {
    id: "exp-002",
    nama: "Siti Aminah",
    asal: "Yogyakarta",
    judul: "Belajar Sabar Saat Antrean di Raudhah",
    kategori: "Umrah",
    pengalaman:
      "Saya belajar banyak tentang kesabaran saat menunggu antrean menuju Raudhah. Situasinya ramai, tetapi dengan mengikuti arahan petugas dan menjaga niat, pengalaman itu menjadi salah satu momen paling berharga dalam hidup saya.",
    tips: "Ikuti arahan petugas dan jaga niat saat antrean padat.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-13",
    like: 24,
    status: "Publish",
  },
  {
    id: "exp-020",
    nama: "Ummu Kalsum",
    asal: "Padang",
    judul: "Kesan Mendalam Shalat di Multazam",
    kategori: "Umrah",
    pengalaman:
      "Berkesempatan berdoa di dekat Multazam adalah momen yang tidak akan saya lupakan. Meski harus sabar menunggu celah karena selalu ramai, rasa syukur dan haru yang saya rasakan saat berdoa di sana sungguh luar biasa.",
    tips: "Manfaatkan waktu selepas shalat fardhu saat area sedikit lebih longgar.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-14",
    like: 17,
    status: "Publish",
  },

  // Haji
  {
    id: "exp-003",
    nama: "Hendra Wijaya",
    asal: "Jakarta",
    judul: "Manfaat Latihan Jalan Kaki Sebelum Haji",
    kategori: "Haji",
    pengalaman:
      "Sebelum berangkat haji, saya rutin berjalan kaki setiap pagi. Kebiasaan sederhana itu sangat membantu saat menjalani rangkaian ibadah yang membutuhkan fisik kuat. Saya menyarankan jamaah mulai latihan jauh-jauh hari.",
    tips: "Latih jalan kaki minimal 30 menit setiap hari sebelum berangkat.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-13",
    like: 10,
    status: "Publish",
  },
  {
    id: "exp-006",
    nama: "Muhammad Rizki",
    asal: "Palembang",
    judul: "Kekhusyukan Wukuf di Arafah yang Tak Terlupakan",
    kategori: "Haji",
    pengalaman:
      "Wukuf di Arafah menjadi puncak ibadah yang paling saya rindukan. Duduk berdesakan dengan jutaan jamaah dari seluruh dunia, saya merasakan kesetaraan yang luar biasa. Panas terik siang hari terasa ringan karena suasana doa dan dzikir yang menggetarkan hati.",
    tips: "Bawa payung, semprotan air, dan perbanyak minum agar tidak dehidrasi saat wukuf.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-15",
    like: 14,
    status: "Publish",
  },
  {
    id: "exp-007",
    nama: "Fatimah Zahra",
    asal: "Makassar",
    judul: "Malam Mabit di Mina: Ujian Fisik dan Kesabaran",
    kategori: "Haji",
    pengalaman:
      "Bermalam di tenda Mina mengajarkan saya arti kesabaran yang sesungguhnya. Tenda yang padat, antrean kamar mandi yang panjang, dan cuaca panas menjadi ujian tersendiri. Namun kebersamaan dengan rombongan membuat semua terasa ringan dan penuh makna.",
    tips: "Selalu ikuti kelompok dan catat nomor tenda agar tidak tersesat saat kembali.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-16",
    like: 9,
    status: "Publish",
  },

  // Persiapan
  {
    id: "exp-004",
    nama: "Nur Laila",
    asal: "Jakarta",
    judul: "Tips Membawa Barang agar Tidak Repot",
    kategori: "Persiapan",
    pengalaman:
      "Saya dulu membawa terlalu banyak barang dan akhirnya kerepotan sendiri. Menurut saya, bawalah barang yang benar-benar penting seperti obat pribadi, pakaian nyaman, botol minum, dan perlengkapan ibadah secukupnya.",
    tips: "Buat checklist barang penting dan hindari membawa yang berlebihan.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-13",
    like: 10,
    status: "Publish",
  },
  {
    id: "exp-008",
    nama: "Dewi Lestari",
    asal: "Semarang",
    judul: "Tips Packing Koper agar Tidak Berlebihan",
    kategori: "Persiapan",
    pengalaman:
      "Saya belajar menyusun koper dengan checklist dari grup rombongan, sehingga tidak ada barang tertinggal maupun berlebihan.",
    tips: "Gunakan checklist tertulis dan timbang koper sebelum berangkat.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-05",
    like: 15,
    status: "Publish",
  },
  {
    id: "exp-010b",
    nama: "Ridwan Hakim",
    asal: "Bogor",
    judul: "Pentingnya Vaksinasi dan Cek Kesehatan Sebelum Berangkat",
    kategori: "Persiapan",
    pengalaman:
      "Sebelum berangkat, saya menyempatkan diri melakukan medical check-up lengkap dan vaksin meningitis jauh-jauh hari. Ternyata dokter menemukan tekanan darah saya cukup tinggi sehingga perlu penyesuaian obat. Jika saya tidak cek lebih awal, mungkin akan menyulitkan saat di perjalanan.",
    tips: "Lakukan medical check-up minimal 1 bulan sebelum keberangkatan agar ada waktu penyesuaian.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-08",
    like: 11,
    status: "Publish",
  },

  // Belanja
  {
    id: "exp-005",
    nama: "Budi Santoso",
    asal: "Jakarta",
    judul: "Pengalaman Mengatur Belanja Oleh-Oleh",
    kategori: "Belanja",
    pengalaman:
      "Saya membuat daftar oleh-oleh sebelum berangkat. Cara ini sangat membantu agar tidak belanja berlebihan. Selain hemat, koper juga tidak terlalu penuh saat pulang ke Indonesia.",
    tips: "Buat daftar oleh-oleh dari rumah agar belanja lebih terarah.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-10",
    like: 10,
    status: "Publish",
  },
  {
    id: "exp-010",
    nama: "Aisyah Putri",
    asal: "Malang",
    judul: "Cara Tawar Menawar di Pasar Seng Makkah",
    kategori: "Belanja",
    pengalaman:
      "Berbelanja di pasar Seng dekat Masjidil Haram cukup seru karena bisa tawar-menawar langsung dengan pedagang. Awalnya saya canggung, tapi setelah beberapa kali mencoba, saya jadi lebih percaya diri menawar harga oleh-oleh seperti sajadah dan gamis.",
    tips: "Mulai tawar dari setengah harga yang ditawarkan penjual, lalu naik bertahap.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-11",
    like: 16,
    status: "Publish",
  },
  {
    id: "exp-011",
    nama: "Taufik Hidayat",
    asal: "Cirebon",
    judul: "Membeli Kurma dan Air Zamzam untuk Oleh-Oleh Keluarga",
    kategori: "Belanja",
    pengalaman:
      "Saya menyiapkan daftar khusus oleh-oleh kurma dan air zamzam agar tidak lupa membelinya untuk keluarga di kampung. Membeli di toko resmi dekat hotel ternyata lebih aman dan harganya wajar dibanding di area yang terlalu ramai turis.",
    tips: "Beli air zamzam di konter resmi bandara agar tidak repot membawa galon sendiri.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-12",
    like: 7,
    status: "Publish",
  },

  // Kesehatan
  {
    id: "exp-012",
    nama: "Sri Wahyuni",
    asal: "Solo",
    judul: "Menjaga Stamina Saat Cuaca Ekstrem di Tanah Suci",
    kategori: "Kesehatan",
    pengalaman:
      "Cuaca panas menyengat sempat membuat saya lemas di hari kedua. Setelah itu saya lebih disiplin minum air putih tiap jam dan menghindari aktivitas di luar pada siang hari. Kondisi tubuh jadi jauh lebih stabil sepanjang sisa ibadah.",
    tips: "Minum air putih secara teratur meski belum merasa haus, terutama saat cuaca panas.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-09",
    like: 12,
    status: "Publish",
  },
  {
    id: "exp-013",
    nama: "Agus Salim",
    asal: "Tangerang",
    judul: "Tips Mengatasi Kaki Lecet Selama Ibadah",
    kategori: "Kesehatan",
    pengalaman:
      "Karena banyak berjalan kaki, telapak kaki saya sempat lecet parah di hari ketiga. Saya belajar pentingnya memakai kaus kaki katun dan sandal yang benar-benar pas ukurannya, serta membawa plester khusus untuk lecet.",
    tips: "Bawa plester anti-lecet dan kaus kaki cadangan sejak dari rumah.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-10",
    like: 8,
    status: "Publish",
  },
  {
    id: "exp-021",
    nama: "Joko Prasetyo",
    asal: "Purwokerto",
    judul: "Pentingnya Membawa Masker dan Vitamin Selama Ibadah",
    kategori: "Kesehatan",
    pengalaman:
      "Udara kering dan debu membuat saya mudah batuk di beberapa hari pertama. Setelah rutin memakai masker dan minum vitamin C, kondisi badan jauh lebih terjaga sehingga bisa fokus beribadah tanpa terganggu sakit.",
    tips: "Bawa masker cadangan dan multivitamin agar daya tahan tubuh tetap terjaga.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-11",
    like: 13,
    status: "Publish",
  },

  // Transportasi
  {
    id: "exp-009b",
    nama: "Budi Santoso",
    asal: "Medan",
    judul: "Pengalaman Naik Kereta Haramain",
    kategori: "Transportasi",
    pengalaman:
      "Naik kereta cepat Haramain dari Makkah ke Madinah terasa nyaman dan cepat, cocok untuk jamaah lansia.",
    tips: "Pesan tiket lebih awal melalui pembimbing rombongan.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-05",
    like: 9,
    status: "Publish",
  },
  {
    id: "exp-009",
    nama: "Yusuf Maulana",
    asal: "Depok",
    judul: "Serunya Naik Bus Shalawat Gratis Menuju Masjidil Haram",
    kategori: "Transportasi",
    pengalaman:
      "Selama tinggal di Makkah, saya memanfaatkan bus shalawat gratis yang disediakan untuk jamaah menuju Masjidil Haram. Rutenya jelas dan armadanya sering lewat, jadi tidak perlu jalan kaki jauh terutama saat cuaca panas.",
    tips: "Kenali halte bus shalawat terdekat dari hotel dan catat jam operasionalnya.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-09",
    like: 13,
    status: "Publish",
  },
  {
    id: "exp-022",
    nama: "Melati Anggraini",
    asal: "Banjarmasin",
    judul: "Pengalaman Naik Taksi Resmi dari Bandara Jeddah",
    kategori: "Transportasi",
    pengalaman:
      "Sesampainya di Bandara King Abdulaziz Jeddah, kami memilih taksi resmi berlogo yang sudah tertera tarif jelas. Perjalanan menuju Makkah terasa aman dan nyaman meski harus menunggu sekitar 20 menit.",
    tips: "Gunakan taksi resmi berlogo dan pastikan tarif disepakati sebelum berangkat.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-12",
    like: 10,
    status: "Publish",
  },

  // Hotel
  {
    id: "exp-014",
    nama: "Dian Permata",
    asal: "Bekasi",
    judul: "Memilih Hotel Dekat Masjid demi Kemudahan Ibadah",
    kategori: "Hotel",
    pengalaman:
      "Kami sengaja memilih hotel yang hanya berjarak beberapa menit jalan kaki dari Masjidil Haram. Meski harganya sedikit lebih mahal, kemudahan bolak-balik untuk shalat lima waktu membuat semuanya terasa sepadan.",
    tips: "Prioritaskan jarak hotel ke masjid dibanding fasilitas mewah jika anggaran terbatas.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-06",
    like: 19,
    status: "Publish",
  },
  {
    id: "exp-015",
    nama: "Herman Susilo",
    asal: "Denpasar",
    judul: "Pengalaman Menginap di Hotel Bintang 3 yang Nyaman",
    kategori: "Hotel",
    pengalaman:
      "Hotel bintang 3 tempat kami menginap ternyata cukup bersih dan pelayanannya ramah, meski fasilitasnya sederhana. Sarapan yang disediakan juga cukup untuk mengisi energi sebelum beribadah seharian.",
    tips: "Baca ulasan jamaah lain sebelum memesan hotel untuk memastikan kebersihan dan pelayanan.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-07",
    like: 6,
    status: "Publish",
  },
  {
    id: "exp-016",
    nama: "Wulan Sari",
    asal: "Pekanbaru",
    judul: "Tips Request Kamar Hotel untuk Jamaah Lansia",
    kategori: "Hotel",
    pengalaman:
      "Karena membawa ibu yang sudah lansia, saya meminta kamar di lantai bawah atau dekat lift saat check-in. Petugas hotel sangat membantu dan mengakomodasi permintaan tersebut sehingga ibu tidak kelelahan naik turun.",
    tips: "Sampaikan kebutuhan khusus jamaah lansia langsung ke petugas hotel saat check-in.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-08",
    like: 10,
    status: "Publish",
  },

  // Tips Hemat
  {
    id: "exp-017",
    nama: "Bambang Irawan",
    asal: "Semarang",
    judul: "Cara Hemat Biaya Makan Selama di Tanah Suci",
    kategori: "Tips Hemat",
    pengalaman:
      "Alih-alih selalu makan di restoran, saya sesekali membeli bahan makanan sederhana dan masak sendiri menggunakan rice cooker kecil yang saya bawa. Cara ini cukup menghemat pengeluaran harian tanpa mengurangi kenyamanan.",
    tips: "Bawa rice cooker mini dan bahan makanan tahan lama untuk menghemat biaya makan.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-04",
    like: 14,
    status: "Publish",
  },
  {
    id: "exp-018",
    nama: "Indah Puspita",
    asal: "Balikpapan",
    judul: "Trik Membeli Oleh-Oleh Tanpa Bikin Boros",
    kategori: "Tips Hemat",
    pengalaman:
      "Saya membuat anggaran khusus oleh-oleh sejak sebelum berangkat dan berbelanja di toko grosir, bukan toko yang menyasar turis. Hasilnya, pengeluaran oleh-oleh jauh lebih terkontrol dibanding yang saya bayangkan sebelumnya.",
    tips: "Tentukan anggaran oleh-oleh sejak awal dan belanja di toko grosir untuk harga lebih murah.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-06",
    like: 9,
    status: "Publish",
  },
  {
    id: "exp-019",
    nama: "Fajar Nugroho",
    asal: "Batam",
    judul: "Mengatur Budget Harian agar Tidak Kehabisan Uang",
    kategori: "Tips Hemat",
    pengalaman:
      "Saya membagi uang riyal ke dalam amplop harian sesuai jumlah hari perjalanan. Cara sederhana ini membantu saya mengontrol pengeluaran dan menghindari kehabisan uang di hari-hari terakhir.",
    tips: "Bagi uang saku ke amplop harian agar pengeluaran lebih terkontrol dan tidak boros di awal.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-07",
    like: 11,
    status: "Publish",
  },

  // Manasik
  {
    id: "exp-023",
    nama: "Zainal Abidin",
    asal: "Cilegon",
    judul: "Belajar Manasik Praktik Sebelum Berangkat",
    kategori: "Manasik",
    pengalaman:
      "Mengikuti praktik manasik langsung di lapangan sangat membantu saya memahami urutan tawaf, sa'i, dan lontar jumrah. Simulasi ini membuat saya lebih percaya diri saat benar-benar melaksanakannya di Tanah Suci.",
    tips: "Ikuti manasik praktik, jangan hanya teori, agar lebih mudah diingat saat pelaksanaan.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-06-20",
    like: 12,
    status: "Publish",
  },
  {
    id: "exp-024",
    nama: "Halimah Tuzzahra",
    asal: "Cianjur",
    judul: "Pentingnya Ikut Bimbingan Manasik dari KBIH",
    kategori: "Manasik",
    pengalaman:
      "Bimbingan manasik dari KBIH membuat saya lebih siap secara mental dan teknis. Pembimbing menjelaskan detail setiap rukun dan wajib haji dengan sabar, termasuk hal-hal yang sering terlewat oleh jamaah baru.",
    tips: "Catat pertanyaan selama manasik dan tanyakan langsung ke pembimbing sebelum berangkat.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-06-22",
    like: 9,
    status: "Publish",
  },
  {
    id: "exp-025",
    nama: "Firmansyah",
    asal: "Sukabumi",
    judul: "Manasik Mandiri di Rumah Menggunakan Miniatur Ka'bah",
    kategori: "Manasik",
    pengalaman:
      "Selain ikut manasik resmi, saya juga berlatih mandiri di rumah menggunakan miniatur Ka'bah dan panduan video. Latihan tambahan ini membantu saya lebih hafal urutan dan doa di setiap tahapan ibadah.",
    tips: "Gunakan video panduan dan miniatur Ka'bah untuk latihan mandiri di rumah.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-06-23",
    like: 7,
    status: "Publish",
  },

  // Doa
  {
    id: "exp-026",
    nama: "Rahmawati",
    asal: "Kediri",
    judul: "Kekuatan Doa Saat Melintasi Miqat",
    kategori: "Doa",
    pengalaman:
      "Saat melintasi miqat dan mengucapkan niat ihram, saya merasakan getaran yang luar biasa. Saya sempat menangis haru sambil melafalkan talbiyah berulang-ulang sepanjang perjalanan menuju Makkah.",
    tips: "Hafalkan lafal niat dan talbiyah sebelum berangkat agar lebih khusyuk saat di miqat.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-06-24",
    like: 15,
    status: "Publish",
  },
  {
    id: "exp-027",
    nama: "Abdul Karim",
    asal: "Sumedang",
    judul: "Menghafal Doa-Doa Penting Sebelum Berangkat",
    kategori: "Doa",
    pengalaman:
      "Saya mulai menghafal doa-doa penting seperti doa masuk Masjidil Haram dan doa saat melihat Ka'bah sejak dua bulan sebelum berangkat. Persiapan ini membuat ibadah terasa lebih bermakna.",
    tips: "Mulai hafalkan doa-doa penting jauh hari agar tidak bergantung penuh pada buku panduan.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-06-25",
    like: 10,
    status: "Publish",
  },
  {
    id: "exp-028",
    nama: "Yulianti",
    asal: "Kudus",
    judul: "Momen Doa Bersama Rombongan di Bus",
    kategori: "Doa",
    pengalaman:
      "Setiap kali menuju lokasi ibadah, rombongan kami selalu berdoa bersama di dalam bus. Kebiasaan ini mempererat kebersamaan dan membuat hati lebih tenang menghadapi rangkaian ibadah yang padat.",
    tips: "Ajak rombongan berdoa bersama sebelum beraktivitas agar lebih tenang dan kompak.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-06-26",
    like: 8,
    status: "Publish",
  },

  // Kuliner
  {
    id: "exp-029",
    nama: "Hasan Basri",
    asal: "Pati",
    judul: "Mencicipi Nasi Mandhi Khas Timur Tengah",
    kategori: "Kuliner",
    pengalaman:
      "Salah satu pengalaman menarik adalah mencicipi nasi mandhi khas Arab di sekitar penginapan. Rasanya kaya rempah dan porsinya besar, cocok dinikmati bersama rombongan setelah seharian beribadah.",
    tips: "Coba kuliner lokal sesekali, tapi tetap jaga porsi agar pencernaan tidak terganggu.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-06-27",
    like: 11,
    status: "Publish",
  },
  {
    id: "exp-030",
    nama: "Nurul Hidayah",
    asal: "Jepara",
    judul: "Menjaga Pola Makan Sehat Selama di Tanah Suci",
    kategori: "Kuliner",
    pengalaman:
      "Saya berusaha menjaga pola makan dengan memperbanyak sayur dan buah meski banyak godaan makanan berat khas Timur Tengah. Cara ini membantu stamina tetap terjaga sepanjang rangkaian ibadah.",
    tips: "Imbangi makanan berat dengan sayur dan buah agar pencernaan tetap lancar.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-06-28",
    like: 9,
    status: "Publish",
  },
  {
    id: "exp-031",
    nama: "Slamet Riyadi",
    asal: "Rembang",
    judul: "Menemukan Warung Indonesia di Dekat Hotel",
    kategori: "Kuliner",
    pengalaman:
      "Setelah beberapa hari makan menu Timur Tengah, kami menemukan warung makan Indonesia dekat hotel. Rasanya seperti obat rindu kampung halaman, apalagi setelah seharian beribadah yang melelahkan.",
    tips: "Tanyakan ke pembimbing rombongan lokasi warung Indonesia terdekat dari hotel.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-06-29",
    like: 13,
    status: "Publish",
  },

  // Budget
  {
    id: "exp-032",
    nama: "Eko Prasetyo",
    asal: "Klaten",
    judul: "Cara Menghitung Kebutuhan Riyal Selama Perjalanan",
    kategori: "Budget",
    pengalaman:
      "Sebelum berangkat, saya menghitung perkiraan kebutuhan riyal harian untuk makan, oleh-oleh, dan keperluan mendadak. Dengan perhitungan ini, saya tidak perlu menukar uang tambahan secara mendadak di sana.",
    tips: "Hitung kebutuhan riyal harian dan tambahkan dana cadangan sekitar 10-15 persen.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-06-30",
    like: 14,
    status: "Publish",
  },
  {
    id: "exp-033",
    nama: "Marsinah",
    asal: "Boyolali",
    judul: "Pengalaman Menukar Uang di Money Changer Resmi",
    kategori: "Budget",
    pengalaman:
      "Saya menukar sebagian uang di money changer resmi bandara dan sebagian lagi di money changer dekat hotel yang kursnya lebih baik. Selalu simpan bukti penukaran untuk berjaga-jaga.",
    tips: "Bandingkan kurs beberapa money changer resmi sebelum menukar dalam jumlah besar.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-01",
    like: 8,
    status: "Publish",
  },
  {
    id: "exp-034",
    nama: "Wahyudi",
    asal: "Sragen",
    judul: "Menyisihkan Dana Darurat Selama Ibadah",
    kategori: "Budget",
    pengalaman:
      "Saya selalu menyisihkan sebagian uang sebagai dana darurat yang disimpan terpisah dari uang harian. Ternyata dana ini sangat membantu ketika ada kebutuhan mendadak seperti membeli obat.",
    tips: "Simpan dana darurat terpisah dari dompet harian, misalnya di tas dokumen.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-02",
    like: 10,
    status: "Publish",
  },

  // Adab
  {
    id: "exp-035",
    nama: "Suryati",
    asal: "Ponorogo",
    judul: "Belajar Adab Menghormati Sesama Jamaah",
    kategori: "Adab",
    pengalaman:
      "Berada di tengah jutaan jamaah dari berbagai negara mengajarkan saya untuk lebih menghargai perbedaan. Meski terkadang berdesakan, saling memaafkan dan bersabar membuat suasana ibadah tetap terasa damai.",
    tips: "Selalu utamakan sikap sabar dan saling memaafkan saat berdesakan dengan jamaah lain.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-03",
    like: 12,
    status: "Publish",
  },
  {
    id: "exp-036",
    nama: "Bagus Setiawan",
    asal: "Madiun",
    judul: "Menjaga Sikap Saat Berdesakan di Masjidil Haram",
    kategori: "Adab",
    pengalaman:
      "Saat tawaf di waktu ramai, saya belajar untuk tetap tenang dan tidak terpancing emosi meski sering terdorong. Menjaga sikap ini penting agar ibadah tetap khusyuk dan tidak menyakiti jamaah lain.",
    tips: "Tetap tenang dan hindari mendorong balik saat berdesakan agar tidak melukai jamaah lain.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-04",
    like: 9,
    status: "Publish",
  },
  {
    id: "exp-037",
    nama: "Kartini Dewi",
    asal: "Ngawi",
    judul: "Adab Bertanya kepada Petugas dan Pembimbing",
    kategori: "Adab",
    pengalaman:
      "Saya belajar untuk bertanya dengan sopan dan tidak memaksa saat meminta bantuan petugas atau pembimbing yang sedang sibuk melayani banyak jamaah lain. Sikap ini membuat komunikasi menjadi lebih lancar.",
    tips: "Bertanya dengan sopan dan bersabar menunggu giliran saat petugas sedang melayani jamaah lain.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-05",
    like: 7,
    status: "Publish",
  },

  // Ziarah
  {
    id: "exp-038",
    nama: "Anisa Rahmawati",
    asal: "Blitar",
    judul: "Ziarah ke Jabal Uhud dan Kisah Perjuangan Sahabat",
    kategori: "Ziarah",
    pengalaman:
      "Mengunjungi Jabal Uhud dan mendengar kisah perjuangan para sahabat di sana membuat saya semakin memahami sejarah perjuangan Islam. Suasana yang tenang membuat momen ziarah terasa sangat mengharukan.",
    tips: "Dengarkan penjelasan pembimbing dengan saksama agar lebih memahami sejarah di setiap lokasi ziarah.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-06",
    like: 16,
    status: "Publish",
  },
  {
    id: "exp-039",
    nama: "Rudi Hartono",
    asal: "Tulungagung",
    judul: "Mengunjungi Masjid Quba Saat Ziarah di Madinah",
    kategori: "Ziarah",
    pengalaman:
      "Shalat sunnah di Masjid Quba menjadi salah satu momen favorit saya selama ziarah di Madinah. Suasananya lebih tenang dibanding Masjid Nabawi, cocok untuk berdoa dengan lebih khusyuk.",
    tips: "Sempatkan shalat sunnah dua rakaat saat berkunjung ke Masjid Quba sesuai anjuran.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-07",
    like: 11,
    status: "Publish",
  },
  {
    id: "exp-040",
    nama: "Puji Lestari",
    asal: "Trenggalek",
    judul: "Pengalaman Ziarah ke Gua Hira",
    kategori: "Ziarah",
    pengalaman:
      "Melihat langsung Gua Hira tempat turunnya wahyu pertama membuat saya semakin menghargai perjuangan Rasulullah dalam berdakwah. Meski harus mendaki cukup jauh, rasa lelah terbayar dengan ketenangan hati.",
    tips: "Gunakan alas kaki yang nyaman dan bawa air minum jika ingin mendaki ke area Gua Hira.",
    foto: "assets/images/article-placeholder.svg",
    tanggal: "2026-07-08",
    like: 10,
    status: "Publish",
  },
];

const isConfigured = () => HC_CONFIG.appsScriptUrl.startsWith("https://");

// Parse response sebagai JSON dengan aman. Jika Apps Script mengembalikan
// HTML (mis. URL salah, deployment lama belum di-update, atau butuh login
// Google), fetch tetap "berhasil" (HTTP 200) tapi body-nya bukan JSON.
// Tanpa ini, error jadi tidak jelas ("Unexpected token <") atau malah
// membuat alur login/CRUD berhenti diam-diam.
const parseJsonSafely = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Respon bukan JSON dari Apps Script:", text.slice(0, 300));
    throw new Error(
      'Respon dari Apps Script tidak valid. Pastikan URL adalah link .../exec dari deployment TERBARU, dan akses deployment diset ke "Anyone".',
    );
  }
};

const requestJson = async (params = {}, options = {}) => {
  if (!isConfigured()) throw new Error("Apps Script URL belum dikonfigurasi.");
  const url = new URL(HC_CONFIG.appsScriptUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  });
  // cache: "no-store" -- jangan biarkan browser menyimpan/menyajikan ulang
  // response GET ini dari cache, supaya data yang berubah di server (mis.
  // status/waktu tracking petugas) selalu ke-fetch fresh.
  // signal: AbortSignal.timeout(...) -- tanpa ini, request yang menggantung
  // di jaringan seluler lambat/tidak stabil (jauh lebih sering terjadi di
  // HP dibanding WiFi/kabel laptop) tidak akan pernah gagal ataupun
  // berhasil, sehingga pemanggil (mis. widget peta rute Badal Umroh di
  // akun.html) juga ikut menggantung tanpa pernah menampilkan status
  // apa pun ke pengguna.
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    ...options,
  });
  if (!response.ok) throw new Error(`Request gagal: ${response.status}`);
  return parseJsonSafely(response);
};

// Khusus request yang membawa password admin: dikirim lewat POST body,
// bukan query string GET, supaya tidak ikut nampang di URL (riwayat
// browser, log server, dsb).
const requestJsonPost = async (payload = {}) => {
  if (!isConfigured()) throw new Error("Apps Script URL belum dikonfigurasi.");
  const response = await fetch(HC_CONFIG.appsScriptUrl, {
    method: "POST",
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Request gagal: ${response.status}`);
  return parseJsonSafely(response);
};

const onlyPublished = (items) =>
  (items || []).filter(
    (item) =>
      String(item.status || "")
        .trim()
        .toLowerCase() === "publish",
  );

// Angka semu yang stabil (bukan acak ulang tiap load) dipakai sebagai
// fallback "views" selama sheet Artikel di Google Sheets belum punya
// kolom "views" (lihat migrateArtikelColumns di Code.gs), supaya urutan
// "Artikel Populer" tetap masuk akal alih-alih selalu 0.
const seededViews = (key = "") => {
  let hash = 0;
  const text = String(key);
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return 80 + (hash % 920);
};

// Pastikan setiap artikel selalu punya "views" (dipakai untuk Artikel
// Populer), baik datanya dari Apps Script maupun dari fallbackArticles.
const normalizeArticle = (article) => {
  if (!article) return article;
  const rawViews = Number(article.views);
  const views =
    Number.isFinite(rawViews) && rawViews >= 0
      ? rawViews
      : seededViews(article.slug || article.id || article.judul);
  return { ...article, views };
};

// Admin bisa menempel link YouTube dalam format apa saja (watch?v=, youtu.be,
// shorts, atau embed langsung). Ubah semuanya ke format /embed/VIDEO_ID yang
// valid untuk iframe, supaya video tetap tampil walau admin tidak menempel
// link versi "embed".
const toYoutubeEmbed = (rawUrl) => {
  const url = String(rawUrl || "").trim();
  if (!url) return "";
  if (/youtube\.com\/embed\//.test(url)) return url.split(/[?&]/)[0];
  const patterns = [
    /youtu\.be\/([\w-]{6,})/,
    /youtube\.com\/watch\?v=([\w-]{6,})/,
    /youtube\.com\/shorts\/([\w-]{6,})/,
    /m\.youtube\.com\/watch\?v=([\w-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};

// TikTok cuma bisa di-embed lewat iframe kalau link-nya sudah berupa link
// "penuh" yang mengandung ID video (mis. tiktok.com/@akun/video/123...).
// Link pendek (vm.tiktok.com/xxxx) tidak bisa diubah jadi ID di browser
// tanpa memanggil server TikTok, jadi kalau polanya tidak cocok kita
// biarkan kosong supaya UI menampilkan tombol "Buka di TikTok" sebagai
// fallback, bukan iframe kosong/rusak.
const toTiktokEmbed = (rawUrl) => {
  const url = String(rawUrl || "").trim();
  if (!url) return "";
  if (/tiktok\.com\/embed\//.test(url)) return url.split(/[?&]/)[0];
  const match = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (match) return `https://www.tiktok.com/embed/v2/${match[1]}`;
  return "";
};

// Instagram Reel/Post bisa di-embed langsung lewat URL permalink + "/embed"
// tanpa perlu script widget tambahan. Juga tangani pola stories dan guide.
const toInstagramEmbed = (rawUrl) => {
  const url = String(rawUrl || "").trim();
  if (!url) return "";
  // Handle berbagai format URL Instagram
  const patterns = [
    /instagram\.com\/(reel|reels|p|tv)\/([\w-]+)/,
    /instagram\.com\/stories\/([\w-]+)\/([\w-]+)/,
    /instagram\.com\/guide\/([\w-]+)\/([\w-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      // reels -> reel, sisanya langsung
      const type = match[1] === "reels" ? "reel" : match[1];
      const id = match[2] || match[1];
      // Coba embed dulu; kalau /embed/ tidak dipakai Instagram untuk
      // stories/guide, setidaknya sourceUrl untuk fallback tombol "Buka".
      return `https://www.instagram.com/${type}/${id}/embed`;
    }
  }
  // Kalau sudah berupa embed URL, biarkan apa adanya
  if (/instagram\.com\/\w+\/[\w-]+\/embed/.test(url))
    return url.split(/[?&]/)[0];
  return "";
};

// Ubah link mentah dari kolom "youtube" (dipakai untuk semua platform) jadi
// URL embed yang benar berdasarkan kolom "platform" pilihan admin.
const resolveVideoEmbed = (platform, rawUrl) => {
  const key = String(platform || "YouTube")
    .trim()
    .toLowerCase();
  if (key === "tiktok") return { url: toTiktokEmbed(rawUrl), kind: "tiktok" };
  if (key === "instagram")
    return { url: toInstagramEmbed(rawUrl), kind: "instagram" };
  return { url: toYoutubeEmbed(rawUrl), kind: "youtube" };
};

// Thumbnail YouTube bisa langsung ditebak dari ID video (tidak perlu
// panggilan API tambahan), jadi kartu pratinjau Short bisa langsung
// menampilkan gambar videonya, bukan iframe halaman YouTube.
const toYoutubeThumbnail = (embedUrl) => {
  const match = String(embedUrl || "").match(/\/embed\/([\w-]+)/);
  return match ? `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg` : "";
};

// Satukan data Video/Short dari sheet (atau data fallback) jadi bentuk yang
// konsisten dipakai oleh video.html, index.html (preview), dan halaman lain:
// { kategori, judul, tipe, platform, sourceUrl, embedUrl, embedKind, thumbnailUrl }
const normalizeVideo = (row) => {
  const tipe =
    String(row.tipe || "")
      .trim()
      .toLowerCase() === "short"
      ? "Short"
      : "Video";
  const platform = String(row.platform || "YouTube").trim();
  const embed = resolveVideoEmbed(platform, row.youtube);
  const thumbnailUrl =
    embed.kind === "youtube" ? toYoutubeThumbnail(embed.url) : "";
  return {
    kategori: row.kategori || "",
    judul: row.judul || "",
    tipe,
    platform,
    sourceUrl: row.youtube || "",
    embedUrl: embed.url,
    embedKind: embed.kind,
    thumbnailUrl,
  };
};

// TikTok tidak punya cara menebak thumbnail dari ID saja, tapi endpoint
// oEmbed publiknya (dipakai TikTok sendiri untuk widget "embed post") bisa
// diakses dari browser dan mengembalikan thumbnail_url. Hasilnya di-cache
// per sesi tab supaya kartu yang sama tidak memanggil ulang setiap kali
// halaman dibuka. Kalau gagal (offline, endpoint berubah, dll), kartu Short
// tetap tampil rapi lewat fallback ikon platform di sisi tampilan.
const tiktokThumbCache = new Map();
const getTiktokThumbnail = async (sourceUrl) => {
  if (!sourceUrl) return "";
  if (tiktokThumbCache.has(sourceUrl)) return tiktokThumbCache.get(sourceUrl);
  const sessionKey = `hc-tiktok-thumb:${sourceUrl}`;
  try {
    const cached = sessionStorage.getItem(sessionKey);
    if (cached !== null) {
      tiktokThumbCache.set(sourceUrl, cached);
      return cached;
    }
  } catch (error) {
    // sessionStorage tidak tersedia (mis. mode privat) -> lanjut tanpa cache
  }
  // Coba langsung dulu dari browser. Kalau gagal karena CORS/network,
  // fallback lewat proxy Apps Script server-to-server.
  let thumbnail = "";
  try {
    const response = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(sourceUrl)}`,
    );
    if (response.ok) {
      const data = await response.json();
      thumbnail = data.thumbnail_url || "";
    }
  } catch (error) {
    // CORS error atau network error — lanjut ke proxy
  }
  if (!thumbnail) {
    const proxyData = await fetchOembedViaProxy("tiktok", sourceUrl);
    thumbnail = (proxyData && proxyData.thumbnail_url) || "";
  }
  tiktokThumbCache.set(sourceUrl, thumbnail);
  try {
    sessionStorage.setItem(sessionKey, thumbnail);
  } catch (error) {
    // abaikan kalau storage penuh/terkunci
  }
  return thumbnail;
};

// Panggil oEmbed lewat server Apps Script (proxy) untuk platform yang
// memblokir CORS dari browser (Instagram, kadang TikTok).
const fetchOembedViaProxy = async (platform, sourceUrl) => {
  if (!isConfigured()) return null;
  try {
    const response = await fetch(HC_CONFIG.appsScriptUrl, {
      method: "POST",
      body: JSON.stringify({
        action: "oembed_proxy",
        platform,
        url: sourceUrl,
      }),
    });
    if (!response.ok)
      throw new Error("Proxy oEmbed gagal: HTTP " + response.status);
    const result = await parseJsonSafely(response);
    if (!result.success)
      throw new Error(result.message || "Proxy oEmbed gagal");
    return result.data || null;
  } catch (error) {
    console.info("Proxy oEmbed tidak tersedia:", error.message);
    return null;
  }
};

// Instagram Reels/Post juga mendukung oEmbed publik tanpa autentikasi,
// endpoint resmi dari platform Instagram bisa mengembalikan thumbnail_url
// untuk public post. Hasilnya di-cache per sesi tab seperti TikTok.
const instagramThumbCache = new Map();
const getInstagramThumbnail = async (sourceUrl) => {
  if (!sourceUrl) return "";
  if (instagramThumbCache.has(sourceUrl))
    return instagramThumbCache.get(sourceUrl);
  const sessionKey = `hc-ig-thumb:${sourceUrl}`;
  try {
    const cached = sessionStorage.getItem(sessionKey);
    if (cached !== null) {
      instagramThumbCache.set(sourceUrl, cached);
      return cached;
    }
  } catch (error) {
    // sessionStorage tidak tersedia (mis. mode privat) -> lanjut tanpa cache
  }
  // Coba langsung dulu dari browser (mungkin lolos CORS di beberapa kondisi).
  // Kalau gagal, fallback lewat proxy Apps Script server-to-server.
  // Fallback terakhir: public CORS proxy untuk oEmbed.
  let thumbnail = "";
  try {
    const response = await fetch(
      `https://www.instagram.com/oembed?url=${encodeURIComponent(sourceUrl)}`,
    );
    if (response.ok) {
      const data = await response.json();
      thumbnail = data.thumbnail_url || "";
    }
  } catch (error) {
    // CORS error atau network error — lanjut ke proxy
  }
  if (!thumbnail) {
    const proxyData = await fetchOembedViaProxy("instagram", sourceUrl);
    thumbnail = (proxyData && proxyData.thumbnail_url) || "";
  }
  // Fallback terakhir: coba lewat public CORS proxy (api.allorigins.win)
  // untuk ambil thumbnail dari halaman Instagram via meta og:image.
  if (!thumbnail) {
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(sourceUrl)}`;
      const response = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const html = await response.text();
        // Cari og:image atau instagram:image di meta tags
        const ogMatch = html.match(
          /<meta\s+property="og:image"[^>]*content="([^"]+)"/i,
        );
        if (ogMatch) thumbnail = ogMatch[1];
      }
    } catch (error) {
      // gagal semua fallback — biarkan thumbnail kosong, UI akan pakai fallback ikon platform
    }
  }
  instagramThumbCache.set(sourceUrl, thumbnail);
  try {
    sessionStorage.setItem(sessionKey, thumbnail);
  } catch (error) {
    // abaikan kalau storage penuh/terkunci
  }
  return thumbnail;
};

const normalizeTataCaraStep = (step) => {
  if (!step || (step.waktu && step.doa_dzikir && step.catatan)) return step;
  const raw = String(step.deskripsi || "");
  const doaMatch = raw.match(/\s*Doa\/dzikir:\s*/i);
  const waktuMatch = raw.match(/\s*Waktu:\s*/i);
  const catatanMatch = raw.match(/\s*Catatan:\s*/i);
  if (!doaMatch && !waktuMatch && !catatanMatch) return step;
  const positions = [
    doaMatch && {
      key: "doa_dzikir",
      index: doaMatch.index,
      length: doaMatch[0].length,
    },
    waktuMatch && {
      key: "waktu",
      index: waktuMatch.index,
      length: waktuMatch[0].length,
    },
    catatanMatch && {
      key: "catatan",
      index: catatanMatch.index,
      length: catatanMatch[0].length,
    },
  ]
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);
  const next = {
    ...step,
    deskripsi: raw.slice(0, positions[0]?.index ?? raw.length).trim(),
  };
  positions.forEach((part, index) => {
    const end = positions[index + 1]?.index ?? raw.length;
    next[part.key] = raw.slice(part.index + part.length, end).trim();
  });
  return next;
};

const HCApi = {
  async getArticles() {
    try {
      const data = await requestJson({ action: "artikel" });
      return onlyPublished(data.data || data).map(normalizeArticle);
    } catch (error) {
      console.info(error.message);
      return fallbackArticles.map(normalizeArticle);
    }
  },
  async getArticle(slug) {
    try {
      const data = await requestJson({ action: "detail", slug });
      const article = data.data || data;
      return article.status === "Publish" ? normalizeArticle(article) : null;
    } catch (error) {
      console.info(error.message);
      return normalizeArticle(
        fallbackArticles.find((item) => item.slug === slug) ||
          fallbackArticles[0],
      );
    }
  },
  // Tambah 1 hitungan baca untuk artikel. Dipanggil dari halaman detail,
  // dibatasi 1x per slug per sesi tab lewat sessionStorage di article.js
  // supaya angka populer tidak digelembungkan oleh refresh berulang.
  async viewArticle(slug) {
    if (!slug) return { views: null };
    if (!isConfigured()) return { views: null };
    try {
      const response = await fetch(HC_CONFIG.appsScriptUrl, {
        method: "POST",
        body: JSON.stringify({ action: "view_artikel", slug }),
      });
      if (!response.ok) return { views: null };
      const result = await parseJsonSafely(response);
      return { views: result.views ?? null };
    } catch (error) {
      console.info(error.message);
      return { views: null };
    }
  },
  async getCategories() {
    try {
      const data = await requestJson({ action: "kategori" });
      return data.data || data;
    } catch (error) {
      console.info(error.message);
      return fallbackCategories;
    }
  },
  async getExperiences() {
    try {
      const data = await requestJson({ action: "pengalaman" });
      return onlyPublished(data.data || data);
    } catch (error) {
      console.info(error.message);
      return fallbackExperiences;
    }
  },
  async postExperience(payload) {
    if (!isConfigured()) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: true,
        message: "Mode demo: pengalaman tersimpan sebagai simulasi.",
      };
    }
    const response = await fetch(HC_CONFIG.appsScriptUrl, {
      method: "POST",
      body: JSON.stringify({ action: "pengalaman", ...payload }),
    });
    if (!response.ok) throw new Error("Gagal mengirim pengalaman.");
    return parseJsonSafely(response);
  },
  async likeExperience(id) {
    if (!id) throw new Error("ID pengalaman tidak valid.");
    if (!isConfigured()) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return {
        success: true,
        like: null,
        message: "Mode demo: like tersimpan di perangkat ini.",
      };
    }
    const response = await fetch(HC_CONFIG.appsScriptUrl, {
      method: "POST",
      body: JSON.stringify({ action: "like_pengalaman", id }),
    });
    if (!response.ok) throw new Error("Gagal menyukai pengalaman.");
    const result = await parseJsonSafely(response);
    if (!result.success)
      throw new Error(result.message || "Gagal menyukai pengalaman.");
    return result;
  },
  async unlikeExperience(id) {
    if (!id) throw new Error("ID pengalaman tidak valid.");
    if (!isConfigured()) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return {
        success: true,
        like: null,
        message: "Mode demo: like dibatalkan di perangkat ini.",
      };
    }
    const response = await fetch(HC_CONFIG.appsScriptUrl, {
      method: "POST",
      body: JSON.stringify({ action: "unlike_pengalaman", id }),
    });
    if (!response.ok) throw new Error("Gagal membatalkan like pengalaman.");
    const result = await parseJsonSafely(response);
    if (!result.success)
      throw new Error(result.message || "Gagal membatalkan like pengalaman.");
    return result;
  },
  async getTerms() {
    const fallbackTerms = (window.HCContent?.terms || []).map((term) =>
      Array.isArray(term)
        ? {
            slug: term[0],
            title: term[1],
            summary: term[2],
            category: term[3],
          }
        : term,
    );
    try {
      const data = await requestJson({ action: "istilah" });
      const rows = onlyPublished(data.data || data);
      return rows.length
        ? rows.map((row) => ({
            slug: row.slug,
            title: row.judul,
            summary: row.ringkasan,
            isi: row.isi,
            category: row.kategori,
            source: row.sumber_referensi,
          }))
        : fallbackTerms;
    } catch (error) {
      console.info(error.message);
      return fallbackTerms;
    }
  },
  async getLayanan(halaman) {
    const fallback = window.HCLayanan && window.HCLayanan[halaman];
    try {
      const data = await requestJson({ action: "layanan", halaman });
      const rows = onlyPublished(data.data || data);
      const row = rows.find((item) => item.halaman === halaman);
      return row
        ? {
            halaman: row.halaman,
            eyebrow: row.eyebrow,
            judul: row.judul,
            ringkasan: row.ringkasan,
            isi: row.isi,
            source: row.sumber_referensi,
          }
        : fallback;
    } catch (error) {
      console.info(error.message);
      return fallback;
    }
  },
  async getFAQ() {
    try {
      const data = await requestJson({ action: "faq" });
      const rows = onlyPublished(data.data || data);
      return rows.length
        ? rows.map((row) => ({
            id: row.id,
            category: row.kategori,
            question: row.pertanyaan,
            answer: row.jawaban,
          }))
        : window.HCFAQ;
    } catch (error) {
      console.info(error.message);
      return window.HCFAQ;
    }
  },
  async getPeta(kategori) {
    try {
      const data = await requestJson({ action: "peta", kategori });
      const rows = onlyPublished(data.data || data);
      return rows;
    } catch (error) {
      console.info(error.message);
      return null;
    }
  },
  async getDownloads() {
    const fallback = window.HCContent.downloads;
    try {
      const data = await requestJson({ action: "download" });
      const rows = onlyPublished(data.data || data);
      return rows.length
        ? rows.map((row) => ({
            judul: row.judul,
            deskripsi: row.deskripsi || "",
            kategori: row.kategori || "",
            file: row.file || "",
            gambar: row.gambar || "",
          }))
        : fallback;
    } catch (error) {
      console.info(error.message);
      return fallback;
    }
  },
  async getVideos() {
    try {
      const data = await requestJson({ action: "video" });
      const rows = onlyPublished(data.data || data);
      return rows.length
        ? rows.map(normalizeVideo)
        : window.HCContent.videos.map(normalizeVideo);
    } catch (error) {
      console.info(error.message);
      return window.HCContent.videos.map(normalizeVideo);
    }
  },
  // Ambil URL thumbnail terbaik untuk sebuah item video/Short tanpa perlu
  // memuat iframe: YouTube langsung dari pola URL, TikTok lewat oEmbed
  // (async, boleh gagal), Instagram juga lewat oEmbed publiknya.
  // Kalau gagal/gak tersedia, tampilan akan pakai fallback ikon platform.
  async getShortThumbnail(item) {
    if (!item) return "";
    if (item.thumbnailUrl) return item.thumbnailUrl;
    if (item.embedKind === "tiktok") return getTiktokThumbnail(item.sourceUrl);
    if (item.embedKind === "instagram")
      return getInstagramThumbnail(item.sourceUrl);
    return "";
  },
  async getPersiapan() {
    try {
      const data = await requestJson({ action: "persiapan" });
      const rows = onlyPublished(data.data || data);
      if (!rows.length) return window.HCContent.prep;
      return rows.reduce((acc, row) => {
        acc[row.kategori] = acc[row.kategori] || [];
        acc[row.kategori].push(row.item);
        return acc;
      }, {});
    } catch (error) {
      console.info(error.message);
      return window.HCContent.prep;
    }
  },
  async getPersiapanTimeline() {
    try {
      const data = await requestJson({ action: "persiapantimeline" });
      const rows = onlyPublished(data.data || data);
      return rows.length
        ? rows.map((row) => [row.waktu, row.deskripsi])
        : window.HCContent.prepTimeline;
    } catch (error) {
      console.info(error.message);
      return window.HCContent.prepTimeline;
    }
  },
  async getTataCara(jenis) {
    const fallback = {
      Haji: [
        {
          urutan: 1,
          judul: "Ihram dan Niat",
          deskripsi:
            "Berihram dari miqat sesuai rute, mandi sunnah bila memungkinkan, memakai pakaian ihram, membaca niat haji, lalu memperbanyak talbiyah. Doa/dzikir: talbiyah sejak niat sampai menjelang melempar Jumrah Aqabah. Waktu: siapkan 30-60 menit untuk berpakaian, niat, dan koordinasi rombongan. Catatan: jaga larangan ihram.",
        },
        {
          urutan: 2,
          judul: "Wukuf di Arafah",
          deskripsi:
            "Hadir di Arafah pada 9 Dzulhijjah, mengikuti arahan pembimbing, lalu memperbanyak doa, istighfar, dzikir, dan muhasabah. Doa/dzikir: laa ilaaha illallaahu wahdahu laa syariika lah dan doa pribadi. Waktu: sejak tergelincir matahari hingga matahari terbenam. Catatan: gunakan waktu dengan tenang dan hemat tenaga.",
        },
        {
          urutan: 3,
          judul: "Mabit di Muzdalifah",
          deskripsi:
            "Berangkat dari Arafah menuju Muzdalifah setelah maghrib sesuai arahan petugas, bermalam atau tinggal beberapa waktu, dan menyiapkan kerikil untuk jumrah. Doa/dzikir: talbiyah, takbir, dan istighfar. Waktu: malam 10 Dzulhijjah sampai menjelang subuh atau sesuai jadwal resmi. Catatan: ikuti arus rombongan.",
        },
        {
          urutan: 4,
          judul: "Melontar Jumrah Aqabah",
          deskripsi:
            "Melontar Jumrah Aqabah dengan tujuh kerikil pada 10 Dzulhijjah. Doa/dzikir: ucapkan Allahu akbar pada setiap lemparan; setelah jumrah ini talbiyah dihentikan dan diganti takbir. Waktu: 30-120 menit tergantung kepadatan dan jadwal maktab. Catatan: utamakan keselamatan dan ikuti jalur petugas.",
        },
        {
          urutan: 5,
          judul: "Tahallul Awal",
          deskripsi:
            "Mencukur atau memendekkan rambut setelah melontar Jumrah Aqabah. Doa/dzikir: baca hamdalah dan mohon agar ibadah diterima. Waktu: 5-20 menit, bisa lebih lama bila antre layanan cukur. Catatan: setelah tahallul awal sebagian larangan ihram berakhir, tetapi belum semuanya.",
        },
        {
          urutan: 6,
          judul: "Tawaf Ifadah dan Sa'i",
          deskripsi:
            "Melakukan Tawaf Ifadah tujuh putaran di Ka'bah, lalu sa'i antara Safa dan Marwah tujuh kali bila belum sa'i haji. Doa/dzikir: perbanyak dzikir, doa pribadi, dan rabbanaa aatinaa fid-dunyaa hasanah antara Rukun Yamani-Hajar Aswad. Waktu: tawaf 45-120 menit dan sa'i 60-120 menit. Catatan: ini rukun haji.",
        },
        {
          urutan: 7,
          judul: "Mabit di Mina",
          deskripsi:
            "Bermalam di Mina pada hari-hari Tasyrik sambil menjaga stamina dan mengikuti jadwal rombongan. Doa/dzikir: takbir, tahlil, tahmid, dan doa pribadi. Waktu: malam 11-12 Dzulhijjah untuk Nafar Awal atau sampai 13 Dzulhijjah untuk Nafar Tsani. Catatan: patuhi pengaturan tenda.",
        },
        {
          urutan: 8,
          judul: "Melontar Tiga Jumrah",
          deskripsi:
            "Melontar Jumrah Ula, Wusta, dan Aqabah masing-masing tujuh lemparan pada hari Tasyrik. Doa/dzikir: Allahu akbar setiap lemparan; setelah Jumrah Ula dan Wusta dianjurkan berdoa di tempat aman. Waktu: 30-120 menit atau lebih sesuai kepadatan. Catatan: lakukan berurutan dan ikuti jalur satu arah.",
        },
        {
          urutan: 9,
          judul: "Tawaf Wada",
          deskripsi:
            "Melakukan tawaf perpisahan sebelum meninggalkan Makkah. Doa/dzikir: syukur, istighfar, doa agar ibadah diterima dan diberi kesempatan kembali. Waktu: 45-150 menit bergantung kepadatan dan jadwal kepulangan. Catatan: setelah Tawaf Wada sebaiknya tidak lagi belanja atau kunjungan yang tidak perlu.",
        },
      ],
      // Selaras dengan baris jenis="Umrah" (tc-029..tc-033) di tabel TataCara
      // pada database, dan dengan konten statis fallback di
      // tata-cara-umrah.html, supaya offline/API-gagal tidak menampilkan
      // rangkaian yang berbeda dari versi live.
      Umrah: [
        {
          urutan: 0,
          judul: "__intro__",
          deskripsi:
            "Berbeda dengan haji yang hanya sah pada bulan-bulan tertentu, umrah dapat dilaksanakan kapan saja. Rangkaiannya lebih singkat — cukup ihram, tawaf, sa'i, dan tahallul — sehingga umumnya dapat diselesaikan dalam beberapa jam.",
          waktu: "Kapan saja",
          catatan: "Lokasi: Masjidil Haram\nEstimasi Durasi: 2\u20135 jam",
        },
        {
          urutan: 1,
          judul: "\u2605 1. Ihram & Niat Umrah",
          deskripsi:
            "Mengenakan pakaian ihram dan berniat umrah saat melewati miqat, lalu memperbanyak bacaan talbiyah. Larangan ihram mulai berlaku sejak saat ini.",
          waktu: "Miqat",
          doa_dzikir:
            "Niat Umrah\n\u0646\u064E\u0648\u064E\u064A\u0652\u062A\u064F \u0627\u0644\u0652\u0639\u064F\u0645\u0652\u0631\u064E\u0629\u064E \u0648\u064E\u0623\u064E\u062D\u0652\u0631\u064E\u0645\u0652\u062A\u064F \u0628\u0650\u0647\u064E\u0627 \u0644\u0650\u0644\u0651\u0647\u0650 \u062A\u064E\u0639\u064E\u0627\u0644\u0649\n\"Nawaitul 'umrata wa a\u1e25ramtu bih\u0101 lill\u0101hi ta'\u0101l\u0101.\" (atau cukup: \"Labbaika 'umratan.\")\nArtinya: \"Aku berniat umrah dan berihram karenanya karena Allah Ta'ala.\"\n\nBacaan Talbiyah\n\u0644\u064E\u0628\u0651\u064E\u064A\u0652\u0643\u064E \u0627\u0644\u0644\u0651\u0647\u064F\u0645\u0651\u064E \u0644\u064E\u0628\u0651\u064E\u064A\u0652\u0643\u064E\u060C \u0644\u064E\u0628\u0651\u064E\u064A\u0652\u0643\u064E \u0644\u064E\u0627 \u0634\u064E\u0631\u0650\u064A\u0643\u064E \u0644\u064E\u0643\u064E \u0644\u064E\u0628\u0651\u064E\u064A\u0652\u0643\u064E\u060C \u0625\u0650\u0646\u0651\u064E \u0627\u0644\u0652\u062D\u064E\u0645\u0652\u062F\u064E \u0648\u064E\u0627\u0644\u0646\u0651\u0650\u0639\u0652\u0645\u064E\u0629\u064E \u0644\u064E\u0643\u064E \u0648\u064E\u0627\u0644\u0652\u0645\u064F\u0644\u0652\u0643\u064E\u060C \u0644\u064E\u0627 \u0634\u064E\u0631\u0650\u064A\u0643\u064E \u0644\u064E\u0643\u064E\nLabbaik\u0101ll\u0101humma labbaik. Labbaika l\u0101 syar\u012bka laka labbaik. Innal-\u1e25amda wan-ni'mata laka wal-mulk. L\u0101 syar\u012bka lak.\nArtinya: \"Aku memenuhi panggilan-Mu ya Allah, aku memenuhi panggilan-Mu. Aku memenuhi panggilan-Mu, tiada sekutu bagi-Mu. Sesungguhnya segala puji, nikmat, dan kerajaan adalah milik-Mu. Tiada sekutu bagi-Mu.\"",
        },
        {
          urutan: 2,
          judul: "2. Tawaf",
          deskripsi:
            "Mengelilingi Ka'bah sebanyak tujuh putaran, dimulai dan diakhiri sejajar Hajar Aswad, dilanjutkan salat sunnah di dekat Maqam Ibrahim bila memungkinkan.",
          waktu: "Masjidil Haram",
          catatan: "\u2192 Lihat Doa Tawaf: doa.html#tawaf",
        },
        {
          urutan: 3,
          judul: "3. Sa'i",
          deskripsi:
            "Berjalan atau berlari kecil antara Bukit Shafa dan Marwah sebanyak tujuh kali perjalanan.",
          waktu: "Shafa\u2013Marwah",
          catatan: "\u2192 Lihat Doa Sa'i: doa.html#sa'i",
        },
        {
          urutan: 4,
          judul: "\u2605 4. Tahallul",
          deskripsi:
            "Mencukur atau memotong sebagian rambut sebagai tanda berakhirnya ibadah umrah. Setelah tahallul, seluruh larangan ihram berakhir.",
          waktu: "Penutup",
          catatan:
            "Umrah juga menjadi bagian dari rangkaian Haji Tamattu' (sebelum berihram haji) dan dapat ditambahkan secara opsional oleh jamaah Haji Ifrad setelah rangkaian haji selesai.",
        },
      ],
    };
    try {
      const data = await requestJson({ action: "tatacara", jenis });
      const rows = onlyPublished(data.data || data).sort(
        (a, b) => Number(a.urutan) - Number(b.urutan),
      );
      return rows.length
        ? rows.map(normalizeTataCaraStep)
        : (fallback[jenis] || []).map(normalizeTataCaraStep);
    } catch (error) {
      console.info(error.message);
      return (fallback[jenis] || []).map(normalizeTataCaraStep);
    }
  },

  // === Admin Panel: login, generic CRUD, upload gambar ===
  isConfigured,
  async adminLogin(token) {
    if (!isConfigured())
      throw new Error(
        "URL Apps Script belum diisi atau tidak diawali https://.",
      );
    let response;
    try {
      response = await fetch(HC_CONFIG.appsScriptUrl, {
        method: "POST",
        body: JSON.stringify({ action: "user_me", token }),
      });
    } catch (error) {
      throw new Error(
        "Tidak bisa menghubungi Apps Script. Periksa koneksi internet dan URL.",
      );
    }
    if (!response.ok) throw new Error(`Request gagal: ${response.status}`);
    const result = await parseJsonSafely(response);
    if (!result.success) throw new Error(result.message || "Login gagal.");
    return result;
  },
  async adminListSheets(token) {
    const data = await requestJsonPost({ action: "admin_sheets", token });
    if (!data.success)
      throw new Error(data.message || "Gagal memuat daftar sheet.");
    return data.data;
  },
  async adminList(sheet, token) {
    const data = await requestJsonPost({
      action: "admin_list",
      sheet,
      token,
    });
    if (!data.success) throw new Error(data.message || "Gagal memuat data.");
    return data.data;
  },
  async adminCreate(sheet, payload, token) {
    const response = await fetch(HC_CONFIG.appsScriptUrl, {
      method: "POST",
      body: JSON.stringify({
        action: "create",
        sheet,
        data: payload,
        token,
      }),
    });
    const result = await parseJsonSafely(response);
    if (!result.success)
      throw new Error(result.message || "Gagal menambahkan data.");
    return result;
  },
  async adminUpdate(sheet, id, payload, token) {
    const response = await fetch(HC_CONFIG.appsScriptUrl, {
      method: "POST",
      body: JSON.stringify({
        action: "update",
        sheet,
        id,
        data: payload,
        token,
      }),
    });
    const result = await parseJsonSafely(response);
    if (!result.success)
      throw new Error(result.message || "Gagal memperbarui data.");
    return result;
  },
  async adminDelete(sheet, id, token) {
    const response = await fetch(HC_CONFIG.appsScriptUrl, {
      method: "POST",
      body: JSON.stringify({ action: "delete", sheet, id, token }),
    });
    const result = await parseJsonSafely(response);
    if (!result.success)
      throw new Error(result.message || "Gagal menghapus data.");
    return result;
  },
  async usersList(token) {
    const data = await requestJsonPost({ action: "users_list", token });
    if (!data.success)
      throw new Error(data.message || "Gagal memuat pengguna.");
    return data.data;
  },
  async usersCreate(payload, token) {
    const data = await requestJsonPost({
      action: "users_create",
      token,
      ...payload,
    });
    if (!data.success)
      throw new Error(data.message || "Gagal membuat pengguna.");
    return data.data;
  },
  async usersUpdate(payload, token) {
    const data = await requestJsonPost({
      action: "users_update",
      token,
      ...payload,
    });
    if (!data.success)
      throw new Error(data.message || "Gagal memperbarui pengguna.");
    return data;
  },
  async usersDelete(id, token) {
    const data = await requestJsonPost({ action: "users_delete", id, token });
    if (!data.success)
      throw new Error(data.message || "Gagal menghapus pengguna.");
    return data;
  },
  async adminUploadImage(file, token) {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
      reader.readAsDataURL(file);
    });
    const response = await fetch(HC_CONFIG.appsScriptUrl, {
      method: "POST",
      body: JSON.stringify({
        action: "uploadimage",
        filename: file.name,
        mimeType: file.type,
        base64,
        token,
      }),
    });
    const result = await parseJsonSafely(response);
    if (!result.success)
      throw new Error(result.message || "Gagal mengunggah gambar.");
    return result.url;
  },
  // Upload generik untuk video/audio (dan gambar juga bisa) ke Cloudinary
  // lewat action "uploadmedia" di Code.gs. Beda dengan adminUploadImage di
  // atas, fungsi ini mengembalikan objek { url, resourceType, format,
  // bytes, durationSeconds } supaya pemanggilnya tahu jenis file hasil
  // upload (berguna untuk menampilkan <video>/<audio>/<img> yang sesuai).
  async adminUploadMedia(file, token) {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = () => reject(new Error("Gagal membaca file."));
      reader.readAsDataURL(file);
    });
    const response = await fetch(HC_CONFIG.appsScriptUrl, {
      method: "POST",
      body: JSON.stringify({
        action: "uploadmedia",
        filename: file.name,
        mimeType: file.type,
        base64,
        token,
      }),
    });
    const result = await parseJsonSafely(response);
    if (!result.success)
      throw new Error(result.message || "Gagal mengunggah media.");
    return result.media;
  },
  // Hapus satu file dari Cloudinary lewat action "deletemedia" di
  // Code.gs. Dipakai tombol "Hapus file" di field gambar/video/audio.
  async adminDeleteMedia(url, token) {
    if (!url) return { success: true, skipped: true };
    const data = await requestJsonPost({ action: "deletemedia", url, token });
    if (!data.success)
      throw new Error(data.message || "Gagal menghapus file.");
    return data;
  },
  // === Manajemen pengguna (khusus role super_admin) ===
  async usersList(token) {
    const data = await requestJsonPost({ action: "users_list", token });
    if (!data.success)
      throw new Error(data.message || "Gagal memuat pengguna.");
    return data.data;
  },
  async usersCreate(payload, token) {
    const data = await requestJsonPost({
      action: "users_create",
      token,
      ...payload,
    });
    if (!data.success) throw new Error(data.message || "Gagal membuat akun.");
    return data.data;
  },
  async usersUpdate(payload, token) {
    const data = await requestJsonPost({
      action: "users_update",
      token,
      ...payload,
    });
    if (!data.success)
      throw new Error(data.message || "Gagal memperbarui pengguna.");
    return data;
  },
  async usersDelete(id, token) {
    const data = await requestJsonPost({ action: "users_delete", id, token });
    if (!data.success)
      throw new Error(data.message || "Gagal menghapus pengguna.");
    return data;
  },
};

// === Order/Pesanan API untuk member dashboard ===
HCApi.getOrders = async function (token) {
  const data = await requestJsonPost({ action: "pesanan_list", token });
  if (!data.success) throw new Error(data.message || "Gagal memuat pesanan.");
  // Parse data_pesanan dari JSON string
  return (data.data || []).map(function (row) {
    try {
      row.data_pesanan = JSON.parse(row.data_pesanan || "{}");
    } catch (e) {
      row.data_pesanan = {};
    }
    return row;
  });
};

HCApi.getMyOrders = async function (token, userId) {
  const data = await requestJsonPost({
    action: "pesanan_list",
    token,
    user_id: userId,
  });
  if (!data.success) throw new Error(data.message || "Gagal memuat pesanan.");
  return (data.data || []).map(function (row) {
    try {
      row.data_pesanan = JSON.parse(row.data_pesanan || "{}");
    } catch (e) {
      row.data_pesanan = {};
    }
    return row;
  });
};

HCApi.createOrder = async function (payload, token) {
  const data = await requestJsonPost({
    action: "pesanan_create",
    token: token || HCAuth.getToken(),
    user_id: payload.user_id,
    layanan: payload.layanan,
    nama_pemesan: payload.nama_pemesan,
    whatsapp_pemesan: payload.whatsapp_pemesan,
    data_pesanan: payload.data_pesanan || {},
  });
  if (!data.success) throw new Error(data.message || "Gagal membuat pesanan.");
  return data;
};

HCApi.updateOrder = async function (id, updates, token) {
  const data = await requestJsonPost({
    action: "pesanan_update",
    token,
    id,
    ...updates,
  });
  if (!data.success)
    throw new Error(data.message || "Gagal memperbarui pesanan.");
  return data;
};

// Profil sendiri (dipakai di menu "Profil Saya" Admin Panel): nama,
// whatsapp, foto/avatar, dan (opsional) password baru milik akun yang
// sedang login. Beda dari usersUpdate yang khusus super_admin mengelola
// akun ORANG LAIN.
HCApi.updateProfile = async function (payload, token) {
  const data = await requestJsonPost({
    action: "user_update_profile",
    token,
    ...payload,
  });
  if (!data.success)
    throw new Error(data.message || "Gagal memperbarui profil.");
  return data.user;
};

HCApi.verifySertifikat = async function (id) {
  const data = await requestJson({ action: "sertifikat_verify", id });
  if (!data.success)
    throw new Error(data.message || "Gagal memverifikasi sertifikat.");
  return data.data;
};

// === Live tracking Badal Umroh ===
// Dipakai oleh petugas-badal.html (role petugas_badal) untuk melihat pesanan
// yang ditugaskan kepadanya, lalu memulai/mengirim/menghentikan lokasi live.
HCApi.getMyBadalPesanan = async function (token) {
  const data = await requestJsonPost({ action: "badal_my_pesanan", token });
  if (!data.success)
    throw new Error(data.message || "Gagal memuat daftar pesanan.");
  return data.data || [];
};

HCApi.startBadalTracking = async function (pesananId, lat, lng, token) {
  const data = await requestJsonPost({
    action: "badal_track_start",
    token,
    pesanan_id: pesananId,
    lat,
    lng,
  });
  if (!data.success)
    throw new Error(data.message || "Gagal memulai live tracking.");
  return data;
};

HCApi.updateBadalTracking = async function (pesananId, lat, lng, token) {
  const data = await requestJsonPost({
    action: "badal_track_update",
    token,
    pesanan_id: pesananId,
    lat,
    lng,
  });
  if (!data.success)
    throw new Error(data.message || "Gagal mengirim lokasi.");
  return data;
};

HCApi.stopBadalTracking = async function (pesananId, lat, lng, token) {
  const data = await requestJsonPost({
    action: "badal_track_stop",
    token,
    pesanan_id: pesananId,
    lat,
    lng,
  });
  if (!data.success)
    throw new Error(data.message || "Gagal menghentikan live tracking.");
  return data;
};

// Dipakai oleh akun.html (widget "Lacak Live", tanpa perlu token) untuk
// polling posisi terbaru petugas Badal Umroh setiap beberapa detik. Pakai
// parameter "_t" (timestamp) supaya URL selalu unik tiap panggilan --
// mencegah browser (atau proxy/CDN di depan Apps Script) menyajikan
// response GET lama dari cache alih-alih data terbaru.
HCApi.getBadalTracking = async function (pesananId) {
  const data = await requestJson({
    action: "badal_track_get",
    pesanan_id: pesananId,
    _t: Date.now(),
  });
  if (!data.success)
    throw new Error(data.message || "Gagal memuat status live tracking.");
  return data.data || { status: "belum_mulai" };
};

// Riwayat lengkap titik koordinat (rute) 1 pesanan, dipakai akun.html untuk
// menggambar jalur (polyline) ala Strava sebagai bukti dokumentasi
// pelaksanaan Badal Umroh. Sama seperti di atas, pakai "_t" untuk menghindari
// cache GET.
HCApi.getBadalTrackPoints = async function (pesananId) {
  const data = await requestJson({
    action: "badal_track_points",
    pesanan_id: pesananId,
    _t: Date.now(),
  });
  if (!data.success)
    throw new Error(data.message || "Gagal memuat riwayat rute tracking.");
  return data.data || [];
};

// Admin Panel: verifikasi hasil tracking petugas (yang berstatus
// "menunggu_verifikasi") sekaligus menandai Pesanan terkait menjadi "selesai".
HCApi.verifyBadalTracking = async function (pesananId, token) {
  const data = await requestJsonPost({
    action: "badal_verify",
    token,
    pesanan_id: pesananId,
  });
  if (!data.success)
    throw new Error(data.message || "Gagal memverifikasi tracking.");
  return data;
};

// Admin Panel: daftar pesanan_id yang tracking-nya sudah dikirim petugas
// ("Selesai") tapi belum diverifikasi, dipakai untuk menampilkan tombol
// "Verifikasi" hanya pada baris Pesanan yang relevan.
HCApi.getBadalPendingVerifications = async function (token) {
  const data = await requestJsonPost({
    action: "badal_pending_verifications",
    token,
  });
  if (!data.success)
    throw new Error(
      data.message || "Gagal memuat daftar tracking menunggu verifikasi.",
    );
  return data.data || [];
};

// Daftar petugas pelaksana jasa Badal Umroh (nama & tanda tangan), dipakai
// di Admin Panel (pilih petugas saat menyelesaikan pesanan) dan untuk
// menyusun sertifikat.
HCApi.getPetugasBadal = async function () {
  try {
    const data = await requestJson({ action: "petugasbadal" });
    const rows = onlyPublished(data.data || data);
    return rows.length ? rows : fallbackPetugasBadal;
  } catch (error) {
    console.info(error.message);
    return fallbackPetugasBadal;
  }
};

// Ambil satu cerita/pengalaman jamaah berdasarkan id, dipakai di
// detail-pengalaman.html. Sengaja memakai getExperiences() (bukan endpoint baru)
// supaya konsisten dengan pola fallback lokal yang sudah ada.
HCApi.getExperience = async function (id) {
  const all = await HCApi.getExperiences();
  return all.find((item) => String(item.id) === String(id)) || null;
};

window.HC_CONFIG = HC_CONFIG;
window.HCApi = HCApi;
