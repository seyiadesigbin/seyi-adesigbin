/*
 * One-time avatar: your head pops up from the bottom edge, then two speech
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
  // Gaps between the steps: head up, greeting bubble, message bubble.
  var STEP_MS = { hello: 700, message: 1000 };

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

    // The figure (right): the head. Clipped at the bottom so it looks like it is peeking up.
    var figure = el("div", null, "avatar-popup__figure");
    figure.setAttribute("aria-hidden", "true");
    var headFrame = el("div", null, "avatar-popup__head");
    var img = document.createElement("img");
    img.src = "assets/figure/head.png"; img.alt = ""; img.width = 136; img.height = 171;
    headFrame.appendChild(img);
    figure.appendChild(headFrame);

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
        box.classList.add("is-up");
        hello.hidden = false; message.hidden = false;
        return;
      }
      // Force a style pass so the starting (hidden) state is painted before the class change.
      void box.offsetWidth;
      box.classList.add("is-up");
      later(function () { hello.hidden = false; }, STEP_MS.hello);
      later(function () { message.hidden = false; }, STEP_MS.hello + STEP_MS.message);
    }
    later(start, START_DELAY_MS);

    // Called by the app whenever the view changes, so the text and button always describe the view now showing.
    function refresh() { if (!box.hidden) fill(); }

    return { hide: hide, refresh: refresh };
  }

  window.AvatarPopup = { create: create };
})();
