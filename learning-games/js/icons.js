/* ICONS — one line-icon set for the app's chrome (buttons, cards, bars).
   Same 24px grid, 2px stroke, round caps and joins everywhere. Emoji stay
   inside kid content (stickers, celebrations, stories, counting pictures). */
window.BD = window.BD || {};

BD.Icon = (function () {
  const P = {
    soundOn: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/>',
    soundLow: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>',
    soundOff: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    gift: '<rect x="3" y="9" width="18" height="4" rx="1"/><path d="M5 13v8h14v-8"/><path d="M12 9v12"/><path d="M12 9c-1.5-3.5-5-4.5-6-2.5S8.5 9 12 9c3.5 0 7-0.5 6-2.5S13.5 5.5 12 9z"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16.5 9.5"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
    trophy: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3"/><path d="M7 5H4v2a3 3 0 0 0 3 3"/>',
    swords: '<path d="M4 4l11 11"/><path d="M13 17l4-4"/><path d="M15 15l4 4"/><path d="M20 4L9 15"/><path d="M11 17l-4-4"/><path d="M9 15l-4 4"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    install: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M12 7v7"/><path d="M9 11l3 3 3-3"/><path d="M10 18h4"/>',
    share: '<path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/>',
    plusSquare: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    vibrate: '<rect x="8" y="4" width="8" height="16" rx="2"/><path d="M4 8v8M20 8v8"/>'
  };
  function svg(name, size, cls) {
    const s = size || 24;
    return '<svg class="ico' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (P[name] || "") + '</svg>';
  }
  return { svg: svg, names: Object.keys(P) };
})();
