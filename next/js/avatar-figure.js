/*
 * The avatar as a standing figure made of six pictures: head, torso (with the sleeves), two arms and two legs.
 * Because the parts are separate, the arms and legs can swing from the shoulders and hips, and the head can be
 * sized on its own. Used by the Report timeline.
 *
 *   var fig = AvatarFigure.create();         // front view, standing (an <svg>, decorative: aria-hidden)
 *   var walker = AvatarFigure.create("walk"); // side view, facing right, for walking along the timeline
 *   walker.classList.add("is-walking");       // starts the walk cycle (see avatar-figure.css)
 *
 * The pictures are in assets/figure/ (front) and assets/figure/walk/ (side). Each layout gives every part's
 * position and its pivot in the figure's own units (front 265 x 720, side 375 x 720). In the front view the
 * head size is a CSS variable (--fig-head-scale).
 * Built with createElementNS, no innerHTML.
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var XLINK = "http://www.w3.org/1999/xlink";

  var LAYOUTS = {};
  LAYOUTS.front = {
    w: 265, h: 720,
    dir: "",
    // Drawn back to front. "pivot" is where the part turns (shoulder, hip, neck).
    parts: [
      { id: "arm-l", x: 9.4, y: 248.5, w: 58, h: 234, pivot: [44.4, 269.2] },
      { id: "arm-r", x: 198.1, y: 248.9, w: 58, h: 233, pivot: [220.3, 269.2] },
      { id: "leg-l", x: 1.9, y: 432.8, w: 132, h: 285, pivot: [87.6, 442.2] },
      { id: "leg-r", x: 130.8, y: 432.8, w: 132, h: 285, pivot: [177.1, 442.2] },
      { id: "torso", x: 20.3, y: 139.5, w: 224, h: 308 },
      { id: "head", x: 64.3, y: 1.9, w: 136, h: 171, pivot: [132.3, 170.7] }
    ]
  };

  // Side view. Arms sit under the shirt (their tops are hidden by the sleeves); the legs hang from the hips
  // under the trouser top, which belongs to the torso piece.
  LAYOUTS.walk = {
    w: 375, h: 720,
    dir: "walk/",
    parts: [
      { id: "arm-b", x: 47.9, y: 277.8, w: 90, h: 203, pivot: [98.4, 281.6] },
      { id: "leg-b", x: 2.6, y: 504.0, w: 177, h: 201, pivot: [179.4, 515.3] },
      { id: "leg-f", x: 179.4, y: 504.0, w: 193, h: 213, pivot: [179.4, 515.3] },
      { id: "arm-f", x: 208.1, y: 277.8, w: 116, h: 173, pivot: [222.8, 281.6] },
      { id: "torso", x: 71.2, y: 133.4, w: 232, h: 393 },
      { id: "head", x: 109.3, y: 2.6, w: 159, h: 173, pivot: [168.1, 157.2] }
    ]
  };

  function node(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }

  function create(kind) {
    var LAYOUT = LAYOUTS[kind] || LAYOUTS.front;
    var root = node("svg", {
      "class": "avatar-figure" + (LAYOUT === LAYOUTS.walk ? " avatar-figure--walk" : ""),
      viewBox: "0 0 " + LAYOUT.w + " " + LAYOUT.h,
      "aria-hidden": "true",
      focusable: "false"
    });
    LAYOUT.parts.forEach(function (p) {
      var g = node("g", { "class": "fig-part fig-" + p.id }, root);
      if (p.pivot) g.style.transformOrigin = p.pivot[0] + "px " + p.pivot[1] + "px";
      var img = node("image", { x: p.x, y: p.y, width: p.w, height: p.h }, g);
      img.setAttribute("href", "assets/figure/" + LAYOUT.dir + p.id + ".png");
      img.setAttributeNS(XLINK, "xlink:href", "assets/figure/" + LAYOUT.dir + p.id + ".png");
    });
    return root;
  }

  window.AvatarFigure = { create: create };
})();
