/* Home page content, drawn from projects.json: edit that file, never the HTML. */
(function () {
  var MG = window.MG;
  var GH = "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z";
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) { n[k] = props[k]; });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function btn(a, extra) { return el("a", { className: "btn" + (a.primary ? " primary" : "") + (extra || ""), href: a.url, textContent: a.label }); }
  function render(d) {
    var app = document.getElementById("app");
    app.innerHTML = "";
    document.title = d.name || "madgeeked";
    var brand = el("a", { className: "brand" }, [el("img", { alt: "", hidden: true }), el("h1", { className: "brandname" })]);
    brand.setAttribute("data-brand-link", ""); brand.firstChild.setAttribute("data-brand-logo", ""); brand.lastChild.setAttribute("data-brand-name", "");
    var wrap = el("div", { className: "wrap" }, [el("div", { className: "top" }, [brand]), el("div", { className: "spacer" })]);
    (d.projects || []).filter(function (p) { return p.public; }).forEach(function (p) {
      var h = el("div", { className: "head" }, []);
      if (p.logo) h.appendChild(el("img", { src: MG.asset(p.logo), alt: "", width: 72, height: 72 }));
      var t = el("div", {}, [el("h2", { textContent: p.name })]);
      if (p.tagline) t.appendChild(el("p", { className: "tag", textContent: p.tagline }));
      h.appendChild(t);
      var actions = el("div", { className: "actions" }, []);
      var dl = (p.links || []).filter(function (a) { return a.primary; })[0];
      if (dl) actions.appendChild(btn({ label: dl.label, url: dl.url, primary: true }));
      if (p.more) actions.appendChild(btn({ label: "more info", url: p.more }));
      var facts = el("ul", { className: "facts" }, (p.facts || []).map(function (f) { return el("li", { textContent: f }); }));
      var art = el("article", { className: "project" }, [el("div", {}, [h, actions]), facts]);
      if (p.theme) art.setAttribute("data-hover-theme", p.theme);
      wrap.appendChild(el("section", {}, [art]));
    });
    var more = el("div", { className: "more" }, []);
    if (d.coffee && d.coffee.url) more.appendChild(el("a", { className: "btn honey", href: d.coffee.url, textContent: d.coffee.label + (d.coffee.emoji ? " " + d.coffee.emoji : "") }));
    var s = el("nav", { className: "socials" }, []);
    s.setAttribute("aria-label", "links");
    (d.socials || []).filter(function (x) { return x.public; }).forEach(function (x) {
      var a = el("a", { href: x.url });
      a.appendChild(document.createTextNode(x.name));
      if (x.name === "github") { a.className = "gh"; a.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="' + GH + '"/></svg>'); }
      s.appendChild(a);
    });
    more.appendChild(s);
    wrap.appendChild(more);
    app.appendChild(wrap);
    MG.apply(d);
  }
  MG.render = render;
  if (!window.MG_MANUAL) MG.load().then(render).catch(function () {});
})();
