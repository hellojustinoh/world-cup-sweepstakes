/* ============================================================================
   MANAGER PORTRAITS — friendly, Notion-style flat illustrations, one per player.
   Built from DiceBear's "personas" set (loaded from jsDelivr), keyed to each
   person's gender (hairstyle) and ethnicity (skin + hair colour) from the roster.
   Deterministic per name. Results land in window.MANAGERS; the page upgrades the
   flag fallbacks once they're ready (window.onManagersReady).
   ========================================================================== */
(() => {
  // skin + hair hex (ethnicity) and a hairstyle that reads to the person's gender.
  const CFG = {
    Jill:      { s: "ffd9b8", h: "2a2330", hair: "bobCut" },          // Singaporean F
    Vivek:     { s: "cf9560", h: "241c20", hair: "shortCombover" },   // Indian M
    Benoit:    { s: "ffe3cd", h: "6b4a32", hair: "fade" },            // French caucasian M
    Yasmin:    { s: "efc59a", h: "241e18", hair: "long" },            // Persian F
    Justin:    { s: "ffdcc0", h: "17171c", hair: "shortCombover" },   // Korean M, black hair
    Shermaine: { s: "ffd9b8", h: "241f2a", hair: "straightBun" },     // Singaporean F
    Katie:     { s: "ffe4cf", h: "6b4a2e", hair: "bobBangs" },        // NZ caucasian F, brown hair
    David:     { s: "ffdcc0", h: "1f1a24", hair: "shortComboverChops" }, // Chinese M
    Regina:    { s: "ffd6b4", h: "241f2a", hair: "extraLong" },       // Singaporean F
    Meiyin:    { s: "ffd9b8", h: "17171c", hair: "long" },            // Singaporean F, medium-long black hair
    Vernette:  { s: "f6cda0", h: "33241c", hair: "curlyBun" },        // Malaysian F
    Sri:       { s: "bd7f4a", h: "201820", hair: "curlyHighTop" },    // Indian M
  };

  window.MANAGERS = {};
  (async () => {
    try {
      const [core, col] = await Promise.all([
        import("https://cdn.jsdelivr.net/npm/@dicebear/core@9/+esm"),
        import("https://cdn.jsdelivr.net/npm/@dicebear/collection@9/+esm"),
      ]);
      Object.entries(CFG).forEach(([name, c]) => {
        window.MANAGERS[name] = core.createAvatar(col.personas, {
          seed: name,
          skinColor: [c.s], hairColor: [c.h], hair: [c.hair],
          eyes: ["open", "happy"], mouth: ["smile", "bigSmile"], nose: ["mediumRound", "smallRound"],
          facialHairProbability: 0, backgroundColor: ["f1ece2"],
        }).toString();
      });
      if (typeof window.onManagersReady === "function") window.onManagersReady();
    } catch (e) { /* leave MANAGERS empty — the UI falls back to flag avatars */ }
  })();
})();
