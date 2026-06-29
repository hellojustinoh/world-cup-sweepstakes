/* ============================================================================
   SHARED CORE — data + logic reused by every layout variant.
   Depends on data.js, flags.js, api.js, char.js (all loaded before this).
   ========================================================================== */
const Core = (() => {
  const OWNER = {}, TIER = {}, PINDEX = {};
  PLAYERS.forEach((p, i) => { PINDEX[p.name] = i; p.picks.forEach((pk) => { OWNER[pk.team] = p.name; TIER[pk.team] = pk.tier; }); });

  // Each team's stage is derived live from the feed (see computeStages). Falls
  // back to the manual TEAM_META.stage only when the feed has no games for a team.
  let STAGES = {};
  const effStage = (t) => {
    if (CONFIG.demoStandings && DEMO_STAGES[t]) return DEMO_STAGES[t];
    if (STAGES[t]) return STAGES[t];
    return (TEAM_META[t] && TEAM_META[t].stage) || "group";
  };
  const owner = (t) => OWNER[t] || null;
  const bestStage = (p) => p.picks.reduce((b, pk) => (STAGE_ORDER[effStage(pk.team)] > STAGE_ORDER[b] ? effStage(pk.team) : b), "out");
  const barPct = (team) => { const st = effStage(team); if (st === "out") return 100; const r = STAGE_ORDER[st] < 0 ? 0 : Math.min(STAGE_ORDER[st], 7); return Math.max(9, Math.round((r / 7) * 100)); };

  // ---- Real results → per-team table (points/GD) from the live feed --------
  let STATS = {};
  function computeStats(fixtures) {
    const s = {};
    const get = (t) => (s[t] = s[t] || { pts: 0, gf: 0, ga: 0, gd: 0, played: 0, w: 0, d: 0, l: 0 });
    (fixtures || []).forEach((f) => {
      const hs = f.homeScore, as = f.awayScore;
      if (hs === null || as === null || hs === undefined || as === undefined) return;
      const H = get(f.home), A = get(f.away);
      H.played++; A.played++; H.gf += hs; H.ga += as; A.gf += as; A.ga += hs;
      if (hs > as) { H.w++; A.l++; H.pts += 3; } else if (hs < as) { A.w++; H.l++; A.pts += 3; } else { H.d++; A.d++; H.pts++; A.pts++; }
    });
    Object.values(s).forEach((v) => { v.gd = v.gf - v.ga; });
    return s;
  }
  const teamPts = (t) => (STATS[t] && STATS[t].pts) || 0;
  const teamGd = (t) => (STATS[t] && STATS[t].gd) || 0;
  const teamPlayed = (t) => (STATS[t] && STATS[t].played) || 0;

  // ---- Derive each team's stage from the live feed -------------------------
  // Each fixture carries its real round (ESPN season.slug). A team with an
  // upcoming fixture is alive in the round it is about to play; a team whose
  // games are all finished with none upcoming is out — unless their last game
  // was the final, which resolves to champion / runner-up by the result. So
  // standings, win probability and elimination all track results with no manual
  // updates.
  const SLUG2STAGE = {
    "group-stage": "group", "round-of-32": "r32", "round-of-16": "r16",
    "quarterfinals": "qf", "quarterfinal": "qf", "semifinals": "sf", "semifinal": "sf",
    "final": "final", "third-place": "sf",
  };
  function computeStages(fixtures) {
    const agg = {};
    const get = (t) => (agg[t] = agg[t] || { future: null, last: null });
    (fixtures || []).forEach((f) => {
      const stage = SLUG2STAGE[f.roundSlug] || "group";
      const ord = STAGE_ORDER[stage];
      const done = f.homeScore != null && f.awayScore != null;
      [["home", "away"], ["away", "home"]].forEach(([side]) => {
        const t = f[side];
        if (!t || !TEAM_META[t]) return; // only track known nations
        const g = get(t);
        if (done) {
          const gf = side === "home" ? f.homeScore : f.awayScore;
          const ga = side === "home" ? f.awayScore : f.homeScore;
          if (!g.last || ord >= g.last.ord) g.last = { stage, ord, win: gf > ga };
        } else if (!g.future || ord > g.future.ord) {
          g.future = { stage, ord };
        }
      });
    });
    const stages = {};
    Object.entries(agg).forEach(([t, g]) => {
      if (g.future) { stages[t] = g.future.stage; return; }      // alive: about to play this round
      if (g.last) {
        stages[t] = g.last.stage === "final" ? (g.last.win ? "champion" : "runnerUp") : "out";
      } else {
        stages[t] = "group";
      }
    });
    return stages;
  }

  // Fetch the live feed (cached) and recompute the results table + stages.
  async function load(force) {
    let live = { source: "none", fixtures: [] };
    try { if (typeof SweepsAPI !== "undefined") live = await SweepsAPI.getSchedule(force); } catch (e) {}
    STATS = computeStats(live.fixtures || []);
    STAGES = computeStages(live.fixtures || []);
    return live;
  }

  // per-player consistent character colours (jersey = their Tier-1 flag colour)
  function charFor(name) {
    const p = PLAYERS.find((x) => x.name === name);
    const i = PINDEX[name];
    const t1 = p.picks.find((pk) => pk.tier === 1).team;
    return { ...appearanceFor(name), jersey: flagPrimary(t1), seed: i };
  }

  function pot() {
    const total = CONFIG.buyInPerPerson * PLAYERS.length;
    const champTeam = Object.keys(TEAM_META).find((t) => effStage(t) === "champion") || null;
    const runnerTeam = Object.keys(TEAM_META).find((t) => effStage(t) === "runnerUp") || null;
    const finalists = Object.keys(TEAM_META).filter((t) => effStage(t) === "final");
    return {
      total, cur: CONFIG.currency,
      championAmt: total * CONFIG.championShare, runnerUpAmt: total * CONFIG.runnerUpShare,
      champPct: Math.round(CONFIG.championShare * 100), runnerPct: Math.round(CONFIG.runnerUpShare * 100),
      champTeam, runnerTeam, finalists,
      champOwner: champTeam ? OWNER[champTeam] : null, runnerOwner: runnerTeam ? OWNER[runnerTeam] : null,
    };
  }

  // Each team's chance of becoming champion. Driven mainly by pre-tournament
  // strength (POWER), amplified as a team advances through the bracket, and
  // nudged by real form (points so far). Normalised to sum to 100%.
  const STAGE_MULT = { out: 0, group: 1, r32: 1.35, r16: 1.9, qf: 2.8, sf: 4.4, final: 8, runnerUp: 0, champion: 60 };
  function champProbMap() {
    const teams = Object.keys(TEAM_META);
    const w = {}; let total = 0;
    teams.forEach((t) => {
      const st = effStage(t);
      const power = (typeof POWER !== "undefined" && POWER[t]) || 40;
      // Cubic: a 90-rated side is FAR likelier to win the cup than a 60-rated
      // one, even when both ease through the group. Bracket position amplifies,
      // real form nudges.
      const base = Math.pow(power / 100, 3) * 100;
      const ww = st === "out" ? 0 : base * (STAGE_MULT[st] || 1) + teamPts(t) * 3;
      w[t] = ww; total += ww;
    });
    const map = {};
    teams.forEach((t) => { map[t] = total > 0 ? w[t] / total : 0; });
    return map;
  }

  function standings() {
    const prob = champProbMap(); // P(team is champion) — a player wins by owning the champion
    return PLAYERS.map((p) => {
      const best = bestStage(p);
      const alive = p.picks.filter((pk) => effStage(pk.team) !== "out").length;
      const points = p.picks.reduce((s, pk) => s + teamPts(pk.team), 0);
      const gd = p.picks.reduce((s, pk) => s + teamGd(pk.team), 0);
      const played = p.picks.reduce((s, pk) => s + teamPlayed(pk.team), 0);
      const winRaw = p.picks.reduce((s, pk) => s + (prob[pk.team] || 0), 0);
      const winPct = Math.round(winRaw * 100);
      return { name: p.name, picks: p.picks.slice().sort((a, b) => a.tier - b.tier), best, bestLabel: STAGE_LABEL[best], rank: STAGE_ORDER[best], alive, out: alive === 0, points, gd, played, winPct, winRaw };
    }).sort((a, b) => b.points - a.points || b.gd - a.gd || b.winRaw - a.winRaw || a.name.localeCompare(b.name));
  }

  function player(name) {
    const p = PLAYERS.find((x) => x.name === name) || PLAYERS[0];
    const picks = p.picks.slice().sort((a, b) => a.tier - b.tier).map((pk) => ({
      tier: pk.tier, team: pk.team, stage: effStage(pk.team), stageLabel: STAGE_LABEL[effStage(pk.team)],
      dead: effStage(pk.team) === "out", pct: barPct(pk.team), tierLabel: TIERS[pk.tier].label, tierEmoji: TIERS[pk.tier].emoji,
    }));
    return { name: p.name, picks, alive: picks.filter((x) => !x.dead).length, best: STAGE_LABEL[bestStage(p)] };
  }

  async function quests(force) {
    let res = { source: "demo", fixtures: (typeof DEMO_FIXTURES !== "undefined" ? DEMO_FIXTURES : []) };
    try { if (typeof SweepsAPI !== "undefined") res = await SweepsAPI.getSchedule(force); } catch (e) { /* keep demo */ }
    let raw = (res.fixtures || []).slice();
    // During the design/demo phase, supplement the (sparse) live feed with the
    // demo slate so the Fixtures section is rich with upcoming games.
    if (CONFIG.demoMode && typeof DEMO_FIXTURES !== "undefined") {
      const seen = new Set(raw.map((f) => `${f.date}|${f.home}|${f.away}`));
      DEMO_FIXTURES.forEach((f) => { const k = `${f.date}|${f.home}|${f.away}`; if (!seen.has(k)) { seen.add(k); raw.push(f); } });
    }
    const norm = raw.filter((f) => OWNER[f.home] || OWNER[f.away]).map((f) => {
      const oh = OWNER[f.home], oa = OWNER[f.away];
      const played = f.homeScore !== null && f.awayScore !== null && f.homeScore !== undefined;
      return { ...f, oh, oa, rivalry: oh && oa && oh !== oa, played };
    });
    const at = (f) => `${f.date} ${f.time || "00:00"}`;
    const upcoming = norm.filter((f) => !f.played).sort((a, b) => at(a) < at(b) ? -1 : 1);
    const recent = norm.filter((f) => f.played).sort((a, b) => at(a) > at(b) ? -1 : 1);
    // Feature upcoming games first, then recent results.
    return { source: res.source, fetchedAt: res.fetchedAt, fixtures: [...upcoming, ...recent], upcoming, recent };
  }

  function graveyard() {
    return Object.keys(TEAM_META).filter((t) => effStage(t) === "out").sort().map((t) => ({ team: t, owner: OWNER[t] }));
  }

  const names = () => PLAYERS.map((p) => p.name);

  return { OWNER, TIER, PINDEX, effStage, owner, charFor, pot, standings, player, quests, graveyard, barPct, names, TIERS, load };
})();
