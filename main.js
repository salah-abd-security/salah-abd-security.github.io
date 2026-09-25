/* =========================================================
   Portfolio Salahadine — moteur de rendu
   Toutes les pages publiques lisent content.json et se
   redessinent avec ces fonctions. L'admin (admin.js) édite
   le même fichier.
========================================================= */

const NAV_LINKS = [
  { href: "index.html", key: "home", fr: "Accueil", en: "Home" },
  { href: "about.html", key: "about", fr: "À propos", en: "About" },
  { href: "projects.html", key: "projects", fr: "Projets", en: "Projects" },
  { href: "certifications.html", key: "certifications", fr: "Certifications", en: "Certifications" },
  { href: "skills.html", key: "skills", fr: "Compétences", en: "Skills" },
  { href: "blog.html", key: "blog", fr: "Actualités", en: "News" }
];

function getLang() {
  return localStorage.getItem("lang") || "fr";
}

function t(field, lang) {
  if (field == null) return "";
  if (typeof field === "string") return field;
  return field[lang] ?? field.fr ?? "";
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

function buildHeader(activeKey, profile, lang) {
  const header = el("header", { class: "site-header" });
  const wrap = el("div", { class: "wrap" });

  const brand = el("a", { href: "index.html", class: "brand" }, [
    el("img", { src: profile.photo, alt: profile.name }),
    profile.name
  ]);

  const toggle = el("button", { class: "menu-toggle", "aria-label": "Menu", id: "menuToggle", html: "&#9776;" });

  const nav = el("nav", { class: "nav-menu", id: "navMenu" },
    NAV_LINKS.map(link =>
      el("a", { href: link.href, class: link.key === activeKey ? "active" : "" }, t(link, lang))
    )
  );

  const actions = el("div", { class: "header-actions" }, [
    el("div", { class: "lang-switch" }, [
      el("button", { id: "langFr", class: lang === "fr" ? "active" : "" }, "FR"),
      el("button", { id: "langEn", class: lang === "en" ? "active" : "" }, "EN")
    ]),
    el("a", { href: profile.cv, class: "btn btn-primary btn-sm", download: "" },
      lang === "fr" ? "CV" : "Resume")
  ]);

  wrap.append(brand, toggle, nav, actions);
  header.append(wrap);
  return header;
}

function buildFooter(lang) {
  const footer = el("footer");
  footer.append(el("div", { class: "wrap" }, [
    el("span", {}, `© 2026 Salahadine Abdassama`),
    el("span", {}, lang === "fr" ? "Analyste cybersécurité, SOC et Blue Team" : "Cybersecurity Analyst, SOC & Blue Team"),
    el("a", { href: "admin.html" }, lang === "fr" ? "Admin" : "Admin")
  ]));
  return footer;
}

function wireChrome(data, activeKey) {
  const lang = getLang();
  document.getElementById("headerSlot").replaceWith(buildHeader(activeKey, data.profile, lang));
  document.getElementById("footerSlot").replaceWith(buildFooter(lang));

  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("navMenu").classList.toggle("active");
  });
  document.getElementById("langFr").addEventListener("click", () => { localStorage.setItem("lang", "fr"); location.reload(); });
  document.getElementById("langEn").addEventListener("click", () => { localStorage.setItem("lang", "en"); location.reload(); });
}

async function loadContent() {
  const res = await fetch("content.json", { cache: "no-store" });
  return res.json();
}

/* ---------------- Page renderers ---------------- */

function renderHome(data, lang) {
  const p = data.profile;
  const hero = document.getElementById("hero-slot");
  hero.innerHTML = "";
  hero.append(el("section", { class: "hero" }, [
    el("div", { class: "wrap hero-grid" }, [
      el("div", {}, [
        el("span", { class: "eyebrow-tag" }, [el("span", { class: "dot" }), lang === "fr" ? "Disponible pour un poste SOC" : "Open to SOC roles"]),
        el("h1", { text: t(p.headline, lang) }),
        el("p", { class: "lead", text: t(p.lead, lang) }),
        el("div", { class: "hero-actions" }, [
          el("a", { href: "projects.html", class: "btn btn-primary" }, lang === "fr" ? "Voir les études de cas" : "See the case studies"),
          el("a", { href: "certifications.html", class: "btn btn-outline" }, lang === "fr" ? "Mes certifications" : "My certifications")
        ]),
        el("div", { class: "hero-links" }, [
          el("a", { href: p.github }, "GitHub"),
          el("a", { href: p.linkedin }, "LinkedIn"),
          el("a", { href: `mailto:${p.email}` }, p.email)
        ])
      ]),
      buildConsole(data.projects.find(x => x.featured) || data.projects[0], lang)
    ])
  ]));

  renderProjects(data, lang, true);

  const certSection = document.getElementById("certs-preview-slot");
  certSection.innerHTML = "";
  const count = data.certifications.length;
  certSection.append(el("section", { class: "section-alt" }, [
    el("div", { class: "wrap" }, [
      el("div", { class: "section-head" }, [
        el("h2", { text: lang === "fr" ? "Certifications" : "Certifications" }),
        el("p", {}, [
          `${count} ` + (lang === "fr" ? "certifications professionnelles, toutes vérifiables en ligne. " : "professional certifications, all verifiable online. "),
          el("a", { href: "certifications.html" }, lang === "fr" ? "Voir le détail →" : "See details →")
        ])
      ]),
      el("div", { class: "tag-row" }, data.certifications.map(c => el("span", { class: "tag-light" }, `${c.issuer} — ${t(c.name, lang)}`)))
    ])
  ]));

  const aboutTeaser = document.getElementById("about-teaser-slot");
  aboutTeaser.innerHTML = "";
  aboutTeaser.append(el("section", {}, [
    el("div", { class: "wrap about-layout" }, [
      el("img", { class: "about-photo", src: p.photo, alt: p.name }),
      el("div", { class: "about-text" }, [
        el("h2", { text: lang === "fr" ? "À propos" : "About" }),
        el("p", { text: t(p.about[0], lang) }),
        el("div", { class: "contact-row" }, [
          el("a", { href: "about.html", class: "btn btn-outline" }, lang === "fr" ? "En savoir plus" : "Read more"),
          el("a", { href: `mailto:${p.email}`, class: "btn btn-primary" }, lang === "fr" ? "Me contacter" : "Contact me")
        ])
      ])
    ])
  ]));
}

function buildConsole(project, lang) {
  const console_ = el("div", { class: "console" });
  const head = el("div", { class: "console-head" }, [
    el("h3", { text: lang === "fr" ? `Dossier : ${t(project.title, lang)}` : `Case file: ${t(project.title, lang)}` }),
    el("span", { class: "pill" }, lang === "fr" ? "Résolu" : "Resolved")
  ]);
  const stepsWrap = el("div", { class: "console-steps" });
  project.sections.forEach((s, i) => {
    const btn = el("button", { class: "console-step" + (i === 0 ? " open" : "") }, [
      el("span", { class: "step-dot" }, String(i + 1)),
      el("span", { class: "step-body" }, [
        el("span", { class: "step-label" }, t(s.title, lang)),
        el("span", { class: "step-detail" }, t(s.text, lang))
      ])
    ]);
    btn.addEventListener("click", () => {
      stepsWrap.querySelectorAll(".console-step").forEach(b => b.classList.remove("open"));
      btn.classList.add("open");
    });
    if (i !== 0) btn.querySelector(".step-detail").style.display = "none";
    stepsWrap.appendChild(btn);
  });
  // toggle detail visibility along with "open" class
  stepsWrap.querySelectorAll(".console-step").forEach(btn => {
    btn.addEventListener("click", () => {
      stepsWrap.querySelectorAll(".step-detail").forEach(d => d.style.display = "none");
      btn.querySelector(".step-detail").style.display = "block";
    });
  });
  const foot = el("div", { class: "console-foot" }, [
    el("span", {}, project.tools),
    el("a", { href: project.page }, lang === "fr" ? "Ouvrir l'étude de cas" : "Open the case study")
  ]);
  console_.append(head, stepsWrap, foot);
  return console_;
}

function renderProjects(data, lang, isPreview) {
  const slot = document.getElementById("projects-slot");
  slot.innerHTML = "";
  const featured = data.projects.find(p => p.featured) || data.projects[0];
  const rest = data.projects.filter(p => p !== featured);

  const featureCard = el("article", { class: "project-feature" }, [
    el("div", {}, [
      el("h3", { text: t(featured.title, lang) }),
      el("p", { text: t(featured.summary, lang) })
    ]),
    el("div", {}, [
      el("div", { class: "tag-row" }, featured.tags.map(tag => el("span", { class: "tag" }, tag))),
      el("div", { class: "project-meta" }, [
        el("span", {}, featured.tools),
        el("a", { href: featured.page }, lang === "fr" ? "Lire l'étude de cas" : "Read the case study")
      ])
    ])
  ]);

  const list = el("div", { class: "project-list" }, rest.map(p =>
    el("article", { class: "project-card" }, [
      el("div", {}, [
        el("h3", { text: t(p.title, lang) }),
        el("p", { text: t(p.summary, lang) })
      ]),
      el("div", { class: "card-meta" }, [
        el("span", {}, p.tools),
        el("a", { href: p.page }, lang === "fr" ? "Lire l'étude de cas" : "Read the case study")
      ])
    ])
  ));

  slot.append(el("section", {}, [
    el("div", { class: "wrap" }, [
      el("div", { class: "section-head" }, [
        el("h2", { text: lang === "fr" ? "Études de cas" : "Case studies" }),
        isPreview
          ? el("p", {}, [lang === "fr" ? "Trois investigations pratiques. " : "Three hands-on investigations. ", el("a", { href: "projects.html" }, lang === "fr" ? "Voir toutes les études de cas →" : "See all case studies →")])
          : el("p", { text: lang === "fr" ? "Trois investigations pratiques, de la détection à la remédiation." : "Three hands-on investigations, from detection to remediation." })
      ]),
      el("div", { class: "projects-layout" }, [featureCard, list])
    ])
  ]));
}

function renderProjectDetail(data, lang) {
  const id = document.body.getAttribute("data-project-id");
  const project = data.projects.find(p => p.id === id);
  const slot = document.getElementById("detail-slot");
  slot.innerHTML = "";
  if (!project) return;
  document.title = `${t(project.title, lang)} – Salahadine Abdassama`;

  slot.append(
    el("section", { class: "detail-hero" }, [
      el("div", { class: "wrap" }, [
        el("h1", { text: t(project.title, lang) }),
        el("p", { class: "lead", text: t(project.summary, lang) }),
        el("div", { class: "tag-row" }, project.tags.map(tag => el("span", { class: "tag-light" }, tag)))
      ])
    ]),
    el("section", {}, [
      el("div", { class: "wrap detail-grid" }, [
        el("div", { class: "detail-steps" }, project.sections.map((s, i) =>
          el("div", { class: "detail-step" }, [
            el("div", { class: "step-num" }, String(i + 1)),
            el("div", { class: "detail-step-body" }, [
              el("h3", { text: `${s.icon} ${t(s.title, lang)}` }),
              el("p", { text: t(s.text, lang) })
            ])
          ])
        )),
        el("aside", { class: "side-card" }, [
          el("h4", { text: lang === "fr" ? "Niveau" : "Level" }),
          el("p", { text: t(project.level, lang) }),
          el("h4", { text: lang === "fr" ? "Outils" : "Tools" }),
          el("p", { text: project.tools }),
          el("h4", { text: lang === "fr" ? "Livrables" : "Deliverables" }),
          el("div", {}, project.deliverables.map(d =>
            el("a", { class: "deliverable", href: d.file, download: "" }, `📄 ${t(d.label, lang)}`)
          ))
        ])
      ])
    ])
  );
}

function renderCertifications(data, lang) {
  const slot = document.getElementById("certs-slot");
  slot.innerHTML = "";
  slot.append(el("section", {}, [
    el("div", { class: "wrap cert-hero" }, [
      el("div", {}, [
        el("h2", { text: lang === "fr" ? "Certifications" : "Certifications" }),
        el("div", { class: "cert-count", text: String(data.certifications.length) }),
        el("p", { text: lang === "fr" ? "Toutes vérifiables en ligne auprès de l'organisme émetteur, avec le PDF à télécharger." : "All verifiable online with the issuing body, PDF included." })
      ]),
      el("div", { class: "cert-list" }, data.certifications.map(c =>
        el("div", { class: "cert-row" }, [
          el("div", { class: "cert-issuer", text: c.issuer }),
          el("div", { class: "cert-body" }, [
            el("h3", { text: t(c.name, lang) }),
            el("p", { text: t(c.focus, lang) })
          ]),
          el("div", { class: "cert-actions" }, [
            el("a", { href: c.verify, target: "_blank", rel: "noopener" }, lang === "fr" ? "Vérifier" : "Verify"),
            el("a", { href: c.pdf, download: "" }, "PDF")
          ])
        ])
      ))
    ])
  ]));
}

function renderSkills(data, lang) {
  const slot = document.getElementById("skills-slot");
  slot.innerHTML = "";
  slot.append(el("section", { class: "section-dark" }, [
    el("div", { class: "wrap" }, [
      el("h2", { text: lang === "fr" ? "Compétences et outils" : "Skills and tools" }),
      el("div", { class: "skills-grid", style: "margin-top:44px" }, data.skills.groups.map(g =>
        el("div", { class: "skill-group" }, [
          el("h3", { text: t(g.title, lang) }),
          el("ul", {}, g.items.map(it => el("li", { text: t(it, lang) })))
        ])
      )),
      el("div", { class: "tools-row" }, data.skills.tools.map(tool => el("span", { class: "tool-pill mono" }, tool)))
    ])
  ]));
}

function renderAbout(data, lang) {
  const slot = document.getElementById("about-slot");
  slot.innerHTML = "";
  const p = data.profile;
  slot.append(el("section", {}, [
    el("div", { class: "wrap about-layout" }, [
      el("img", { class: "about-photo", src: p.photo, alt: p.name }),
      el("div", { class: "about-text" }, [
        el("h2", { text: lang === "fr" ? "À propos" : "About" }),
        ...p.about.map(par => el("p", { text: t(par, lang) })),
        el("div", { class: "contact-row" }, [
          el("a", { href: `mailto:${p.email}`, class: "btn btn-primary" }, lang === "fr" ? "Me contacter" : "Contact me"),
          el("a", { href: p.linkedin, class: "btn btn-outline" }, "LinkedIn")
        ])
      ])
    ])
  ]));
}

function renderBlog(data, lang) {
  const slot = document.getElementById("blog-slot");
  slot.innerHTML = "";
  slot.append(el("section", {}, [
    el("div", { class: "wrap" }, [
      el("div", { class: "section-head" }, [
        el("h2", { text: lang === "fr" ? "Actualités" : "News" }),
        el("p", { text: lang === "fr" ? "Avancement des projets et analyses SOC." : "Project progress and SOC write-ups." })
      ]),
      el("div", { style: "display:flex;flex-direction:column;gap:20px" }, data.news.map(n =>
        el("article", { class: "blog-card" }, [
          el("h3", { text: t(n.title, lang) }),
          el("p", { text: t(n.text, lang) }),
          el("a", { href: n.url, target: "_blank", rel: "noopener" }, lang === "fr" ? "Consulter sur Notion →" : "Read on Notion →")
        ])
      ))
    ])
  ]));
}

/* ---------------- Boot ---------------- */

document.addEventListener("DOMContentLoaded", async () => {
  const data = await loadContent();
  const lang = getLang();
  const page = document.body.getAttribute("data-page");
  wireChrome(data, page);

  if (page === "home") renderHome(data, lang);
  if (page === "projects") renderProjects(data, lang);
  if (page === "project") renderProjectDetail(data, lang);
  if (page === "certifications") renderCertifications(data, lang);
  if (page === "skills") renderSkills(data, lang);
  if (page === "about") renderAbout(data, lang);
  if (page === "blog") renderBlog(data, lang);
});
