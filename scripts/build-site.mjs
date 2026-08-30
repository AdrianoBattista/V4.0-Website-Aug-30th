import { mkdir, rm, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  audiencePathways,
  authorityBio,
  books,
  dataPoints,
  disclaimer,
  focusAreas,
  helpResources,
  homePillars,
  models,
  nav,
  partners,
  preventionLevels,
  publications,
  researchThemes,
  site,
  teachingPhilosophy
} from "../src/content.mjs";
import { basePath, defaultLocale, locales, localizePath, t } from "../src/translations.mjs";

const outDir = "dist";
let activeLocale = defaultLocale;

const esc = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const external = (href = "") => href.startsWith("http");
const attr = (href = "") => (external(href) ? ' target="_blank" rel="noreferrer"' : "");
const tr = (value) => t(activeLocale, value);
const paragraph = (text) => `<p>${esc(tr(text))}</p>`;
const linkHref = (href = "") => localizePath(activeLocale, href);

function pagePath(slug) {
  if (slug === "/") return join(outDir, "index.html");
  return join(outDir, slug.replace(/^\/|\/$/g, ""), "index.html");
}

function urlFor(slug) {
  return `${site.baseUrl}${slug}`;
}

function navHtml() {
  return nav
    .map(([label, href, children]) => {
      const dropdown = children
        ? `<div class="dropdown">${children.map(([child, childHref]) => `<a href="${linkHref(childHref)}">${esc(tr(child))}</a>`).join("")}</div>`
        : "";
      return `<div class="nav-item"><a class="nav-link" href="${linkHref(href)}">${esc(tr(label))}</a>${dropdown}</div>`;
    })
    .join("");
}

function socialIcon({ key, label, href }) {
  const icons = {
    linkedin: `<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="6"/><text x="9" y="23">in</text></svg>`,
    scholar: `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="17" r="10"/><path d="M4 13 16 6l12 7-12 7Z"/><path d="M10 20c2 3 10 3 12 0"/></svg>`,
    amazon: `<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="6"/><text x="10" y="21">a</text><path d="M9 24c5 3 10 3 15-1"/></svg>`
  };
  return `<a class="social-icon social-${key}" href="${href}" target="_blank" rel="noreferrer" aria-label="${esc(label)}">${icons[key] || ""}</a>`;
}

function head({ title, description, slug = "/", image = site.image, schema = [], locale = "en" }) {
  const pageSlug = basePath(slug);
  const canonical = urlFor(localizePath(locale, pageSlug));
  const translatedTitle = t(locale, title);
  const translatedDescription = t(locale, description);
  const metaDescription =
    translatedDescription.length > 190
      ? `${translatedDescription.slice(0, 187).replace(/\s+\S*$/, "")}...`
      : translatedDescription;
  const sameAs = site.socials.map((item) => item.href);
  const alternateLinks = locales
    .map((item) => `<link rel="alternate" hreflang="${item.code}" href="${urlFor(localizePath(item.code, pageSlug))}">`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${urlFor(localizePath(defaultLocale, pageSlug))}">`)
    .join("\n  ");
  const schemaGraph = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.name,
      url: site.baseUrl,
      image: `${site.baseUrl}${site.image}`,
      jobTitle: t(locale, "Doctoral researcher, educator, and published author"),
      sameAs,
      knowsAbout: site.keywords.map((keyword) => t(locale, keyword))
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "HOPE Youth Education",
      url: site.baseUrl,
      founder: { "@type": "Person", name: site.name },
      description: t(
        locale,
        "School-community prevention and awareness work focused on youth homelessness prevention education and staff training."
      )
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: t(locale, site.title),
      url: site.baseUrl
    },
    ...schema
  ];

  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(translatedTitle)}</title>
  <meta name="description" content="${esc(metaDescription)}">
  <meta name="keywords" content="${esc(site.keywords.map((keyword) => t(locale, keyword)).join(", "))}">
  <link rel="canonical" href="${canonical}">
  ${alternateLinks}
  <meta property="og:title" content="${esc(translatedTitle)}">
  <meta property="og:description" content="${esc(metaDescription)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${site.baseUrl}${image}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script type="application/ld+json">${JSON.stringify(schemaGraph)}</script>
</head>`;
}

function header({ slug = "/", locale = "en" } = {}) {
  const pageSlug = basePath(slug);
  return `<a class="skip-link" href="#main">${esc(t(locale, "Skip to main content"))}</a>
<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="${localizePath(locale, "/")}"><strong>${site.name}</strong><span>${esc(t(locale, "Research Hub"))}</span></a>
    <button class="menu-toggle" data-menu aria-expanded="false" aria-controls="site-nav">${esc(t(locale, "Menu"))}</button>
    <nav class="main-nav" id="site-nav" data-nav aria-label="${esc(t(locale, "Main navigation"))}">${navHtml()}</nav>
    <div class="header-actions">
      <div class="language-switcher" aria-label="${esc(t(locale, "Language links"))}">
        ${locales
          .map(
            ({ code, label }) =>
              `<a class="${locale === code ? "active" : ""}" href="${localizePath(code, pageSlug)}" hreflang="${code}" data-locale-link data-locale="${code}">${esc(label)}</a>`
          )
          .join("")}
      </div>
    </div>
  </div>
</header>`;
}

function footer(locale = activeLocale) {
  const emailHtml = site.email.includes("@")
    ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`
    : `<span>${esc(site.email)}</span>`;
  return `<footer class="footer">
  <div class="footer-inner">
    <div>
      <h2>${site.name}</h2>
      <p>${esc(t(locale, site.description))}</p>
      <p><strong>${esc(t(locale, "Contact:"))}</strong> ${emailHtml}</p>
      <div class="social-row">${site.socials.map(socialIcon).join("")}</div>
    </div>
    <div>
      <h3>${esc(t(locale, "Explore"))}</h3>
      <a href="${localizePath(locale, "/research/")}">${esc(t(locale, "Research"))}</a>
      <a href="${localizePath(locale, "/publications/")}">${esc(t(locale, "Publications"))}</a>
      <a href="${localizePath(locale, "/what-works/")}">${esc(t(locale, "What Works"))}</a>
      <a href="${localizePath(locale, "/toolkit-books/")}">${esc(t(locale, "Toolkit & Books"))}</a>
    </div>
    <div>
      <h3>${esc(t(locale, "Resources"))}</h3>
      <a href="${localizePath(locale, "/in-plain-sight/")}">${esc(t(locale, "In Plain Sight"))}</a>
      <a href="${localizePath(locale, "/why-prevention/")}">${esc(t(locale, "Why Prevention"))}</a>
      <a href="${localizePath(locale, "/community-partnerships/")}">${esc(t(locale, "Community Partnerships"))}</a>
      <a href="${localizePath(locale, "/need-help/")}">${esc(t(locale, "Need Help?"))}</a>
      <a href="${localizePath(locale, "/accessibility/")}">${esc(t(locale, "Accessibility"))}</a>
    </div>
  </div>
  <div class="footer-bottom">${esc(t(locale, "Informational and educational content only. Confirm urgent service information directly with official providers."))}</div>
</footer>`;
}

function supportBanner(locale = activeLocale) {
  return `<aside class="support-banner hidden" data-support-banner aria-label="${esc(t(locale, "Support reminder"))}">
  <div class="support-inner">
    <p><strong>${esc(t(locale, "Caring space reminder."))}</strong> ${esc(t(locale, "Please feel free to reach out if you need support at any point during your search. Feeling powerless in certain situations is normal and valid."))}</p>
    <div class="button-row" style="margin-top:0">
      <a class="button-dark" href="${localizePath(locale, "/need-help/")}">${esc(t(locale, "Need Help?"))}</a>
      <button class="button" type="button" data-dismiss-support>${esc(t(locale, "Continue"))}</button>
    </div>
  </div>
</aside>`;
}

function layout({ title, description, slug, body, schema = [], locale = "en" }) {
  return `${head({ title, description, slug, schema, locale })}
<body>
${header({ slug, locale })}
<main id="main">${body}</main>
${footer(locale)}
${supportBanner(locale)}
<script src="/assets/js/site.js"></script>
</body>
</html>`;
}

function heroPage({ title, eyebrow, description, summary }) {
  return `<section class="page-hero">
  <div class="page-hero-inner">
    <div class="breadcrumb"><a href="${linkHref("/")}">${esc(tr("Home"))}</a> / ${esc(tr(title))}</div>
    <p class="eyebrow">${esc(tr(eyebrow))}</p>
    <h1>${esc(tr(title))}</h1>
    <p>${esc(tr(description))}</p>
    ${summary ? `<div class="summary-box">${esc(tr(summary))}</div>` : ""}
  </div>
</section>`;
}

function cards(items, columns = 3) {
  return `<div class="grid grid-${columns}">${items
    .map(
      (item) => `<article class="card">
        <p class="label">${esc(tr(item.label || item[0] || "Resource"))}</p>
        <h3>${esc(tr(item.title || item[1]))}</h3>
        <p>${esc(tr(item.text || item.description || item[2]))}</p>
        ${item.href || item[3] ? `<a class="card-link" href="${linkHref(item.href || item[3])}"${attr(item.href || item[3])}>${esc(tr("Open resource"))}</a>` : ""}
      </article>`
    )
    .join("")}</div>`;
}

function statCard(stat) {
  return `<article class="stat-card">
    <span class="stat-value">${esc(stat.value)}</span>
    <p>${esc(tr(stat.text))} <a class="stat-citation" href="${stat.href}" target="_blank" rel="noreferrer">(${esc(stat.citation)})</a></p>
  </article>`;
}

function qrBox(href, title) {
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=10&data=${encodeURIComponent(href)}`;
  return `<a class="qr-box" href="${href}" target="_blank" rel="noreferrer" aria-label="${esc(`${tr("Open QR resource")}: ${tr(title)}`)}">
    <img src="${esc(qrSrc)}" alt="${esc(`${tr("QR code for")} ${tr(title)}`)}" loading="eager" decoding="async">
    <span>${esc(tr("Scan or open"))}</span>
  </a>`;
}

function modelSeoTitle(model) {
  const titles = {
    "coss-model": "COSS Model | Youth Homelessness Prevention",
    "critical-pedagogy": "Critical Pedagogy | Youth Homelessness Prevention",
    "washington-hope": "Washington SB 6560 | Youth Homelessness Prevention",
    "duty-to-assist": "Duty to Assist | Youth Homelessness Prevention",
    "family-natural-supports": "Family Supports | Youth Homelessness Prevention",
    "mckinney-vento": "McKinney-Vento | Youth Homelessness Prevention"
  };
  return titles[model.slug] || `${model.title} | Prevention`;
}

function referenceList() {
  const unique = new Map();
  dataPoints.forEach((stat) => unique.set(stat.citation, stat));
  return `<div class="reference-list">${[...unique.values()]
    .map((stat) => `<p><a href="${stat.href}" target="_blank" rel="noreferrer">${esc(stat.citation)}</a>. ${esc(stat.apa)}</p>`)
    .join("")}</div>`;
}

function home() {
  const body = `<section class="hero">
  <div class="hero-inner">
    <div>
      <p class="eyebrow">${esc(tr("Youth homelessness prevention through education and early intervention"))}</p>
      <h1>${esc(tr("Youth Homelessness Prevention Starts Before Crisis"))}</h1>
      <p class="hero-lede">${esc(tr("A research-informed resource hub for educators, schools, communities, and youth-serving partners working to recognize housing precarity earlier and strengthen school-community prevention systems."))}</p>
      <div class="button-row">
        <a class="button" href="${linkHref("/research/")}">${esc(tr("Explore the Research"))}</a>
        <a class="button-secondary" href="${linkHref("/what-works/")}">${esc(tr("View Prevention Models"))}</a>
        <a class="button-secondary" href="${linkHref("/need-help/")}">${esc(tr("Need Help?"))}</a>
      </div>
    </div>
    <aside class="hero-photo-card" aria-label="${esc(tr("Photo of Adriano Battista"))}">
      <img src="${site.image}" alt="${esc(tr("Adriano Battista, doctoral researcher, educator, and youth homelessness prevention scholar"))}">
      <div class="hero-badge"><strong>Adriano Battista</strong> ${esc(tr("Doctoral researcher, educator, published author, and public educator."))}</div>
    </aside>
  </div>
</section>
<section class="section section-white">
  <div class="container split">
    <div><p class="eyebrow">${esc(tr("Research profile"))}</p><h2>${esc(tr("Academic researcher + public educator."))}</h2></div>
    <div class="page-content">${authorityBio.map(paragraph).join("")}</div>
  </div>
</section>
<section class="section section-pale">
  <div class="container">${cards(homePillars, 4)}</div>
</section>
<section class="section section-white">
  <div class="container">
    <p class="eyebrow">${esc(tr("Choose your pathway"))}</p>
    <h2>${esc(tr("Choose the pathway that matches your role."))}</h2>
    ${cards(audiencePathways, 4)}
  </div>
</section>
<section class="section section-pale">
  <div class="container">
    <p class="eyebrow">${esc(tr("Prevention cluster"))}</p>
    <h2>${esc(tr("Four entry points into youth homelessness prevention."))}</h2>
    ${cards(focusAreas.map(([title, text, href]) => ({ label: "Focus area", title, text, href })), 4)}
  </div>
</section>
<section class="section section-dark">
  <div class="container split">
    <div><p class="eyebrow">${esc(tr("In plain sight"))}</p><h2>${esc(tr("The data points toward schools, care systems, and early intervention."))}</h2><p>${esc(tr("These figures are presented as decision-support signals. Each statistic links back to a cited source so readers can examine the evidence directly."))}</p></div>
    <div class="grid grid-2">${dataPoints.slice(0, 4).map(statCard).join("")}</div>
  </div>
</section>
<section class="section section-white">
  <div class="container split">
    <div><p class="eyebrow">${esc(tr("Featured publication"))}</p><h2>${esc(tr("Schools as Sites of Both Harm and Potential"))}</h2></div>
    <article class="card"><p class="label">${esc(tr(publications[0].type))}</p><h3>${esc(tr(publications[0].title))}</h3><p>${esc(tr(publications[0].summary))}</p><a class="card-link" href="${publications[0].href}" target="_blank" rel="noreferrer">${esc(tr("Read the article"))}</a></article>
  </div>
</section>
<section class="section section-pale">
  <div class="container">
    <p class="eyebrow">${esc(tr("Research to practice"))}</p>
    <h2>${esc(tr("Public scholarship that helps people decide where to start."))}</h2>
    ${cards([
      { label: "What Works", title: "Compare prevention models", text: "COSS, Reconnect, Upstream, Family and Natural Supports, HF4Y, McKinney-Vento, Washington SB 6560, Duty to Assist, breakfast programs, and critical pedagogy.", href: "/what-works/" },
      { label: "Toolkit", title: "Freirean Teacher Toolkit", text: "Classroom-ready strategies, lesson plans, trauma-informed pedagogy, and social justice teaching tools.", href: "/toolkit-books/" },
      { label: "Need Help?", title: "Youth-friendly resources", text: "Easy-to-scan support cards with phone numbers, links, and QR codes for Quebec crisis and community resources.", href: "/need-help/" }
    ], 3)}
  </div>
</section>`;
  return layout({
    title: "Youth Homelessness Prevention Research Hub | Adriano Battista",
    description: site.description,
    slug: "/",
    body,
    locale: activeLocale
  });
}

function researchPage() {
  const body = `${heroPage({
    title: "Research",
    eyebrow: "Academic research and community-engaged prevention",
    description:
      "Research themes, publications, collaborations, awards, and community-based prevention work connected to youth homelessness prevention and education systems.",
    summary:
      "This page connects academic papers, thesis work, media, organizations, and practical tools into a focused research ecosystem."
  })}
<section class="section section-white"><div class="container">${cards(researchThemes.map((theme) => ({ label: "Research theme", title: theme.title, text: theme.text, href: theme.links[0][1] })), 2)}</div></section>
<section class="section section-pale"><div class="container split"><div><p class="eyebrow">${esc(tr("Research background"))}</p><h2>${esc(tr("From lived and professional experience to teacher education research."))}</h2></div><div class="page-content">${paragraph("Adriano Battista’s research began by examining the experiences of precarious and homeless youth in and out of schools through autoethnographic research and case studies. His current work now examines how pre-service teacher education prepares, or fails to prepare, future educators to recognize and respond to poverty, trauma, housing instability, and youth homelessness.")}${paragraph("Across this work, he explores how education systems can become stronger sites of early intervention, upstream prevention, and school-based support for vulnerable youth.")}</div></div></section>
<section class="section section-white"><div class="container"><p class="eyebrow">${esc(tr("Connected work"))}</p><h2>${esc(tr("Publications, media, organizations, and tools."))}</h2>${cards([
    { label: "Publications", title: "Academic publications first", text: "IJOH article, graduate thesis, policy work, and citation-ready references.", href: "/publications/" },
    { label: "Speaking & Media", title: "Talks, workshops, and awareness videos", text: "HOPE Youth Education, teacher training, panels, conferences, and media requests.", href: "/speaking-media/" },
    { label: "Partners", title: "Community and institutional credibility", text: "Dans la rue, Coalition Jeunes+, McGill, Concordia, PolicyWise, Wirkunft, Shiseido, and CAEH.", href: "/community-partnerships/" }
  ], 3)}</div></section>`;
  return layout({ title: "Youth Homelessness Prevention Research | Adriano Battista", description: "Research themes and academic profile for youth homelessness prevention, teacher education, and school-based early intervention.", slug: "/research/", body, locale: activeLocale });
}

function publicationsPage() {
  const articles = publications.map((pub) => ({
    "@context": "https://schema.org",
    "@type": pub.type.includes("Publication") || pub.type.includes("Thesis") ? "ScholarlyArticle" : "CreativeWork",
    headline: pub.title,
    author: { "@type": "Person", name: site.name },
    url: pub.href,
    sameAs: pub.doi || pub.href
  }));
  const body = `${heroPage({ title: "Publications", eyebrow: "Citation-ready research record", description: "Academic publications, graduate thesis work, policy reports, media, awards, and citation-ready records.", summary: "Academic records appear first, followed by thesis, policy, media, and resource work." })}
<section class="section section-white"><div class="container grid grid-2">${publications
    .map(
      (pub) => `<article class="card"><p class="label">${esc(tr(pub.type))}</p><h3>${esc(tr(pub.title))}</h3><p>${esc(tr(pub.summary))}</p><div class="callout"><strong>${esc(tr("APA 7"))}</strong><br>${esc(pub.citation)}</div><a class="card-link" href="${pub.href}" target="_blank" rel="noreferrer">${esc(tr("Open source"))}</a></article>`
    )
    .join("")}</div></section>
<section class="section section-pale"><div class="container">${cards([
    { label: "Research", title: "Research themes", text: "Connect publications back to research themes and current doctoral work.", href: "/research/" },
    { label: "What Works", title: "Model comparison", text: "Connect cited scholarship to prevention models and school-community systems.", href: "/what-works/" }
  ], 2)}</div></section>`;
  return layout({ title: "Research Publications and Thesis | Adriano Battista", description: "Citation-ready academic publications, graduate thesis, forthcoming policy work, media, and awards.", slug: "/publications/", body, schema: articles, locale: activeLocale });
}

function inPlainSightPage() {
  const body = `${heroPage({ title: "In Plain Sight", eyebrow: "The crisis starts before the streets", description: "Youth homelessness often begins before adulthood. The timing, care-system pathways, and housing pressures show why earlier intervention matters.", summary: "This page presents the scale and timing of the problem, not the full prevention solution." })}
<section class="section section-white"><div class="container grid grid-4">${dataPoints.map(statCard).join("")}</div></section>
<section class="section section-pale"><div class="container split"><aside class="callout"><strong>${esc(tr("Core implication"))}</strong><p>${esc(tr("If homelessness often begins while young people are still school-aged, the problem cannot be understood only through shelters, housing systems, or adult crisis services."))}</p></aside><article class="page-content">
<h2>${esc(tr("Youth homelessness starts earlier than many people think"))}</h2>
${paragraph("Young people may still be attending school while experiencing hidden homelessness, family violence, housing instability, poverty, untreated distress, or difficult transitions out of care. They may not yet use homelessness services. They may not identify as homeless. They may not tell an adult what is happening.")}
<h2>${esc(tr("Child protection, mental health, and service gaps"))}</h2>
${paragraph("Youth homelessness is deeply connected to child protection, mental health, and service-system gaps. The statistics above show that many young people are already known to public systems before homelessness becomes visible. The moral and policy problem is not that no one ever saw them. It is that seeing did not always become coordinated support.")}
<h2>${esc(tr("Why schools appear in the data"))}</h2>
${paragraph("Schools are one of the few systems that have consistent contact with young people during the period when homelessness risk often first appears. Absenteeism, exhaustion, hunger, withdrawal, behavioural changes, academic decline, instability, and disconnection can all appear in school before a young person enters a formal crisis system.")}
</article></div></section>
<section class="section section-white"><div class="container"><p class="eyebrow">${esc(tr("References"))}</p><h2>${esc(tr("Statistic sources."))}</h2>${referenceList()}</div></section>`;
  return layout({ title: "In Plain Sight | Youth Homelessness Starts Before the Streets", description: "Data-informed page on early youth homelessness risk, child protection, Quebec education outcomes, and why schools matter.", slug: "/in-plain-sight/", body, locale: activeLocale });
}

function whyPreventionPage() {
  const body = `${heroPage({ title: "Why Prevention", eyebrow: "Before crisis", description: "Homelessness is not an identity. It is a situation produced through systems, and prevention asks what could be seen and supported earlier.", summary: "Prevention is primary, secondary, tertiary, upstream, school-based, relational, and policy-driven." })}
<section class="section section-white"><div class="container split"><aside class="callout"><strong>${esc(tr("Prevention question"))}</strong><p>${esc(tr("If youth homelessness often begins while young people are still connected to school, why are schools not positioned more centrally within homelessness prevention?"))}</p></aside><article class="page-content">
<h2>${esc(tr("Homelessness is often visible only after systems have already failed"))}</h2>
${paragraph("Homelessness can be visible, hidden, or present as risk. A young person may be sleeping on a friend’s couch, staying temporarily with relatives, living in a car, moving between unstable places, or remaining in an unsafe home because there is nowhere else to go.")}
<h2>${esc(tr("Schools are sites where precarity is either misrecognized or interrupted"))}</h2>
${paragraph("What becomes visible in school may be absenteeism, exhaustion, hunger, silence, anger, missing work, poor hygiene, lateness, withdrawal, or disengagement. Without training, these signs can be misread as laziness, defiance, lack of motivation, or behavioural failure.")}
${paragraph("When schools are properly equipped, they can become spaces of early recognition, relational care, and coordinated support. This does not mean asking teachers to become social workers. It means ensuring that educators and school systems are prepared to notice early signs of housing instability, respond without stigma, and connect young people to appropriate supports before crisis becomes entrenched.")}
</article></div></section>
<section class="section section-pale"><div class="container"><p class="eyebrow">${esc(tr("Prevention typology"))}</p><h2>${esc(tr("Prevention is a multi-level strategy."))}</h2>${cards(preventionLevels.map((level) => ({ label: "Prevention level", title: level.title, text: level.text })), 3)}</div></section>`;
  return layout({ title: "Why Prevention Matters | Youth Homelessness and Schools", description: "Primary, secondary, tertiary, and upstream youth homelessness prevention explained through schools and education policy.", slug: "/why-prevention/", body, locale: activeLocale });
}

function whatWorksPage() {
  const filters = ["all", "school-based", "community-based", "housing-based", "policy-based", "teacher education", "primary prevention", "secondary prevention", "tertiary prevention"];
  const body = `${heroPage({ title: "What Works", eyebrow: "Prevention models and frameworks", description: "Youth homelessness prevention does not depend on one program, one policy, or one sector. The strongest approaches combine early identification, relational support, school-community coordination, family and natural supports, housing stability, and policy alignment.", summary: "Use the filters to compare prevention approaches and open each model page for source-linked context." })}
<section class="section section-white"><div class="container">
  <div class="callout compact-disclaimer"><strong>${esc(tr("Informational note"))}</strong><p>${esc(tr("This page is informational and educational only. Please review the linked sources and confirm decisions with qualified professionals, local services, and appropriate organizations."))}</p></div>
  <div class="model-filter">${filters.map((filter, index) => `<button class="${index === 0 ? "active" : ""}" data-model-filter="${filter}">${esc(tr(filter))}</button>`).join("")}</div>
  <div class="grid grid-3">${models.map((model) => `<article class="card" data-model-card data-tags="${esc(model.tags.join(" "))}"><p class="label">${esc(tr(model.label))}</p><h3>${esc(tr(model.title))}</h3><p>${esc(tr(model.summary))}</p><a class="card-link" href="${linkHref(`/what-works/${model.slug}/`)}">${esc(tr("Open model page"))}</a></article>`).join("")}</div>
</div></section>`;
  return layout({ title: "What Works in Youth Homelessness Prevention | COSS Upstream Reconnect HF4Y", description: "Compare COSS, Reconnect, Upstream, Family and Natural Supports, HF4Y, McKinney-Vento, Washington SB 6560, Duty to Assist, breakfast programs, and critical pedagogy.", slug: "/what-works/", body, locale: activeLocale });
}

function modelPage(model) {
  const body = `${heroPage({ title: model.title, eyebrow: model.label, description: model.summary, summary: `${tr("Source:")} ${tr(model.source[0])}` })}
<section class="section section-white"><div class="container split"><aside class="callout"><strong>${esc(tr("Informational note"))}</strong><p>${esc(tr(disclaimer))}</p><p><a href="${model.source[1]}" target="_blank" rel="noreferrer">${esc(tr("Open original source"))}</a></p></aside><article class="page-content">${model.sections.map(([title, text]) => `<h2>${esc(tr(title))}</h2>${paragraph(text)}`).join("")}</article></div></section>
<section class="section section-pale"><div class="container">${cards([
    { label: "Related research", title: "Publications", text: "Connect this model back to publications and thesis work.", href: "/publications/" },
    { label: "Teaching and training", title: "Teaching Portfolio", text: "Connect this model to pre-service teacher education and staff training.", href: "/teaching-portfolio/" },
    { label: "Community partners", title: "Community Partnerships", text: "Connect this model to school-community implementation partners.", href: "/community-partnerships/" }
  ], 3)}</div></section>`;
  return layout({ title: modelSeoTitle(model), description: model.summary, slug: `/what-works/${model.slug}/`, body, locale: activeLocale });
}

function needHelpPage() {
  const body = `${heroPage({ title: "Need Help?", eyebrow: "Support resources", description: "That’s okay. So did I at one point. These resources are meant to help people in crisis find a safer next step.", summary: "If you or someone else is in immediate danger, call 911 now. Always confirm details directly with official providers." })}
<section class="section section-white"><div class="container"><div class="callout"><strong>${esc(tr("Important disclaimer"))}</strong><p>${esc(tr(disclaimer))}</p><p>${esc(tr("These resources are meant to help people in crisis, but always consult with a professional or official service."))}</p></div></div></section>
<section class="section section-pale"><div class="container grid grid-2">${helpResources.map(([title, category, text, age, phone, extra, href, action]) => `<article class="resource-card"><div><p class="label">${esc(tr(category))}</p><h3>${esc(tr(title))}</h3><p>${esc(tr(text))}</p>${age ? `<p><strong>${esc(tr(age))}</strong></p>` : ""}${phone ? `<p><strong>${esc(tr("Call:"))}</strong> ${esc(phone)}</p>` : ""}${extra ? `<p><strong>${esc(tr(extra))}</strong></p>` : ""}<p><strong>${esc(tr("What to do:"))}</strong> ${esc(tr(action))}</p><a class="card-link" href="${href}" target="_blank" rel="noreferrer">${esc(tr("Open resource"))}</a></div>${qrBox(href, title)}</article>`).join("")}</div></section>
<section class="section section-white"><div class="container">${cards([
    { label: "Additional resource", title: "A Way Home Canada", text: "National movement to prevent and end youth homelessness.", href: "https://awayhome.ca" },
    { label: "Additional resource", title: "Canadian Observatory on Homelessness", text: "Research and knowledge mobilization on homelessness in Canada.", href: "https://www.homelesshub.ca/about-us/about-coh" },
    { label: "Additional resource", title: "Homeless Hub", text: "Research summaries, toolkits, and public education resources.", href: "https://homelesshub.ca" }
  ], 3)}</div></section>`;
  return layout({ title: "Need Help? Quebec Youth Shelter Mental Health and Crisis Resources", description: "Youth-friendly crisis and support resources with phone numbers, QR codes, and official links for Quebec and Canada.", slug: "/need-help/", body, locale: activeLocale });
}

function toolkitPage() {
  const bookSchema = books.map(([, title, description, href]) => ({
    "@context": "https://schema.org",
    "@type": "Book",
    name: tr(title),
    author: { "@type": "Person", name: site.name },
    description: tr(description),
    url: href
  }));
  const body = `${heroPage({ title: "Toolkit & Books", eyebrow: "Academic resources and books", description: "Teacher resources, the Freirean toolkit, plant science education, puzzle books, and community resilience.", summary: "The Freirean Teacher Toolkit is the primary education-resource product on this site." })}
<section class="section section-white"><div class="container split"><aside class="callout"><strong>${esc(tr("Toolkit question"))}</strong><p>${esc(tr("How do you support students experiencing homelessness, when no one trained you for it?"))}</p><p>${esc(tr("This comprehensive, classroom-ready guide is here to fill that gap. Complete French-language edition included: Trousse de prévention transformative de l’itinérance jeunesse pour les enseignants Freiriens."))}</p></aside><div class="grid">${books.map(([group, title, description, href, second]) => `<article class="card"><p class="label">${esc(tr(group))}</p><h3>${esc(tr(title))}</h3><p>${esc(tr(description))}</p><a class="card-link" href="${href}" target="_blank" rel="noreferrer">${esc(tr("Amazon paperback"))}</a>${second ? `<a class="card-link" href="${second}" target="_blank" rel="noreferrer">${esc(tr("Ebook version"))}</a>` : ""}</article>`).join("")}</div></div></section>`;
  return layout({ title: "Freirean Teacher Toolkit and Books | Adriano Battista", description: "Teacher resources, Freirean youth homelessness prevention toolkit, gardening book, and puzzle books.", slug: "/toolkit-books/", body, schema: bookSchema, locale: activeLocale });
}

function partnershipsPage() {
  const body = `${heroPage({ title: "Community Partnerships", eyebrow: "Reputation and credibility", description: "Prevention work is collective. This page links research, universities, organizations, youth-led coalitions, community partners, and school-community initiatives.", summary: "External organization links help readers trace the work from scholarship to institutions, media, and community." })}
<section class="section section-white"><div class="container">${cards(partners.map(([title, href]) => ({ label: "Partner / organization", title, text: "External organization or public profile connected to prevention, education, research, or community work.", href })), 3)}</div></section>
<section class="section section-pale"><div class="container split"><aside class="callout"><strong>${esc(tr("Coalition Jeunes+"))}</strong><p>${esc(tr("Le Comité de pilotage brings together community leadership, youth with experiential knowledge of homelessness, coalitions, and scientists to define orientations and support the action plan."))}</p></aside><div>${cards([
    { label: "Dans la rue", title: "Community centre volunteer work", text: "Volunteer work with the Dans la rue community centre.", href: "https://danslarue.org/wp-content/uploads/2024/06/dans-la-rue-annual-report-22-23.pdf" },
    { label: "Emmett Johns Street School", title: "Volunteer teacher work", text: "Volunteer teacher work with Emmett Johns Street School.", href: "https://www.linkedin.com/posts/adriano-bats-battista_l%C3%A9cole-dans-la-rue-activity-7160254393852813312-gdPw/" }
  ], 1)}</div></div></section>`;
  return layout({ title: "Community Partnerships | Adriano Battista Youth Homelessness Prevention", description: "Partnership and organization links for youth homelessness prevention research, schools, and community-based work.", slug: "/community-partnerships/", body, locale: activeLocale });
}

function speakingPage() {
  const body = `${heroPage({ title: "Speaking & Media", eyebrow: "Public education", description: "A page for universities, organizations, school boards, media, and community partners reviewing speaking, training, workshops, panels, podcasts, and awareness work.", summary: "HOPE Youth Education awareness videos, teacher resources, toolkit work, conferences, panels, workshops, and media requests belong here." })}
<section class="section section-white"><div class="container">${cards([
    { label: "HOPE Youth Education", title: "Awareness videos and teacher resources", text: "Awareness videos, teacher resources, toolkit development, and school-community prevention work with school-board, community, and private-sector partners." },
    { label: "Speaking", title: "Conference presentations and guest lecturing", text: "Conference talks and invited university teaching, including at uO, on youth homelessness prevention, education policy, and critical pedagogy." },
    { label: "Training", title: "Workshops and teacher training", text: "Workshops for educators and school staff on hidden homelessness, trauma-informed practice, and referral pathways." },
    { label: "Award / Media", title: "Paula Goering Memorial Scholarship", text: "Recognition connected to youth homelessness prevention research and community-engaged scholarship.", href: "https://www.youtube.com/watch?v=8sGvk6HRd68" },
    { label: "Media", title: "Podcast and media appearances", text: "Public-facing conversations about prevention, schools, and education systems." }
  ], 2)}</div></section>
<section class="section section-pale"><div class="container"><div class="callout"><strong>${esc(tr("Booking and media requests"))}</strong><p>${esc(tr("Use the email in the footer for speaking, consulting, policy advising, teacher training, media requests, and partnerships."))}</p></div></div></section>`;
  return layout({ title: "Speaking Media and Teacher Training | Adriano Battista", description: "Speaking, media, panels, workshops, and teacher training connected to youth homelessness prevention.", slug: "/speaking-media/", body, locale: activeLocale });
}

function teachingPage() {
  const body = `${heroPage({ title: "Teaching Portfolio", eyebrow: "Academic portfolio and teaching credentials", description: "Teaching philosophy, courses, mentorship, and teacher education work connected to youth homelessness prevention and critical pedagogy.", summary: "This page strengthens the academic profile by showing pedagogical expertise alongside research output." })}
<section class="section section-white"><div class="container split"><aside class="callout teaching-philosophy"><strong>${esc(tr("Teaching Philosophy"))}</strong>${teachingPhilosophy.map(paragraph).join("")}</aside><div>${cards([
    { label: "Courses taught", title: "Physical and Health Education", text: "Teaching in Montréal with students facing learning difficulties, language barriers, and social vulnerability." },
    { label: "Courses taught", title: "English Language Arts", text: "Taught at Emmett Johns Street School, serving homeless and precarious youth." },
    { label: "Courses taught", title: "L’école peut-elle vraiment prévenir l’itinérance?", text: "Enseigné à uO." },
    { label: "Teacher education", title: "Pre-service teacher training", text: "Research and training focused on poverty, trauma, housing instability, youth homelessness, and school-based early intervention." },
    { label: "Mentorship", title: "Student mentorship and public education", text: "Mentorship, public education, and teaching connected to youth homelessness prevention and critical pedagogy." }
  ], 1)}</div></div></section>`;
  return layout({ title: "Teaching Portfolio | Teacher Education and Prevention | Adriano Battista", description: "Teaching philosophy, courses taught, syllabi, mentorship, and teacher training connected to youth homelessness prevention.", slug: "/teaching-portfolio/", body, locale: activeLocale });
}

function accessibilityPage() {
  const body = `${heroPage({ title: "Accessibility", eyebrow: "Care and inclusion", description: "This site is designed to be readable, keyboard-accessible, youth-friendly, and trauma-informed.", summary: "The site uses simple navigation, clear labels, alt text, and full English/French language access." })}
<section class="section section-white"><div class="container page-content"><h2>${esc(tr("Accessibility statement"))}</h2>${paragraph("The site keeps readable headings, keyboard-accessible navigation, alt text for images, clear labels, and plain-language support prompts. Videos should include transcripts before public launch.")}<h2>${esc(tr("Language access"))}</h2>${paragraph("English is the default site language and French is the secondary locale. Each page has a matching French URL, localized navigation, localized metadata, and alternate-language SEO links.")}</div></section>`;
  return layout({ title: "Accessibility Statement | Adriano Battista Research Hub", description: "Accessibility and inclusivity statement for the youth homelessness prevention research hub.", slug: "/accessibility/", body, locale: activeLocale });
}

async function writePage(slug, html) {
  const file = pagePath(slug);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

function renderLocale(locale, renderer, ...args) {
  activeLocale = locale;
  return renderer(...args);
}

const staticPages = [
  ["/", home],
  ["/research/", researchPage],
  ["/publications/", publicationsPage],
  ["/in-plain-sight/", inPlainSightPage],
  ["/why-prevention/", whyPreventionPage],
  ["/what-works/", whatWorksPage],
  ["/need-help/", needHelpPage],
  ["/toolkit-books/", toolkitPage],
  ["/community-partnerships/", partnershipsPage],
  ["/speaking-media/", speakingPage],
  ["/teaching-portfolio/", teachingPage],
  ["/accessibility/", accessibilityPage]
];

const baseSlugs = [
  ...staticPages.map(([slug]) => slug),
  ...models.map((model) => `/what-works/${model.slug}/`)
];

function sitemapUrl(slug) {
  const alternateLinks = locales
    .map((locale) => `<xhtml:link rel="alternate" hreflang="${locale.code}" href="${urlFor(localizePath(locale.code, slug))}" />`)
    .concat(`<xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(localizePath(defaultLocale, slug))}" />`)
    .join("");
  return `<url><loc>${urlFor(localizePath(defaultLocale, slug))}</loc>${alternateLinks}</url>`;
}

function notFoundPage(locale) {
  return renderLocale(
    locale,
    () =>
      layout({
        title: "Page Not Found | Adriano Battista",
        description: "The requested page could not be found. Return to the youth homelessness prevention research hub.",
        slug: "/404.html",
        body: heroPage({ title: "Page Not Found", eyebrow: "404", description: "This page may have moved in the v4 rebuild.", summary: "Return to the research hub homepage." }),
        locale
      })
  );
}

async function main() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(join(outDir, "assets/css"), { recursive: true });
  await mkdir(join(outDir, "assets/js"), { recursive: true });
  await mkdir(join(outDir, "assets/img"), { recursive: true });
  await copyFile("src/styles.css", join(outDir, "assets/css/styles.css"));
  await copyFile("src/site.js", join(outDir, "assets/js/site.js"));
  await copyFile("public/assets/img/adriano-battista-speaker.jpg", join(outDir, "assets/img/adriano-battista-speaker.jpg"));
  await copyFile("public/assets/img/favicon.svg", join(outDir, "assets/img/favicon.svg"));

  for (const locale of locales) {
    for (const [slug, renderer] of staticPages) {
      await writePage(localizePath(locale.code, slug), renderLocale(locale.code, renderer));
    }
    for (const model of models) {
      const slug = `/what-works/${model.slug}/`;
      await writePage(localizePath(locale.code, slug), renderLocale(locale.code, modelPage, model));
    }
  }

  await writeFile(join(outDir, "404.html"), notFoundPage(defaultLocale));
  await mkdir(join(outDir, "fr"), { recursive: true });
  await writeFile(join(outDir, "fr", "404.html"), notFoundPage("fr"));

  await writeFile(
    join(outDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${baseSlugs.map(sitemapUrl).join("")}</urlset>`
  );
  await writeFile(join(outDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.baseUrl}/sitemap.xml\n`);
}

main();
