/*
 * The animated strip above the Report timeline. The avatar runs along the years, turns into a plane at the
 * move to the UK, lands, and runs on to today. Nothing is typed in here: the year range comes from
 * window.SITE.experience and the move from window.SITE.ukMove, so editing content.js moves everything.
 *
 *   TimelineRunner.create(site, firstYear, yearCount)  ->  an element to put above the year axis
 *
 * Plays once, when the strip is mostly on screen; a Replay button runs it again. With prefers-reduced-motion
 * nothing moves: the avatar simply stands at today's position, with the move marked by a pin.
 * The pictures are decorative (aria-hidden); the pin's label is real text.
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var SECONDS_PER_FULL_WIDTH = 8;   // running speed: time to cross the whole strip
  var FLIGHT_MS = 1900;
  var HOP = 0.035;                  // how far along the strip the flight carries the avatar (fraction of width)

  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  function svg(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }
  function reducedMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  // A small flat aeroplane in the site's colours.
  function plane(className) {
    var s = svg("svg", { "class": "runner-plane " + (className || ""), viewBox: "0 0 120 64", "aria-hidden": "true", focusable: "false" });
    svg("path", { "class": "pl-wing-far", d: "M58 24 L50 8 L68 8 L82 24 Z" }, s);
    svg("path", { "class": "pl-tail", d: "M18 26 L7 6 L26 6 L38 24 Z" }, s);
    svg("path", { "class": "pl-body", d: "M8 33 Q8 23 30 22 L90 22 Q114 23 114 33 Q114 43 90 44 L30 44 Q8 43 8 33 Z" }, s);
    svg("path", { "class": "pl-stripe", d: "M12 36 L110 36 L110 39 Q104 43 90 44 L30 44 Q14 43 12 39 Z" }, s);
    svg("path", { "class": "pl-wing", d: "M52 36 L38 60 L66 60 L86 36 Z" }, s);
    [34, 46, 58, 70].forEach(function (x) { svg("circle", { "class": "pl-window", cx: x, cy: 30, r: 3 }, s); });
    svg("path", { "class": "pl-window", d: "M94 26 Q104 26 108 31 L94 31 Z" }, s);
    return s;
  }

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
    var move = site.ukMove;
    var pMove = move ? frac(move.year + (move.month - 1) / 12, first, n) : null;
    var hasMove = pMove !== null && pMove > 0 && pMove < pNow;   // the plane only appears if the move is in range and has happened

    if (hasMove) {
      var pin = el("div", "runner-pin");
      pin.style.left = pct(pMove);
      if (pMove > 0.5) pin.classList.add("runner-pin--left");   // keep the label inside the chart
      pin.appendChild(plane("runner-plane--pin"));
      pin.appendChild(el("span", "runner-pin__label mono", move.label));
      track.appendChild(pin);
    }

    var actor = el("div", "runner-actor");
    var figure = window.AvatarFigure ? window.AvatarFigure.create() : null;
    if (figure) actor.appendChild(figure);
    actor.appendChild(plane("runner-plane--actor"));
    track.appendChild(actor);

    function stand(left) { actor.style.left = pct(left); actor.classList.remove("is-plane"); if (figure) figure.classList.remove("is-running"); }
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
      if (!hasMove) { runTo(0, pNow).then(function () { if (alive()) { setRun(false); stand(pNow); } }); return; }

      var landAt = Math.min(pNow, pMove + HOP);
      runTo(0, pMove).then(function () {
        if (!alive()) return null;
        setRun(false);
        actor.classList.add("is-plane");
        return go(actor, [
          { left: pct(pMove), transform: "translateY(0) rotate(0deg)" },
          { left: pct(pMove + (landAt - pMove) * 0.5), transform: "translateY(-46px) rotate(-10deg)", offset: 0.5 },
          { left: pct(landAt), transform: "translateY(0) rotate(4deg)" }
        ], { duration: FLIGHT_MS, easing: "ease-in-out", fill: "forwards" });
      }).then(function () {
        if (!alive()) return null;
        actor.getAnimations().forEach(function (a) { a.cancel(); });
        actor.classList.remove("is-plane");
        actor.style.left = pct(landAt);
        return landAt < pNow ? runTo(landAt, pNow) : null;
      }).then(function () {
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
