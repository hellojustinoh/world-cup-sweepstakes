/* Homerun-style "warm editorial" layout — circular flag avatars, no characters.
   Reuses the shared Core (data.js, flags.js, api.js, core.js). */
(() => {
  const $ = (s) => document.querySelector(s);

  // Rain of emojis + nation flags over an element (glory or mourning).
  // `items` is a list of { emoji } or { team } drops.
  function rainOn(el, items) {
    if (!el || !items.length || el.querySelector(":scope > .rainfx")) return;
    const h = el.offsetHeight || 60, w = el.offsetWidth || 200;
    const n = Math.max(6, Math.min(14, Math.round(w / 60)));
    let drops = "";
    for (let i = 0; i < n; i++) {
      const it = items[i % items.length];
      const left = ((i + ((i * 37) % 10) / 10) * (100 / n)).toFixed(1);
      const dur = (2.2 + ((i * 17) % 16) / 10).toFixed(2);
      const delay = (-((i * 23) % 30) / 10).toFixed(2);
      const base = `left:${left}%;--fall:${h + 26}px;animation-duration:${dur}s;animation-delay:${delay}s`;
      if (it.team) drops += `<span class="drop flagdrop" style="${base};width:22px;height:15px">${renderFlag(it.team, { pixel: false })}</span>`;
      else drops += `<span class="drop" style="${base};font-size:${13 + ((i * 13) % 8)}px">${it.emoji}</span>`;
    }
    const layer = document.createElement("div");
    layer.className = "rainfx";
    layer.innerHTML = drops;
    el.appendChild(layer);
  }
  // Build a rain item list from emoji strings + team flags.
  const rainItems = (emojis, teams) => [...emojis.map((e) => ({ emoji: e })), ...(teams || []).map((t) => ({ team: t }))];

  // Animate a win% cell when the number changes after new results.
  const prevWin = {};
  function animatePct(el, from, to) {
    el.classList.remove("up", "down"); void el.offsetWidth;
    el.classList.add(to > from ? "up" : "down");
    const start = performance.now(), dur = 700;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(from + (to - from) * t) + "%";
      if (t < 1) requestAnimationFrame(tick); else el.textContent = to + "%";
    };
    requestAnimationFrame(tick);
    setTimeout(() => el.classList.remove("up", "down"), 1100);
  }

  // ---- Local "cheer" (confetti + a personal tally in localStorage) ----------
  const CHEER_KEY = "sweeps.cheers";
  const readCheers = () => { try { return JSON.parse(localStorage.getItem(CHEER_KEY)) || {}; } catch (e) { return {}; } };
  const writeCheers = (o) => { try { localStorage.setItem(CHEER_KEY, JSON.stringify(o)); } catch (e) {} };
  const cheerCount = (t) => readCheers()[t] || 0;
  const flagPalette = (t) => [flagPrimary(t), "#ffce00", "#16a866", "#ff4b4b", "#ffffff"];

  function confettiBurst(x, y, colors) {
    const wrap = document.createElement("div");
    wrap.className = "confetti-wrap";
    let html = "";
    for (let i = 0; i < 28; i++) {
      const ang = Math.random() * Math.PI * 2, dist = 40 + Math.random() * 110;
      const dx = (Math.cos(ang) * dist).toFixed(0), dy = (Math.sin(ang) * dist - 50).toFixed(0);
      const rot = ((Math.random() * 720 - 360) | 0), delay = (Math.random() * 0.08).toFixed(2);
      const c = colors[i % colors.length];
      html += `<span class="confetti" style="left:${x}px;top:${y}px;background:${c};--dx:${dx}px;--dy:${dy}px;--rot:${rot}deg;animation-delay:${delay}s"></span>`;
    }
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 1400);
  }

  let toastTimer;
  function toast(msg) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
  }

  function doCheer(team, btn) {
    const c = readCheers(); c[team] = (c[team] || 0) + 1; writeCheers(c);
    const n = btn.querySelector(".cheer-n"); if (n) n.textContent = c[team];
    btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
    const r = btn.getBoundingClientRect();
    confettiBurst(r.left + r.width / 2, r.top + r.height / 2, flagPalette(team));
    toast(`Go ${team}! 📣`);
  }

  const tier1 = (picks) => (picks.find((p) => p.tier === 1) || picks[0]).team;
  // Manager portrait, ringed in their Tier-1 nation's colour. Falls back to that
  // nation's flag until the illustrated portraits (managers.js) finish loading.
  const avatar = (name, t1, size) => {
    const portrait = (window.MANAGERS || {})[name] || renderFlag(t1, { pixel: false });
    return `<span class="favatar" style="--av:${size || 44}px;--ring:${flagPrimary(t1)}">${portrait}</span>`;
  };
  // Small owner portrait for fixtures — ringed in the owner's Tier-1 nation colour.
  const _ot1 = {};
  const ownerT1 = (name) => (_ot1[name] || (_ot1[name] = tier1(Core.player(name).picks)));
  const ownerAvatar = (name, size) => name ? `<span class="oav" title="${name}">${avatar(name, ownerT1(name), size || 22)}</span>` : "";

  // ---- Hero ----------------------------------------------------------------
  function hero() {
    const p = Core.pot();
    const navpot = $("#navpot"); if (navpot) navpot.textContent = `${p.cur}${p.total} pot`;
    const chip = $("#potchip"); if (chip) chip.textContent = `Pot ${p.cur}${p.total} · winner takes ${p.cur}${p.championAmt.toFixed(0)}`;

    const lead = Core.standings()[0];
    if (lead) {
      const t1 = tier1(lead.picks);
      const alivePicks = Core.player(lead.name).picks.filter((pk) => !pk.dead);
      const teamsHtml = alivePicks.length
        ? alivePicks.map((pk) => `<span class="lt"><span class="lt-f">${renderFlag(pk.team, { pixel: false })}</span>${pk.team}</span>`).join("")
        : `<span class="lt-none">No teams left in the running.</span>`;
      $("#leadcard").innerHTML = `
        <span class="lead-badge">● Top of the table</span>
        <div class="lead-top">
          ${avatar(lead.name, t1, 52)}
          <div>
            <div class="lead-name">${lead.name}</div>
            <div class="lead-role">${lead.points} pts · ${lead.alive}/4 teams alive</div>
          </div>
        </div>
        <div class="lead-teams"><div class="lt-h">Still in the running</div><div class="lt-list">${teamsHtml}</div></div>
        <div class="lead-foot"><span class="lab">Odds to own the champion</span><span class="big">${lead.winPct}%</span></div>`;
    }
    renderLatest();
  }

  // Dynamic "what just happened" digest — recent eliminations and advances.
  function renderLatest() {
    const m = Core.movements();
    const join = (a) => a.length <= 1 ? (a[0] || "") : a.length === 2 ? `${a[0]} and ${a[1]}` : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`;
    const outOwners = [...new Set(m.out.map((x) => x.owner))];
    const advOwners = [...new Set(m.adv.map((x) => x.owner))];
    let emoji = "🗓️", headline = "Quiet on the pitch", line = "No changes in the last 24 hours. Knockout games are coming up.";
    if (m.out.length && m.adv.length) { emoji = "📊"; headline = "Swings in the draw"; line = `${join(advOwners)} advanced, ${join(outOwners)} lost a team.`; }
    else if (m.out.length) { emoji = "🪦"; headline = "Tough 24 hours"; line = `${join(outOwners)} ${outOwners.length > 1 ? "each had a team" : "had a team"} eliminated.`; }
    else if (m.adv.length) { emoji = "🎉"; headline = "Through to the next round"; line = `${join(advOwners)} ${advOwners.length > 1 ? "each saw a team" : "saw a team"} go through.`; }
    const item = (x, type) => `<div class="upd-item">
        <span class="m-flag">${renderFlag(x.team, { pixel: false })}</span>
        <div class="ui-tx"><div class="ui-t">${x.team} ${type === "out" ? "eliminated" : "through to " + x.stageLabel}</div><div class="ui-s">${x.owner}</div></div>
        <span class="ui-em">${type === "out" ? "🪦" : "🎉"}</span>
      </div>`;
    const items = [...m.adv.map((x) => item(x, "in")), ...m.out.map((x) => item(x, "out"))].slice(0, 4).join("");
    $("#updcard").innerHTML = `<div class="upd-h">The latest</div><div class="upd-headline">${emoji} ${headline}</div><div class="upd-line">${line}</div>${items ? `<div class="upd-list">${items}</div>` : ""}`;
  }

  // ---- Standings -----------------------------------------------------------
  function board() {
    const head = `<div class="bhead">
      <div class="h-r">#</div><div></div><div>Player</div>
      <div class="h-info">Win prob<span class="qmark">?</span><span class="tip">Modelled chance this player owns the eventual <b>champion</b>, from each team's strength rating, how far it has advanced, and live form. Updates with results.</span></div>
      <div class="h-r"><span class="h-info">Pts<span class="qmark">?</span><span class="tip">Football points from real results: <b>win 3</b>, <b>draw 1</b>, <b>loss 0</b>, counted across every game. A player's total is the sum of all four of their teams.</span></span></div>
    </div>`;
    const rows = Core.standings();
    $("#board").innerHTML = head + rows.map((r, i) => {
      const t1 = tier1(r.picks);
      const tag = i === 0 ? `<span class="b-tag">Top</span>` : "";
      const glory = r.recentWin && r.recentWin.length, mourn = r.recentOut && r.recentOut.length;
      const mood = glory && mourn ? " swing" : glory ? " glory" : mourn ? " mourning" : "";
      const moveChip = (teams, type) => teams && teams.length ? `<span class="b-move ${type}"><span class="cf">${renderFlag(teams[0], { pixel: false })}</span>${type === "in" ? "🎉" : "🪦"}${teams.length > 1 ? " +" + (teams.length - 1) : ""}</span>` : "";
      return `<div class="brow ${i === 0 ? "lead" : ""} ${r.out ? "out" : ""}${mood}" data-player="${r.name}">
        <div class="b-rk">${i + 1}</div>
        <div>${avatar(r.name, t1, 40)}</div>
        <div>
          <div class="b-nm">${r.name}${tag}${moveChip(r.recentWin, "in")}${moveChip(r.recentOut, "out")}</div>
          <div class="b-sub">${r.out ? "All teams knocked out" : "Furthest: " + r.bestLabel} · ${r.alive}/4 alive</div>
        </div>
        <div class="b-win">${r.winPct}%</div>
        <div class="b-pts">${r.points}<small>pts</small></div>
      </div>`;
    }).join("");
    // Rain on anyone whose team advanced (glory) or was eliminated (mourning) today.
    rows.forEach((r) => {
      const el = $(`#board .brow[data-player="${r.name}"]`);
      const glory = r.recentWin && r.recentWin.length, mourn = r.recentOut && r.recentOut.length;
      if (glory && mourn) rainOn(el, rainItems(["🎉", "🪦"], [...r.recentWin, ...r.recentOut]));
      else if (glory) rainOn(el, rainItems(["🎉", "🏆", "⚽"], r.recentWin));
      else if (mourn) rainOn(el, rainItems(["🪦", "😢", "⚽"], r.recentOut));
      // Animate the win% when it has moved since the last results.
      const win = $(`#board .brow[data-player="${r.name}"] .b-win`);
      if (win && prevWin[r.name] != null && prevWin[r.name] !== r.winPct) animatePct(win, prevWin[r.name], r.winPct);
      prevWin[r.name] = r.winPct;
    });
  }

  // ---- Fixtures ------------------------------------------------------------
  async function fixtures() {
    const res = await Core.quests();
    const ago = res.fetchedAt ? Math.max(0, Math.round((Date.now() - res.fetchedAt) / 60000)) : null;
    const live = res.source === "live";
    const label = live ? "Live 2026" : res.source === "demo" ? "Demo feed" : "No feed";
    const agoTxt = ago == null ? "" : ago < 1 ? " · just now" : ` · ${ago}m ago`;
    $("#feedtag").className = "feedtag" + (live ? "" : " dead");
    $("#feedtag").innerHTML = `${label}${agoTxt} <button class="refresh-btn" type="button" title="Refresh now">↻</button>`;
    const rb = $("#feedtag .refresh-btn");
    if (rb) rb.onclick = async () => { rb.classList.add("spin"); await Core.load(true); board(); hero(); await fixtures(); };

    const flagCell = (name, tbd) => tbd ? `<span class="m-flag tbd">?</span>` : `<span class="m-flag">${renderFlag(name, { pixel: false })}</span>`;
    const nameCell = (name, tbd) => tbd ? `<span class="m-tm tbd">TBD</span>` : `<span class="m-tm">${name}</span>`;
    const row = (f) => {
      const mid = f.played ? `<span class="mscore">${f.homeScore}–${f.awayScore}</span>` : `<span class="mvs">VS</span>`;
      const date = (() => { try { return new Date(f.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch (e) { return f.date; } })();
      const winSide = !f.played ? null : f.homeScore > f.awayScore ? "home" : f.awayScore > f.homeScore ? "away" : f.homeWin ? "home" : f.awayWin ? "away" : null;
      const cls = (which) => winSide ? (winSide === which ? " win" : " lose") : "";
      const ownCls = (which) => winSide === which ? " win" : "";
      return `<div class="match ${f.played ? "played" : "upcoming"}">
        <div class="m-side${cls("home")}">${flagCell(f.home, f.homeTBD)}${nameCell(f.home, f.homeTBD)}</div>
        <div class="m-mid">
          <div class="m-vs">${f.oh ? `<span class="m-own${ownCls("home")}">${ownerAvatar(f.oh, 20)}</span>` : ""}${mid}${f.oa ? `<span class="m-own${ownCls("away")}">${ownerAvatar(f.oa, 20)}</span>` : ""}</div>
          <span class="m-round">${f.round || ""}</span>
          <span class="m-when">${f.played ? "FT · " + date : date + (f.time ? " · " + f.time : "")}</span>
        </div>
        <div class="m-side r${cls("away")}">${flagCell(f.away, f.awayTBD)}${nameCell(f.away, f.awayTBD)}</div>
      </div>`;
    };
    const up = res.upcoming || [], done = res.recent || [];
    let html = "";
    if (up.length) html += `<div class="fix-sub">Upcoming · ${up.length}</div><div class="fixgrid">${up.map(row).join("")}</div>`;
    if (done.length) html += `<div class="fix-sub">Results · ${done.length}</div><div class="fixgrid">${done.map(row).join("")}</div>`;
    $("#fixwrap").innerHTML = html || `<div class="card" style="padding:24px;color:var(--muted)">No pool fixtures yet.</div>`;
  }

  // ---- View-team modal -----------------------------------------------------
  function openModal(name) {
    const pl = Core.player(name);
    const st = Core.standings().find((r) => r.name === name);
    const p = Core.pot();
    const t1 = tier1(pl.picks);
    const ownsChamp = pl.picks.some((pk) => pk.stage === "champion");
    const ownsRunner = pl.picks.some((pk) => pk.stage === "runnerUp");
    const winChip = ownsChamp ? `<span class="chip win">🏆 Wins ${p.cur}${p.championAmt.toFixed(0)}</span>`
      : ownsRunner ? `<span class="chip win">🥈 Wins ${p.cur}${p.runnerUpAmt.toFixed(0)}</span>` : "";
    $("#modal-body").innerHTML = `
      <div class="mh">
        ${avatar(name, t1, 60)}
        <div>
          <div class="mh-name">${name}</div>
          <div class="mh-meta"><span class="chip prob">${st ? st.winPct : 0}% win prob</span><span class="chip">${st ? st.points : 0} pts</span><span class="chip">${pl.alive}/4 alive</span>${winChip}</div>
        </div>
      </div>
      <div class="mteams">${pl.picks.map((pk) => `
        <div class="mteam ${pk.dead ? "dead" : ""}${pk.recentOut ? " mourning" : ""}${pk.recentWin ? " glory" : ""}" data-team="${pk.team}">
          <span class="m-flag">${renderFlag(pk.team, { pixel: false })}</span>
          <div class="mteam-tx"><div class="mt-t">${pk.tierEmoji} Tier ${pk.tier} · ${pk.tierLabel}</div><div class="mt-n">${pk.team}</div><div class="mt-s">${pk.stageLabel}</div></div>
          ${pk.dead ? "" : `<button class="cheer" data-team="${pk.team}" title="Cheer for ${pk.team}">📣<span class="cheer-n">${cheerCount(pk.team) || ""}</span></button>`}
        </div>`).join("")}</div>`;
    $("#modal").hidden = false;
    // Rain on the specific team(s) that advanced or were eliminated in the last 24h.
    pl.picks.forEach((pk) => {
      const el = $(`#modal-body .mteam[data-team="${pk.team}"]`);
      if (pk.recentWin) rainOn(el, rainItems(["🎉", "🏆", "⚽"], [pk.team]));
      else if (pk.recentOut) rainOn(el, rainItems(["🪦", "😢", "⚽"], [pk.team]));
    });
  }
  const closeModal = () => { $("#modal").hidden = true; };

  $("#board").addEventListener("click", (e) => {
    const row = e.target.closest(".brow");
    if (row && row.dataset.player) openModal(row.dataset.player);
  });
  $("#modal-body").addEventListener("click", (e) => { const b = e.target.closest(".cheer"); if (b) { e.stopPropagation(); doCheer(b.dataset.team, b); } });
  $("#modal").addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // Upgrade flag fallbacks to illustrated portraits once managers.js is ready.
  window.onManagersReady = () => { hero(); board(); fixtures(); };

  // ---- Boot + 30-min live refresh ------------------------------------------
  hero();
  (async () => { await Core.load(); hero(); board(); fixtures(); })();
  setInterval(async () => { await Core.load(true); hero(); board(); fixtures(); }, 15 * 60 * 1000);
})();
