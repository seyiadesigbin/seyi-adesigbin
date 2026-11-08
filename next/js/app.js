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

  // Temporary content so both views show real data. Replaced by the designed views later.
  function renderDeskPlaceholder(root) {
    root.appendChild(el("h1", "Hey, I'm " + site.shortName + "."));
    root.appendChild(el("p", site.tagline + " " + site.intro));
    root.appendChild(el("h2", "Three words"));
    root.appendChild(el("p", site.threeWords.join(". ") + "."));
    root.appendChild(el("h2", "What I do"));
    var ul = el("ul");
    site.expertise.forEach(function (x) { ul.appendChild(el("li", x.title + ": " + x.text)); });
    root.appendChild(ul);
  }

  function renderReportPlaceholder(root) {
    root.appendChild(el("h1", site.name));
    root.appendChild(el("p", site.tagline + " " + site.intro));
    root.appendChild(el("h2", "Key figures"));
    var s = el("ul");
    site.stats.forEach(function (x) {
      s.appendChild(el("li", x.value.toLocaleString() + (x.plus ? "+" : "") + (x.suffix || "") + " " + x.label));
    });
    root.appendChild(s);
    root.appendChild(el("h2", "Experience"));
    var e = el("ul");
    site.experience.forEach(function (x) {
      var years = x.start === x.end ? x.start : x.start + "-" + x.end;
      e.appendChild(el("li", years + " | " + x.role + ", " + x.org));
    });
    root.appendChild(e);
    root.appendChild(el("h2", "Tools"));
    root.appendChild(el("p", site.tools.map(function (t) { return t.name; }).join(", ")));
  }

  function show(view, opts) {
    opts = opts || {};
    VIEWS.forEach(function (v) {
      document.getElementById("view-" + v).hidden = v !== view;
    });
    document.body.setAttribute("data-view", view);
    document.querySelectorAll(".view-switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.view === view));
    });
    if (opts.remember) store(view);
    if (opts.updateHash && viewFromHash() !== view) history.replaceState(null, "", "#" + view);
  }

  function init() {
    renderDeskPlaceholder(document.querySelector("#view-desk .placeholder"));
    renderReportPlaceholder(document.querySelector("#view-report .placeholder"));

    var stored = readStored();
    var start = viewFromHash() || (VIEWS.indexOf(stored) !== -1 ? stored : null) || defaultView();
    show(start, { updateHash: true });

    document.querySelectorAll(".view-switch button").forEach(function (b) {
      b.addEventListener("click", function () {
        show(b.dataset.view, { remember: true, updateHash: true });
      });
    });
    window.addEventListener("hashchange", function () {
      var v = viewFromHash();
      if (v) show(v, { remember: true });
    });
  }

  init();
})();
