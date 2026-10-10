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
  function get() { try { return localStorage.getItem("mg-theme"); } catch (e) { return null; } }
  function put(v) { try { localStorage.setItem("mg-theme", v); } catch (e) {} }
  function find(id) { for (var i = 0; i < T.length; i++) if (T[i].id === id) return T[i]; return null; }
  function init() {
    var scene = document.createElement("div"); scene.id = "scene"; scene.setAttribute("aria-hidden", "true");
    var img = document.createElement("img"); img.alt = ""; img.decoding = "async"; scene.appendChild(img);
    document.body.insertBefore(scene, document.body.firstChild);
    document.body.classList.add(PIN ? "scenic-docs" : "scenic");
    var cur = "honey", shown = "", ui = null;
    function show(id) {
      if (id === shown) return; shown = id;
      document.body.setAttribute("data-theme", id);
      img.style.opacity = 0;
      var n = new Image(); n.onload = function () { if (shown === id) { img.src = n.src; img.style.opacity = 1; } }; n.onerror = function () { img.style.opacity = 1; };
      n.src = SITE + "assets/themes/" + id + ".svg?v=5";
    }
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
      b.innerHTML = '<span class="em">' + t.label + '</span><span class="nm">' + t.name + '</span>';
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
    var saved = get(); cur = find(saved) ? saved : "honey"; ui.sync(); show(cur);

    // hover (mouse) previews the card's theme
    var hov = null, canHover = window.matchMedia && matchMedia("(hover: hover)").matches;
    function target(e) { return e.target && e.target.closest ? e.target.closest("[data-hover-theme]") : null; }
    function over(e) { var a = target(e); if (a === hov) return; hov = a; show(a ? a.getAttribute("data-hover-theme") : cur); }
    if (canHover) document.addEventListener("mouseover", over);
    document.addEventListener("focusin", over);
    document.addEventListener("focusout", function () { if (hov) { hov = null; show(cur); } });

    // press and hold (phone) previews it too; letting go goes back
    var timer = null, held = false;
    document.addEventListener("touchstart", function (e) {
      var a = target(e); if (!a) return; held = false;
      clearTimeout(timer);
      timer = setTimeout(function () { held = true; show(a.getAttribute("data-hover-theme")); if (navigator.vibrate) try { navigator.vibrate(12); } catch (x) {} }, 350);
    }, { passive: true });
    function release(e) { clearTimeout(timer); if (held) { held = false; show(cur); if (e && e.cancelable && e.type === "touchend") e.preventDefault(); } }
    document.addEventListener("touchend", release);
    document.addEventListener("touchcancel", release);
    document.addEventListener("touchmove", function () { if (!held) clearTimeout(timer); }, { passive: true });
    document.addEventListener("contextmenu", function (e) { if (held || target(e) && !canHover) e.preventDefault(); });
  }
  if (document.body) init(); else document.addEventListener("DOMContentLoaded", init);
})();
