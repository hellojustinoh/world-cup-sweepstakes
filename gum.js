/* Gumroad-style bold-print layout — the chosen direction. */
(() => {
  const $ = (s) => document.querySelector(s);
  const avatar = (name, size) => animeChar({ ...Core.charFor(name), size: size || 92 });

  const TIERMETA = [
    { t: 1, e: "👑", n: "ELITE", s: "Tier 1", d: "the favourites" },
    { t: 2, e: "🔥", n: "CONTENDER", s: "Tier 2", d: "in the mix" },
    { t: 3, e: "🎲", n: "WILDCARD", s: "Tier 3", d: "could surprise" },
    { t: 4, e: "🐶", n: "UNDERDOG", s: "Tier 4", d: "the long shots" },
  ];

  const penta = (cx, cy, r, rot) => { let p = ""; for (let i = 0; i < 5; i++) { const a = (rot + i * 72) * Math.PI / 180; p += `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)} `; } return p.trim(); };
  const soccerBall = (size) => {
    const cx = 50, cy = 50, R = 44; let edges = "", seams = "";
    for (let i = 0; i < 5; i++) {
      const t = -90 + i * 72, rad = t * Math.PI / 180;
      const ex = cx + 35 * Math.cos(rad), ey = cy + 35 * Math.sin(rad);
      edges += `<polygon points="${penta(ex, ey, 11.5, t)}" fill="#111"/>`;
      const vx = cx + 12.5 * Math.cos(rad), vy = cy + 12.5 * Math.sin(rad);
      seams += `<line x1="${vx.toFixed(1)}" y1="${vy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="#111" stroke-width="2.4"/>`;
    }
    return `<svg width="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="sbclip"><circle cx="50" cy="50" r="${R}"/></clipPath></defs>
      <circle cx="50" cy="50" r="${R}" fill="#fff" stroke="#111" stroke-width="3.5"/>
      <g clip-path="url(#sbclip)">${seams}${edges}<polygon points="${penta(50, 50, 13, -90)}" fill="#111"/></g>
    </svg>`;
  };
  const trophy = (size) => `<svg width="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="trg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe07a"/><stop offset="1" stop-color="#d99a13"/></linearGradient></defs>
    <path d="M30,20 H70 V36 Q70,54 50,58 Q30,54 30,36 Z" fill="url(#trg)" stroke="#111" stroke-width="3.5"/>
    <path d="M30,24 Q16,26 19,38 Q22,46 33,43" fill="none" stroke="#111" stroke-width="3.5"/>
    <path d="M70,24 Q84,26 81,38 Q78,46 67,43" fill="none" stroke="#111" stroke-width="3.5"/>
    <rect x="45" y="57" width="10" height="13" fill="url(#trg)" stroke="#111" stroke-width="3.5"/>
    <rect x="33" y="70" width="34" height="9" rx="2" fill="url(#trg)" stroke="#111" stroke-width="3.5"/>
    <rect x="28" y="79" width="44" height="9" rx="2" fill="url(#trg)" stroke="#111" stroke-width="3.5"/></svg>`;

  function hero() {
    const p = Core.pot();
    $("#potbig").innerHTML = `<span>POT</span> <b>${p.cur}${p.total}</b> <span>· WIN ${p.cur}${p.championAmt.toFixed(0)}</span>`;
    const squad = ["Benoit", "Meiyin", "Sri"].map((n, i) =>
      `<div class="sq-c">${animeChar({ ...Core.charFor(n), size: i === 1 ? 152 : 128 })}</div>`).join("");
    $("#hero-char").innerHTML =
      `<div class="hero-trophy">${trophy(76)}</div>
       <div class="hero-squad">${squad}</div>
       <div class="hero-ball">${soccerBall(104)}</div>`;
  }

  function board() {
    const head = `<div class="ghead gcols"><div></div><div></div><div>Player</div><div>Furthest</div><div class="h-win">Win prob %<i class="qmark">?</i><span class="tip">Modelled chance this player owns the eventual <b>Champion</b> — based on each team's strength rating, how far it has advanced, and current form. Updates with live results.</span></div><div class="h-xp">Pts</div></div>`;
    $("#board").innerHTML = head + Core.standings().map((r, i) =>
      `<div class="grow gcols ${i === 0 ? "lead" : ""} ${r.out ? "out" : ""}" data-player="${r.name}">
        <div class="grk">${i + 1}</div>
        <div class="gav">${avatar(r.name, 92)}</div>
        <div class="gnm">${r.name}</div>
        <div class="gst">${r.out ? "OUT" : r.bestLabel}</div>
        <div class="gwin">${r.winPct}%</div>
        <div class="gxp">${r.points}</div>
      </div>`).join("");
  }

  async function fixtures() {
    const res = await Core.quests();
    const ago = res.fetchedAt ? Math.max(0, Math.round((Date.now() - res.fetchedAt) / 60000)) : null;
    const tag = res.source === "live" ? "LIVE 2026" : res.source === "demo" ? "DEMO" : "NO FEED";
    const agoTxt = ago == null ? "" : ago < 1 ? " · just now" : ` · ${ago}m ago`;
    $("#feedtag").innerHTML = `${tag}${agoTxt} <button class="refresh-btn" type="button" title="Refresh now">↻</button>`;
    const rb = document.querySelector("#feedtag .refresh-btn");
    if (rb) rb.onclick = async () => { rb.classList.add("spin"); await Core.load(true); board(); await fixtures(); };

    const row = (f) => {
      const mid = f.played ? `<span class="mscore">${f.homeScore}–${f.awayScore}</span>` : `<span class="mvs">VS</span>`;
      const date = (() => { try { return new Date(f.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch (e) { return f.date; } })();
      return `<div class="match ${f.rivalry ? "rivalry" : ""}">
        <div class="m-side"><div class="m-flag">${renderFlag(f.home, { pixel: false })}</div><div class="m-tm">${f.home}</div></div>
        <div class="m-mid">${mid}<span class="m-when">${f.played ? `FT · ${date}` : `${date}${f.time ? " · " + f.time : ""}`}</span>${f.rivalry ? `<span class="m-riv">⚔ ${f.oh} v ${f.oa}</span>` : ""}</div>
        <div class="m-side r"><div class="m-tm">${f.away}</div><div class="m-flag">${renderFlag(f.away, { pixel: false })}</div></div>
      </div>`;
    };
    const up = res.upcoming || [], done = res.recent || [];
    let html = "";
    if (up.length) html += `<div class="fix-sub">Upcoming · ${up.length}</div>` + up.map(row).join("");
    if (done.length) html += `<div class="fix-sub">Results · ${done.length}</div>` + done.map(row).join("");
    $("#fixtures").innerHTML = html || `<p>No pool fixtures yet.</p>`;
  }

  // ---- View-team modal -----------------------------------------------------
  function openModal(name) {
    const pl = Core.player(name);
    const st = Core.standings().find((r) => r.name === name);
    const p = Core.pot();
    const ownsChamp = pl.picks.some((pk) => pk.stage === "champion");
    const ownsRunner = pl.picks.some((pk) => pk.stage === "runnerUp");
    const winChip = ownsChamp ? `<span class="chip win">🏆 WINS ${p.cur}${p.championAmt.toFixed(0)}</span>`
      : ownsRunner ? `<span class="chip win">🥈 WINS ${p.cur}${p.runnerUpAmt.toFixed(0)}</span>` : "";
    $("#modal-body").innerHTML = `
      <div class="mh">
        <div class="mh-av"><div class="sticker">${avatar(name, 118)}</div></div>
        <div>
          <div class="mh-name">${name}</div>
          <div class="mh-meta"><span class="chip">${st ? st.winPct : 0}% WIN PROB</span><span class="chip">${st ? st.points : 0} PTS</span><span class="chip">${pl.alive}/4 ALIVE</span>${winChip}</div>
        </div>
      </div>
      <div class="mteams">${pl.picks.map((pk) => `
        <div class="mteam ${pk.dead ? "dead" : ""}">
          <div class="m-flag">${renderFlag(pk.team, { pixel: false })}</div>
          <div><div class="mt-t">${pk.tierEmoji} Tier ${pk.tier} · ${pk.tierLabel}</div><div class="mt-n">${pk.team}</div><div class="mt-s">${pk.stageLabel}</div></div>
        </div>`).join("")}</div>`;
    $("#modal").hidden = false;
  }
  function closeModal() { $("#modal").hidden = true; }

  $("#board").addEventListener("click", (e) => {
    const row = e.target.closest(".grow");
    if (row && row.dataset.player) openModal(row.dataset.player);
  });
  $("#modal").addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // Top-nav smooth scroll (reliable across browsers; respects sticky header).
  document.querySelectorAll('.bar nav a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const el = document.querySelector(a.getAttribute("href"));
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
  });

  // ---- Boot + 12-hour live refresh -----------------------------------------
  hero();
  (async () => { await Core.load(); board(); fixtures(); })();
  setInterval(async () => { await Core.load(true); board(); fixtures(); }, 30 * 60 * 1000);
})();
