/* The visualizer behind the page: soft drifting colour (the swirl) with five sheets of flow on top,
   ported from chanceify's player-bar visualizer. One fixed canvas, #flow. */
(function () {
  var cv = document.getElementById("flow");
  if (!cv || cv.getAttribute("data-on")) return;
  cv.setAttribute("data-on", "1");
  var ctx = cv.getContext("2d");
  var layer = document.createElement("canvas");
  var lx = layer.getContext("2d");
  var POINTS = 96, SHEETS = 5, DEPTH = 0.8, OFFSET = 0.05, SWING = 0.3, DRIFT = 0.1;
  var LOW = "48,110,240", HIGH = "170,70,220", BLOBS = ["24,85,218", "85,68,213", "149,53,202"];
  var W = 0, H = 0, dpr = 1;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = layer.width = Math.round(W * dpr);
    cv.height = layer.height = Math.round(H * dpr);
  }
  function smooth(a, passes) {
    for (var p = 0; p < passes; p++) {
      var b = a.slice();
      for (var i = 0; i < a.length; i++) {
        var s = 0, n = 0;
        for (var j = -3; j <= 3; j++) { var k = Math.max(0, Math.min(a.length - 1, i + j)); s += a[k]; n++; }
        b[i] = s / n;
      }
      a = b;
    }
    return a;
  }
  function levels(t) {
    var out = new Array(POINTS);
    var beat = 0.6 + 0.4 * Math.pow(Math.max(0, Math.sin(t * 2.6)), 2);
    for (var i = 0; i < POINTS; i++) {
      var x = i / (POINTS - 1);
      var env = 0.42 + 0.58 * Math.pow(1 - x, 1.1);
      var n = 0.5 + 0.28 * Math.sin(x * 9 + t * 1.7) + 0.22 * Math.sin(x * 15 - t * 1.1);
      out[i] = Math.max(0.05, Math.min(1, env * n * (0.7 + 0.3 * beat * (1 - x * 0.5))));
    }
    return smooth(out, 3);
  }
  function at(lv, idx) { var m = lv.length - 1, k = ((idx % (2 * m)) + 2 * m) % (2 * m); return lv[k > m ? 2 * m - k : k]; }
  function ease(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function swirl(t) {
    for (var k = 0; k < 3; k++) {
      var cx = W * (0.5 + 0.42 * Math.sin(t * 0.06 + k * 2.1));
      var cy = H * (0.42 + 0.28 * Math.cos(t * 0.045 + k * 1.7));
      var r = Math.max(W, H) * 0.6;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(" + BLOBS[k] + ",0.20)"); g.addColorStop(1, "rgba(" + BLOBS[k] + ",0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
  }
  function draw(t) {
    var lv = levels(t), phase = t * DRIFT;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    swirl(t);
    var top0 = H * 0.26, FH = H - top0, X0 = -30, XW = W + 60;
    var bass = 0, k = Math.floor(POINTS / 8);
    for (var b = 0; b < k; b++) bass += lv[b];
    bass /= k;
    var g = ctx.createLinearGradient(0, top0 + FH * 0.5, 0, H);
    g.addColorStop(0, "rgba(" + LOW + ",0)");
    g.addColorStop(1, "rgba(" + LOW + "," + (0.22 * (0.4 + bass)).toFixed(3) + ")");
    ctx.fillStyle = g; ctx.fillRect(0, top0 + FH * 0.5, W, FH * 0.5);
    for (var s = 0; s < SHEETS; s++) {
      var back = s / Math.max(SHEETS - 1, 1);
      var dir = s % 2 === 0 ? 1 : -1;
      var swing = (phase * Math.PI * 2 + back * 1.7) * dir;
      var rest = H - FH * (0.03 + back * DEPTH * 0.55);
      var reach = FH * DEPTH * (0.78 - back * 0.28);
      var alpha = Math.max(0.46 - back * 0.28, 0.08) * 1.25;
      var shift = Math.round(s * OFFSET * POINTS);
      var pts = [], topY = H;
      for (var i = 0; i < POINTS; i++) {
        var across = i / (POINTS - 1);
        var wave = Math.sin(across * Math.PI * 2 * 1.2 + swing);
        var edge = 0.6 + 0.4 * ease(0, 0.14, across) * ease(1, 0.86, across);
        var y = rest - at(lv, i + shift) * edge * reach * (0.75 + 0.25 * wave) - wave * FH * SWING * 0.28;
        if (y < topY) topY = y;
        pts.push([X0 + across * XW, y]);
      }
      lx.setTransform(1, 0, 0, 1, 0, 0);
      lx.clearRect(0, 0, layer.width, layer.height);
      lx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lx.globalCompositeOperation = "source-over";
      lx.beginPath();
      lx.moveTo(X0, H + 4);
      lx.lineTo(pts[0][0], pts[0][1]);
      for (var q = 1; q < pts.length - 1; q++) {
        var mx = (pts[q][0] + pts[q + 1][0]) / 2, my = (pts[q][1] + pts[q + 1][1]) / 2;
        lx.quadraticCurveTo(pts[q][0], pts[q][1], mx, my);
      }
      lx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      lx.lineTo(X0 + XW, H + 4); lx.closePath();
      var hg = lx.createLinearGradient(0, 0, W, 0);
      hg.addColorStop(0, "rgb(" + LOW + ")"); hg.addColorStop(1, "rgb(" + HIGH + ")");
      lx.fillStyle = hg; lx.fill();
      lx.globalCompositeOperation = "destination-in";
      var vg = lx.createLinearGradient(0, topY, 0, H);
      vg.addColorStop(0, "rgba(0,0,0,1)"); vg.addColorStop(1, "rgba(0,0,0,0)");
      lx.fillStyle = vg; lx.fillRect(0, 0, W, H);
      ctx.globalAlpha = Math.min(alpha, 1);
      ctx.drawImage(layer, 0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t0 = performance.now();
  function frame(now) { draw((now - t0) / 1000 + 3); if (!still) requestAnimationFrame(frame); }
  size();
  window.addEventListener("resize", function () { size(); if (still) draw(3); });
  requestAnimationFrame(frame);
})();
