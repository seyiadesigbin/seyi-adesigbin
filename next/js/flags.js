/*
 * Small country flags drawn as SVG (emoji flags do not show on Windows). Decorative: the country is always
 * written next to the flag as text, so the picture is hidden from screen readers.
 *
 *   Flags.create("NG")  ->  an <svg> element, or null for a code that is not drawn
 *
 * Add a country by adding a function to DRAW. Built with createElementNS, no innerHTML.
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var uid = 0;

  function node(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }

  var DRAW = {
    // Nigeria: green, white, green, in three upright stripes.
    NG: function (s) {
      node("rect", { width: 30, height: 20, fill: "#008751" }, s);
      node("rect", { x: 10, width: 10, height: 20, fill: "#fff" }, s);
    },
    // United Kingdom: the Union flag.
    GB: function (s) {
      var id = "flag-gb-" + (++uid);
      node("rect", { width: 60, height: 30, fill: "#012169" }, s);
      var diag = "M0,0 L60,30 M60,0 L0,30";
      node("path", { d: diag, stroke: "#fff", "stroke-width": 6 }, s);
      var clip = node("clipPath", { id: id }, s);
      node("path", { d: "M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" }, clip);
      node("path", { d: diag, stroke: "#C8102E", "stroke-width": 4, "clip-path": "url(#" + id + ")" }, s);
      node("path", { d: "M30,0 V30 M0,15 H60", stroke: "#fff", "stroke-width": 10 }, s);
      node("path", { d: "M30,0 V30 M0,15 H60", stroke: "#C8102E", "stroke-width": 6 }, s);
    }
  };
  var SIZE = { NG: [30, 20], GB: [60, 30] };

  function create(code) {
    var draw = DRAW[code];
    if (!draw) return null;
    var size = SIZE[code];
    var s = node("svg", { "class": "flag", viewBox: "0 0 " + size[0] + " " + size[1], "aria-hidden": "true", focusable: "false" });
    draw(s);
    return s;
  }

  window.Flags = { create: create };
})();
