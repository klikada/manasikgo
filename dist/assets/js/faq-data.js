const faqCategories = ["Dokumen", "Persiapan", "Ibadah", "Kesehatan", "Transportasi", "Hotel", "Kuliner", "Belanja", "Keuangan", "Keamanan"];
const faqTopics = [
  "paspor", "visa", "tiket", "hotel", "ihram", "tawaf", "sa'i", "miqat", "obat pribadi", "masker",
  "uang riyal", "kartu debit", "bus shalawat", "kereta Haramain", "taksi", "makanan hemat", "air zamzam", "oleh-oleh", "koper", "rombongan"
];

const HCFAQ = Array.from({ length: 200 }, (_, index) => {
  const category = faqCategories[index % faqCategories.length];
  const topic = faqTopics[index % faqTopics.length];
  return {
    id: `faq-${String(index + 1).padStart(3, "0")}`,
    category,
    question: `Apa yang perlu diketahui jamaah tentang ${topic} sebelum berangkat?`,
    answer: `Untuk topik ${topic}, jamaah sebaiknya mengecek informasi terbaru dari penyelenggara, menyiapkan kebutuhan pribadi, dan mengikuti arahan pembimbing. Jawaban ini bersifat panduan umum kategori ${category} dan dapat diperbarui melalui Google Spreadsheet.`
  };
});

const renderFAQ = async () => {
  const target = document.querySelector("[data-faq-list]");
  if (!target) return;
  const search = document.querySelector("[data-faq-search]");
  const filter = document.querySelector("[data-faq-category]");
  const data = (window.HCApi ? await HCApi.getFAQ() : HCFAQ) || HCFAQ;
  const categories = [...new Set(data.map((item) => item.category))];
  filter.innerHTML = `<option value="">Semua kategori</option>${categories.map((item) => `<option value="${item}">${item}</option>`).join("")}`;
  const render = () => {
    const keyword = (search.value || "").toLowerCase();
    const selected = filter.value;
    const items = data.filter((item) => {
      const text = `${item.question} ${item.answer} ${item.category}`.toLowerCase();
      return (!keyword || text.includes(keyword)) && (!selected || item.category === selected);
    });
    target.innerHTML = items.map((item) => `
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed faq-button" type="button" data-bs-toggle="collapse" data-bs-target="#${item.id}">
            <span class="badge-soft me-2">${item.category}</span>${item.question}
          </button>
        </h2>
        <div id="${item.id}" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
          <div class="accordion-body">${item.answer}</div>
        </div>
      </div>
    `).join("");
    document.querySelector("[data-faq-count]").textContent = `${items.length} pertanyaan`;
  };
  search.addEventListener("input", render);
  filter.addEventListener("change", render);
  render();
};

document.addEventListener("DOMContentLoaded", renderFAQ);
