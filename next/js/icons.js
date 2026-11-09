/* Small line icons for the contact links, shared by the Desk and the Report.
   Exposes window.Icons.link(kind, href, label, external): an <a> that shows only an icon.
   The accessible name comes from aria-label (the SVG itself is hidden from screen readers);
   title gives sighted mouse users a tooltip. Drawn as outlines in the style of the Feather set (MIT licence). */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  var PHONE = "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z";
  var BUBBLE = "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z";

  // Each icon is a list of shapes: [tag, attributes].
  var SHAPES = {
    call: [["path", { d: PHONE }]],
    whatsapp: [
      ["path", { d: BUBBLE }],
      ["path", { d: PHONE, transform: "translate(7.6 7.4) scale(.38)" }]
    ],
    linkedin: [
      ["path", { d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" }],
      ["rect", { x: 2, y: 9, width: 4, height: 12 }],
      ["circle", { cx: 4, cy: 4, r: 2 }]
    ],
    instagram: [
      ["rect", { x: 2, y: 2, width: 20, height: 20, rx: 5, ry: 5 }],
      ["path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" }],
      ["line", { x1: 17.5, y1: 6.5, x2: 17.51, y2: 6.5 }]
    ]
  };

  function svg(kind) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("focusable", "false");
    (SHAPES[kind] || []).forEach(function (shape) {
      var node = document.createElementNS(NS, shape[0]);
      Object.keys(shape[1]).forEach(function (k) { node.setAttribute(k, shape[1][k]); });
      s.appendChild(node);
    });
    return s;
  }

  function link(kind, href, label, external) {
    var a = document.createElement("a");
    a.className = "icon-link icon-" + kind;
    a.href = href;
    a.title = label;
    // Links that open a new tab say so, so a screen-reader user is not surprised.
    a.setAttribute("aria-label", external ? label + " (opens in a new tab)" : label);
    if (external) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    a.appendChild(svg(kind));
    return a;
  }

  window.Icons = { link: link };
})();
