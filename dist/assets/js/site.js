(function () {
  const nav = document.querySelector("[data-nav]");
  const menu = document.querySelector("[data-menu]");

  menu?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(Boolean(open)));
  });

  const currentLocale = document.documentElement.lang || "en";
  const localeLinks = document.querySelectorAll("[data-locale-link]");
  localeLinks.forEach((link) => {
    link.addEventListener("click", () => {
      localStorage.setItem("preferred-locale", link.getAttribute("data-locale") || "en");
    });
  });

  const preferredLocale = localStorage.getItem("preferred-locale");
  if (preferredLocale && preferredLocale !== currentLocale) {
    const target = document.querySelector(`[data-locale-link][data-locale="${preferredLocale}"]`);
    if (target instanceof HTMLAnchorElement) {
      const targetUrl = new URL(target.href, window.location.origin);
      if (targetUrl.pathname !== window.location.pathname) {
        window.location.replace(target.href);
        return;
      }
    }
  }

  const banner = document.querySelector("[data-support-banner]");
  if (banner && localStorage.getItem("support-banner-v2") !== "dismissed") {
    banner.classList.remove("hidden");
  }
  document.querySelector("[data-dismiss-support]")?.addEventListener("click", () => {
    localStorage.setItem("support-banner-v2", "dismissed");
    banner?.classList.add("hidden");
  });

  const filterButtons = document.querySelectorAll("[data-model-filter]");
  const modelCards = document.querySelectorAll("[data-model-card]");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-model-filter") || "all";
      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
      modelCards.forEach((card) => {
        const tags = card.getAttribute("data-tags") || "";
        card.classList.toggle("hidden", filter !== "all" && !tags.includes(filter));
      });
    });
  });

})();
