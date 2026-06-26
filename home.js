/* Homerun-style "warm editorial" layout — circular flag avatars, no characters.
   Reuses the shared Core (data.js, flags.js, api.js, core.js). */
(() => {
  const $ = (s) => document.querySelector(s);

  // Circular avatar = the player's Tier-1 nation flag, ringed in its flag colour.
  const tier1 = (picks) => (picks.find((p) => p.tier === 1) || picks[0]).team;
  const avatar = (team, size) =>
    `<span class="favatar" style="--av:${size || 44}px;--ring:${flagPrimary(team)}">${renderFlag(team, { pixel: false })}</span>`;

  // ---- Hero ----------------------------------------------------------------
  function hero() {
    const p = Core.pot();
    $("#potbtn").textContent = `The pot · ${p.cur}${p.total}`;
    $("#navpot").textContent = `${p.cur}${p.total} pot`;
    $("#herostat").textContent = `12 players · 48 teams · winner takes ${p.cur}${p.championAmt.toFixed(0)}`;

    const lead = Core.standings()[0];
    if (!lead) return;
    const t1 = tier1(lead.picks);
    $("#leadcard").innerHTML = `
      <span class="lead-badge">● Top of the table</span>
      <div class="lead-top">
        ${avatar(t1, 56)}
        <div>
          <div class="lead-name">${lead.name}</div>
          <div class="lead-role">${lead.points} pts · ${lead.alive}/4 teams alive</div>
        </div>
      </div>
      <div class="lead-quote">Out in front on points, holding the strongest hand of nations still alive in the draw.</div>
      <div class="lead-foot"><span class="lab">Odds to own the champion</span><span class="big">${lead.winPct}%</span></div>`;
  }

  // ---- Standings -----------------------------------------------------------
  function board() {
    const head = `<div class="bhead">
      <div class="h-r">#</div><div></div><div>Player</div>
      <div class="h-info">Win prob<span class="qmark">?</span><span class="tip">Modelled chance this player owns the eventual <b>champion</b> — from each team's strength rating, how far it has advanced, and live form. Updates with results.</span></div>
      <div class="h-r">Pts</div>
    </div>`;
    $("#board").innerHTML = head + Core.standings().map((r, i) => {
      const t1 = tier1(r.picks);
      const tag = i === 0 ? `<span class="b-tag">Top</span>` : "";
      return `<div class="brow ${i === 0 ? "lead" : ""} ${r.out ? "out" : ""}" data-player="${r.name}">
        <div class="b-rk">${i + 1}</div>
        <div>${avatar(t1, 40)}</div>
        <div>
          <div class="b-nm">${r.name}${tag}</div>
          <div class="b-sub">${r.out ? "All teams knocked out" : "Furthest: " + r.bestLabel} · ${r.alive}/4 alive</div>
        </div>
        <div class="b-win">${r.winPct}%</div>
        <div class="b-pts">${r.points}<small>pts</small></div>
      </div>`;
    }).join("");
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

    const row = (f) => {
      const mid = f.played ? `<span class="mscore">${f.homeScore}–${f.awayScore}</span>` : `<span class="mvs">VS</span>`;
      const date = (() => { try { return new Date(f.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch (e) { return f.date; } })();
      return `<div class="match ${f.rivalry ? "rivalry" : ""}">
        <div class="m-side"><span class="m-flag">${renderFlag(f.home, { pixel: false })}</span><span class="m-tm">${f.home}</span></div>
        <div class="m-mid">${mid}<span class="m-when">${f.played ? "FT · " + date : date + (f.time ? " · " + f.time : "")}</span>${f.rivalry ? `<span class="m-riv">⚔ ${f.oh} v ${f.oa}</span>` : ""}</div>
        <div class="m-side r"><span class="m-tm">${f.away}</span><span class="m-flag">${renderFlag(f.away, { pixel: false })}</span></div>
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
        ${avatar(t1, 60)}
        <div>
          <div class="mh-name">${name}</div>
          <div class="mh-meta"><span class="chip prob">${st ? st.winPct : 0}% win prob</span><span class="chip">${st ? st.points : 0} pts</span><span class="chip">${pl.alive}/4 alive</span>${winChip}</div>
        </div>
      </div>
      <div class="mteams">${pl.picks.map((pk) => `
        <div class="mteam ${pk.dead ? "dead" : ""}">
          <span class="m-flag">${renderFlag(pk.team, { pixel: false })}</span>
          <div><div class="mt-t">${pk.tierEmoji} Tier ${pk.tier} · ${pk.tierLabel}</div><div class="mt-n">${pk.team}</div><div class="mt-s">${pk.stageLabel}</div></div>
        </div>`).join("")}</div>`;
    $("#modal").hidden = false;
  }
  const closeModal = () => { $("#modal").hidden = true; };

  $("#board").addEventListener("click", (e) => {
    const row = e.target.closest(".brow");
    if (row && row.dataset.player) openModal(row.dataset.player);
  });
  $("#modal").addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // ---- Boot + 30-min live refresh ------------------------------------------
  hero();
  (async () => { await Core.load(); hero(); board(); fixtures(); })();
  setInterval(async () => { await Core.load(true); hero(); board(); fixtures(); }, 30 * 60 * 1000);
})();
