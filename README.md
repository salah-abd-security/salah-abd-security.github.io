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
- `embed.js` — reconnaissance des liens vidéo (YouTube, Vimeo, TikTok…)
- `assets/news/` — photos et vidéos des actualités
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

## Publier une actualité

Dans l'admin, onglet **Actualités** → **+ Ajouter une actualité**, puis choisis le type :

- **Photo** : choisis l'image, elle est réduite automatiquement et téléchargée ;
  place ce fichier dans `assets/news/`. Les GIF animés fonctionnent aussi.
- **Vidéo (fichier)** : place le MP4/WebM dans `assets/news/` (idéalement moins de
  25 Mo). Case « Animation » = lecture en boucle, sans son.
- **Vidéo en ligne** : colle simplement le lien de la vidéo (YouTube, Vimeo,
  TikTok, Facebook, Instagram, Dailymotion). Rien à téléverser.
- **Article ou lien** / **Texte seul**.

Les actualités s'affichent de la plus récente à la plus ancienne sur `blog.html`,
et les **3 dernières** apparaissent aussi sur la page d'accueil. Ensuite :
télécharge `content.json`, remplace-le dans le dépôt, ajoute les fichiers de
`assets/news/` puis `git add . && git commit && git push`.

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
