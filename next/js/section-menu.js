/*
 * A small floating button for the Report: press it to open a list of the page's sections and jump to one.
 * It can be dragged anywhere on screen (pointer or touch); a short press without moving opens the list.
 * Keyboard: Tab to the button, Enter or Space opens the list, Tab through the links, Escape closes it.
 * (There is no keyboard dragging: the button stays where it is, and the menu works without moving it.)
 *
 *   SectionMenu.create(items, scrollTo)   items: [{ id, label }]   scrollTo(id) scrolls to a section
 *
 * The icon is drawn here (three bars and a dot), not a stock icon. Built with createElementNS, no innerHTML.
 * The Report's hidden state hides this too, since it is mounted inside the Report.
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var DRAG_PX = 6;   // movement before a press counts as a drag

  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon() {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 32 32"); s.setAttribute("aria-hidden", "true"); s.setAttribute("focusable", "false");
    s.setAttribute("class", "section-menu__icon");
    [[7, 9, 18], [7, 16, 12], [7, 23, 16]].forEach(function (b) {
      var r = document.createElementNS(NS, "rect");
      r.setAttribute("x", b[0]); r.setAttribute("y", b[1] - 2); r.setAttribute("width", b[2]); r.setAttribute("height", 4); r.setAttribute("rx", 2);
      s.appendChild(r);
    });
    var d = document.createElementNS(NS, "circle");
    d.setAttribute("cx", 26); d.setAttribute("cy", 9); d.setAttribute("r", 3); d.setAttribute("class", "dot");
    s.appendChild(d);
    return s;
  }

  function create(items, scrollTo) {
    var root = el("div", "section-menu");
    var btn = el("button", "section-menu__btn");
    btn.type = "button";
    btn.setAttribute("aria-label", "Jump to a section");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "section-menu-list");
    btn.appendChild(icon());

    var list = el("nav", "section-menu__list");
    list.id = "section-menu-list";
    list.setAttribute("aria-label", "Sections");
    list.hidden = true;
    items.forEach(function (it) {
      var b = el("button", "section-menu__link", it.label);
      b.type = "button";
      b.addEventListener("click", function () { close(); scrollTo(it.id); });
      list.appendChild(b);
    });
    root.appendChild(list);
    root.appendChild(btn);

    function place() {
      // Open the list away from the nearest screen edge, so it is never cut off.
      var r = btn.getBoundingClientRect();
      root.classList.toggle("is-below", r.top + r.height / 2 < window.innerHeight / 2);
      root.classList.toggle("is-right", r.left + r.width / 2 > window.innerWidth / 2);
    }
    function open() { place(); list.hidden = false; btn.setAttribute("aria-expanded", "true"); }
    function close() { list.hidden = true; btn.setAttribute("aria-expanded", "false"); }

    btn.addEventListener("click", function () {
      if (suppress) { suppress = false; return; }
      if (list.hidden) open(); else close();
    });
    root.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !list.hidden) { close(); btn.focus(); }
    });
    document.addEventListener("pointerdown", function (e) {
      if (!list.hidden && !root.contains(e.target)) close();
    });

    // Dragging. The root is placed with left/top once it has been moved; until then CSS puts it bottom-left.
    var suppress = false, drag = null;
    btn.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      var r = root.getBoundingClientRect();
      drag = { x: e.clientX, y: e.clientY, left: r.left, top: r.top, moved: false, id: e.pointerId };
    });
    btn.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < DRAG_PX) return;
      if (!drag.moved) { drag.moved = true; window.removeEventListener("scroll", goToCursor); close(); btn.setPointerCapture(e.pointerId); root.classList.add("is-dragging"); }
      var w = root.offsetWidth, h = root.offsetHeight;
      root.style.left = Math.min(Math.max(0, drag.left + dx), window.innerWidth - w) + "px";
      root.style.top = Math.min(Math.max(0, drag.top + dy), window.innerHeight - h) + "px";
      root.style.right = "auto"; root.style.bottom = "auto";
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.moved) { suppress = true; root.classList.remove("is-dragging"); }
      drag = null;
    }
    btn.addEventListener("pointerup", end);
    btn.addEventListener("pointercancel", end);

    // Where the button first goes: when the visitor first scrolls, it glides to just beside the mouse pointer, so it is
    // close to where they are looking. It does this once, and not at all if it has been dragged. With touch (no
    // pointer) it simply stays at its starting corner.
    var cursor = null;
    document.addEventListener("pointermove", function (e) { if (e.pointerType === "mouse") cursor = { x: e.clientX, y: e.clientY }; });
    function goToCursor() {
      if (!root.getClientRects().length) return;   // the Report is not showing: try again on a later scroll
      window.removeEventListener("scroll", goToCursor);
      if (!cursor || root.style.left) return;
      var r = root.getBoundingClientRect(), w = root.offsetWidth, h = root.offsetHeight;
      root.style.left = r.left + "px"; root.style.top = r.top + "px"; root.style.right = "auto"; root.style.bottom = "auto";
      void root.offsetWidth;   // let the browser take the starting point before the move
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.style.transition = "left .4s ease-out, top .4s ease-out";
      root.style.left = Math.min(Math.max(0, cursor.x + 28), window.innerWidth - w) + "px";
      root.style.top = Math.min(Math.max(0, cursor.y + 28), window.innerHeight - h) + "px";
      setTimeout(function () { root.style.transition = ""; }, 450);
    }
    window.addEventListener("scroll", goToCursor, { passive: true });

    window.addEventListener("resize", function () {
      if (root.style.left) {   // keep a dragged button on screen when the window shrinks
        var r = root.getBoundingClientRect();
        root.style.left = Math.min(Math.max(0, r.left), window.innerWidth - r.width) + "px";
        root.style.top = Math.min(Math.max(0, r.top), window.innerHeight - r.height) + "px";
      }
    });
    return root;
  }

  window.SectionMenu = { create: create };
})();
