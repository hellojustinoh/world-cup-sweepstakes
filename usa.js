/* ============================================================================
   🇺🇸 USA CELEBRATION THEME — deliberately loud and obnoxious.
   Stars-and-stripes backdrop, eagles + Lady Liberty whizzing across the screen,
   a scrolling chant, and a red/white/blue sparkle cursor trail.
   Self-contained: delete the <script src="usa.js"> tag in index.html to remove.
   ========================================================================== */
(() => {
  const R = (a, b) => a + Math.random() * (b - a);
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Illustrated USA-flag cursor: a vector flag on a pole, drawn as an inline
  // SVG data-URI. Hotspot (1,1) = the pole tip, so clicks land where expected.
  const FLAG_SVG = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">` +
      `<line x1="2" y1="2" x2="2" y2="28" stroke="#7a5b3a" stroke-width="2.4" stroke-linecap="round"/>` +
      `<circle cx="2" cy="2" r="1.8" fill="#f0b419"/>` +
      `<path d="M4,3 Q11,1.4 17,3 T29,3 L28.4,16 Q21,17.8 15,16 T3.6,16 Z" fill="#fff" stroke="#1f2430" stroke-width="1"/>` +
      `<path d="M4,3 Q11,1.4 17,3 T29,3 L28.85,5.7 Q21.4,7.3 15.5,5.7 T3.9,5.5 Z" fill="#b22234"/>` +
      `<path d="M3.85,8.1 Q11.2,9.8 17.2,8.2 T28.75,8.3 L28.6,10.9 Q21.2,12.5 15.3,10.9 T3.75,10.7 Z" fill="#b22234"/>` +
      `<path d="M3.7,13.3 Q11,15 17,13.4 T28.5,13.5 L28.4,16 Q21,17.8 15,16 T3.6,16 Z" fill="#b22234"/>` +
      `<path d="M4,3 Q8,2.1 12,2.5 L11.7,9.4 Q7.8,9.1 3.85,9.9 Z" fill="#2a2f77"/>` +
      `<g fill="#fff"><circle cx="6" cy="4.4" r=".8"/><circle cx="9.4" cy="4.7" r=".8"/><circle cx="5.7" cy="7.4" r=".8"/><circle cx="9.1" cy="7.7" r=".8"/></g>` +
    `</svg>`
  );
  const CUR = `url("data:image/svg+xml,${FLAG_SVG}") 1 1, auto`;

  const style = document.createElement("style");
  style.textContent = `
    /* USA flag cursor everywhere (incl. links/buttons so it never flickers back) */
    html, body, a, button, .brow, .cheer, .refresh-btn, .modal-x, select, label { cursor: ${CUR} !important; }
    /* Cursor sparkle trail */
    .usa-spark { position: fixed; z-index: 120; pointer-events: none; border-radius: 50%; transform: translate(-50%, -50%); animation: usaSpark .72s ease-out forwards; }
    @keyframes usaSpark { 0% { opacity: 1; } 100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(.2); } }
    /* Chant marquee */
    #usa-marquee { position: fixed; left: 0; right: 0; bottom: 0; z-index: 55; pointer-events: none; overflow: hidden; white-space: nowrap;
      background: linear-gradient(90deg, #b22234, #2a2f77); color: #fff; font-family: "Archivo Black", "Plus Jakarta Sans", sans-serif; font-weight: 900; letter-spacing: 1px; font-size: 13px; padding: 6px 0; box-shadow: 0 -2px 12px rgba(0,0,0,.25); }
    #usa-marquee b { display: inline-block; padding-left: 100%; animation: usaMarq 16s linear infinite; }
    @media (prefers-reduced-motion: reduce) { #usa-marquee b { animation: none !important; } }
  `;
  document.head.appendChild(style);

  const add = (id, tag) => { const el = document.createElement(tag || "div"); if (id) el.id = id; document.body.appendChild(el); return el; };

  const marq = add("usa-marquee");
  marq.innerHTML = `<b>${"🇺🇸 USA! USA! USA! 🦅 CHAMPIONS OF THE WORLD 🗽 LAND OF THE FREE, HOME OF THE BRAVE 🎆 ".repeat(6)}</b>`;

  if (!reduce) {
    const dot = ["#e02d3c", "#2b4de0"]; // red, blue (white shows as ✨ so it reads on light bg)
    let lastX = 0, lastY = 0, n = 0;
    window.addEventListener("mousemove", (e) => {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (dx * dx + dy * dy < 55) return; // throttle by distance
      lastX = e.clientX; lastY = e.clientY;
      const el = document.createElement("span");
      el.className = "usa-spark";
      el.style.left = e.clientX + "px"; el.style.top = e.clientY + "px";
      el.style.setProperty("--dx", R(-22, 22) + "px");
      el.style.setProperty("--dy", R(8, 30) + "px");
      const kind = n++ % 3;
      if (kind === 2) { el.textContent = "✨"; el.style.fontSize = R(12, 22) + "px"; }
      else { const c = dot[kind]; const sz = R(6, 12); el.style.width = sz + "px"; el.style.height = sz + "px"; el.style.background = c; el.style.boxShadow = `0 0 8px 2px ${c}`; }
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 720);
    }, { passive: true });
  }
})();
