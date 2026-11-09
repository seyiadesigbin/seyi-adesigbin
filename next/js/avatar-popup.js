/*
 * One-time avatar pop-up: says hello and offers the other view (Desk or Report).
 * Shown once per browser (remembered in localStorage), dismissible by button or Escape.
 * It is not modal: it never takes focus, and the page behind stays usable.
 * All wording comes from window.SITE.popup.
 */
(function () {
  var SEEN_KEY = "seyi-popup-seen";
  var SHOW_DELAY_MS = 1200;

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
   * Returns { hide } or null when there is nothing to show.
   */
  function create(opts) {
    var copy = opts.site.popup;
    if (!copy || seen()) return null;

    var box = el("aside", null, "avatar-popup");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", copy.greeting);
    box.hidden = true;

    // The picture is decorative: the words next to it say everything.
    var frame = el("div", null, "avatar-popup__face");
    var img = document.createElement("img");
    img.src = "assets/avatar.png"; img.alt = ""; img.width = 1000; img.height = 1000;
    frame.appendChild(img);

    var body = el("div", null, "avatar-popup__body");
    var hello = el("p", copy.greeting, "avatar-popup__hello");
    var msg = el("p", "", "avatar-popup__msg");
    var go = el("button", "", "avatar-popup__go");
    go.type = "button";
    body.appendChild(hello); body.appendChild(msg); body.appendChild(go);

    var close = el("button", "\u00d7", "avatar-popup__close");
    close.type = "button";
    close.setAttribute("aria-label", copy.close);

    box.appendChild(frame); box.appendChild(body); box.appendChild(close);
    document.body.appendChild(box);

    var timer = null;

    function other() { return opts.getView() === "desk" ? "report" : "desk"; }
    function fill() {
      var v = opts.getView();
      msg.textContent = v === "desk" ? copy.desk : copy.report;
      go.textContent = v === "desk" ? copy.toReport : copy.toDesk;
    }
    function hide() {
      clearTimeout(timer);
      box.hidden = true;
      document.removeEventListener("keydown", onKey);
      markSeen();
    }
    function onKey(e) { if (e.key === "Escape") hide(); }

    close.addEventListener("click", hide);
    go.addEventListener("click", function () { var v = other(); hide(); opts.onSwitch(v); });

    timer = setTimeout(function () {
      fill();
      box.hidden = false;
      document.addEventListener("keydown", onKey);
    }, SHOW_DELAY_MS);

    return { hide: hide };
  }

  window.AvatarPopup = { create: create };
})();
