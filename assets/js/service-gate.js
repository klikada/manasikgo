// === ManasikGo Service Gate ===
// Dipakai di halaman layanan (badal.html, wakaf-quran.html,
// rekrutmen-petugas.html): mengecek status login sebelum membuka modal
// "Pesan Jasa" / "Daftar Panitia Haji". Kalau belum login, tampilkan modal
// "Masuk Dulu, Yuk" yang mengarahkan ke login.html / daftar.html dengan
// parameter ?redirect= supaya user kembali ke halaman ini setelah masuk.
// Bergantung pada assets/js/auth.js (window.HCAuth) dan Bootstrap 5 modal.

(function () {
  function openLoginRequiredModal(reason, currentPage) {
    var modalEl = document.getElementById("loginRequiredModal");
    if (!modalEl || typeof bootstrap === "undefined") return;

    var reasonEl = document.getElementById("loginRequiredReason");
    if (reasonEl) {
      reasonEl.textContent =
        reason ||
        "Anda perlu masuk ke akun ManasikGo terlebih dahulu untuk melanjutkan.";
    }

    var redirect = encodeURIComponent(currentPage || "index.html");
    var loginBtn = document.getElementById("loginRequiredLoginBtn");
    var registerBtn = document.getElementById("loginRequiredRegisterBtn");
    if (loginBtn) loginBtn.href = "login.html?redirect=" + redirect;
    if (registerBtn) registerBtn.href = "daftar.html?redirect=" + redirect;

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  // options: { modalId: 'pesanBadalModal', page: 'badal.html', reason: '...' }
  // Mengembalikan true jika user sudah login (modal target langsung dibuka),
  // false jika belum login (modal "Masuk Dulu, Yuk" yang dibuka).
  window.hcServiceGate = function (options) {
    options = options || {};
    var session = window.HCAuth && window.HCAuth.getSession();
    var currentPage =
      options.page || window.location.pathname.split("/").pop() || "index.html";

    if (!session || !session.user) {
      openLoginRequiredModal(options.reason, currentPage);
      return false;
    }

    if (options.modalId && typeof bootstrap !== "undefined") {
      var targetEl = document.getElementById(options.modalId);
      if (targetEl) bootstrap.Modal.getOrCreateInstance(targetEl).show();
    }
    return true;
  };
})();
