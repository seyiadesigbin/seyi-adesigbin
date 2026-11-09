/*
 * One-time avatar: your head pops up from the bottom edge, a hand waves to get attention, then two speech
 * bubbles appear one after the other (a greeting, then a message with a button that offers the other view).
 * Shown once per browser (remembered in localStorage); dismissible by the x button or Escape.
 * It is not modal: it never takes focus, and the page behind stays usable.
 * All wording comes from window.SITE.popup.
 *
 * Under prefers-reduced-motion nothing moves: everything appears at once.
 */
(function () {
  var SEEN_KEY = "seyi-popup-seen";
  var START_DELAY_MS = 1200;
  // Gaps between the steps: head up, hand up and waving, greeting bubble, message bubble.
  var STEP_MS = { wave: 550, hello: 900, message: 1000 };
  var SVG_NS = "http://www.w3.org/2000/svg";

  function seen() {
    try { return localStorage.getItem(SEEN_KEY) === "1"; } catch (e) { return false; }
  }
  function markSeen() {
    try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) { /* private mode: fine */ }
  }
  function el(tag, text, className) {
    var n = document.createElement(tag);
    if (text != null) n.textContent = text;
    if (className) n.className = className;
    return n;
  }
  function svg(tag, attrs, parent) {
    var n = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }

  // A plain cartoon hand and forearm, same thick-outline style as the head. Placeholder art.
  function buildHand() {
    var s = svg("svg", { viewBox: "0 0 44 96", "aria-hidden": "true", focusable: "false", "class": "avatar-popup__hand" });
    var line = { fill: "#bc875e", stroke: "#262626", "stroke-width": "2.5", "stroke-linejoin": "round" };
    function rect(x, y, w, h, r, extra) {
      var a = { x: x, y: y, width: w, height: h, rx: r };
      Object.keys(line).forEach(function (k) { a[k] = line[k]; });
      Object.keys(extra || {}).forEach(function (k) { a[k] = extra[k]; });
      return svg("rect", a, s);
    }
    rect(14, 44, 16, 60, 4);                       // forearm (runs off the bottom edge)
    rect(9, 8, 6, 24, 3);                          // index
    rect(16, 3, 6, 28, 3);                         // middle
    rect(23, 7, 6, 25, 3);                         // ring
    rect(30, 13, 6, 20, 3);                        // little
    rect(2, 26, 7, 22, 3.5, { transform: "rotate(-28 5.5 37)" }); // thumb
    rect(8, 28, 28, 22, 9);                        // palm
    svg("rect", { x: 11, y: 28, width: 22, height: 8, fill: "#bc875e" }, s); // hides the lines where fingers meet the palm
    return s;
  }

  /*
   * opts.site     window.SITE
   * opts.getView  function returning "desk" or "report"
   * opts.onSwitch function(view) called when the visitor accepts the suggestion
   * Returns { hide, refresh } or null when there is nothing to show.
   */
  function create(opts) {
    var copy = opts.site.popup;
    if (!copy || seen()) return null;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var box = el("aside", null, "avatar-popup");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", copy.greeting);
    box.hidden = true;

    // Speech bubbles (left). aria-live so a screen reader reads each bubble as it appears.
    var talk = el("div", null, "avatar-popup__talk");
    talk.setAttribute("aria-live", "polite");
    var hello = el("p", copy.greeting, "avatar-popup__bubble avatar-popup__bubble--hello");
    var message = el("div", null, "avatar-popup__bubble avatar-popup__bubble--message");
    var msg = el("p", "");
    var go = el("button", "", "avatar-popup__go");
    go.type = "button";
    var close = el("button", "×", "avatar-popup__close");
    close.type = "button";
    close.setAttribute("aria-label", copy.close);
    message.appendChild(msg); message.appendChild(go); message.appendChild(close);
    hello.hidden = true; message.hidden = true;
    talk.appendChild(hello); talk.appendChild(message);

    // The figure (right): head, with a hand beside it. Clipped at the bottom so it looks like it is peeking up.
    var figure = el("div", null, "avatar-popup__figure");
    figure.setAttribute("aria-hidden", "true");
    var headFrame = el("div", null, "avatar-popup__head");
    var img = document.createElement("img");
    img.src = "assets/avatar.png"; img.alt = ""; img.width = 375; img.height = 556;
    headFrame.appendChild(img);
    var handWrap = el("div", null, "avatar-popup__handwrap");
    handWrap.appendChild(buildHand());
    figure.appendChild(handWrap); figure.appendChild(headFrame);

    box.appendChild(talk); box.appendChild(figure);
    document.body.appendChild(box);

    var timers = [];
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    function other() { return opts.getView() === "desk" ? "report" : "desk"; }
    function fill() {
      var v = opts.getView();
      msg.textContent = v === "desk" ? copy.desk : copy.report;
      go.textContent = v === "desk" ? copy.toReport : copy.toDesk;
    }
    function hide() {
      timers.forEach(clearTimeout);
      box.hidden = true;
      document.removeEventListener("keydown", onKey);
      markSeen();
    }
    function onKey(e) { if (e.key === "Escape") hide(); }

    close.addEventListener("click", hide);
    go.addEventListener("click", function () { var v = other(); hide(); opts.onSwitch(v); });

    function start() {
      fill();
      box.hidden = false;
      document.addEventListener("keydown", onKey);
      if (reduced) {
        box.classList.add("is-up", "is-waving");
        hello.hidden = false; message.hidden = false;
        return;
      }
      // Force a style pass so the starting (hidden) state is painted before the class change.
      void box.offsetWidth;
      box.classList.add("is-up");
      later(function () { box.classList.add("is-waving"); }, STEP_MS.wave);
      later(function () { hello.hidden = false; }, STEP_MS.wave + STEP_MS.hello);
      later(function () { message.hidden = false; }, STEP_MS.wave + STEP_MS.hello + STEP_MS.message);
    }
    later(start, START_DELAY_MS);

    // Called by the app whenever the view changes, so the text and button always describe the view now showing.
    function refresh() { if (!box.hidden) fill(); }

    return { hide: hide, refresh: refresh };
  }

  window.AvatarPopup = { create: create };
})();
