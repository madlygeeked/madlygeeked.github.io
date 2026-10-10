/* Content comes from projects.json: edit that file, never the HTML. */
(function () {
  var me = document.currentScript;
  var ROOT = me.getAttribute("data-root") || "";
  var SLUG = document.body.getAttribute("data-project");
  var GH = "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z";
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) { n[k] = props[k]; });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function asset(p) { return /^(https?:)?\/\//.test(p) ? p : ROOT + p; }
  function fonts(f) {
    if (!f) return;
    var root = document.documentElement.style, seen = {};
    function load(x) {
      if (!x || !x.gf || seen[x.gf]) return; seen[x.gf] = 1;
      var l = document.createElement("link"); l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=" + x.gf + "&display=swap";
      document.head.appendChild(l);
    }
    var stack = function (x) { return '"' + x.family + '", "Segoe UI", system-ui, sans-serif'; };
    if (f.body && f.body.family) { load(f.body); root.setProperty("--body", stack(f.body)); root.setProperty("--display", stack(f.body)); }
    if (f.name && f.name.family) {
      load(f.name);
      root.setProperty("--namefont", stack(f.name));
      if (f.name.weight) root.setProperty("--namew", f.name.weight);
      if (f.name.size) root.setProperty("--ns", f.name.size);
      if (f.name.spacing !== undefined) root.setProperty("--nametrack", f.name.spacing + "em");
    }
  }
  function btn(a, extra) {
    return el("a", { className: "btn" + (a.primary ? " primary" : "") + (extra || ""), href: a.url, textContent: a.label });
  }
  function footer(d) {
    var more = el("div", { className: "more" }, []);
    if (d.coffee && d.coffee.url) {
      more.appendChild(el("a", { className: "btn honey", href: d.coffee.url, textContent: d.coffee.label + (d.coffee.emoji ? " " + d.coffee.emoji : "") }));
    }
    var s = el("nav", { className: "socials" }, []);
    s.setAttribute("aria-label", "links");
    (d.socials || []).filter(function (x) { return x.public; }).forEach(function (x) {
      var a = el("a", { href: x.url });
      if (x.name === "github") { a.className = "gh"; a.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="' + GH + '"/></svg>'; }
      a.appendChild(document.createTextNode(x.name));
      s.appendChild(a);
    });
    more.appendChild(s);
    return more;
  }
  function home(d, main) {
    document.title = d.name || "madgeeked";
    var head = el("header", {}, []);
    if (d.logo) head.appendChild(el("img", { src: asset(d.logo), alt: "" }));
    head.appendChild(el("h1", { textContent: d.name }));
    main.appendChild(el("div", { className: "wrap" }, [head]));
    main.appendChild(el("canvas", { className: "flow", id: "flow" }));
    var wrap = el("div", { className: "wrap" }, []);
    (d.projects || []).filter(function (p) { return p.public; }).forEach(function (p) {
      var h = el("div", { className: "head" }, []);
      if (p.logo) h.appendChild(el("img", { src: asset(p.logo), alt: "", width: 72, height: 72 }));
      var t = el("div", {}, [el("h2", { textContent: p.name })]);
      if (p.tagline) t.appendChild(el("p", { className: "tag", textContent: p.tagline }));
      h.appendChild(t);
      var left = el("div", {}, [h]);
      var actions = el("div", { className: "actions" }, []);
      if (p.slug) actions.appendChild(btn({ label: "More info", url: ROOT + p.slug + "/", primary: true }));
      else (p.links || []).forEach(function (a) { actions.appendChild(btn(a)); });
      left.appendChild(actions);
      var facts = el("ul", { className: "facts" }, (p.facts || []).map(function (f) { return el("li", { textContent: f }); }));
      wrap.appendChild(el("section", {}, [el("article", { className: "project" }, [left, facts])]));
    });
    wrap.appendChild(footer(d));
    main.appendChild(wrap);
  }
  function page(d, p, main) {
    document.title = p.name + " · " + (d.name || "madgeeked");
    document.body.className = "page";
    var wrap = el("div", { className: "wrap" }, []);
    wrap.appendChild(el("a", { className: "crumb", href: ROOT || "./", textContent: "← " + (d.name || "home") }));
    var head = el("header", {}, []);
    head.style.paddingTop = "20px";
    if (p.logo) head.appendChild(el("img", { src: asset(p.logo), alt: "" }));
    var t = el("div", {}, [el("h1", { textContent: p.name })]);
    if (p.tagline) t.appendChild(el("p", { className: "tag", textContent: p.tagline }));
    head.appendChild(t);
    wrap.appendChild(head);
    main.appendChild(wrap);
    main.appendChild(el("canvas", { className: "flow", id: "flow" }));
    var w2 = el("div", { className: "wrap" }, []);
    var actions = el("div", { className: "actions" }, []);
    (p.links || []).forEach(function (a, i) { actions.appendChild(btn(a, i === 0 && a.primary ? " big" : "")); });
    var facts = el("ul", { className: "facts" }, (p.facts || []).map(function (f) { return el("li", { textContent: f }); }));
    w2.appendChild(el("div", { className: "detail" }, [el("div", {}, [actions]), facts]));
    w2.appendChild(footer(d));
    main.appendChild(w2);
  }
  fetch(ROOT + "projects.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (d) {
    fonts(d.fonts);
    var main = document.getElementById("app");
    var p = SLUG && (d.projects || []).filter(function (x) { return x.slug === SLUG && x.public; })[0];
    if (SLUG && !p) { location.replace(ROOT || "./"); return; }
    if (p) page(d, p, main); else home(d, main);
    var s = document.createElement("script"); s.src = ROOT + "flow.js"; document.body.appendChild(s);
  }).catch(function () {});
})();
