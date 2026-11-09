/*
 * App shell: decides which view to show (Desk or Report), keeps the URL and
 * the switch in sync, and remembers the visitor's choice.
 *
 * Rules, in order:
 *   1. A link like site.com/#report always wins.
 *   2. Otherwise the choice remembered from a previous visit.
 *   3. Otherwise Report for small screens or "reduce motion", else Desk.
 */
(function () {
  var VIEWS = ["desk", "report"];
  var STORAGE_KEY = "seyi-view";
  var site = window.SITE;

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function store(view) {
    try { localStorage.setItem(STORAGE_KEY, view); } catch (e) { /* private mode: fine */ }
  }

  function defaultView() {
    var small = window.matchMedia("(max-width: 700px)").matches;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return small || reduced ? "report" : "desk";
  }

  function viewFromHash() {
    var h = location.hash.replace("#", "");
    return VIEWS.indexOf(h) !== -1 ? h : null;
  }

  function el(tag, text, className) {
    var n = document.createElement(tag);
    if (text != null) n.textContent = text;
    if (className) n.className = className;
    return n;
  }

  function show(view, opts) {
    opts = opts || {};
    VIEWS.forEach(function (v) {
      document.getElementById("view-" + v).hidden = v !== view;
    });
    document.body.setAttribute("data-view", view);
    if (view === "desk" && window.Desk) window.Desk.layout(); // needs the view visible to measure
    document.querySelectorAll(".view-switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.view === view));
    });
    if (opts.remember) store(view);
    if (opts.updateHash && viewFromHash() !== view) history.replaceState(null, "", "#" + view);
  }

  function init() {
    window.Desk.mount(document.querySelector("#view-desk .desk"));
    window.Report.mount(document.querySelector("#view-report .report"));

    var stored = readStored();
    var start = viewFromHash() || (VIEWS.indexOf(stored) !== -1 ? stored : null) || defaultView();
    show(start, { updateHash: true });

    document.querySelectorAll(".view-switch button").forEach(function (b) {
      b.addEventListener("click", function () {
        show(b.dataset.view, { remember: true, updateHash: true });
      });
    });
    if (window.AvatarPopup) {
      window.AvatarPopup.create({
        site: site,
        getView: function () { return document.body.getAttribute("data-view"); },
        onSwitch: function (v) { show(v, { remember: true, updateHash: true }); }
      });
    }
    window.addEventListener("hashchange", function () {
      var v = viewFromHash();
      if (v) show(v, { remember: true });
    });
  }

  init();
})();
