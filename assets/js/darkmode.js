const applyTheme = (theme) => {
  const isDark = theme === "dark";
  document.documentElement.style.setProperty("--theme-transition", "1");
  document.documentElement.classList.toggle("theme-dark-preload", isDark);
  document.documentElement.setAttribute("data-bs-theme", isDark ? "dark" : "light");
  document.body?.classList.add("theme-transitioning");
  document.body?.classList.toggle("dark-mode", isDark);
  document.querySelectorAll("[data-theme-icon]").forEach((icon) => {
    icon.classList.add("icon-spin");
    icon.className = `bi ${isDark ? "bi-sun" : "bi-moon-stars"} icon-spin`;
    setTimeout(() => icon.classList.remove("icon-spin"), 350);
  });
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", isDark);
  });
  setTimeout(() => document.body?.classList.remove("theme-transitioning"), 400);

  // Chromium/WebKit sometimes fail to repaint elements that use
  // backdrop-filter (hero search bar, sticky nav, etc.) right after a
  // CSS custom-property switch this high up the tree (html.theme-dark-preload
  // touches --bg/--surface/--text on nearly every element at once). The
  // symptom is cards/text staying blank until the mouse moves over them.
  // Nudging opacity by a hair and back forces the compositor to redraw
  // every layer without any visible flash.
  if (document.body) {
    const body = document.body;
    requestAnimationFrame(() => {
      body.style.opacity = "0.999";
      requestAnimationFrame(() => {
        body.style.opacity = "";
      });
    });
  }
};

const getPreferredTheme = () => {
  const saved = localStorage.getItem("manasikgo-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getPreferredTheme());

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
      localStorage.setItem("manasikgo-theme", nextTheme);
      applyTheme(nextTheme);
    });
  });

  if (window.matchMedia) {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (event) => {
      if (localStorage.getItem("manasikgo-theme")) return; // user has an explicit preference, don't override
      applyTheme(event.matches ? "dark" : "light");
    };
    if (media.addEventListener) media.addEventListener("change", handleSystemThemeChange);
    else if (media.addListener) media.addListener(handleSystemThemeChange);
  }
});
