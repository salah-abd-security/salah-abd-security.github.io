/* =========================================================
   Espace admin — édite content.json dans le navigateur.
   Brouillon persistant en localStorage ; "Télécharger" exporte
   le fichier final à remplacer dans le dépôt GitHub.
========================================================= */

const DRAFT_KEY = "portfolio-admin-draft";
const ADMIN_PASSWORD_HASH = "7f6e667ead5e1fde7824350722b1cc4bfff9a34fbf9c8a79d591c005ee069f34";
const SESSION_KEY = "portfolio-admin-unlocked";
let state = null;
let originalFetched = null;

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function wireGate() {
  const gate = document.getElementById("adminGate");
  const shell = document.getElementById("adminShell");
  const input = document.getElementById("gatePassword");
  const error = document.getElementById("gateError");

  async function tryUnlock() {
    const hash = await sha256Hex(input.value);
    if (hash === ADMIN_PASSWORD_HASH) {
      sessionStorage.setItem(SESSION_KEY, "1");
      gate.style.display = "none";
      shell.style.display = "block";
      boot();
    } else {
      error.textContent = "Mot de passe incorrect.";
      input.value = "";
      input.focus();
    }
  }

  document.getElementById("gateSubmit").addEventListener("click", tryUnlock);
  input.addEventListener("keydown", e => { if (e.key === "Enter") tryUnlock(); });

  if (sessionStorage.getItem(SESSION_KEY) === "1") {
    gate.style.display = "none";
    shell.style.display = "block";
    boot();
  } else {
    input.focus();
  }
}

function uid() { return Math.random().toString(36).slice(2, 9); }

function showStatus(msg) {
  const s = document.getElementById("status");
  s.textContent = msg;
  s.classList.add("show");
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => s.classList.remove("show"), 1600);
}

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  showStatus("Brouillon enregistré (local)");
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  return node;
}

function field(labelText, value, onChange, multiline) {
  const input = el(multiline ? "textarea" : "input", { value: multiline ? undefined : value });
  if (multiline) input.value = value || "";
  input.addEventListener("input", () => { onChange(input.value); saveDraft(); });
  return el("div", { class: "admin-field" }, [el("label", { text: labelText }), input]);
}

function biField(labelBase, biObj, onChangeFr, onChangeEn, multiline) {
  return el("div", { class: "admin-row2" }, [
    field(`${labelBase} (FR)`, biObj.fr, onChangeFr, multiline),
    field(`${labelBase} (EN)`, biObj.en, onChangeEn, multiline)
  ]);
}

function removeBtn(onClick, label) {
  return el("button", { class: "btn-danger", onclick: onClick, type: "button" }, label || "Supprimer");
}

/* ---------------- Profil & À propos ---------------- */

function renderProfile() {
  const p = state.profile;
  const panel = document.getElementById("panel-profile");
  panel.innerHTML = "";

  panel.append(
    field("Nom", p.name, v => p.name = v),
    biField("Rôle", p.role, v => p.role.fr = v, v => p.role.en = v),
    biField("Titre d'accueil (headline)", p.headline, v => p.headline.fr = v, v => p.headline.en = v),
    biField("Texte d'accueil (lead)", p.lead, v => p.lead.fr = v, v => p.lead.en = v, true),
    el("div", { class: "admin-row2" }, [
      field("Email", p.email, v => p.email = v),
      field("GitHub (URL)", p.github, v => p.github = v)
    ]),
    el("div", { class: "admin-row2" }, [
      field("LinkedIn (URL)", p.linkedin, v => p.linkedin = v),
      field("Chemin du CV", p.cv, v => p.cv = v)
    ]),
    field("Chemin de la photo", p.photo, v => p.photo = v)
  );

  const aboutWrap = el("div", { class: "sub-list" });
  function drawAbout() {
    aboutWrap.innerHTML = "";
    p.about.forEach((par, i) => {
      aboutWrap.append(el("div", { class: "admin-item" }, [
        el("div", { class: "admin-item-head" }, [
          el("strong", { text: `Paragraphe ${i + 1}` }),
          removeBtn(() => { p.about.splice(i, 1); saveDraft(); drawAbout(); })
        ]),
        biField("Texte", par, v => par.fr = v, v => par.en = v, true)
      ]));
    });
  }
  drawAbout();
  panel.append(el("h3", { text: "À propos — paragraphes", style: "margin-top:8px" }), aboutWrap,
    el("button", { class: "btn btn-outline btn-sm admin-add", onclick: () => { p.about.push({ fr: "", en: "" }); saveDraft(); drawAbout(); } }, "+ Ajouter un paragraphe"));
}

/* ---------------- Projets ---------------- */

function emptyProject() {
  return {
    id: "nouveau-projet-" + uid(),
    page: "project-nouveau.html",
    featured: false,
    title: { fr: "", en: "" },
    summary: { fr: "", en: "" },
    level: { fr: "Débutant", en: "Beginner" },
    tools: "",
    tags: [],
    sections: [],
    deliverables: []
  };
}

function renderProjects() {
  const panel = document.getElementById("panel-projects");
  panel.innerHTML = "";
  const list = el("div", { class: "sub-list" });

  function drawTags(proj, wrap) {
    wrap.innerHTML = "";
    proj.tags.forEach((tag, i) => {
      wrap.append(el("div", { class: "sub-item" }, [
        el("input", { value: tag, oninput: e => { proj.tags[i] = e.target.value; saveDraft(); } }),
        removeBtn(() => { proj.tags.splice(i, 1); saveDraft(); drawTags(proj, wrap); })
      ]));
    });
  }

  function drawSections(proj, wrap) {
    wrap.innerHTML = "";
    proj.sections.forEach((s, i) => {
      wrap.append(el("div", { class: "admin-item" }, [
        el("div", { class: "admin-item-head" }, [
          el("strong", { text: `Étape ${i + 1}` }),
          removeBtn(() => { proj.sections.splice(i, 1); saveDraft(); drawSections(proj, wrap); })
        ]),
        el("div", { class: "admin-row2" }, [
          field("Icône (emoji)", s.icon, v => s.icon = v),
          biField("Titre", s.title, v => s.title.fr = v, v => s.title.en = v)
        ]),
        biField("Texte", s.text, v => s.text.fr = v, v => s.text.en = v, true)
      ]));
    });
  }

  function drawDeliverables(proj, wrap) {
    wrap.innerHTML = "";
    proj.deliverables.forEach((d, i) => {
      wrap.append(el("div", { class: "admin-item" }, [
        el("div", { class: "admin-item-head" }, [
          el("strong", { text: `Livrable ${i + 1}` }),
          removeBtn(() => { proj.deliverables.splice(i, 1); saveDraft(); drawDeliverables(proj, wrap); })
        ]),
        biField("Libellé", d.label, v => d.label.fr = v, v => d.label.en = v),
        field("Chemin du fichier", d.file, v => d.file = v)
      ]));
    });
  }

  function drawProjects() {
    list.innerHTML = "";
    state.projects.forEach((proj, i) => {
      const tagsWrap = el("div", { class: "sub-list" });
      const sectionsWrap = el("div", { class: "sub-list" });
      const deliverablesWrap = el("div", { class: "sub-list" });
      drawTags(proj, tagsWrap);
      drawSections(proj, sectionsWrap);
      drawDeliverables(proj, deliverablesWrap);

      list.append(el("div", { class: "admin-item" }, [
        el("div", { class: "admin-item-head" }, [
          el("strong", { text: t(proj.title.fr) || "Nouveau projet" }),
          removeBtn(() => { state.projects.splice(i, 1); saveDraft(); drawProjects(); }, "Supprimer le projet")
        ]),
        el("div", { class: "admin-row2" }, [
          field("Identifiant (id)", proj.id, v => proj.id = v),
          field("Page HTML associée", proj.page, v => proj.page = v)
        ]),
        biField("Titre", proj.title, v => proj.title.fr = v, v => proj.title.en = v),
        biField("Résumé", proj.summary, v => proj.summary.fr = v, v => proj.summary.en = v, true),
        el("div", { class: "admin-row2" }, [
          field("Outils (texte libre)", proj.tools, v => proj.tools = v),
          biField("Niveau", proj.level, v => proj.level.fr = v, v => proj.level.en = v)
        ]),
        el("label", { class: "admin-field" }, [
          el("span", {}, [
            el("input", { type: "checkbox", ...(proj.featured ? { checked: "checked" } : {}), onchange: e => { proj.featured = e.target.checked; saveDraft(); } }),
            " Mettre en avant sur l'accueil"
          ])
        ]),
        el("h3", { text: "Tags" }), tagsWrap,
        el("button", { class: "btn btn-outline btn-sm admin-add", onclick: () => { proj.tags.push("Nouveau tag"); saveDraft(); drawTags(proj, tagsWrap); } }, "+ Ajouter un tag"),
        el("h3", { text: "Étapes de l'étude de cas", style: "margin-top:10px" }), sectionsWrap,
        el("button", { class: "btn btn-outline btn-sm admin-add", onclick: () => { proj.sections.push({ icon: "🔍", title: { fr: "", en: "" }, text: { fr: "", en: "" } }); saveDraft(); drawSections(proj, sectionsWrap); } }, "+ Ajouter une étape"),
        el("h3", { text: "Livrables", style: "margin-top:10px" }), deliverablesWrap,
        el("button", { class: "btn btn-outline btn-sm admin-add", onclick: () => { proj.deliverables.push({ label: { fr: "", en: "" }, file: "" }); saveDraft(); drawDeliverables(proj, deliverablesWrap); } }, "+ Ajouter un livrable")
      ]));
    });
  }
  drawProjects();
  panel.append(list, el("button", { class: "btn btn-primary admin-add", onclick: () => { state.projects.push(emptyProject()); saveDraft(); drawProjects(); } }, "+ Ajouter un projet"));
}
function t(v) { return v; }

/* ---------------- Certifications ---------------- */

function renderCertifications() {
  const panel = document.getElementById("panel-certifications");
  panel.innerHTML = "";
  const list = el("div", { class: "sub-list" });

  function draw() {
    list.innerHTML = "";
    state.certifications.forEach((c, i) => {
      list.append(el("div", { class: "admin-item" }, [
        el("div", { class: "admin-item-head" }, [
          el("strong", { text: `${c.issuer || "Émetteur"} — ${c.name.fr || "certification"}` }),
          removeBtn(() => { state.certifications.splice(i, 1); saveDraft(); draw(); })
        ]),
        el("div", { class: "admin-row2" }, [
          field("Émetteur", c.issuer, v => c.issuer = v),
          field("Lien de vérification", c.verify, v => c.verify = v)
        ]),
        biField("Nom de la certification", c.name, v => c.name.fr = v, v => c.name.en = v),
        biField("Domaine couvert", c.focus, v => c.focus.fr = v, v => c.focus.en = v),
        field("Chemin du PDF", c.pdf, v => c.pdf = v)
      ]));
    });
  }
  draw();
  panel.append(list, el("button", { class: "btn btn-primary admin-add", onclick: () => {
    state.certifications.push({ issuer: "", name: { fr: "", en: "" }, focus: { fr: "", en: "" }, verify: "", pdf: "" });
    saveDraft(); draw();
  } }, "+ Ajouter une certification"));
}

/* ---------------- Compétences ---------------- */

function renderSkills() {
  const panel = document.getElementById("panel-skills");
  panel.innerHTML = "";
  const groupsWrap = el("div", { class: "sub-list" });

  function drawItems(group, wrap) {
    wrap.innerHTML = "";
    group.items.forEach((it, i) => {
      wrap.append(el("div", { class: "sub-item" }, [
        el("input", { value: it.fr, placeholder: "FR", oninput: e => { it.fr = e.target.value; saveDraft(); } }),
        el("input", { value: it.en, placeholder: "EN", oninput: e => { it.en = e.target.value; saveDraft(); } }),
        removeBtn(() => { group.items.splice(i, 1); saveDraft(); drawItems(group, wrap); })
      ]));
    });
  }

  function drawGroups() {
    groupsWrap.innerHTML = "";
    state.skills.groups.forEach((g, i) => {
      const itemsWrap = el("div", { class: "sub-list" });
      drawItems(g, itemsWrap);
      groupsWrap.append(el("div", { class: "admin-item" }, [
        el("div", { class: "admin-item-head" }, [
          el("strong", { text: g.title.fr || "Groupe" }),
          removeBtn(() => { state.skills.groups.splice(i, 1); saveDraft(); drawGroups(); }, "Supprimer le groupe")
        ]),
        biField("Titre du groupe", g.title, v => g.title.fr = v, v => g.title.en = v),
        el("h3", { text: "Compétences" }), itemsWrap,
        el("button", { class: "btn btn-outline btn-sm admin-add", onclick: () => { g.items.push({ fr: "", en: "" }); saveDraft(); drawItems(g, itemsWrap); } }, "+ Ajouter une compétence")
      ]));
    });
  }
  drawGroups();

  const toolsWrap = el("div", { class: "sub-list" });
  function drawTools() {
    toolsWrap.innerHTML = "";
    state.skills.tools.forEach((tool, i) => {
      toolsWrap.append(el("div", { class: "sub-item" }, [
        el("input", { value: tool, oninput: e => { state.skills.tools[i] = e.target.value; saveDraft(); } }),
        removeBtn(() => { state.skills.tools.splice(i, 1); saveDraft(); drawTools(); })
      ]));
    });
  }
  drawTools();

  panel.append(
    groupsWrap,
    el("button", { class: "btn btn-primary admin-add", onclick: () => { state.skills.groups.push({ title: { fr: "", en: "" }, items: [] }); saveDraft(); drawGroups(); } }, "+ Ajouter un groupe"),
    el("h3", { text: "Outils techniques", style: "margin-top:24px" }), toolsWrap,
    el("button", { class: "btn btn-outline btn-sm admin-add", onclick: () => { state.skills.tools.push("Nouvel outil"); saveDraft(); drawTools(); } }, "+ Ajouter un outil")
  );
}

/* ---------------- Actualités ---------------- */

const NEWS_TYPES = [
  ["image", "Photo (ou GIF animé)"],
  ["video", "Vidéo (fichier MP4 ou WebM)"],
  ["embed", "Vidéo ou publication en ligne (YouTube, LinkedIn, TikTok, Facebook…)"],
  ["link", "Article ou lien"],
  ["text", "Texte seul"]
];

function todayISO() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function slugify(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "image";
}

function downloadBlob(blob, filename) {
  const a = el("a", { href: URL.createObjectURL(blob), download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Réduit une photo à 1600 px max (JPEG) pour garder le site rapide.
async function optimizeImage(file, maxSide = 1600, quality = 0.85) {
  const bmp = await createImageBitmap(file);
  const ratio = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * ratio);
  canvas.height = Math.round(bmp.height * ratio);
  canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise(res => canvas.toBlob(res, "image/jpeg", quality));
}

function emptyNews() {
  return { id: "n-" + uid(), type: "image", date: todayISO(), title: { fr: "", en: "" }, text: { fr: "", en: "" }, media: "", url: "" };
}

function renderNews() {
  const panel = document.getElementById("panel-news");
  panel.innerHTML = "";
  const list = el("div", { class: "sub-list" });

  function draw() {
    list.innerHTML = "";
    state.news.forEach((n, i) => {
      if (!n.type) n.type = n.url ? "link" : "text";
      const hint = el("p", { class: "admin-hint" });

      const typeSelect = el("select", {}, NEWS_TYPES.map(([v, label]) => {
        const o = el("option", { value: v }, label);
        if (v === n.type) o.selected = true;
        return o;
      }));
      typeSelect.addEventListener("change", () => { n.type = typeSelect.value; saveDraft(); draw(); });

      const dateInput = el("input", { type: "date", value: n.date || "" });
      dateInput.addEventListener("input", () => { n.date = dateInput.value; saveDraft(); });

      const head = el("div", { class: "admin-item-head" }, [
        el("strong", { text: (n.title && n.title.fr) || "Nouvelle actualité" }),
        removeBtn(() => { state.news.splice(i, 1); saveDraft(); draw(); })
      ]);

      const parts = [
        head,
        el("div", { class: "admin-row2" }, [
          el("div", { class: "admin-field" }, [el("label", { text: "Type de publication" }), typeSelect]),
          el("div", { class: "admin-field" }, [el("label", { text: "Date" }), dateInput])
        ]),
        biField("Titre", n.title, v => n.title.fr = v, v => n.title.en = v),
        biField("Texte", n.text, v => n.text.fr = v, v => n.text.en = v, true)
      ];

      // --- Média selon le type ---
      if (n.type === "embed") {
        const f = field("Lien ou code d'intégration (YouTube, LinkedIn, TikTok…)", n.media, v => { n.media = v; check(); });
        function check() {
          const info = parseEmbed(n.media);
          if (!n.media) { hint.textContent = ""; hint.className = "admin-hint"; }
          else if (info) { hint.textContent = `✓ Lien ${info.name} reconnu : la vidéo sera lisible directement sur le site.`; hint.className = "admin-hint ok"; }
          else { hint.textContent = "Lien non reconnu comme vidéo intégrable : il s'affichera comme un simple lien. Utilise l'adresse complète de la vidéo (pas celle de la chaîne)."; hint.className = "admin-hint warn"; }
        }
        check();
        parts.push(f, hint);
      }

      if (n.type === "image" || n.type === "video") {
        const isImg = n.type === "image";
        const f = field(isImg ? "Chemin de l'image" : "Chemin de la vidéo", n.media, v => n.media = v);
        const file = el("input", { type: "file", accept: isImg ? "image/*" : "video/mp4,video/webm" });
        file.addEventListener("change", async () => {
          const chosen = file.files[0];
          if (!chosen) return;
          const base = `${n.date || todayISO()}-${slugify((n.title && n.title.fr) || chosen.name.replace(/\.[^.]+$/, ""))}`;
          if (isImg && chosen.type !== "image/gif") {
            const blob = await optimizeImage(chosen);
            const name = `${base}.jpg`;
            downloadBlob(blob, name);
            n.media = `assets/news/${name}`;
            hint.textContent = `Photo optimisée téléchargée sous « ${name} ». Place-la dans le dossier assets/news/ du dépôt GitHub.`;
            hint.className = "admin-hint ok";
          } else {
            const ext = chosen.name.split(".").pop().toLowerCase();
            const name = `${base}.${ext}`;
            n.media = `assets/news/${name}`;
            const mb = (chosen.size / 1048576).toFixed(1);
            hint.textContent = `Renomme ton fichier en « ${name} » et place-le dans assets/news/ du dépôt. Taille : ${mb} Mo.` +
              (chosen.size > 25 * 1048576 ? " Attention : fichier lourd (le site sera lent, GitHub refuse au-delà de 100 Mo). Mieux vaut publier la vidéo sur YouTube et choisir « Vidéo en ligne »." : "");
            hint.className = "admin-hint" + (chosen.size > 25 * 1048576 ? " warn" : " ok");
          }
          saveDraft();
          draw();
          // le message d'aide est perdu au redessin : on le réaffiche
          const again = list.children[i].querySelector(".admin-hint");
          if (again) { again.textContent = hint.textContent; again.className = hint.className; }
        });
        parts.push(f, el("div", { class: "admin-file" }, [file]), hint);
        if (!isImg) {
          parts.push(el("label", { class: "admin-check" }, [
            el("input", { type: "checkbox", ...(n.loop ? { checked: "checked" } : {}), onchange: e => { n.loop = e.target.checked; saveDraft(); } }),
            "Animation : lecture en boucle, sans son ni commandes"
          ]));
        } else {
          hint.textContent = hint.textContent || "Pour un GIF animé, choisis le fichier .gif : il est utilisé tel quel.";
        }
      }

      if (n.type === "link") {
        const lf = field("Lien (URL de l'article, Notion…)", n.url, v => {
          n.url = v;
          const info = parseEmbed(v);
          hint.textContent = info ? `✓ ${info.name} reconnu : cette publication s'affichera directement sur le site.` : "";
          hint.className = "admin-hint" + (info ? " ok" : "");
        });
        parts.push(lf, hint);
      } else if (n.type !== "embed") {
        parts.push(field("Lien « En savoir plus » (facultatif)", n.url, v => n.url = v));
      }

      list.append(el("div", { class: "admin-item" }, parts));
    });
  }
  draw();
  panel.append(
    el("p", { class: "admin-note", text: "Les actualités s'affichent de la plus récente à la plus ancienne ; les 3 dernières apparaissent aussi sur la page d'accueil." }),
    list,
    el("button", { class: "btn btn-primary admin-add", onclick: () => { state.news.unshift(emptyNews()); saveDraft(); draw(); } }, "+ Ajouter une actualité")
  );
}

/* ---------------- Tabs & boot ---------------- */

function renderAll() {
  renderProfile();
  renderProjects();
  renderCertifications();
  renderSkills();
  renderNews();
}

function wireTabs() {
  document.querySelectorAll(".admin-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
    });
  });
}

function downloadJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = el("a", { href: URL.createObjectURL(blob), download: "content.json" });
  document.body.appendChild(a);
  a.click();
  a.remove();
  showStatus("content.json téléchargé");
}

async function boot() {
  const draft = localStorage.getItem(DRAFT_KEY);
  const res = await fetch("content.json", { cache: "no-store" });
  originalFetched = await res.json();
  state = draft ? JSON.parse(draft) : JSON.parse(JSON.stringify(originalFetched));

  renderAll();
  wireTabs();

  document.getElementById("btnExport").addEventListener("click", downloadJSON);
  document.getElementById("btnReset").addEventListener("click", () => {
    if (!confirm("Recharger content.json et effacer le brouillon local ?")) return;
    localStorage.removeItem(DRAFT_KEY);
    state = JSON.parse(JSON.stringify(originalFetched));
    renderAll();
    showStatus("Réinitialisé");
  });
  document.getElementById("btnImport").addEventListener("click", () => document.getElementById("fileImport").click());
  document.getElementById("fileImport").addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    state = JSON.parse(await file.text());
    saveDraft();
    renderAll();
    showStatus("JSON importé");
  });
}

wireGate();
