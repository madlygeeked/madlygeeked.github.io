/* Scenic backgrounds. The main page has one theme button (top left) that drops a list down; a docs site can pin a theme with data-theme="chanceify".
   Hover (or press and hold on a phone) a project card to preview that project's own theme.
   Add data-site="https://madlygeeked.github.io/" when used from another site. */
(function () {
  var me = document.currentScript;
  var SITE = me ? (me.getAttribute("data-site") || "") : "";
  var PIN = me ? me.getAttribute("data-theme") : "";
  var T = [
    { id: "honey", label: "🍯", name: "honey" },
    { id: "golden", label: "☀️", name: "golden hour" },
    { id: "autumn", label: "🍂", name: "autumn" },
    { id: "lake-teal", label: "🏞️", name: "lake" }
  ];
  var BG = { "honey": "#ffb070", "golden": "#f4806a", "autumn": "#e8d3a8", "lake-teal": "#a6cdf0", "chanceify": "#2a1850" };

  // ---------- scene player ----------
  // A scene is a list of small cropped pictures. Each one that moves sits in its own div and is animated with CSS transforms, so the phone's GPU
  // moves the layers around and nothing gets repainted. Pictures that are off screen are not built at all.
  var MGScene = (function () {
    function f2(v) { return (Math.round(v * 100) / 100); }
    function frames(sp, k) {
      var n = sp.f.length, o = "", cen = false, i, f;
      for (i = 0; i < n; i++) if (sp.f[i][2] || sp.f[i][3]) cen = true;
      for (i = 0; i < n; i++) {
        f = sp.f[i]; var v, t = sp.t;
        if (t === "tr") v = "transform:translate(" + f2(f[1] * k) + "px," + f2(f[2] * k) + "px)";
        else if (t === "rot") v = "transform:" + (cen ? "translate(" + f2(f[2] * k) + "px," + f2(f[3] * k) + "px) rotate(" + f[1] + "deg) translate(" + f2(-f[2] * k) + "px," + f2(-f[3] * k) + "px)" : "rotate(" + f[1] + "deg)");
        else if (t === "sc") { var c = f[3] || f[4]; v = "transform:" + (c ? "translate(" + f2(f[3] * k) + "px," + f2(f[4] * k) + "px) scale(" + f[1] + "," + f[2] + ") translate(" + f2(-f[3] * k) + "px," + f2(-f[4] * k) + "px)" : "scale(" + f[1] + "," + f[2] + ")"); }
        else if (t === "sk") v = "transform:skewX(" + f[1] + "deg)";
        else v = "opacity:" + f[1];
        o += f2(f[0] * 100) + "%{" + v + (i < n - 1 && sp.e[i] !== "linear" ? ";animation-timing-function:" + sp.e[i] : "") + "}";
      }
      return o;
    }
    function build(man, base, vw, vh, opt) {
      opt = opt || {};
      var k = Math.max(vw / man.w, vh / man.h), ox = (vw - man.w * k) / 2, oy = vh - man.h * k, low = !!opt.low, still = !!opt.still, M = 40;
      var root = document.createElement("div"); root.className = "mgs";
      var frame = document.createElement("div"); frame.style.cssText = "position:absolute;left:" + ox + "px;top:" + oy + "px;width:0;height:0";
      root.appendChild(frame);
      var names = {}, css = "", imgs = [];
      function vis(r) { return r[2] * k + ox > -M && r[0] * k + ox < vw + M && r[3] * k + oy > -M && r[1] * k + oy < vh + M; }
      function div(p) { var d = document.createElement("div"); d.style.cssText = "position:absolute;left:0;top:0;width:0;height:0"; p.appendChild(d); return d; }
      function anim(d, sp) {
        if (still) return;
        var key = sp.t + JSON.stringify(sp.f) + sp.e.join(""), nm = names[key];
        if (!nm) { nm = names[key] = "k" + Object.keys(names).length; css += "@keyframes " + nm + "{" + frames(sp, k) + "}"; }
        d.style.animation = nm + " " + sp.d + "s linear " + (-sp.l) + "s infinite";
        d.style.willChange = sp.t === "op" ? "opacity" : "transform";
      }
      function leaf(c, p) {
        if (!vis(c.r)) return;
        var im = new Image(); im.alt = ""; im.decoding = "async"; im.draggable = false;
        im.style.cssText = "position:absolute;max-width:none;display:block;left:" + f2(c.x * k) + "px;top:" + f2(c.y * k) + "px;width:" + Math.ceil(c.w * k) + "px;height:" + Math.ceil(c.h * k) + "px";
        var retried = 0; im.onerror = function () { if (c.f && !retried++) im.src = base + "lay/" + c.f + ".svg?r=" + Date.now(); };
        im.src = c.f ? base + "lay/" + c.f + ".svg?v=17" : "data:image/svg+xml;charset=utf-8," + encodeURIComponent(man.P[c.s]);
        p.appendChild(im); imgs.push(im);
      }
      function node(n, p) {
        if (!vis(n.r) || (low && n.lo)) return;
        var el = p, d, i;
        if (n.m) { d = div(el); d.style.transform = "matrix(" + [n.m[0], n.m[1], n.m[2], n.m[3], f2(n.m[4] * k), f2(n.m[5] * k)].join(",") + ")"; el = d; }
        if (n.a) for (i = 0; i < n.a.length; i++) { d = div(el); anim(d, n.a[i]); el = d; }
        for (i = 0; i < n.c.length; i++) { if (n.c[i].c) node(n.c[i], el); else leaf(n.c[i], el); }
      }
      for (var i = 0; i < man.T.length; i++) { if (man.T[i].c) node(man.T[i], frame); else leaf(man.T[i], frame); }
      var st = document.createElement("style"); st.textContent = css; root.appendChild(st);
      var ready = Promise.all(imgs.map(function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); }));
      var timeout = new Promise(function (r) { setTimeout(r, 7000); });
      return { el: root, ready: Promise.race([ready, timeout]) };
    }
    return { build: build };
  })();
  window.MGScene = window.MGScene || MGScene;
  function get() { try { return sessionStorage.getItem("mg-theme"); } catch (e) { return null; } }   // per tab: a refresh keeps the theme, a new tab picks a new one
  function put(v) { try { sessionStorage.setItem("mg-theme", v); } catch (e) {} }
  function find(id) { for (var i = 0; i < T.length; i++) if (T[i].id === id) return T[i]; return null; }
  // some themes have several versions; one is picked at random on each visit
  var VARIANTS = { "golden": ["", "-b"], "lake-teal": ["", "-b"], "honey": ["", "-b", "-c", "-d"] }, pick = {};
  Object.keys(VARIANTS).forEach(function (k) { pick[k] = VARIANTS[k][Math.floor(Math.random() * VARIANTS[k].length)]; });
  function file(id) { return id + (pick[id] || ""); }
  function init() {
    var scene = document.createElement("div"); scene.id = "scene"; scene.setAttribute("aria-hidden", "true");
    document.body.insertBefore(scene, document.body.firstChild);
    document.body.classList.add(PIN ? "scenic-docs" : "scenic");
    var cur = "honey", shown = "", ui = null, front = null, seq = 0, mans = {};
    var low = Math.min(screen.width || 9999, screen.height || 9999) <= 500;
    var still = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    // the new scene is built and fully decoded off screen, then fades in over the old one. nothing is ever left empty, so there is no black flash.
    function manifest(f) {
      if (mans[f]) return mans[f];
      var url = SITE + "assets/themes/" + f + ".json?v=17";
      return (mans[f] = fetch(url).then(function (r) { return r.json(); }).catch(function () { delete mans[f]; return null; }));
    }
    function show(id, force) {
      if (id === shown && !force) return; shown = id; var mine = ++seq;
      document.body.setAttribute("data-theme", id);
      var bg = BG[id] || "#ffb070"; scene.style.background = bg; document.documentElement.style.background = bg;
      var f = file(id);
      manifest(f).then(function (man) {
        if (!man || mine !== seq) return;
        var sc = MGScene.build(man, SITE + "assets/themes/", scene.clientWidth || innerWidth, scene.clientHeight || innerHeight, { low: low, still: still });
        sc.el.style.opacity = 0; scene.appendChild(sc.el);
        sc.ready.then(function () {
          if (mine !== seq) { if (sc.el.parentNode) sc.el.parentNode.removeChild(sc.el); return; }
          void sc.el.offsetWidth; sc.el.style.opacity = 1;
          var old = front; front = sc.el;
          setTimeout(function () { if (old && old.parentNode) old.parentNode.removeChild(old); }, 700);
        });
      });
    }
    var rt = null, lw = innerWidth, lh = innerHeight;
    window.addEventListener("resize", function () {
      clearTimeout(rt); rt = setTimeout(function () { if (Math.abs(innerWidth - lw) > 60 || Math.abs(innerHeight - lh) > 120) { lw = innerWidth; lh = innerHeight; show(shown, true); } }, 350);
    });
    function choose(id) { cur = id; put(id); show(id); if (ui) ui.sync(); }
    if (PIN) { show(PIN); return; }

    // the one theme button
    var box = document.createElement("div"); box.className = "themes";
    var btn = document.createElement("button"); btn.type = "button"; btn.className = "tbtn"; btn.setAttribute("aria-haspopup", "true"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-label", "themes");
    var em = document.createElement("span"); em.className = "em";
    var ar = document.createElement("span"); ar.className = "ar"; ar.innerHTML = '<svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.appendChild(em); btn.appendChild(ar);
    var menu = document.createElement("div"); menu.className = "tmenu"; menu.hidden = true; menu.setAttribute("role", "menu");
    T.forEach(function (t) {
      var b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "menuitem"); b.setAttribute("data-id", t.id);
      b.innerHTML = '<span class="em">' + t.label + '</span>'; b.setAttribute("aria-label", t.name); b.title = t.name;
      b.onclick = function () { choose(t.id); close(); };
      menu.appendChild(b);
    });
    box.appendChild(btn); box.appendChild(menu); document.body.appendChild(box);
    function open() { menu.hidden = false; box.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
    function close() { menu.hidden = true; box.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    btn.onclick = function (e) { e.stopPropagation(); menu.hidden ? open() : close(); };
    document.addEventListener("click", function (e) { if (!box.contains(e.target)) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    ui = { sync: function () {
      var t = find(cur); em.textContent = t ? t.label : "";
      Array.prototype.forEach.call(menu.children, function (b) { b.setAttribute("aria-current", b.getAttribute("data-id") === cur ? "true" : "false"); });
    } };
    cur = find(get()) ? get() : T[Math.floor(Math.random() * T.length)].id; put(cur); var qp = /[?&]theme=([\w-]+)/.exec(location.search); if (qp && find(qp[1])) cur = qp[1]; ui.sync(); show(cur);   // a new theme on every visit

    // (hover / press-and-hold previews were removed: they made the page lag. the chanceify docs have their own pinned theme.)
  }
  if (document.body) init(); else document.addEventListener("DOMContentLoaded", init);
})();
