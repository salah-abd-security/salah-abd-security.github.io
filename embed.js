 /* =========================================================
   Détection des liens vidéo (YouTube, Vimeo, TikTok, ...)
   Utilisé par main.js (affichage) et admin.js (vérification).
   parseEmbed(url) → { provider, name, src, vertical, thumb? } ou null
========================================================= */

function parseEmbed(raw) {
  if (!raw) return null;
  // Accepte aussi un code <iframe ...> collé tel quel : on en extrait l'adresse (src)
  const fromIframe = String(raw).match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (fromIframe) raw = fromIframe[1].replace(/&amp;/g, "&");
  let u;
  try { u = new URL(String(raw).trim()); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;

  const host = u.hostname.replace(/^(www|m|web)\./, "");
  const path = u.pathname;
  const idOk = id => id && /^[\w-]{4,}$/.test(id);
  let m;

  // YouTube : watch, youtu.be, shorts, embed, live
  if (host === "youtu.be" || host === "youtube.com" || host === "music.youtube.com") {
    let id = null, vertical = false;
    if (host === "youtu.be") id = path.split("/")[1];
    else if (path === "/watch") id = u.searchParams.get("v");
    else if ((m = path.match(/^\/(shorts|embed|live)\/([\w-]+)/))) { id = m[2]; vertical = m[1] === "shorts"; }
    if (idOk(id)) {
      return {
        provider: "youtube", name: "YouTube", vertical,
        src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
        thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
      };
    }
    return null;
  }

  // Vimeo
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    m = path.match(/(\d{5,})/);
    if (m) return { provider: "vimeo", name: "Vimeo", vertical: false, src: `https://player.vimeo.com/video/${m[1]}` };
    return null;
  }

  // Dailymotion
  if (host === "dai.ly" || host === "dailymotion.com") {
    const id = host === "dai.ly" ? path.split("/")[1] : (path.match(/\/video\/([\w]+)/) || [])[1];
    if (idOk(id)) return { provider: "dailymotion", name: "Dailymotion", vertical: false, src: `https://www.dailymotion.com/embed/video/${id}` };
    return null;
  }

  // TikTok (lien complet : tiktok.com/@compte/video/123…)
  if (host === "tiktok.com") {
    m = path.match(/\/video\/(\d+)/);
    if (m) return { provider: "tiktok", name: "TikTok", vertical: true, src: `https://www.tiktok.com/embed/v2/${m[1]}` };
    return null;
  }

  // Instagram : publications et reels
  if (host === "instagram.com") {
    m = path.match(/^\/(p|reel|tv)\/([\w-]+)/);
    if (m) return { provider: "instagram", name: "Instagram", vertical: true, src: `https://www.instagram.com/${m[1]}/${m[2]}/embed` };
    return null;
  }

  // LinkedIn : code d'intégration, lien de publication ou lien /posts/…
  if (/(^|\.)linkedin\.com$/.test(host)) {
    let urn = null;
    if ((m = path.match(/^\/(?:embed\/)?feed\/update\/(urn:li:(?:share|ugcPost|activity):\d+)/))) urn = m[1];
    else if ((m = path.match(/(activity|share|ugcPost)-(\d{10,})/))) urn = `urn:li:${m[1]}:${m[2]}`;
    if (urn) {
      return {
        provider: "linkedin", name: "LinkedIn", vertical: false, tall: true,
        src: `https://www.linkedin.com/embed/feed/update/${urn}`,
        link: `https://www.linkedin.com/feed/update/${urn}/`
      };
    }
    return null;
  }

  // Facebook : vidéos, watch, reels, fb.watch
  if (host === "facebook.com" || host === "fb.watch") {
    if (host === "fb.watch" || /\/(videos|watch|reel)\b/.test(path)) {
      return {
        provider: "facebook", name: "Facebook", vertical: /\/reel\b/.test(path),
        src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u.href)}&show_text=false`
      };
    }
    return null;
  }

  return null;
}
