/* Scenic backgrounds. The main page has a theme switcher (top left); a docs site can pin one with data-theme="chanceify".
   Add data-site="https://madlygeeked.github.io/" when used from another site. */
(function () {
  var me = document.currentScript;
  var SITE = me ? (me.getAttribute("data-site") || "") : "";
  var PIN = me ? me.getAttribute("data-theme") : "";
  var T = [
    { id: "honey", label: "\uD83C\uDF6F", name: "honey" },
    { id: "golden", label: "\u2600\uFE0F", name: "golden hour" },
    { id: "autumn", label: "\uD83C\uDF42", name: "autumn" },
    { id: "lake-teal", label: "\uD83C\uDFDE\uFE0F", name: "teal lake" },
    { id: "chanceify", label: "chanceify", hidden: true }
  ];
  function get() { try { return localStorage.getItem("mg-theme"); } catch (e) { return null; } }
  function put(v) { try { localStorage.setItem("mg-theme", v); } catch (e) {} }
  function init() {
    var scene = document.createElement("div"); scene.id = "scene"; scene.setAttribute("aria-hidden", "true");
    var img = document.createElement("img"); img.alt = ""; img.decoding = "async"; scene.appendChild(img);
    document.body.insertBefore(scene, document.body.firstChild);
    document.body.classList.add(PIN ? "scenic-docs" : "scenic");
    var cur = "honey";
    function set(id, temp) {
      if (!temp) cur = id;
      document.body.setAttribute("data-theme", id);
      img.style.opacity = 0;
      var n = new Image(); n.onload = function () { img.src = n.src; img.style.opacity = 1; }; n.onerror = function () { img.style.opacity = 1; };
      n.src = SITE + "assets/themes/" + id + ".svg?v=2";
      Array.prototype.forEach.call(document.querySelectorAll(".themes button"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-id") === cur ? "true" : "false"); });
    }
    if (PIN) { set(PIN); return; }
    var nav = document.createElement("nav"); nav.className = "themes"; nav.setAttribute("aria-label", "theme");
    T.filter(function (t) { return !t.hidden; }).forEach(function (t) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = t.label; b.setAttribute("data-id", t.id); b.title = t.name; b.setAttribute("aria-label", t.name);
      b.onclick = function () { put(t.id); set(t.id); };
      nav.appendChild(b);
    });
    document.body.appendChild(nav);
    var saved = get();
    set(T.some(function (t) { return t.id === saved && !t.hidden; }) ? saved : "honey");
    // hovering a project card previews that project's own theme
    var hov = null;
    function over(e) {
      var a = e.target.closest ? e.target.closest("[data-hover-theme]") : null;
      if (a === hov) return; hov = a;
      set(a ? a.getAttribute("data-hover-theme") : cur, !!a || true);
    }
    document.addEventListener("mouseover", over);
    document.addEventListener("focusin", over);
    document.addEventListener("focusout", function () { if (hov) { hov = null; set(cur, true); } });
  }
  if (document.body) init(); else document.addEventListener("DOMContentLoaded", init);
})();
