const formatMoney = (value, currency = "IDR") => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency,
  maximumFractionDigits: 0
}).format(value || 0);

const PRAYER_CITIES = [
  { kota: "Mekkah", apiCity: "Makkah", apiCountry: "Saudi Arabia", timeZone: "Asia/Riyadh" },
  { kota: "Madinah", apiCity: "Madinah", apiCountry: "Saudi Arabia", timeZone: "Asia/Riyadh" },
  { kota: "Jakarta", apiCity: "Jakarta", apiCountry: "Indonesia", timeZone: "Asia/Jakarta" }
];

const normalizePrayerTime = (value) => String(value || "").match(/\d{1,2}:\d{2}/)?.[0] || "--:--";

const fetchPrayerCity = async (city) => {
  const url = new URL("https://api.aladhan.com/v1/timingsByCity");
  url.searchParams.set("city", city.apiCity);
  url.searchParams.set("country", city.apiCountry);
  url.searchParams.set("method", city.apiCountry === "Indonesia" ? "20" : "4");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API jadwal shalat gagal untuk ${city.kota}.`);
  const payload = await response.json();
  const timings = payload.data && payload.data.timings;
  if (!timings) throw new Error(`Data jadwal shalat kosong untuk ${city.kota}.`);
  return {
    kota: city.kota,
    subuh: normalizePrayerTime(timings.Fajr),
    dzuhur: normalizePrayerTime(timings.Dhuhr),
    ashar: normalizePrayerTime(timings.Asr),
    maghrib: normalizePrayerTime(timings.Maghrib),
    isya: normalizePrayerTime(timings.Isha),
    sumber: "Update realtime",
    timeZone: city.timeZone
  };
};

const loadRealtimePrayerSchedule = async () => {
  const fallback = (window.HCContent && window.HCContent.jadwalShalat) || [];
  try {
    const rows = await Promise.all(PRAYER_CITIES.map(fetchPrayerCity));
    if (rows.length) return rows;
  } catch (error) {
    console.info(error.message);
  }
  return fallback;
};

const minutesInZone = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);
  const get = (type) => Number(parts.find((part) => part.type === type)?.value || 0);
  return get("hour") * 60 + get("minute") + get("second") / 60;
};

const nextPrayerFor = (row, now) => {
  const zone = row.timeZone || "Asia/Jakarta";
  const nowMinutes = minutesInZone(now, zone);
  const items = [["Subuh", row.subuh], ["Dzuhur", row.dzuhur], ["Ashar", row.ashar], ["Maghrib", row.maghrib], ["Isya", row.isya]];
  const upcoming = items.find(([, time]) => {
    const [hour, minute] = String(time).split(":").map(Number);
    return hour * 60 + minute > nowMinutes;
  });
  const next = upcoming || items[0];
  const [hour, minute] = String(next[1]).split(":").map(Number);
  let diff = hour * 60 + minute - nowMinutes;
  if (diff < 0) diff += 24 * 60;
  return { name: next[0], time: next[1], minutesLeft: diff };
};

const formatCountdown = (minutesLeft) => {
  const totalSeconds = Math.max(0, Math.round(minutesLeft * 60));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((value) => String(value).padStart(2, "0")).join(":");
};

const initClockWidget = async () => {
  const target = document.querySelector("[data-clock-widget]");
  if (!target) return;
  const jadwal = await loadRealtimePrayerSchedule();
  const jakarta = jadwal.find((row) => String(row.kota).toLowerCase() === "jakarta") || jadwal[0];

  target.innerHTML = `
    <section id="jam-hijriah" class="mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <div>
          <span class="eyebrow">Jam &amp; Hijriah</span>
          <h2 class="h4 fw-bold mb-0">Jam Dunia Jamaah</h2>
        </div>
        <span class="small lead-muted">Untuk orientasi waktu, tanggal Masehi, kalender Hijriah, dan selisih waktu.</span>
      </div>
      <div class="row g-4">
        <div class="col-md-6 col-lg-3"><div class="surface p-4 clock-card"><span class="eyebrow">WIB</span><div class="time" data-wib-clock>--:--:--</div><p class="lead-muted mb-0">Indonesia Barat</p></div></div>
        <div class="col-md-6 col-lg-3"><div class="surface p-4 clock-card"><span class="eyebrow">Arab Saudi</span><div class="time" data-saudi-clock>--:--:--</div><p class="lead-muted mb-0">Makkah dan Madinah</p></div></div>
        <div class="col-md-6 col-lg-3"><div class="surface p-4"><span class="eyebrow">Tanggal Masehi</span><h2 class="h5 fw-bold mb-1" data-masehi-date>Memuat...</h2><p class="lead-muted mb-0">Tanggal lokal perangkat</p></div></div>
        <div class="col-md-6 col-lg-3"><div class="surface p-4"><span class="eyebrow">Kalender Hijriah</span><h2 class="h5 fw-bold mb-1" data-hijri-date>Memuat...</h2><p class="lead-muted mb-0">Perkiraan kalender Islam</p></div></div>
      </div>
    </section>
    <section id="jadwal-shalat" class="surface p-3 p-lg-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <span class="eyebrow">Jadwal Shalat &amp; Waktu</span>
          <h2 class="h5 fw-bold mb-0"><i class="bi bi-alarm text-primary"></i> Jadwal Shalat Mekkah, Madinah &amp; Jakarta</h2>
        </div>
        <div class="text-lg-end">
          <span class="small lead-muted d-block">Diperbarui otomatis secara realtime</span>
          <strong class="small">Jakarta berikutnya: <span data-next-prayer-name>-</span> dalam <span class="text-primary" data-next-prayer-countdown>--:--:--</span></strong>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table align-middle mb-0" data-jadwal-table>
          <thead><tr><th>Kota</th><th>Subuh</th><th>Dzuhur</th><th>Ashar</th><th>Maghrib</th><th>Isya</th><th>Catatan</th></tr></thead>
          <tbody>${jadwal.map((row) => `
            <tr data-city-row="${row.kota}">
              <td class="fw-bold">${row.kota}</td>
              <td data-prayer="Subuh">${row.subuh}</td>
              <td data-prayer="Dzuhur">${row.dzuhur}</td>
              <td data-prayer="Ashar">${row.ashar}</td>
              <td data-prayer="Maghrib">${row.maghrib}</td>
              <td data-prayer="Isya">${row.isya}</td>
              <td class="small lead-muted">${row.sumber || ""}</td>
            </tr>
          `).join("")}</tbody>
        </table>
      </div>
      <p class="small lead-muted mt-3 mb-0">Jadwal bersifat referensi. Untuk pelaksanaan ibadah, selalu ikuti pengumuman masjid dan aplikasi resmi setempat.</p>
    </section>
  `;

  const wibEl = target.querySelector("[data-wib-clock]");
  const saudiEl = target.querySelector("[data-saudi-clock]");
  const masehiEl = target.querySelector("[data-masehi-date]");
  const hijriEl = target.querySelector("[data-hijri-date]");
  const nextNameEl = target.querySelector("[data-next-prayer-name]");
  const nextCountdownEl = target.querySelector("[data-next-prayer-countdown]");

  const tick = () => {
    const now = new Date();
    wibEl.textContent = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now);
    saudiEl.textContent = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now);
    masehiEl.textContent = new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(now);
    hijriEl.textContent = new Intl.DateTimeFormat("id-ID-u-ca-islamic", { day: "numeric", month: "long", year: "numeric" }).format(now);

    if (jakarta) {
      const next = nextPrayerFor(jakarta, now);
      nextNameEl.textContent = next.name;
      nextCountdownEl.textContent = formatCountdown(next.minutesLeft);
    }

    jadwal.forEach((row) => {
      const next = nextPrayerFor(row, now);
      const rowEl = target.querySelector(`[data-city-row="${row.kota}"]`);
      if (!rowEl) return;
      rowEl.querySelectorAll("[data-prayer]").forEach((cell) => cell.classList.remove("prayer-active"));
      const activeCell = rowEl.querySelector(`[data-prayer="${next.name}"]`);
      if (activeCell) activeCell.classList.add("prayer-active");
    });
  };
  tick();
  setInterval(tick, 1000);
};

// Strip tipis (15-30px) yang menyatu di bawah navbar, menampilkan jam WIB,
// tanggal Hijriah, dan hitung mundur shalat berikutnya (Jakarta) secara realtime.
const initTopStripWidget = async () => {
  const target = document.querySelector("[data-top-strip]");
  if (!target) return;
  const rows = await loadRealtimePrayerSchedule();
  const jakarta = rows.find((item) => String(item.kota).toLowerCase() === "jakarta") || rows[0];

  target.innerHTML = `
    <div class="container top-strip-inner">
      <span class="top-strip-item"><i class="bi bi-clock"></i> <strong data-ts-wib>--:--:--</strong> WIB</span>
      <span class="top-strip-sep">&middot;</span>
      <span class="top-strip-item"><i class="bi bi-moon-stars"></i> <span data-ts-hijri>Memuat...</span></span>
      <span class="top-strip-sep">&middot;</span>
      <span class="top-strip-item top-strip-prayer"><i class="bi bi-alarm"></i> Shalat berikutnya: <strong data-ts-next-name>-</strong> pukul <strong data-ts-next-time>--:--</strong> &middot; <span data-ts-next-countdown>--:--:--</span></span>
      <a class="top-strip-link" href="waktu.html">Lihat Lengkap <i class="bi bi-chevron-right"></i></a>
    </div>
  `;

  const wibEl = target.querySelector("[data-ts-wib]");
  const hijriEl = target.querySelector("[data-ts-hijri]");
  const nameEl = target.querySelector("[data-ts-next-name]");
  const timeEl = target.querySelector("[data-ts-next-time]");
  const countdownEl = target.querySelector("[data-ts-next-countdown]");

  const tick = () => {
    const now = new Date();
    wibEl.textContent = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now);
    hijriEl.textContent = new Intl.DateTimeFormat("id-ID-u-ca-islamic", { day: "numeric", month: "long", year: "numeric" }).format(now);
    if (jakarta) {
      const next = nextPrayerFor(jakarta, now);
      nameEl.textContent = next.name;
      timeEl.textContent = next.time;
      countdownEl.textContent = formatCountdown(next.minutesLeft);
    }
  };
  tick();
  setInterval(tick, 1000);
};

const initBudgetPlanner = () => {
  const form = document.querySelector("[data-budget-form]");
  if (!form) return;
  const output = document.querySelector("[data-budget-result]");
  const calculate = () => {
    const data = Object.fromEntries(new FormData(form).entries());
    const days = Number(data.days || 0);
    const people = Number(data.people || 0);
    const daily = Number(data.hotel || 0) + Number(data.transport || 0) + Number(data.meal || 0);
    const total = (daily * days * people) + Number(data.shopping || 0);
    output.textContent = formatMoney(total, "IDR");
  };
  form.addEventListener("input", calculate);
  calculate();
};

const fetchLiveRates = async () => {
  const response = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!response.ok) throw new Error("API kurs realtime gagal diakses.");
  const payload = await response.json();
  if (payload.result !== "success" || !payload.rates || !payload.rates.IDR || !payload.rates.SAR) {
    throw new Error("Data kurs realtime tidak lengkap.");
  }
  const usdToIdr = payload.rates.IDR;
  const usdToSar = payload.rates.SAR;
  return {
    rates: {
      IDR: 1,
      USD: usdToIdr,
      SAR: usdToIdr / usdToSar,
    },
    sumber: "Kurs realtime",
    waktu: payload.time_last_update_utc || null,
  };
};

const loadCurrencyRates = async () => {
  const fallback = {
    rates: { IDR: 1, SAR: 4300, USD: 16200 },
    sumber: "Nilai default sementara \u2014 tidak berhasil memuat sumber realtime.",
    waktu: null,
  };
  try {
    const live = await fetchLiveRates();
    return live;
  } catch (error) {
    console.info(error.message);
  }
  return fallback;
};

const initCurrencyConverter = async () => {
  const form = document.querySelector("[data-currency-form]");
  if (!form) return;
  const statusEl = document.querySelector("[data-kurs-status]");
  if (statusEl) statusEl.textContent = "Memuat kurs realtime...";

  const { rates, sumber, waktu } = await loadCurrencyRates();

  if (statusEl) {
    const waktuText = waktu
      ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(waktu))
      : null;
    statusEl.innerHTML = `<i class="bi bi-broadcast text-primary"></i> Kurs realtime${waktuText ? ` &middot; diperbarui ${waktuText} WIB` : ""} &middot; 1 SAR &asymp; ${formatMoney(rates.SAR, "IDR")} &middot; 1 USD &asymp; ${formatMoney(rates.USD, "IDR")}`;
  }

  const inputs = [...form.querySelectorAll("input")];
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      const valueInIdr = Number(input.value || 0) * rates[input.name];
      inputs.forEach((other) => {
        if (other === input) return;
        other.value = Math.round(valueInIdr / rates[other.name]);
      });
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initClockWidget();
  initTopStripWidget();
  initBudgetPlanner();
  initCurrencyConverter();
});
