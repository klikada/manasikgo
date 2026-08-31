// === ManasikGo Auth ===
// Menangani login/registrasi member, penyimpanan sesi (token) di browser,
// dan menampilkan tombol "Masuk" / menu akun di navbar semua halaman.
// Bergantung pada window.HC_CONFIG (lihat assets/js/api.js) untuk URL Apps Script.

const HC_AUTH_STORAGE_KEY = "manasikgo_auth";

function hcAuthGetSession() {
  try {
    const raw = localStorage.getItem(HC_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.token || !session.user) return null;
    return session;
  } catch (error) {
    return null;
  }
}

function hcAuthSetSession(session) {
  localStorage.setItem(HC_AUTH_STORAGE_KEY, JSON.stringify(session));
}

function hcAuthClearSession() {
  localStorage.removeItem(HC_AUTH_STORAGE_KEY);
}

async function hcAuthRequest(payload) {
  const url = window.HC_CONFIG && window.HC_CONFIG.appsScriptUrl;
  if (!url) throw new Error("Apps Script URL belum dikonfigurasi.");
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Request gagal: " + response.status);
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error("Respon server tidak valid.");
  }
  if (!data.success) throw new Error(data.message || "Terjadi kesalahan.");
  return data;
}

function hcAuthRoleLabel(role) {
  if (role === "super_admin") return "Super Admin";
  if (role === "penulis") return "Pengelola Konten";
  if (role === "petugas_badal") return "Petugas Badal";
  return "Member";
}

function hcAuthDashboardUrl(role) {
  if (role === "super_admin" || role === "penulis") return "admin.html";
  if (role === "petugas_badal") return "petugas-badal.html";
  return "akun.html";
}

const HCAuth = {
  setSession(session) {
    hcAuthSetSession(session);
  },
  async login(email, password) {
    const data = await hcAuthRequest({ action: "user_login", email, password });
    hcAuthSetSession({ token: data.token, user: data.user });
    hcAuthRenderNav();
    return data.user;
  },
  async register({ nama, email, whatsapp, password }) {
    const data = await hcAuthRequest({
      action: "user_register",
      nama,
      email,
      whatsapp,
      password,
    });
    hcAuthSetSession({ token: data.token, user: data.user });
    hcAuthRenderNav();
    return data.user;
  },
  async me() {
    const session = hcAuthGetSession();
    if (!session) return null;
    try {
      const data = await hcAuthRequest({
        action: "user_me",
        token: session.token,
      });
      hcAuthSetSession({ token: session.token, user: data.user });
      hcAuthRenderNav();
      return data.user;
    } catch (error) {
      hcAuthClearSession();
      hcAuthRenderNav();
      return null;
    }
  },
  logout() {
    hcAuthClearSession();
    hcAuthRenderNav();
  },
  getSession: hcAuthGetSession,
  getToken() {
    const session = hcAuthGetSession();
    return session ? session.token : null;
  },
  // Panggil di halaman yang perlu login (mis. akun.html, admin.html):
  // kalau belum login / role tidak sesuai, otomatis diarahkan ke halaman lain.
  requireRole(roles, redirectTo) {
    const session = hcAuthGetSession();
    if (!session || roles.indexOf(session.user.role) === -1) {
      window.location.href = redirectTo || "login.html";
      return null;
    }
    return session.user;
  },
};

function hcAuthRenderNav() {
  const menu = document.getElementById("navbarActions");
  if (!menu) return;
  const existing = document.getElementById("hcAuthNavItem");
  if (existing) existing.remove();

  const session = hcAuthGetSession();
  const li = document.createElement("li");
  li.id = "hcAuthNavItem";

  if (session && session.user) {
    li.className = "nav-item dropdown";
    const firstName = String(session.user.nama || "Akun").split(" ")[0];
    const dashboardUrl = hcAuthDashboardUrl(session.user.role);
    const dashboardLabel =
      session.user.role === "member"
        ? "Kelola Pesanan"
        : session.user.role === "petugas_badal"
          ? "Dashboard Badal"
          : "Admin Panel";
    li.innerHTML =
      '<a class="nav-link dropdown-toggle" href="#" id="hcAuthDropdown" role="button" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">' +
      '<i class="bi bi-person-circle"></i> ' +
      firstName +
      "</a>" +
      '<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="hcAuthDropdown">' +
      '<li><span class="dropdown-item-text small lead-muted">' +
      hcAuthRoleLabel(session.user.role) +
      "</span></li>" +
      '<li><hr class="dropdown-divider"></li>' +
      '<li><a class="dropdown-item" href="' +
      dashboardUrl +
      '">' +
      dashboardLabel +
      "</a></li>" +
      '<li><a class="dropdown-item" href="#" id="hcAuthLogoutBtn">Keluar</a></li>' +
      "</ul>";
  } else {
    li.className = "nav-item";
    li.innerHTML =
      '<a class="btn btn-outline-light btn-sm" href="login.html">' +
      '<i class="bi bi-door-open-fill"></i> Masuk</a>';
  }

  menu.appendChild(li);

  const logoutBtn = document.getElementById("hcAuthLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (event) {
      event.preventDefault();
      HCAuth.logout();
      window.location.href = "index.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  hcAuthRenderNav();
  HCAuth.me();
});

window.HCAuth = HCAuth;
window.hcAuthRenderNav = hcAuthRenderNav;
window.hcAuthDashboardUrl = hcAuthDashboardUrl;
