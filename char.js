/* ============================================================================
   SHARED CHARACTER — global animeChar() used by every layout variant.
   Soft-anime chibi with cute, HAPPY eyes, male/female hair, and per-person
   skin/hair/eye tones (ethnicity). One source of truth for all pages.
   ========================================================================== */
const _parse = (h) => { const n = parseInt((h || "#888").slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const _hex = (r, g, b) => "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
const cDarken = (h, f) => { const [r, g, b] = _parse(h); return _hex(r * f, g * f, b * f); };
const cLighten = (h, f) => { const [r, g, b] = _parse(h); return _hex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f); };

/* Per-person look. gender drives hair length; skin/hair/iris give ethnicity. */
const APPEARANCE = {
  Jill:      { gender: "f", skin: "#ffd9b8", hair: "#2a2330", iris: "#4a2e20" }, // Singaporean
  Vivek:     { gender: "m", skin: "#cf9560", hair: "#241c20", iris: "#3a241a" }, // Indian
  Benoit:    { gender: "m", skin: "#ffe3cd", hair: "#6b4a32", iris: "#5b7fc0" }, // French caucasian
  Yasmin:    { gender: "f", skin: "#efc59a", hair: "#241e18", iris: "#3a241a" }, // Persian
  Justin:    { gender: "m", skin: "#ffdcc0", hair: "#221d28", iris: "#3a241a" }, // Korean
  Shermaine: { gender: "f", skin: "#ffd9b8", hair: "#241f2a", iris: "#3a241a" }, // Singaporean
  Katie:     { gender: "f", skin: "#ffe4cf", hair: "#c79a4e", iris: "#5a8a5a" }, // NZ caucasian
  David:     { gender: "m", skin: "#ffdcc0", hair: "#1f1a24", iris: "#3a241a" }, // Chinese
  Regina:    { gender: "f", skin: "#ffd6b4", hair: "#241f2a", iris: "#3a241a" }, // Singaporean
  Meiyin:    { gender: "f", skin: "#ffd9b8", hair: "#221d26", iris: "#3a241a" }, // Singaporean
  Vernette:  { gender: "f", skin: "#f6cda0", hair: "#33241c", iris: "#3a241a" }, // Malaysian
  Sri:       { gender: "m", skin: "#bd7f4a", hair: "#201820", iris: "#3a241a" }, // Indian
};
const appearanceFor = (name) => APPEARANCE[name] || { gender: "m", skin: "#ffd9bd", hair: "#3b2a22", iris: "#5b3a2a" };

let _charUid = 0;
function animeChar(opts) {
  const o = opts || {};
  const size = o.size || 120;
  const seed = o.seed || 0;
  const jersey = o.jersey || "#ff6b6b";
  const hair = o.hair || "#3b2a22";
  const iris = o.iris || "#5b3a2a";
  const skin = o.skin || "#ffd9bd";
  const female = o.gender === "f";
  const skinSh = cDarken(skin, 0.86);
  const ink = "#41333b", hairDk = cDarken(hair, 0.7), hairHi = cLighten(hair, 0.22);
  const id = "ch" + (_charUid++);
  const G = { skin: id + "s", hair: id + "h", jersey: id + "j", iris: id + "i" };

  // Soft early-2000s-anime eye: almond sclera, a single iris with one gentle
  // highlight, a darker upper lash line with a small outer flick, and a soft
  // brow that matches the hair. Smaller + calmer than a chibi sparkle-eye.
  const eye = (cx) => {
    const s = cx < 50 ? -1 : 1;
    const inX = cx - s * 7, outX = cx + s * 8;
    const clip = id + "e" + (cx < 50 ? "L" : "R");
    const sclera = `M${inX},51 Q${cx},44 ${outX},50 Q${cx},54.6 ${inX},51 Z`;
    const brow = female
      ? `<path d="M${cx - 5.2},37.6 Q${cx},36.3 ${cx + 5.2},37.9" stroke="${hairDk}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
      : `<path d="M${cx - 5.8},38.4 Q${cx},37.3 ${cx + 5.8},38.6" stroke="${hairDk}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    return `
      <clipPath id="${clip}"><path d="${sclera}"/></clipPath>
      <path d="${sclera}" fill="#fbf7f4"/>
      <g clip-path="url(#${clip})">
        <ellipse cx="${cx}" cy="50.4" rx="5.6" ry="6.7" fill="url(#${G.iris})"/>
        <ellipse cx="${cx}" cy="51" rx="2.1" ry="2.7" fill="#241d2b"/>
        <circle cx="${cx - s * 1.8}" cy="47.3" r="2.3" fill="#ffffff"/>
        <circle cx="${cx + s * 2.3}" cy="52.6" r="0.95" fill="#ffffff" opacity="0.78"/>
      </g>
      <path d="M${cx - s * 8},50.6 Q${cx},42.7 ${cx + s * 8.6},49.1 Q${cx + s * 10.2},49.6 ${cx + s * 10.9},51.2" stroke="${ink}" stroke-width="2.1" fill="none" stroke-linecap="round"/>
      <path d="M${cx - s * 6},53.9 Q${cx},55.6 ${cx + s * 6},53.7" stroke="${skinSh}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.6"/>
      ${brow}`;
  };
  const lid = (cx) => `<path class="lid" d="M${cx - 8},50.4 Q${cx},44 ${cx + 8},49.8 Q${cx},54.8 ${cx - 8},50.4 Z" fill="url(#${G.skin})"/>`;

  // Soft tapered face — a real chin instead of a perfect bobble-circle.
  const face = `M50,15 C35,15 26,25 25.5,41 C25,52.5 28.5,63 35.5,70 Q42,75.2 50,76 Q58,75.2 64.5,70 C71.5,63 75,52.5 74.5,41 C74,25 65,15 50,15 Z`;

  // Hair: soft chunky locks with scalloped tips, not a smooth helmet.
  const hairBack = female
    ? `<path d="M50,12 C27,12 17,27 16.5,47 C16,62 18.5,80 22.5,96 L32,93.5 C28,80 27,65 28.5,53 C26,44 31,24 50,21 C69,24 74,44 71.5,53 C73,65 72,80 68,93.5 L77.5,96 C81.5,80 84,62 83.5,47 C83,27 73,12 50,12 Z" fill="url(#${G.hair})"/>`
    : `<path d="M50,11.5 C30,11.5 20,25 20,43 C20,47.5 21,51 24,52.5 L27,44 C25.5,36 31,24 50,22.5 C69,24 74.5,36 73,44 L76,52.5 C79,51 80,47.5 80,43 C80,25 70,11.5 50,11.5 Z" fill="url(#${G.hair})"/>`;

  const bangs = female
    ? `<path d="M22,45.5 C21,28 32,21 50,21 C68,21 79,28 78,45.5 C74,42 70,43 67,47.5 C64,42 60,42 57,46.5 C55.5,40 53,40 51,45.5 C49,40 46.5,41 45,46.5 C42,42 38,42 35,47.5 C31.5,43 26,42 22,45.5 Z" fill="url(#${G.hair})"/>`
    : `<path d="M22,44.5 C21,27 33,21 50,21 C67,21 79,27 78,44.5 C75,40.5 71,41.5 68,46 C65,39.5 61,40.5 58,44.5 C56,38.5 53,39.5 50,43.5 C47,39.5 43,40.5 40,44.5 C37,40.5 33,41.5 30,46 C27,41.5 25,42.5 22,44.5 Z" fill="url(#${G.hair})"/>`;

  // Soft face-framing strands down the sides.
  const sideLocks = female
    ? `<path d="M20,42 Q13.5,56 19,70 Q23.5,65 23,55 Q21,47 27,42 Z" fill="url(#${G.hair})"/>
       <path d="M80,42 Q86.5,56 81,70 Q76.5,65 77,55 Q79,47 73,42 Z" fill="url(#${G.hair})"/>`
    : "";

  return `
<svg class="anime" width="${size}" viewBox="0 0 100 132" style="--d:-${(seed * 0.5).toFixed(2)}s" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${G.skin}" cx="40%" cy="32%" r="72%"><stop offset="0" stop-color="${cLighten(skin, 0.26)}"/><stop offset="1" stop-color="${skin}"/></radialGradient>
    <linearGradient id="${G.hair}" gradientUnits="userSpaceOnUse" x1="50" y1="9" x2="56" y2="98"><stop offset="0" stop-color="${hairHi}"/><stop offset="1" stop-color="${hairDk}"/></linearGradient>
    <linearGradient id="${G.jersey}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cLighten(jersey, 0.2)}"/><stop offset="1" stop-color="${cDarken(jersey, 0.74)}"/></linearGradient>
    <radialGradient id="${G.iris}" cx="50%" cy="34%" r="80%"><stop offset="0" stop-color="${cLighten(iris, 0.55)}"/><stop offset="0.62" stop-color="${iris}"/><stop offset="1" stop-color="${cDarken(iris, 0.62)}"/></radialGradient>
  </defs>
  <g class="floaty">
    <rect x="42" y="104" width="6" height="16" rx="3" fill="${skin}"/>
    <rect x="52" y="104" width="6" height="16" rx="3" fill="${skin}"/>
    <rect x="41.5" y="113" width="7" height="6" rx="2" fill="#fbfbf6"/>
    <rect x="51.5" y="113" width="7" height="6" rx="2" fill="#fbfbf6"/>
    <ellipse cx="45" cy="122" rx="5.5" ry="3.6" fill="${cDarken(jersey, 0.5)}"/>
    <ellipse cx="55" cy="122" rx="5.5" ry="3.6" fill="${cDarken(jersey, 0.5)}"/>
    <path d="M37,98 Q50,104 63,98 L62,110 Q56,112 51,109 Q50,107 49,109 Q44,112 38,110 Z" fill="#33406b"/>
    <path d="M33,101 Q30,82 41,77 L59,77 Q70,82 67,101 Q50,106 33,101 Z" fill="url(#${G.jersey})"/>
    <ellipse cx="30" cy="85" rx="7" ry="8" fill="url(#${G.jersey})"/>
    <ellipse cx="70" cy="85" rx="7" ry="8" fill="url(#${G.jersey})"/>
    <circle cx="27" cy="96" r="4.2" fill="${skin}"/>
    <circle cx="73" cy="96" r="4.2" fill="${skin}"/>
    <path d="M44,77 Q50,82 56,77 L54,80 Q50,83 46,80 Z" fill="#ffffff" opacity="0.85"/>
    <rect x="46" y="70" width="8" height="9" rx="3" fill="${skinSh}"/>
    ${hairBack}
    <path d="${face}" fill="url(#${G.skin})"/>
    <ellipse cx="25.5" cy="51" rx="3" ry="4.6" fill="${skin}"/>
    <ellipse cx="74.5" cy="51" rx="3" ry="4.6" fill="${skin}"/>
    <ellipse cx="33.5" cy="59" rx="5" ry="3" fill="#ff9c9c" opacity="${female ? 0.34 : 0.16}"/>
    <ellipse cx="66.5" cy="59" rx="5" ry="3" fill="#ff9c9c" opacity="${female ? 0.34 : 0.16}"/>
    <path d="M49,55.5 Q47.7,58.6 50.4,59.3" stroke="${skinSh}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.55"/>
    <g class="eyes">${eye(38)}${eye(62)}</g>
    <path d="M45.5,63 Q50,66.8 54.5,63" stroke="#b76a60" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <g class="blink">${lid(38)}${lid(62)}</g>
    <g class="sway">
      ${sideLocks}
      ${bangs}
      <path d="M34,27.5 Q43,24 53,26.5" stroke="${hairHi}" stroke-width="2" fill="none" opacity="0.32" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;
}

(function injectCharCSS() {
  if (document.getElementById("charcss")) return;
  const s = document.createElement("style");
  s.id = "charcss";
  s.textContent = `
    .anime{display:block;transform-origin:50% 100%;animation:chF 4.2s ease-in-out infinite;animation-delay:var(--d,0s)}
    @keyframes chF{0%,100%{transform:translateY(0) rotate(-.6deg)}50%{transform:translateY(-5%) rotate(.6deg)}}
    .anime .floaty{animation:chB 3.6s ease-in-out infinite;animation-delay:var(--d,0s);transform-origin:50% 80%}
    @keyframes chB{0%,100%{transform:scale(1,1)}50%{transform:scale(1.012,.992)}}
    .anime .blink .lid{transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0);animation:chBl 5s infinite;animation-delay:var(--d,0s)}
    @keyframes chBl{0%,93%,100%{transform:scaleY(0)}95.5%,97%{transform:scaleY(1)}}
    .anime .sway{transform-box:fill-box;transform-origin:50% 100%;animation:chS 5.5s ease-in-out infinite;animation-delay:var(--d,0s)}
    @keyframes chS{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1.4deg)}}
    @media (prefers-reduced-motion:reduce){.anime,.anime *,.lid{animation:none!important;transform:none!important}}`;
  document.head.appendChild(s);
})();
