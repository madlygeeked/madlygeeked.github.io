/* A calm visualizer along the bottom of the page: three soft sheets of colour (chanceify's flow),
   drawn small and at 30 frames a second so it stays light. One fixed canvas, #flow. */
(function () {
  var cv = document.getElementById("flow");
  if (!cv || cv.getAttribute("data-on")) return;
  cv.setAttribute("data-on", "1");
  var ctx = cv.getContext("2d");
  var layer = document.createElement("canvas");
  var lx = layer.getContext("2d");
  var POINTS = 48, SHEETS = 3, SCALE = 0.5, DRIFT = 0.05, SWING = 0.22, ALPHA = 0.5;
  var LOW = "48,110,240", HIGH = "170,70,220";
  var W = 0, H = 0;
  function size() {
    W = Math.max(2, Math.round(cv.clientWidth * SCALE));
    H = Math.max(2, Math.round(cv.clientHeight * SCALE));
    cv.width = layer.width = W; cv.height = layer.height = H;
  }
  function levels(t) {
    var out = [];
    for (var i = 0; i < POINTS; i++) {
      var x = i / (POINTS - 1);
      var v = 0.5 + 0.22 * Math.sin(x * 7 - t * 0.9) + 0.14 * Math.sin(x * 12 - t * 0.6);
      out.push(Math.max(0.1, Math.min(1, v * (0.55 + 0.45 * (1 - x * 0.5)))));
    }
    return out;
  }
  function draw(t) {
    var lv = levels(t), phase = t * DRIFT;
    ctx.clearRect(0, 0, W, H);
    for (var s = 0; s < SHEETS; s++) {
      var back = s / (SHEETS - 1);
      var swing = phase * Math.PI * 2 + back * 1.7;
      var rest = H * (0.98 - back * 0.22);
      var reach = H * (0.5 - back * 0.14);
      var alpha = (0.5 - back * 0.22) * ALPHA;
      var pts = [], topY = H;
      for (var i = 0; i < POINTS; i++) {
        var a = i / (POINTS - 1);
        var wave = Math.sin(a * Math.PI * 2 * 1.1 - swing);
        var y = rest - lv[i] * reach * (0.8 + 0.2 * wave) - wave * H * SWING * 0.2;
        if (y < topY) topY = y;
        pts.push([-W * 0.03 + a * W * 1.06, y]);
      }
      lx.globalCompositeOperation = "source-over";
      lx.clearRect(0, 0, W, H);
      lx.beginPath(); lx.moveTo(pts[0][0], H + 2); lx.lineTo(pts[0][0], pts[0][1]);
      for (var q = 1; q < pts.length - 1; q++) lx.quadraticCurveTo(pts[q][0], pts[q][1], (pts[q][0] + pts[q + 1][0]) / 2, (pts[q][1] + pts[q + 1][1]) / 2);
      lx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); lx.lineTo(pts[pts.length - 1][0], H + 2); lx.closePath();
      var hg = lx.createLinearGradient(0, 0, W, 0);
      hg.addColorStop(0, "rgb(" + LOW + ")"); hg.addColorStop(1, "rgb(" + HIGH + ")");
      lx.fillStyle = hg; lx.fill();
      lx.globalCompositeOperation = "destination-in";
      var vg = lx.createLinearGradient(0, topY, 0, H);
      vg.addColorStop(0, "rgba(0,0,0,1)"); vg.addColorStop(1, "rgba(0,0,0,0)");
      lx.fillStyle = vg; lx.fillRect(0, 0, W, H);
      ctx.globalAlpha = alpha; ctx.drawImage(layer, 0, 0); ctx.globalAlpha = 1;
    }
  }
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t0 = performance.now(), last = 0;
  function frame(now) {
    if (now - last >= 33) { last = now; draw((now - t0) / 1000 + 3); }
    if (!still) requestAnimationFrame(frame);
  }
  size();
  window.addEventListener("resize", function () { size(); if (still) draw(3); });
  requestAnimationFrame(frame);
})();
