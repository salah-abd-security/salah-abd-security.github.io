# 🔐 Salahadine Abdassama – Cybersecurity Analyst

Portfolio professionnel en cybersécurité.

🌐 Site : https://salah-abd-security.github.io/

## Architecture

Le contenu (profil, projets, certifications, compétences, actualités) vit dans
**`content.json`**. Toutes les pages HTML sont des coquilles qui chargent ce
fichier via `main.js` et se dessinent dynamiquement — modifier le contenu ne
demande jamais de toucher au HTML.

- `style.css` — design system (couleurs, typographie, mise en page)
- `content.json` — tout le contenu du site
- `main.js` — moteur de rendu des pages publiques
- `admin.html` / `admin.js` — espace d'administration (voir ci-dessous)
- `index.html`, `about.html`, `projects.html`, `certifications.html`,
  `skills.html`, `blog.html`, `project-*.html` — coquilles de page

## Espace admin

Ouvre `admin.html` (lien discret dans le pied de page, ou directement
`tonsite.github.io/admin.html`) pour ajouter, modifier ou supprimer un
projet, une certification, une compétence ou une actualité depuis un
formulaire, sans toucher au code.

L'admin travaille sur un brouillon sauvegardé dans le navigateur. Pour que
les visiteurs voient les changements :
1. Clique sur **Télécharger content.json**.
2. Remplace le fichier `content.json` du dépôt par celui téléchargé.
3. `git add content.json && git commit -m "Mise à jour du contenu" && git push`

Cette page n'est pas protégée par mot de passe : elle ne modifie rien tant
que le fichier n'est pas repoussé sur GitHub, mais évite d'y mettre un lien
public si tu préfères la garder discrète.

## 🎯 Profil
Analyste de sécurité informatique, spécialisé en analyse des risques,
sécurité réseau et bonnes pratiques cybersécurité.

## 🧠 Compétences
- Analyse des risques
- Scan de vulnérabilités (Nmap)
- Analyse réseau (Wireshark)
- Sécurité des systèmes

## 📜 Certifications
- Google Cybersecurity Certificate
- Google IT Support
- Cisco – Information Security Analysis
- Google Data Analytics
- Google Project Management
- CCEP – Red Team Leaders

## 📫 Contact
- GitHub : https://github.com/salah-abd-security
