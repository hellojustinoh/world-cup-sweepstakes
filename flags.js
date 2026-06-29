/* ============================================================================
   SHARED FLAG DATA + RENDERER
   renderFlag(team, {pixel}) -> SVG string.
     pixel:true  → crisp 8-bit grid (for the pixel themes).
     pixel:false → clean VECTOR flag (real circles/diamonds/crosses/stripes)
                   for the smooth themes (Duolingo, Storybook, etc.).
   ========================================================================== */

const FLAGS = {
  "France": { v: ["#0055A4", "#ffffff", "#EF4135"] },
  "Uruguay": { h: ["#ffffff", "#0038A8", "#ffffff", "#0038A8", "#ffffff"] },
  "Panama": { grid: ["wwwwwwrrrrrr", "wwwwwwrrrrrr", "wwwwwwrrrrrr", "wwwwwwrrrrrr", "bbbbbbwwwwww", "bbbbbbwwwwww", "bbbbbbwwwwww", "bbbbbbwwwwww"], map: { w: "#ffffff", r: "#D21034", b: "#072357" } },
  "Cabo Verde": { h: [["#003893", 4], ["#ffffff", 1], ["#cf2027", 1], ["#ffffff", 1], ["#003893", 2]] },
  "England": { grid: ["wwwwwrrwwwww", "wwwwwrrwwwww", "wwwwwrrwwwww", "rrrrrrrrrrrr", "rrrrrrrrrrrr", "wwwwwrrwwwww", "wwwwwrrwwwww", "wwwwwrrwwwww"], map: { w: "#ffffff", r: "#CF142B" } },
  "Ecuador": { h: [["#FFDD00", 2], ["#034EA2", 1], ["#ED1C24", 1]] },
  "Algeria": { v: ["#006233", "#ffffff"] },
  "Bosnia & Herzegovina": { c: "#002395" },
  "Netherlands": { h: ["#AE1C28", "#ffffff", "#21468B"] },
  "Switzerland": { grid: ["RRRRRRRRRRRR", "RRRRRwwRRRRR", "RRRRRwwRRRRR", "RRwwwwwwwwRR", "RRwwwwwwwwRR", "RRRRRwwRRRRR", "RRRRRwwRRRRR", "RRRRRRRRRRRR"], map: { R: "#FF0000", w: "#ffffff" } },
  "Paraguay": { h: ["#D52B1E", "#ffffff", "#0038A8"] },
  "New Zealand": { c: "#00247D" },
  "Germany": { h: ["#000000", "#DD0000", "#FFCE00"] },
  "South Korea": { grid: ["wwwwwwwwwwww", "wwwwwwwwwwww", "wwwwrrrrwwww", "wwwrrrrrrwww", "wwwbbbbbbwww", "wwwwbbbbwwww", "wwwwwwwwwwww", "wwwwwwwwwwww"], map: { w: "#ffffff", r: "#CD2E3A", b: "#0047A0" } },
  "DR Congo": { c: "#007FFF" },
  "Haiti": { h: ["#00209F", "#D21034"] },
  "Colombia": { h: [["#FCD116", 2], ["#003893", 1], ["#CE1126", 1]] },
  "Japan": { grid: ["wwwwwwwwwwww", "wwwwwwwwwwww", "wwwwrrrrwwww", "wwwrrrrrrwww", "wwwrrrrrrwww", "wwwwrrrrwwww", "wwwwwwwwwwww", "wwwwwwwwwwww"], map: { w: "#ffffff", r: "#BC002D" } },
  "Sweden": { grid: ["bbbyybbbbbbb", "bbbyybbbbbbb", "bbbyybbbbbbb", "yyyyyyyyyyyy", "yyyyyyyyyyyy", "bbbyybbbbbbb", "bbbyybbbbbbb", "bbbyybbbbbbb"], map: { b: "#006AA7", y: "#FECC00" } },
  "Uzbekistan": { h: ["#0099B5", "#ffffff", "#1EB53A"] },
  "Argentina": { h: ["#74ACDF", "#ffffff", "#74ACDF"] },
  "Senegal": { v: ["#00853F", "#FDEF42", "#E31B23"] },
  "Scotland": { grid: ["wwbbbbbbbbww", "bwwbbbbbbwwb", "bbwwbbbbwwbb", "bbbwwbbwwbbb", "bbbwwbbwwbbb", "bbwwbbbbwwbb", "bwwbbbbbbwwb", "wwbbbbbbbbww"], map: { b: "#005EB8", w: "#ffffff" } },
  "Qatar": { v: [["#ffffff", 1], ["#8A1538", 4]] },
  "Portugal": { v: [["#006600", 2], ["#FF0000", 3]] },
  "United States": { grid: ["BBBBBrrrrrrr", "BBBBBwwwwwww", "BBBBBrrrrrrr", "BBBBBwwwwwww", "rrrrrrrrrrrr", "wwwwwwwwwwww", "rrrrrrrrrrrr", "wwwwwwwwwwww"], map: { B: "#3C3B6E", r: "#B22234", w: "#ffffff" } },
  "Côte d'Ivoire": { v: ["#FF8200", "#ffffff", "#009A44"] },
  "Curaçao": { c: "#002B7F" },
  "Morocco": { c: "#C1272D" },
  "Iran": { h: ["#239F40", "#ffffff", "#DA0000"] },
  "Egypt": { h: ["#CE1126", "#ffffff", "#000000"] },
  "Iraq": { h: ["#CE1126", "#ffffff", "#000000"] },
  "Croatia": { h: ["#FF0000", "#ffffff", "#171796"] },
  "Mexico": { v: ["#006847", "#ffffff", "#CE1126"] },
  "Norway": { grid: ["RRwBwRRRRRRR", "RRwBwRRRRRRR", "RRwBwRRRRRRR", "wwwwwwwwwwww", "BBBBBBBBBBBB", "wwwwwwwwwwww", "RRwBwRRRRRRR", "RRwBwRRRRRRR"], map: { R: "#EF2B2D", w: "#ffffff", B: "#002868" } },
  "South Africa": { c: "#007749" },
  "Spain": { h: [["#AA151B", 1], ["#F1BF00", 2], ["#AA151B", 1]] },
  "Australia": { c: "#00247D" },
  "Czechia": { grid: ["Bwwwwwwwwwww", "BBwwwwwwwwww", "BBBwwwwwwwww", "BBBBwwwwwwww", "BBBBrrrrrrrr", "BBBrrrrrrrrr", "BBrrrrrrrrrr", "Brrrrrrrrrrr"], map: { B: "#11457E", w: "#ffffff", r: "#D7141A" } },
  "Jordan": { h: ["#000000", "#ffffff", "#007A3D"] },
  "Brazil": { grid: ["gggggggggggg", "gggggyyggggg", "ggggyyyygggg", "gggyybbyyggg", "gggyybbyyggg", "ggggyyyygggg", "gggggyyggggg", "gggggggggggg"], map: { g: "#009C3B", y: "#FFDF00", b: "#002776" } },
  "Türkiye": { c: "#E30A17" },
  "Tunisia": { c: "#E70013" },
  "Ghana": { h: ["#CE1126", "#FCD116", "#006B3F"] },
  "Belgium": { v: ["#000000", "#FAE042", "#ED2939"] },
  "Austria": { h: ["#ED2939", "#ffffff", "#ED2939"] },
  "Canada": { v: [["#FF0000", 1], ["#ffffff", 2], ["#FF0000", 1]] },
  "Saudi Arabia": { c: "#006C35" },
};

function flagPrimary(team) {
  const s = FLAGS[team];
  if (!s) return "#7aa0c0";
  if (s.c) return s.c;
  if (s.h || s.v) { const f = (s.h || s.v)[0]; return Array.isArray(f) ? f[0] : f; }
  if (s.grid) return Object.values(s.map)[0];
  return "#7aa0c0";
}

/* ---- VECTOR flags (smooth mode) — real shapes in a 12×8 box ---------------- */
const _star = (cx, cy, R, r, fill, stroke) => {
  let pts = "";
  for (let i = 0; i < 10; i++) {
    const rad = (i % 2 ? r : R), a = (-90 + i * 36) * Math.PI / 180;
    pts += `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)} `;
  }
  return `<polygon points="${pts.trim()}" fill="${fill || "none"}"${stroke ? ` stroke="${stroke}" stroke-width="0.3"` : ""}/>`;
};
const VEC = {
  "Japan": () => `<rect width="12" height="8" fill="#fff"/><circle cx="6" cy="4" r="2.3" fill="#BC002D"/>`,
  "South Korea": () => {
    const cx = 6, cy = 4, R = 2.15, r = R / 2;
    const red = `M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy} A${r},${r} 0 0 0 ${cx},${cy} A${r},${r} 0 0 1 ${cx - R},${cy} Z`;
    const blue = `M${cx - R},${cy} A${R},${R} 0 0 0 ${cx + R},${cy} A${r},${r} 0 0 1 ${cx},${cy} A${r},${r} 0 0 0 ${cx - R},${cy} Z`;
    const bar = (x, y, a) => `<g transform="translate(${x},${y}) rotate(${a})"><rect x="-1" y="-0.62" width="2" height="0.26" fill="#1a1a1a"/><rect x="-1" y="-0.13" width="2" height="0.26" fill="#1a1a1a"/><rect x="-1" y="0.36" width="2" height="0.26" fill="#1a1a1a"/></g>`;
    return `<rect width="12" height="8" fill="#fff"/><path d="${blue}" fill="#0047A0"/><path d="${red}" fill="#CD2E3A"/>${bar(2.1, 1.7, -59)}${bar(9.9, 1.7, 59)}${bar(2.1, 6.3, 59)}${bar(9.9, 6.3, -59)}`;
  },
  "Switzerland": () => `<rect width="12" height="8" fill="#FF0000"/><rect x="5.1" y="1.8" width="1.8" height="4.4" fill="#fff"/><rect x="3.8" y="3.1" width="4.4" height="1.8" fill="#fff"/>`,
  "England": () => `<rect width="12" height="8" fill="#fff"/><rect x="5.2" width="1.6" height="8" fill="#CF142B"/><rect y="3.2" width="12" height="1.6" fill="#CF142B"/>`,
  "Scotland": () => `<rect width="12" height="8" fill="#005EB8"/><path d="M0,0 L1.9,0 L12,6.95 L12,8 L10.1,8 L0,1.05 Z" fill="#fff"/><path d="M12,0 L10.1,0 L0,6.95 L0,8 L1.9,8 L12,1.05 Z" fill="#fff"/>`,
  "Sweden": () => `<rect width="12" height="8" fill="#006AA7"/><rect x="3.3" width="1.6" height="8" fill="#FECC00"/><rect y="3.2" width="12" height="1.6" fill="#FECC00"/>`,
  "Norway": () => `<rect width="12" height="8" fill="#EF2B2D"/><rect x="2.7" width="2.4" height="8" fill="#fff"/><rect y="2.8" width="12" height="2.4" fill="#fff"/><rect x="3.3" width="1.2" height="8" fill="#002868"/><rect y="3.4" width="12" height="1.2" fill="#002868"/>`,
  "Brazil": () => `<rect width="12" height="8" fill="#009C3B"/><polygon points="6,0.9 11.1,4 6,7.1 0.9,4" fill="#FFDF00"/><circle cx="6" cy="4" r="1.7" fill="#002776"/>`,
  "United States": () => { let s = `<rect width="12" height="8" fill="#B22234"/>`; for (let i = 1; i < 13; i += 2) s += `<rect y="${(i * 8 / 13).toFixed(2)}" width="12" height="${(8 / 13).toFixed(2)}" fill="#fff"/>`; return s + `<rect width="4.8" height="${(8 / 13 * 7).toFixed(2)}" fill="#3C3B6E"/>`; },
  "Panama": () => `<rect width="6" height="4" fill="#fff"/><rect x="6" width="6" height="4" fill="#D21034"/><rect y="4" width="6" height="4" fill="#072357"/><rect x="6" y="4" width="6" height="4" fill="#fff"/>` + _star(3, 2, 1, 0.42, "#072357") + _star(9, 6, 1, 0.42, "#D21034"),
  "Czechia": () => `<rect width="12" height="4" fill="#fff"/><rect y="4" width="12" height="4" fill="#D7141A"/><polygon points="0,0 5,4 0,8" fill="#11457E"/>`,
  "Türkiye": () => `<rect width="12" height="8" fill="#E30A17"/><circle cx="5.2" cy="4" r="1.9" fill="#fff"/><circle cx="5.85" cy="4" r="1.5" fill="#E30A17"/>` + _star(7.5, 4, 0.9, 0.38, "#fff"),
  "Tunisia": () => `<rect width="12" height="8" fill="#E70013"/><circle cx="6" cy="4" r="2.1" fill="#fff"/><circle cx="6.4" cy="4" r="1.4" fill="#E70013"/>` + _star(6.9, 4, 0.7, 0.3, "#E70013"),
  "Morocco": () => `<rect width="12" height="8" fill="#C1272D"/>` + _star(6, 4, 2, 0.9, "none", "#006233"),
  "DR Congo": () => `<rect width="12" height="8" fill="#007FFF"/><polygon points="0,8 1.7,8 12,1.5 12,0 10.3,0 0,6.5 Z" fill="#F7D618"/>` + _star(2, 1.7, 1.1, 0.46, "#F7D618"),
  "Jordan": () => `<rect width="12" height="2.67" fill="#000000"/><rect y="2.67" width="12" height="2.66" fill="#fff"/><rect y="5.33" width="12" height="2.67" fill="#007A3D"/><polygon points="0,0 5,4 0,8" fill="#CE1126"/>` + _star(1.7, 4, 0.7, 0.3, "#fff"),
  "Algeria": () => `<rect width="6" height="8" fill="#006233"/><rect x="6" width="6" height="8" fill="#fff"/><circle cx="6.3" cy="4" r="1.6" fill="#D21034"/><circle cx="6.9" cy="4" r="1.25" fill="#fff"/>` + _star(7.7, 4, 0.7, 0.3, "#D21034"),
  "Curaçao": () => `<rect width="12" height="8" fill="#002B7F"/><rect y="5.5" width="12" height="1.1" fill="#F9E814"/>` + _star(2.3, 2, 0.8, 0.34, "#fff") + _star(3.7, 3.4, 1, 0.42, "#fff"),
};

let _flUid = 0;
function _stripes(list, horizontal, round) {
  const arr = list.map((e) => Array.isArray(e) ? e : [e, 1]);
  const total = arr.reduce((s, e) => s + e[1], 0);
  const span = horizontal ? 8 : 12;
  let pos = 0, out = "";
  arr.forEach(([c, wt]) => {
    let sz = (wt / total) * span; if (round) sz = Math.round(sz);
    if (horizontal) out += `<rect x="0" y="${pos}" width="12" height="${sz}" fill="${c}"/>`;
    else out += `<rect x="${pos}" y="0" width="${sz}" height="8" fill="${c}"/>`;
    pos += sz;
  });
  return out;
}
function _cells(spec) {
  if (spec.grid) { let c = ""; spec.grid.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const col = spec.map[row[x]]; if (col) c += `<rect x="${x}" y="${y}" width="1" height="1" fill="${col}"/>`; } }); return c; }
  if (spec.h || spec.v) return _stripes(spec.h || spec.v, !!spec.h, true);
  return `<rect width="12" height="8" fill="${spec.c}"/>`;
}

/* ---- ISO 3166-1 alpha-2 codes -> real flag icons --------------------------- */
const FLAG_ISO = {
  "France": "fr", "Uruguay": "uy", "Panama": "pa", "Cabo Verde": "cv",
  "England": "gb-eng", "Ecuador": "ec", "Algeria": "dz", "Bosnia & Herzegovina": "ba",
  "Netherlands": "nl", "Switzerland": "ch", "Paraguay": "py", "New Zealand": "nz",
  "Germany": "de", "South Korea": "kr", "DR Congo": "cd", "Haiti": "ht",
  "Colombia": "co", "Japan": "jp", "Sweden": "se", "Uzbekistan": "uz",
  "Argentina": "ar", "Senegal": "sn", "Scotland": "gb-sct", "Qatar": "qa",
  "Portugal": "pt", "United States": "us", "Côte d'Ivoire": "ci", "Curaçao": "cw",
  "Morocco": "ma", "Iran": "ir", "Egypt": "eg", "Iraq": "iq",
  "Croatia": "hr", "Mexico": "mx", "Norway": "no", "South Africa": "za",
  "Spain": "es", "Australia": "au", "Czechia": "cz", "Jordan": "jo",
  "Brazil": "br", "Türkiye": "tr", "Tunisia": "tn", "Ghana": "gh",
  "Belgium": "be", "Austria": "at", "Canada": "ca", "Saudi Arabia": "sa",
};
// Real flag artwork from the flag-icons set, served via jsDelivr.
const FLAG_BASE = "https://cdn.jsdelivr.net/npm/flag-icons@7/flags/4x3/";

// Accurate flag icon for a nation: the real flag rendered as an <img> that fills
// its container. Falls back to the nation's primary colour for any unmapped name.
// The `pixel` option is accepted for call-site compatibility but no longer used.
function renderFlag(team, opts = {}) {
  const code = FLAG_ISO[team];
  if (!code) {
    return `<svg width="100%" height="100%" viewBox="0 0 12 8" preserveAspectRatio="none" style="display:block"><rect width="12" height="8" fill="${flagPrimary(team)}"/></svg>`;
  }
  return `<img class="flag-img" src="${FLAG_BASE}${code}.svg" alt="${team} flag" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block" />`;
}
