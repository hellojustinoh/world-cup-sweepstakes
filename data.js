/* ============================================================================
   WORLD CUP 2026 OFFICE SWEEPSTAKES — DATA & CONFIG
   ----------------------------------------------------------------------------
   This is the ONLY file you need to edit to keep the site up to date.
   Three things you'll touch:
     1. CONFIG          - pot size, shares, live-feed toggle.
     2. TEAM_META[x].stage  - bump a team as it advances or gets knocked out.
     3. CONFIG.demoMode - set to false once the real schedule is flowing.
   Everything else (standings, payouts, graveyard) recomputes automatically.
   ========================================================================== */

const CONFIG = {
  // --- Pot maths -----------------------------------------------------------
  buyInPerPerson: 8,          // every participant chips in this much
  currency: "$",
  championShare: 0.70,        // owner of the winning team takes this slice
  runnerUpShare: 0.30,        // owner of the runner-up takes this slice

  // --- Live results feed (TheSportsDB, keyless free tier) ------------------
  useLiveApi: true,
  theSportsDb: {
    apiKey: "3",              // free public test key, safe to expose
    worldCupLeagueId: "4429", // FIFA World Cup on TheSportsDB
    season: "2026",
  },

  // --- Preview / demo ------------------------------------------------------
  // demoMode lets the Quest Log fall back to sample fixtures if the live feed
  // is momentarily empty. OFF for the live site so only real matches show.
  demoMode: false,
  // demoStandings drives a FICTIONAL bracket snapshot. OFF for the live site:
  // standings come from real match results, and knockout progression is set
  // per team via TEAM_META[...].stage as rounds finish.
  demoStandings: false,

  tournamentName: "World Cup 2026",
  potShareNote: "Winner takes 70%, runner-up takes 30%.",
};

// Tier labels (purely how the hand was dealt — they do not affect the pot)
const TIERS = {
  1: { key: "elite",     label: "Elite",     emoji: "👑" },
  2: { key: "contender", label: "Contender", emoji: "🔥" },
  3: { key: "wildcard",  label: "Wildcard",  emoji: "🎲" },
  4: { key: "underdog",  label: "Underdog",  emoji: "🐶" },
};

/* ----------------------------------------------------------------------------
   PARTICIPANTS — each holds one team per tier (ordered 1 → 4).
-------------------------------------------------------------------------------*/
const PLAYERS = [
  { name: "Benoit",    picks: [{ tier: 1, team: "France" },      { tier: 2, team: "Uruguay" },       { tier: 3, team: "Panama" },          { tier: 4, team: "Cabo Verde" }] },
  { name: "David",     picks: [{ tier: 1, team: "England" },     { tier: 2, team: "Ecuador" },       { tier: 3, team: "Algeria" },         { tier: 4, team: "Bosnia & Herzegovina" }] },
  { name: "Jill",      picks: [{ tier: 1, team: "Netherlands" }, { tier: 2, team: "Switzerland" },   { tier: 3, team: "Paraguay" },        { tier: 4, team: "New Zealand" }] },
  { name: "Justin",    picks: [{ tier: 1, team: "Germany" },     { tier: 2, team: "South Korea" },   { tier: 3, team: "DR Congo" },        { tier: 4, team: "Haiti" }] },
  { name: "Katie",     picks: [{ tier: 1, team: "Colombia" },    { tier: 2, team: "Japan" },         { tier: 3, team: "Sweden" },          { tier: 4, team: "Uzbekistan" }] },
  { name: "Meiyin",    picks: [{ tier: 1, team: "Argentina" },   { tier: 2, team: "Senegal" },       { tier: 3, team: "Scotland" },        { tier: 4, team: "Qatar" }] },
  { name: "Regina",    picks: [{ tier: 1, team: "Portugal" },    { tier: 2, team: "United States" }, { tier: 3, team: "Côte d'Ivoire" },   { tier: 4, team: "Curaçao" }] },
  { name: "Shermaine", picks: [{ tier: 1, team: "Morocco" },     { tier: 2, team: "Iran" },          { tier: 3, team: "Egypt" },           { tier: 4, team: "Iraq" }] },
  { name: "Sri",       picks: [{ tier: 1, team: "Croatia" },     { tier: 2, team: "Mexico" },        { tier: 3, team: "Norway" },          { tier: 4, team: "South Africa" }] },
  { name: "Vernette",  picks: [{ tier: 1, team: "Spain" },       { tier: 2, team: "Australia" },     { tier: 3, team: "Czechia" },         { tier: 4, team: "Jordan" }] },
  { name: "Vivek",     picks: [{ tier: 1, team: "Brazil" },      { tier: 2, team: "Türkiye" },       { tier: 3, team: "Tunisia" },         { tier: 4, team: "Ghana" }] },
  { name: "Yasmin",    picks: [{ tier: 1, team: "Belgium" },     { tier: 2, team: "Austria" },       { tier: 3, team: "Canada" },          { tier: 4, team: "Saudi Arabia" }] },
];

/* ----------------------------------------------------------------------------
   TEAM METADATA
   flag     : emoji shown everywhere
   aliases  : alternate names the live feed might use (for matching results)
   stage    : where the team currently is. THIS is what you bump over time:
              'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'
                      | 'champion' | 'runnerUp' | 'out'
              Everyone starts in 'group'. Set 'out' when knocked out.
-------------------------------------------------------------------------------*/
const TEAM_META = {
  "France":               { flag: "🇫🇷", aliases: ["France"], stage: "group" },
  "Uruguay":              { flag: "🇺🇾", aliases: ["Uruguay"], stage: "group" },
  "Panama":               { flag: "🇵🇦", aliases: ["Panama"], stage: "group" },
  "Cabo Verde":           { flag: "🇨🇻", aliases: ["Cape Verde", "Cabo Verde"], stage: "group" },
  "England":              { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", aliases: ["England"], stage: "group" },
  "Ecuador":              { flag: "🇪🇨", aliases: ["Ecuador"], stage: "group" },
  "Algeria":              { flag: "🇩🇿", aliases: ["Algeria"], stage: "group" },
  "Bosnia & Herzegovina": { flag: "🇧🇦", aliases: ["Bosnia and Herzegovina", "Bosnia-Herzegovina", "Bosnia Herzegovina", "Bosnia"], stage: "group" },
  "Netherlands":          { flag: "🇳🇱", aliases: ["Netherlands", "Holland"], stage: "group" },
  "Switzerland":          { flag: "🇨🇭", aliases: ["Switzerland"], stage: "group" },
  "Paraguay":             { flag: "🇵🇾", aliases: ["Paraguay"], stage: "group" },
  "New Zealand":          { flag: "🇳🇿", aliases: ["New Zealand"], stage: "group" },
  "Germany":              { flag: "🇩🇪", aliases: ["Germany"], stage: "group" },
  "South Korea":          { flag: "🇰🇷", aliases: ["South Korea", "Korea Republic", "Korea"], stage: "group" },
  "DR Congo":             { flag: "🇨🇩", aliases: ["DR Congo", "Congo DR", "Democratic Republic of Congo"], stage: "group" },
  "Haiti":                { flag: "🇭🇹", aliases: ["Haiti"], stage: "group" },
  "Colombia":             { flag: "🇨🇴", aliases: ["Colombia"], stage: "group" },
  "Japan":                { flag: "🇯🇵", aliases: ["Japan"], stage: "group" },
  "Sweden":               { flag: "🇸🇪", aliases: ["Sweden"], stage: "group" },
  "Uzbekistan":           { flag: "🇺🇿", aliases: ["Uzbekistan"], stage: "group" },
  "Argentina":            { flag: "🇦🇷", aliases: ["Argentina"], stage: "group" },
  "Senegal":              { flag: "🇸🇳", aliases: ["Senegal"], stage: "group" },
  "Scotland":             { flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", aliases: ["Scotland"], stage: "group" },
  "Qatar":                { flag: "🇶🇦", aliases: ["Qatar"], stage: "group" },
  "Portugal":             { flag: "🇵🇹", aliases: ["Portugal"], stage: "group" },
  "United States":        { flag: "🇺🇸", aliases: ["USA", "United States", "US"], stage: "group" },
  "Côte d'Ivoire":        { flag: "🇨🇮", aliases: ["Ivory Coast", "Cote d'Ivoire", "Côte d'Ivoire"], stage: "group" },
  "Curaçao":              { flag: "🇨🇼", aliases: ["Curacao", "Curaçao"], stage: "group" },
  "Morocco":              { flag: "🇲🇦", aliases: ["Morocco"], stage: "group" },
  "Iran":                 { flag: "🇮🇷", aliases: ["Iran", "IR Iran"], stage: "group" },
  "Egypt":                { flag: "🇪🇬", aliases: ["Egypt"], stage: "group" },
  "Iraq":                 { flag: "🇮🇶", aliases: ["Iraq"], stage: "group" },
  "Croatia":              { flag: "🇭🇷", aliases: ["Croatia"], stage: "group" },
  "Mexico":               { flag: "🇲🇽", aliases: ["Mexico"], stage: "group" },
  "Norway":               { flag: "🇳🇴", aliases: ["Norway"], stage: "group" },
  "South Africa":         { flag: "🇿🇦", aliases: ["South Africa"], stage: "group" },
  "Spain":                { flag: "🇪🇸", aliases: ["Spain"], stage: "group" },
  "Australia":            { flag: "🇦🇺", aliases: ["Australia"], stage: "group" },
  "Czechia":              { flag: "🇨🇿", aliases: ["Czech Republic", "Czechia"], stage: "group" },
  "Jordan":               { flag: "🇯🇴", aliases: ["Jordan"], stage: "group" },
  "Brazil":               { flag: "🇧🇷", aliases: ["Brazil"], stage: "group" },
  "Türkiye":              { flag: "🇹🇷", aliases: ["Turkey", "Türkiye", "Turkiye"], stage: "group" },
  "Tunisia":              { flag: "🇹🇳", aliases: ["Tunisia"], stage: "group" },
  "Ghana":                { flag: "🇬🇭", aliases: ["Ghana"], stage: "group" },
  "Belgium":              { flag: "🇧🇪", aliases: ["Belgium"], stage: "group" },
  "Austria":              { flag: "🇦🇹", aliases: ["Austria"], stage: "group" },
  "Canada":               { flag: "🇨🇦", aliases: ["Canada"], stage: "group" },
  "Saudi Arabia":         { flag: "🇸🇦", aliases: ["Saudi Arabia", "KSA"], stage: "group" },
};

/* Pre-tournament strength / favouritism (0-100), ~ FIFA ranking + 2026 odds.
   Drives "win probability": France/Argentina are far likelier to win than
   USA/Mexico even when both are cruising through the group stage. */
const POWER = {
  "Argentina": 95, "France": 92, "Brazil": 90, "Spain": 90, "England": 86, "Portugal": 84,
  "Germany": 82, "Netherlands": 80, "Belgium": 76, "Croatia": 74, "Uruguay": 72, "Morocco": 70,
  "Colombia": 68, "Senegal": 64, "Japan": 62, "Switzerland": 60, "United States": 60, "Mexico": 58,
  "Norway": 58, "Türkiye": 58, "Austria": 56, "South Korea": 56, "Ecuador": 54, "Egypt": 54,
  "Côte d'Ivoire": 52, "Iran": 52, "Algeria": 52, "Australia": 52, "Czechia": 52, "Canada": 52,
  "Scotland": 50, "Sweden": 50, "Ghana": 50, "Paraguay": 48, "Tunisia": 46, "Bosnia & Herzegovina": 46,
  "DR Congo": 44, "Saudi Arabia": 42, "South Africa": 42, "Uzbekistan": 40, "Panama": 38, "Iraq": 38,
  "Qatar": 36, "New Zealand": 34, "Jordan": 34, "Cabo Verde": 32, "Curaçao": 30, "Haiti": 28,
};

// Stage ranking — how "close to the money" a team is. Higher = deeper.
const STAGE_ORDER = {
  out: -1, group: 0, r32: 1, r16: 2, qf: 3, sf: 4, final: 5, runnerUp: 6, champion: 7,
};
const STAGE_LABEL = {
  out: "Eliminated", group: "Group stage", r32: "Round of 32", r16: "Round of 16",
  qf: "Quarter-final", sf: "Semi-final", final: "Final", runnerUp: "Runner-up", champion: "Champion 🏆",
};

/* ----------------------------------------------------------------------------
   DEMO DATA (only used while CONFIG.demoMode === true)
   Clearly placeholder so the UI has something to render before kickoff.
   - DEMO_STAGES: a pretend snapshot of how far some teams have gone.
   - DEMO_FIXTURES: a handful of sample matches.
   Delete or ignore once the real feed is live.
-------------------------------------------------------------------------------*/
const DEMO_STAGES = {
  // Two finalists from different owners → an undecided, exciting pot.
  "Spain": "final", "Argentina": "final",
  "France": "sf", "England": "sf",
  "Brazil": "qf", "Morocco": "qf", "Netherlands": "qf", "Croatia": "qf",
  "Portugal": "r16", "Germany": "r16", "Japan": "r16", "Mexico": "r16",
  "Senegal": "r32", "United States": "r32", "Switzerland": "r32",
  "Qatar": "out", "Saudi Arabia": "out", "Haiti": "out", "New Zealand": "out",
  "Iraq": "out", "Panama": "out", "Curaçao": "out", "Jordan": "out",
};

const DEMO_FIXTURES = [
  // recent results
  { date: "2026-06-17", time: "20:00", home: "Mexico",      away: "Spain",       homeScore: 1, awayScore: 2, status: "FT", round: "Group stage" },
  { date: "2026-06-18", time: "18:00", home: "Brazil",      away: "Switzerland", homeScore: 3, awayScore: 1, status: "FT", round: "Group stage" },
  { date: "2026-06-18", time: "21:00", home: "Argentina",   away: "Egypt",       homeScore: 2, awayScore: 0, status: "FT", round: "Group stage" },
  // upcoming
  { date: "2026-06-19", time: "18:00", home: "England",     away: "Senegal",     homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-19", time: "21:00", home: "Netherlands", away: "Japan",       homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-20", time: "18:00", home: "Portugal",    away: "Türkiye",     homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-20", time: "21:00", home: "France",      away: "Australia",   homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-21", time: "18:00", home: "Belgium",     away: "Croatia",     homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-21", time: "21:00", home: "Colombia",    away: "Morocco",     homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-22", time: "18:00", home: "Germany",     away: "Uruguay",     homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-22", time: "21:00", home: "United States", away: "Iran",      homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-23", time: "18:00", home: "Spain",       away: "Ecuador",     homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-23", time: "21:00", home: "Ghana",       away: "Norway",      homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-24", time: "18:00", home: "Argentina",   away: "Canada",      homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-24", time: "21:00", home: "South Korea", away: "Sweden",      homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-25", time: "18:00", home: "Mexico",      away: "Algeria",     homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-25", time: "21:00", home: "Austria",     away: "Paraguay",    homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-26", time: "18:00", home: "Brazil",      away: "Scotland",    homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
  { date: "2026-06-26", time: "21:00", home: "Côte d'Ivoire", away: "Tunisia",   homeScore: null, awayScore: null, status: "Not Started", round: "Group stage" },
];
