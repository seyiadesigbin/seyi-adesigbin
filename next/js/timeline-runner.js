/*
 * The animated strip above the Report timeline. The avatar moves along the years and stops at today. Nothing
 * is typed in here: the year range comes from window.SITE.experience, so editing content.js moves everything.
 *
 *   TimelineRunner.create(site, firstYear, yearCount)  ->  an element to put above the year axis
 *
 * Plays once, when the strip is mostly on screen; a Replay button runs it again. With prefers-reduced-motion
 * nothing moves: the avatar simply stands at today's position. The picture is decorative (aria-hidden).
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var SECONDS_PER_FULL_WIDTH = 8;   // running speed: time to cross the whole strip

  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  function reducedMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  // Position along the strip, 0..1, for a date given as a fractional year.
  function frac(date, first, n) { return Math.min(1, Math.max(0, (date - first) / n)); }
  function pct(f) { return (f * 100).toFixed(3) + "%"; }

  function create(site, first, n) {
    var wrap = el("div", "runner");
    var side = el("div", "runner-side");
    var replay = el("button", "runner-replay mono", "Replay");
    replay.type = "button";
    replay.setAttribute("aria-label", "Replay the career timeline animation");
    side.appendChild(replay);
    wrap.appendChild(side);

    var track = el("div", "runner-track");
    wrap.appendChild(track);
    track.appendChild(el("div", "runner-ground"));

    // Where everything sits, from the data.
    var now = new Date();
    var nowYear = now.getFullYear() + (now.getMonth() + (now.getDate() - 1) / 30) / 12;
    var pNow = frac(nowYear, first, n);

    var actor = el("div", "runner-actor");
    var figure = window.AvatarFigure ? window.AvatarFigure.create() : null;
    if (figure) actor.appendChild(figure);
    track.appendChild(actor);

    function stand(left) { actor.style.left = pct(left); if (figure) figure.classList.remove("is-running"); }
    function setRun(on) { if (figure) figure.classList.toggle("is-running", on); }

    var running = [];
    var token = 0;
    function stop() { token++; running.forEach(function (a) { a.cancel(); }); running = []; }
    function go(el_, frames, opts) {
      var a = el_.animate(frames, opts);
      running.push(a);
      return a.finished.then(function () { return a; }, function () { return null; });
    }

    function showFinal() { stop(); stand(pNow); }

    function play() {
      stop();
      if (reducedMotion() || !actor.animate) { showFinal(); return; }
      var mine = token;
      function alive() { return mine === token; }
      function runTo(from, to) {
        var ms = Math.max(500, Math.abs(to - from) * SECONDS_PER_FULL_WIDTH * 1000);
        setRun(true);
        return go(actor, [{ left: pct(from) }, { left: pct(to) }], { duration: ms, easing: "linear", fill: "forwards" });
      }

      stand(0);
      runTo(0, pNow).then(function () {
        if (!alive()) return;
        setRun(false);
        actor.getAnimations().forEach(function (a) { a.cancel(); });
        stand(pNow);
      });
    }

    replay.addEventListener("click", play);

    // Show the resting state straight away, then play once when the strip comes into view.
    stand(pNow);
    var played = false;
    function playOnce() { if (!played) { played = true; play(); } }
    if (!reducedMotion() && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); playOnce(); } });
      }, { threshold: 0.6 });
      io.observe(wrap);
    }
    return wrap;
  }

  window.TimelineRunner = { create: create };
})();
