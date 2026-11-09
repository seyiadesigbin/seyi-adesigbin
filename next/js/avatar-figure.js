/*
 * The avatar as a standing figure made of six pictures: head, torso (with the sleeves), two arms and two legs.
 * Because the parts are separate, the arms and legs can swing from the shoulders and hips, and the head can be
 * sized on its own. Used by the Report timeline.
 *
 *   var fig = AvatarFigure.create();   // returns an <svg> element (decorative: aria-hidden)
 *   fig.classList.add("is-running");   // starts the run cycle (see avatar-figure.css)
 *
 * The pictures are in assets/figure/. LAYOUT gives each part's position and its pivot in the figure's own
 * units (the figure is 265 x 720). Head size is a CSS variable (--fig-head-scale).
 * Built with createElementNS, no innerHTML.
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var XLINK = "http://www.w3.org/1999/xlink";

  var LAYOUT = {
    w: 265, h: 720,
    // Drawn back to front. "pivot" is where the part turns (shoulder, hip, neck).
    parts: [
      { id: "arm-l", x: 9.4, y: 248.5, w: 58, h: 234, pivot: [44.4, 269.2] },
      { id: "arm-r", x: 198.1, y: 248.9, w: 58, h: 233, pivot: [220.3, 269.2] },
      { id: "leg-l", x: 1.9, y: 432.8, w: 132, h: 285, pivot: [87.6, 442.2] },
      { id: "leg-r", x: 130.8, y: 432.8, w: 132, h: 285, pivot: [177.1, 442.2] },
      { id: "torso", x: 20.3, y: 171.1, w: 224, h: 277 },
      { id: "head", x: 64.3, y: 1.9, w: 136, h: 176, pivot: [132.3, 177.8] }
    ]
  };

  function node(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }

  function create() {
    var root = node("svg", {
      "class": "avatar-figure",
      viewBox: "0 0 " + LAYOUT.w + " " + LAYOUT.h,
      "aria-hidden": "true",
      focusable: "false"
    });
    LAYOUT.parts.forEach(function (p) {
      var g = node("g", { "class": "fig-part fig-" + p.id }, root);
      if (p.pivot) g.style.transformOrigin = p.pivot[0] + "px " + p.pivot[1] + "px";
      var img = node("image", { x: p.x, y: p.y, width: p.w, height: p.h }, g);
      img.setAttribute("href", "assets/figure/" + p.id + ".png");
      img.setAttributeNS(XLINK, "xlink:href", "assets/figure/" + p.id + ".png");
    });
    return root;
  }

  window.AvatarFigure = { create: create };
})();
