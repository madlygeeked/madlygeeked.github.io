/* Flow, ported from chanceify's player-bar visualizer: five sheets of colour, each riding on a
   spectrum and swinging slowly, folded over one another and faded toward the foot. */
(function () {
  var cv = document.getElementById("flow");
  if (!cv) return;
  var ctx = cv.getContext("2d");
  var layer = document.createElement("canvas");
  var lx = layer.getContext("2d");
  var POINTS = 96, SHEETS = 5, DEPTH = 0.75, OFFSET = 0.06, SWING = 0.34, DRIFT = 0.13;
  var LOW = "48,110,240", HIGH = "170,70,220";
  var W = 0, H = 0, dpr = 1;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = layer.width = Math.round(W * dpr);
    cv.height = layer.height = Math.round(H * dpr);
  }
  function levels(t) {
    var out = new Array(POINTS);
    var beat = 0.55 + 0.45 * Math.pow(Math.max(0, Math.sin(t * 3.1)), 2);
    for (var i = 0; i < POINTS; i++) {
      var x = i / (POINTS - 1);
      var env = 0.3 + 0.7 * Math.pow(1 - x, 1.3);
      var n = 0.5 + 0.5 * Math.sin(x * 19 + t * 2.3) * Math.cos(x * 7 - t * 1.1);
      var v = env * (0.3 + 0.7 * n) * (0.65 + 0.35 * beat * (1 - x * 0.6));
      out[i] = Math.max(0, Math.min(1, v));
    }
    return out;
  }
  function draw(t) {
    var lv = levels(t), phase = t * DRIFT;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var bass = 0, k = Math.floor(POINTS / 8);
    for (var b = 0; b < k; b++) bass += lv[b];
    bass /= k;
    var g = ctx.createLinearGradient(0, H / 2, 0, H);
    g.addColorStop(0, "rgba(" + LOW + ",0)");
    g.addColorStop(1, "rgba(" + LOW + "," + (0.3 * (0.4 + bass * bass)).toFixed(3) + ")");
    ctx.fillStyle = g; ctx.fillRect(0, H / 2, W, H / 2);
    for (var s = 0; s < SHEETS; s++) {
      var back = s / Math.max(SHEETS - 1, 1);
      var dir = s % 2 === 0 ? 1 : -1;
      var swing = (phase * Math.PI * 2 + back * 1.7) * dir;
      var rest = H - H * (0.04 + back * DEPTH * 0.62);
      var reach = H * DEPTH * (0.72 - back * 0.3);
      var alpha = Math.max(0.5 - back * 0.3, 0.08) * 1.5;
      var shift = Math.round(s * OFFSET * POINTS) % POINTS;
      var top = H;
      lx.setTransform(1, 0, 0, 1, 0, 0);
      lx.clearRect(0, 0, layer.width, layer.height);
      lx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lx.globalCompositeOperation = "source-over";
      lx.beginPath();
      lx.moveTo(0, H);
      for (var i = 0; i < POINTS; i++) {
        var across = i / (POINTS - 1);
        var wave = Math.sin(across * Math.PI * 2 * 1.3 + swing);
        var y = rest - lv[(i + shift) % POINTS] * reach * (0.75 + 0.25 * wave) - wave * H * SWING * 0.28;
        if (y < top) top = y;
        lx.lineTo(across * W, y);
      }
      lx.lineTo(W, H); lx.closePath();
      var hg = lx.createLinearGradient(0, 0, W, 0);
      hg.addColorStop(0, "rgb(" + LOW + ")"); hg.addColorStop(1, "rgb(" + HIGH + ")");
      lx.fillStyle = hg; lx.fill();
      lx.globalCompositeOperation = "destination-in";
      var vg = lx.createLinearGradient(0, top, 0, H);
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
