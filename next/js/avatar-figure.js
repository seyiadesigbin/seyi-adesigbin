/*
 * The avatar as a standing figure: the head drawing on a body drawn in SVG, with the arms and legs as
 * separate parts so they can swing. Used by the Report timeline.
 *
 *   var fig = AvatarFigure.create();   // returns an <svg> element (decorative: aria-hidden)
 *   fig.classList.add("is-running");   // starts the run cycle (see avatar-figure.css)
 *
 * Colours come from CSS variables in avatar-figure.css, so the outfit can be changed without touching this file.
 * Built with createElementNS, no innerHTML.
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";

  function node(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }

  // Both arms and legs are drawn for the left side of the picture, then mirrored for the right
  // (x -> 224 - x, the figure is centred on x = 112).
  function arm(parent, side) {
    var g = node("g", { "class": "fig-part fig-arm fig-arm--" + side }, parent);
    var m = side === "r";
    var x = function (v, w) { return m ? 224 - v - (w || 0) : v; };
    node("rect", { "class": "fig-skin fig-line", x: x(31, 20), y: 186, width: 20, height: 62, rx: 9 }, g);
    node("ellipse", { "class": "fig-skin fig-line", cx: m ? 183 : 41, cy: 254, rx: 11, ry: 12 }, g);
    if (side === "l") node("rect", { "class": "fig-accent fig-line-thin", x: 30, y: 236, width: 22, height: 7, rx: 2 }, g); // watch
    node("rect", { "class": "fig-top fig-line", x: x(26, 30), y: 146, width: 30, height: 46, rx: 13 }, g); // sleeve
    return g;
  }

  function leg(parent, side) {
    var g = node("g", { "class": "fig-part fig-leg fig-leg--" + side }, parent);
    var left = side === "l";
    var d = left
      ? "M56 244 L110 244 L106 358 L50 358 Z"
      : "M168 244 L114 244 L118 358 L174 358 Z";
    node("path", { "class": "fig-trousers fig-line", d: d }, g);
    node("path", { "class": "fig-fold", d: left ? "M84 262 L82 346" : "M140 262 L142 346" }, g);
    // trainer: white upper, dark sole
    var sx = left ? 44 : 114;
    node("path", { "class": "fig-shoe fig-line", d: "M" + sx + " 356 h66 v14 q0 11 -12 11 h-42 q-12 0 -12 -11 z" }, g);
    node("rect", { "class": "fig-sole", x: sx + 1, y: 376, width: 64, height: 5, rx: 2.5 }, g);
    return g;
  }

  function create() {
    var root = node("svg", {
      "class": "avatar-figure",
      viewBox: "0 0 224 392",
      "aria-hidden": "true",
      focusable: "false"
    });
    var body = node("g", { "class": "fig-body" }, root);

    // Waist band behind the shirt, then legs, so the shirt hem overlaps the trousers.
    node("rect", { "class": "fig-trousers fig-line", x: 52, y: 234, width: 120, height: 30, rx: 6 }, body);
    leg(body, "l");
    leg(body, "r");

    // A neck behind the head fills the notches in the head drawing's ragged neck edge.
    node("rect", { "class": "fig-neck", x: 84, y: 118, width: 56, height: 46, rx: 8 }, body);

    // Head first, then the shirt over it so the scooped neckline hides the ragged neck edge.
    node("image", { "class": "fig-head", href: "assets/head.png", x: 62, y: 0, width: 100, height: 149 }, body);

    node("path", {
      "class": "fig-top fig-line",
      d: "M52 152 Q58 140 82 137 Q112 160 142 137 Q166 140 172 152 L176 252 Q112 264 48 252 Z"
    }, body);
    node("path", { "class": "fig-rib", d: "M84 139 Q112 160 140 139" }, body);
    node("path", { "class": "fig-fold", d: "M112 158 L112 190" }, body);
    [166, 176, 186].forEach(function (y) { node("circle", { "class": "fig-button", cx: 112, cy: y, r: 1.8 }, body); });
    // drawstring
    node("path", { "class": "fig-string", d: "M106 258 Q104 272 100 280 M118 258 Q120 272 124 280" }, body);

    arm(body, "l");
    arm(body, "r");
    return root;
  }

  window.AvatarFigure = { create: create };
})();
