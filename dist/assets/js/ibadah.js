const initTataCara = () => {
  const target = document.querySelector("[data-tatacara-list]");
  if (!target) return;
  const tabs = document.querySelectorAll("[data-jenis-tab]");
  const fixedJenis = target.getAttribute("data-jenis");
  const render = async (jenis) => {
    target.innerHTML = '<div class="skeleton"></div>';
    const steps = await HCApi.getTataCara(jenis);
    if (!steps || !steps.length) {
      target.innerHTML =
        '<p class="lead-muted mb-0">Belum ada data tahapan untuk kategori ini.</p>';
      return;
    }
    target.innerHTML = steps
      .map(
        (step, index) => `
      <div class="info-item d-flex gap-3 fade-up">
        <span class="badge-soft" style="min-width:2.4rem; justify-content:center;">${step.urutan || index + 1}</span>
        <div>
          <h3 class="h6 fw-bold mb-2">${step.judul}</h3>
          <p class="lead-muted mb-3">${step.deskripsi}</p>
          <div class="row g-2 small">
            ${step.waktu ? `<div class="col-md-4"><div class="badge-soft w-100 justify-content-start"><i class="bi bi-clock"></i><span><strong>Waktu:</strong> ${step.waktu}</span></div></div>` : ""}
            ${step.doa_dzikir ? `<div class="col-md-4"><div class="badge-soft w-100 justify-content-start"><i class="bi bi-moon-stars"></i><span><strong>Doa/Dzikir:</strong> ${step.doa_dzikir}</span></div></div>` : ""}
            ${step.catatan ? `<div class="col-md-4"><div class="badge-soft w-100 justify-content-start"><i class="bi bi-info-circle"></i><span><strong>Catatan:</strong> ${step.catatan}</span></div></div>` : ""}
          </div>
        </div>
      </div>
    `,
      )
      .join("");
    HCUtils?.initAnimations?.();
  };

  // Mode 1: container sudah menentukan jenis tetap lewat atribut
  // data-jenis (dipakai di tata-cara-haji.html / tata-cara-umrah.html,
  // tidak butuh tab pemilih jenis karena satu halaman = satu jenis).
  if (fixedJenis) {
    render(fixedJenis);
    return;
  }

  // Mode 2: jenis dipilih lewat tombol/tab [data-jenis-tab] (mis. dipakai
  // di halaman yang menampilkan Haji & Umrah sekaligus dalam satu tab).
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      render(tab.dataset.jenisTab);
    });
  });
  const hash = location.hash.replace("#", "").toLowerCase();
  const preselected = [...tabs].find(
    (tab) => tab.dataset.jenisTab.toLowerCase() === hash,
  );
  const initial =
    preselected || document.querySelector("[data-jenis-tab].active") || tabs[0];
  if (preselected) {
    tabs.forEach((item) => item.classList.remove("active"));
    preselected.classList.add("active");
  }
  if (initial) render(initial.dataset.jenisTab);
};

const initDoa = () => {
  const target = document.querySelector("[data-doa-list]");
  if (!target) return;
  const tabs = document.querySelectorAll("[data-jenis-tab]");
  const render = async (jenis) => {
    target.innerHTML = '<div class="col-12"><div class="skeleton"></div></div>';
    const list = await HCApi.getDoa(jenis);
    target.innerHTML = list
      .map(
        (doa) => `
      <div class="col-md-6">
        <div class="surface p-4 h-100 fade-up">
          <h3 class="h6 fw-bold">${doa.judul}</h3>
          ${doa.arab ? `<p class="fs-4 text-end mb-2" lang="ar" dir="rtl">${doa.arab}</p>` : ""}
          <p class="fst-italic lead-muted mb-2">${doa.latin}</p>
          <p class="mb-0">${doa.arti}</p>
        </div>
      </div>
    `,
      )
      .join("");
    HCUtils?.initAnimations?.();
  };
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      render(tab.dataset.jenisTab);
    });
  });
  const hash = location.hash.replace("#", "").toLowerCase();
  const preselected = [...tabs].find(
    (tab) => tab.dataset.jenisTab.toLowerCase() === hash,
  );
  const initial =
    preselected || document.querySelector("[data-jenis-tab].active") || tabs[0];
  if (preselected) {
    tabs.forEach((item) => item.classList.remove("active"));
    preselected.classList.add("active");
  }
  if (initial) render(initial.dataset.jenisTab);
};

document.addEventListener("DOMContentLoaded", () => {
  initTataCara();
  initDoa();
});
