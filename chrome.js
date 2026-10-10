/* Shared page chrome for the main site and every project's docs site:
   fonts, name/logo position and the visualizer, all read from projects.json on the main site.
   Add data-site="https://madlygeeked.github.io/" when used from another site. */
(function () {
  var me = document.currentScript;
  var SITE = me ? (me.getAttribute("data-site") || "") : "";
  var MG = window.MG = window.MG || {};
  MG.site = SITE;
  MG.asset = function (p) { return /^(https?:)?\/\//.test(p) || /^data:/.test(p) ? p : SITE + p; };
  MG.load = function () {
    if (window.MG_DATA) return Promise.resolve(window.MG_DATA);
    return MG._p || (MG._p = fetch(SITE + "projects.json", { cache: "no-cache" }).then(function (r) { return r.json(); }));
  };
  var loaded = {};
  function loadFont(x) {
    if (!x || !x.gf || loaded[x.gf]) return; loaded[x.gf] = 1;
    var l = document.createElement("link"); l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + x.gf + "&display=swap";
    document.head.appendChild(l);
  }
  MG.apply = function (d) {
    var root = document.documentElement.style, f = d.fonts || {};
    var stack = function (x) { return '"' + x.family + '", "Segoe UI", system-ui, sans-serif'; };
    if (f.body && f.body.family) { loadFont(f.body); root.setProperty("--body", stack(f.body)); root.setProperty("--display", stack(f.body)); }
    if (f.name && f.name.family) {
      loadFont(f.name);
      root.setProperty("--namefont", stack(f.name));
      if (f.name.weight) root.setProperty("--namew", f.name.weight);
      if (f.name.size) root.setProperty("--ns", f.name.size);
      if (f.name.spacing !== undefined) root.setProperty("--nametrack", f.name.spacing + "em");
    }
    var h = (d.layout && d.layout.header) || "left";
    ["left", "right", "center", "hero"].forEach(function (k) { document.body.classList.toggle("hdr-" + k, k === h); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-brand-name]"), function (n) { n.textContent = d.name || ""; });
    Array.prototype.forEach.call(document.querySelectorAll("[data-brand-logo]"), function (n) { if (d.logo) { n.src = MG.asset(d.logo); n.hidden = false; } });
    Array.prototype.forEach.call(document.querySelectorAll("[data-brand-link]"), function (n) { n.href = SITE || "./"; });
  };
  MG.start = function () {
    if (document.getElementById("flow") && !document.getElementById("flow").getAttribute("data-on")) {
      var s = document.createElement("script"); s.src = SITE + "flow.js"; document.body.appendChild(s);
    }
  };
  if (!window.MG_MANUAL) {
    var go = function () { MG.load().then(function (d) { MG.apply(d); MG.start(); }).catch(function () { MG.start(); }); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
  }
})();
