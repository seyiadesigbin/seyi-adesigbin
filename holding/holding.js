/*
 * Temporary holding page: a messy desk the visitor can tidy up.
 * Five sticky notes start scattered. Dragging a note near a dashed outline snaps it in; the arrow keys
 * move a focused note and Enter snaps it to the nearest free outline; the "Tidy up" button does it all.
 * When every note is in an outline the avatar says thanks. Nothing is stored or sent anywhere.
 * All wording is in CONTENT below. Plain script (not a module) so it also works when opened from disk.
 */
(function () {
  var CONTENT = {
    headline: "Tidying the desk.",
    headlineDone: "Desk tidied.",
    sub: "Back soon.",
    name: "Seyi Adesigbin",
    domain: "seyiadesigbin.com",
    linkedinText: "Say hello on LinkedIn",
    linkedinUrl: "https://www.linkedin.com/in/seyiadesigbin/",
    newTab: " (opens in a new tab)",
    hello: "Hi, I'm Seyi.",
    thanks: "Thank you! This looks much better!",
    tidy: "Tidy up",
    mess: "Mess it up again",
    count: function (n, total) { return n + " of " + total + " tidied"; }
  };

  var GAP = 14;            // space between notes and between outlines
  var SNAP_RATIO = 0.75;   // a drop within this many note-widths of an outline snaps
  var KEY_STEP = 16;       // arrow-key movement; Shift moves three times as far
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var world = document.getElementById("world");
  var stage = document.getElementById("stage");
  var toggle = document.getElementById("toggle");
  var countEl = document.getElementById("count");
  var avatar = document.getElementById("avatar");
  var bubble = document.getElementById("bubble");

  function el(tag, text, className) {
    var n = document.createElement(tag);
    if (text != null) n.textContent = text;
    if (className) n.className = className;
    return n;
  }

  var notes = [];   // { el, x, y, r, slot }  slot is an outline index or null
  var slots = [];   // { el, x, y }
  var geo = { w: 0, h: 0, stageW: 0, stageH: 0, messyTop: 0, messyH: 0 };
  var zTop = 1;
  var introDone = false;
  var shownBubble = "";
  var headingEl = null;

  // ---- Build the notes ----
  function addNote(cls, label, fill) {
    var n = el("div", null, "note " + cls);
    n.tabIndex = 0;
    n.setAttribute("role", "group");
    n.setAttribute("aria-label", label);
    n.setAttribute("aria-describedby", "hint");
    fill(n);
    stage.appendChild(n);
    var item = { el: n, x: 0, y: 0, r: 0, slot: null };
    notes.push(item);
    bindNote(item);
  }

  addNote("c-y", "Note: " + CONTENT.headline, function (n) {
    headingEl = el("h1", CONTENT.headline);
    n.appendChild(headingEl);
    n.appendChild(el("p", CONTENT.sub, "note__sub"));
  });
  addNote("c-w", "Note: " + CONTENT.name, function (n) {
    n.appendChild(el("p", CONTENT.name, "note__name"));
    n.appendChild(el("p", CONTENT.domain, "note__mono"));
  });
  addNote("c-b", "Note: " + CONTENT.linkedinText, function (n) {
    var a = el("a", CONTENT.linkedinText);
    a.href = CONTENT.linkedinUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.appendChild(el("span", CONTENT.newTab, "sr-only"));
    n.appendChild(a);
  });
  addNote("c-p", "Blank pink note", function () {});
  addNote("c-g", "Blank green note", function () {});

  var total = notes.length;
  for (var i = 0; i < total; i++) {
    var s = el("div", null, "slot");
    s.setAttribute("aria-hidden", "true");
    stage.insertBefore(s, stage.firstChild);
    slots.push({ el: s, x: 0, y: 0 });
  }

  // ---- Geometry ----
  function measure() {
    var stageW = stage.clientWidth;
    var cols = stageW >= 906 ? 5 : (stageW >= 478 ? 3 : 2);
    var w = Math.min(200, Math.floor((stageW - (cols - 1) * GAP) / cols));
    var h = Math.round(w * 0.78);
    var rows = Math.ceil(total / cols);
    var slotsH = rows * (h + GAP) - GAP;
    var messyTop = slotsH + 40;
    var messyH = Math.round(h * 1.7);
    geo = { w: w, h: h, stageW: stageW, stageH: messyTop + messyH + h, messyTop: messyTop, messyH: messyH };

    for (var r = 0; r < rows; r++) {
      var inRow = Math.min(cols, total - r * cols);
      var x0 = (stageW - (inRow * w + (inRow - 1) * GAP)) / 2;
      for (var c = 0; c < inRow; c++) {
        var sl = slots[r * cols + c];
        sl.x = x0 + c * (w + GAP);
        sl.y = r * (h + GAP);
        sl.el.style.width = w + "px";
        sl.el.style.height = h + "px";
        sl.el.style.transform = "translate(" + sl.x + "px," + sl.y + "px)";
      }
    }
    stage.style.height = geo.stageH + "px";
    world.style.height = geo.stageH + "px";
    stage.style.setProperty("--u", String(w / 200));
    notes.forEach(function (n) { n.el.style.width = w + "px"; n.el.style.height = h + "px"; });
  }


  // The desk is tilted in perspective (see .world in holding.css). Turn a pointer position on the screen into a
  // position on the stage by undoing the tilt. For a plane turned by "tilt" about its centre and seen with
  // perspective "d", a plane point (x, y) from the centre lands at screen (x*k, y*cos(tilt)*k), k = d / (d - y*sin(tilt)).
  var cs = getComputedStyle(world);
  var TILT = parseFloat(cs.getPropertyValue("--tilt")) * Math.PI / 180;
  var PERSP = parseFloat(cs.getPropertyValue("--persp"));
  function toStage(clientX, clientY) {
    var r = world.getBoundingClientRect();   // the world itself is not tilted, so this is the untilted box
    var X = clientX - (r.left + r.width / 2), Y = clientY - (r.top + r.height / 2);
    var sin = Math.sin(TILT), cos = Math.cos(TILT);
    var y = Y * PERSP / (cos * PERSP + Y * sin);
    var x = X * (PERSP - y * sin) / PERSP;
    return { x: x + r.width / 2 - (r.width - stage.clientWidth) / 2, y: y + r.height / 2 };
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function place(n, animate) {
    n.el.classList.toggle("is-snapping", !!animate && !reduced);
    n.el.style.transform = "translate(" + n.x + "px," + n.y + "px) rotate(" + n.r + "deg)";
    n.el.classList.toggle("is-placed", n.slot !== null);
  }

  function slotTaken(i, except) {
    return notes.some(function (n) { return n !== except && n.slot === i; });
  }

  // Nearest free outline to the note's centre. maxRatio limits how far away it may be (omit for any distance).
  function nearestFree(n, maxRatio) {
    var best = -1, bestD = Infinity;
    slots.forEach(function (sl, i) {
      if (slotTaken(i, n)) return;
      var d = Math.hypot(sl.x - n.x, sl.y - n.y);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best < 0) return -1;
    if (maxRatio != null && bestD > geo.w * maxRatio) return -1;
    return best;
  }

  function snapTo(n, i, animate) {
    n.slot = i; n.x = slots[i].x; n.y = slots[i].y; n.r = 0;
    place(n, animate);
  }

  function raise(n) { zTop += 1; n.el.style.zIndex = String(zTop); }

  // ---- Messy / tidy ----
  function messUp(animate) {
    notes.forEach(function (n, idx) {
      n.slot = null;
      if (idx === 0) {   // the headline note sits near the middle, on top, so it is always readable
        n.x = (geo.stageW - geo.w) / 2 + (Math.random() - .5) * geo.w * .3;
        n.y = geo.messyTop + geo.messyH * .35;
        n.r = -4;
      } else {
        n.x = Math.random() * (geo.stageW - geo.w);
        n.y = geo.messyTop + Math.random() * geo.messyH;
        n.r = Math.round((Math.random() * 18 - 9) * 10) / 10;
      }
      raise(n);
      place(n, animate);
    });
    raise(notes[2]); raise(notes[1]); raise(notes[0]);   // text notes end up above the blank ones
    render();
  }

  function tidyAll() {
    notes.forEach(function (n) {
      if (n.slot !== null) return;
      for (var i = 0; i < slots.length; i++) {
        if (!slotTaken(i, n)) { snapTo(n, i, true); break; }
      }
    });
    render();
  }

  // ---- Wording that depends on progress ----
  function setBubble(text) {
    if (!introDone || text === shownBubble) return;
    shownBubble = text;
    bubble.textContent = text;
    bubble.classList.remove("is-in");
    void bubble.offsetWidth;   // restart the pop animation
    bubble.classList.add("is-in");
  }

  function render() {
    var placed = notes.filter(function (n) { return n.slot !== null; }).length;
    var done = placed === total;
    countEl.textContent = CONTENT.count(placed, total);
    toggle.textContent = done ? CONTENT.mess : CONTENT.tidy;
    headingEl.textContent = done ? CONTENT.headlineDone : CONTENT.headline;
    setBubble(done ? CONTENT.thanks : CONTENT.hello);
  }

  // ---- Dragging and keys ----
  function clearHot() { slots.forEach(function (s) { s.el.classList.remove("is-hot"); }); }

  function bindNote(n) {
    var node = n.el, start = null, baseX = 0, baseY = 0, dragging = false;

    node.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || e.target.closest("a")) return;
      dragging = true;
      start = toStage(e.clientX, e.clientY); baseX = n.x; baseY = n.y;
      n.slot = null;
      node.classList.remove("is-snapping");
      node.classList.add("is-dragging");
      raise(n);
      try { node.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events: nothing to capture */ }
      render();
    });

    node.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var p = toStage(e.clientX, e.clientY);
      n.x = clamp(baseX + p.x - start.x, 0, geo.stageW - geo.w);
      n.y = clamp(baseY + p.y - start.y, 0, geo.stageH - geo.h);
      place(n, false);
      clearHot();
      var near = nearestFree(n, SNAP_RATIO);
      if (near >= 0) slots[near].el.classList.add("is-hot");
    });

    function drop() {
      if (!dragging) return;
      dragging = false;
      node.classList.remove("is-dragging");
      clearHot();
      var near = nearestFree(n, SNAP_RATIO);
      if (near >= 0) snapTo(n, near, true);
      render();
    }
    node.addEventListener("pointerup", drop);
    node.addEventListener("pointercancel", drop);

    node.addEventListener("keydown", function (e) {
      if (e.target !== node) return;   // keys inside the link keep their normal meaning
      var step = e.shiftKey ? KEY_STEP * 3 : KEY_STEP, dx = 0, dy = 0;
      if (e.key === "ArrowLeft") dx = -step;
      else if (e.key === "ArrowRight") dx = step;
      else if (e.key === "ArrowUp") dy = -step;
      else if (e.key === "ArrowDown") dy = step;
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (n.slot !== null) return;
        var i = nearestFree(n);
        if (i >= 0) { snapTo(n, i, true); render(); }
        return;
      } else return;
      e.preventDefault();
      n.slot = null;
      n.x = clamp(n.x + dx, 0, geo.stageW - geo.w);
      n.y = clamp(n.y + dy, 0, geo.stageH - geo.h);
      raise(n);
      place(n, false);
      render();
    });
  }

  toggle.addEventListener("click", function () {
    var done = notes.every(function (n) { return n.slot !== null; });
    if (done) messUp(true); else tidyAll();
  });

  // ---- Resize: outlines move, placed notes follow them, loose notes stay inside the board ----
  var resizeQueued = false;
  window.addEventListener("resize", function () {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(function () {
      resizeQueued = false;
      measure();
      notes.forEach(function (n) {
        if (n.slot !== null) { n.x = slots[n.slot].x; n.y = slots[n.slot].y; }
        else { n.x = clamp(n.x, 0, geo.stageW - geo.w); n.y = clamp(n.y, 0, geo.stageH - geo.h); }
        place(n, false);
      });
    });
  });

  // ---- Start ----
  measure();
  messUp(false);

  // The head pops up, then the bubble. With reduced motion everything appears at once.
  function intro() {
    avatar.hidden = false;
    avatar.classList.add("is-up");
    introDone = true;
    setBubble(CONTENT.hello);
  }
  if (reduced) intro();
  else setTimeout(function () {
    avatar.hidden = false;
    void avatar.offsetWidth;
    avatar.classList.add("is-up");
    bubble.parentNode.hidden = true;
    setTimeout(function () { bubble.parentNode.hidden = false; introDone = true; setBubble(CONTENT.hello); }, 700);
  }, 700);
})();
