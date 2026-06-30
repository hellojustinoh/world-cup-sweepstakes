/* ============================================================================
   LIVE RESULTS LAYER
   ----------------------------------------------------------------------------
   Pulls the full 2026 World Cup schedule (fixtures + live scores + results) from
   ESPN's free public API — no key, CORS-enabled, complete coverage — and matches
   team names back to our owned teams via the alias table in data.js.
   Falls back to demo data (if enabled) or an empty schedule so the site never
   breaks. Public interface unchanged: getSchedule(force), resolveTeam, bust.
   ========================================================================== */

const SweepsAPI = (() => {
  // ESPN scoreboard, split into two ranges so neither hits the 100-event cap.
  const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=";
  const RANGES = ["20260601-20260628", "20260628-20260720"];

  function norm(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]/g, "")
      .trim();
  }

  // alias lookup: every name/alias (normalised) -> canonical owned-team name
  const aliasIndex = (() => {
    const idx = {};
    Object.entries(TEAM_META).forEach(([name, meta]) => {
      idx[norm(name)] = name;
      (meta.aliases || []).forEach((a) => { idx[norm(a)] = name; });
    });
    return idx;
  })();
  function resolveTeam(feedName) { return aliasIndex[norm(feedName)] || null; }

  async function fetchJson(url) {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // ESPN puts the real bracket round in event.season.slug; the notes headline
  // is usually empty. Map the slug to a readable label.
  const ROUND_LABEL = {
    "group-stage": "Group stage", "round-of-32": "Round of 32", "round-of-16": "Round of 16",
    "quarterfinals": "Quarter-final", "semifinals": "Semi-final", "final": "Final", "third-place": "Third place",
  };
  // A competitor that is an unresolved bracket slot ("Round of 32 3 Winner",
  // "Group A Runner-Up", ...) rather than an actual nation — show these as TBD.
  const PLACEHOLDER = /winner|runner-?up|loser|round of|group [a-z]\b|place/i;

  function normalizeEvent(e) {
    const c = e.competitions && e.competitions[0];
    if (!c || !c.competitors) return null;
    const H = c.competitors.find((x) => x.homeAway === "home") || c.competitors[0];
    const A = c.competitors.find((x) => x.homeAway === "away") || c.competitors[1];
    if (!H || !A) return null;
    const state = c.status && c.status.type && c.status.type.state; // pre | in | post
    const played = state === "post";
    const hn = H.team && H.team.displayName, an = A.team && A.team.displayName;
    const score = (x) => ((state === "post" || state === "in") && x.score != null && x.score !== "") ? Number(x.score) : null;
    let time = "";
    try { time = new Date(e.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); } catch (err) { time = (e.date || "").slice(11, 16); }
    const slug = (e.season && e.season.slug) || "";
    const round = ROUND_LABEL[slug] || (c.notes && c.notes[0] && c.notes[0].headline) || "Group stage";
    const rh = resolveTeam(hn), ra = resolveTeam(an);
    return {
      id: e.id,
      date: (e.date || "").slice(0, 10),
      iso: e.date || "",
      time,
      home: rh || hn,
      away: ra || an,
      homeOwned: !!rh,
      awayOwned: !!ra,
      homeTBD: !rh && PLACEHOLDER.test(hn || ""),
      awayTBD: !ra && PLACEHOLDER.test(an || ""),
      homeScore: score(H),
      awayScore: score(A),
      homeWin: !!H.winner,
      awayWin: !!A.winner,
      status: played ? "FT" : state === "in" ? "LIVE" : "Not Started",
      round,
      roundSlug: slug,
    };
  }

  async function fetchLive() {
    const seen = new Set(), events = [];
    for (const r of RANGES) {
      try {
        const j = await fetchJson(ESPN + r);
        (j.events || []).forEach((e) => { if (!seen.has(e.id)) { seen.add(e.id); events.push(e); } });
      } catch (err) { /* try next range */ }
    }
    return events.map(normalizeEvent).filter(Boolean);
  }

  function tagOwnership(f) {
    return { ...f, homeOwned: !!resolveTeam(f.home) || !!TEAM_META[f.home], awayOwned: !!resolveTeam(f.away) || !!TEAM_META[f.away] };
  }
  function sortFixtures(list) {
    return [...list].sort((a, b) => {
      const da = `${a.date} ${a.time || "00:00"}`, db = `${b.date} ${b.time || "00:00"}`;
      return da < db ? -1 : da > db ? 1 : 0;
    });
  }

  async function fetchSchedule() {
    if (CONFIG.useLiveApi) {
      try {
        const fixtures = await fetchLive();
        if (fixtures && fixtures.length) return { source: "live", fixtures: sortFixtures(fixtures) };
      } catch (err) {
        if (CONFIG.demoMode) return { source: "demo", fixtures: sortFixtures(DEMO_FIXTURES.map(tagOwnership)), error: err.message };
        return { source: "none", fixtures: [], error: err.message };
      }
    }
    if (CONFIG.demoMode) return { source: "demo", fixtures: sortFixtures(DEMO_FIXTURES.map(tagOwnership)) };
    return { source: "none", fixtures: [] };
  }

  // 15-minute cache so the feed feels live on match days while sparing the API.
  const CACHE_KEY = "sweeps.schedule.v2";
  const CACHE_TTL = 15 * 60 * 1000;
  function bust() { try { localStorage.removeItem(CACHE_KEY); } catch (e) {} }
  function readCache() {
    try { const c = JSON.parse(localStorage.getItem(CACHE_KEY)); if (c && Date.now() - c.t < CACHE_TTL) return c; } catch (e) {}
    return null;
  }
  function writeCache(data) { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch (e) {} }

  // Public: get the schedule. Returns { source, fixtures, error?, fetchedAt }.
  async function getSchedule(force) {
    if (!force) { const c = readCache(); if (c) return { ...c.data, fetchedAt: c.t }; }
    const data = await fetchSchedule();
    if (data.source === "live") writeCache(data);
    return { ...data, fetchedAt: Date.now() };
  }

  return { getSchedule, resolveTeam, bust };
})();
