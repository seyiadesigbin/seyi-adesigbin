/*
 * Desk view: builds the pinboard from window.SITE and makes every item
 * draggable (mouse, touch, pen) and movable with the arrow keys.
 *
 * Public API: window.Desk.mount(rootElement), window.Desk.layout()
 */
(function () {
  var site = window.SITE;
  var ITEM_W = 290;
  var GAP = 30;
  var ROTATIONS = [-4, 3, -2, 4, -3, 2, -5, 2.5, -1.5, 3.5, -3.5, 1.5];
  var COLORS = ["y", "p", "g", "b", "w"];
  var STACK_QUERY = "(max-width: 700px)";

  var board = null;
  var items = [];
  var topZ = 10;
  var lastWidth = 0;

  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  function link(href, text, external) {
    var a = el("a", null, text);
    a.href = href;
    if (external) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    return a;
  }
  function stacked() { return window.matchMedia(STACK_QUERY).matches; }

  /* ---------- building items ---------- */

  function register(node, label, rotationIndex) {
    node.classList.add("item");
    node.tabIndex = 0;
    node.setAttribute("role", "group");
    node.setAttribute("aria-label", label);
    node.dataset.rot = String(ROTATIONS[rotationIndex % ROTATIONS.length]);
    board.appendChild(node);
    items.push(node);
    return node;
  }

  function noteBase(color) {
    var n = el("div", "note c-" + color);
    n.appendChild(el("span", "pin"));
    return n;
  }

  function polaroid() {
    var n = el("div", "polaroid");
    n.appendChild(el("span", "pin"));
    var img = el("img");
    img.src = "assets/portrait.png";
    img.alt = "Portrait of " + site.shortName;
    img.width = 600; img.height = 600;
    img.draggable = false;
    n.appendChild(img);
    n.appendChild(el("span", "caption", "that's me"));
    return n;
  }

  function wordsNote() {
    var n = noteBase("y");
    n.classList.add("words");
    n.appendChild(el("small", null, "Three words"));
    var h = el("h3");
    site.threeWords.forEach(function (w, i) {
      if (i) h.appendChild(document.createElement("br"));
      h.appendChild(document.createTextNode(w + "."));
    });
    n.appendChild(h);
    return n;
  }

  function years(x) { return x.start === x.end ? String(x.start) : x.start + " - " + x.end; }

  function experienceNote(x, color) {
    var n = noteBase(color);
    n.appendChild(el("small", null, years(x)));
    n.appendChild(el("h3", null, x.org));
    var p = el("p");
    p.appendChild(el("strong", null, x.role + ". "));
    p.appendChild(document.createTextNode(x.text));
    n.appendChild(p);
    return n;
  }

  function expertiseTicket(x, accent) {
    var n = el("div", "ticket");
    n.style.borderLeftColor = accent;
    n.appendChild(el("small", null, "Admit one / skill"));
    n.appendChild(el("b", null, x.title));
    n.appendChild(el("p", null, x.text));
    return n;
  }

  function toolsNote() {
    var n = noteBase("w");
    n.appendChild(el("small", null, "Toolbox"));
    n.appendChild(el("h3", null, "What I work with"));
    n.appendChild(el("p", null, site.tools.map(function (t) { return t.name; }).join(", ") + "."));
    return n;
  }

  function contactNote() {
    var c = site.contact;
    var n = noteBase("y");
    n.appendChild(el("small", null, "Get in touch"));
    n.appendChild(el("h3", null, "Say hello"));
    var ul = el("ul");

    var li = el("li");
    li.appendChild(link("mailto:" + c.email, c.email));
    ul.appendChild(li);

    (c.phones || []).forEach(function (ph) {
      var row = el("li");
      row.appendChild(document.createTextNode(ph.label + ": " + ph.display + " "));
      if (ph.call) { row.appendChild(link("tel:" + ph.e164, "Call")); row.appendChild(document.createTextNode(" ")); }
      if (ph.whatsapp) row.appendChild(link("https://wa.me/" + ph.e164.replace("+", ""), "WhatsApp", true));
      ul.appendChild(row);
    });

    var social = el("li");
    social.appendChild(link(c.linkedin, "LinkedIn", true));
    social.appendChild(document.createTextNode(" / "));
    social.appendChild(link(c.instagram, "Instagram", true));
    ul.appendChild(social);

    if (c.resume) {
      var r = el("li");
      r.appendChild(link(c.resume, "Download my resume"));
      ul.appendChild(r);
    }
    n.appendChild(ul);
    return n;
  }

  function sticker() {
    var n = el("div", "sticker", site.sticker);
    return n;
  }

  /* ---------- layout ---------- */

  function layout(tidy) {
    if (!board) return;
    if (stacked()) { board.style.height = ""; items.forEach(function (n) { n.style.left = n.style.top = n.style.transform = ""; }); return; }
    var W = board.clientWidth;
    if (!W) return; // view is hidden; layout again when it is shown
    lastWidth = W;

    var cols = Math.max(1, Math.floor((W + GAP) / (ITEM_W + GAP)));
    var left0 = Math.max(0, (W - (cols * ITEM_W + (cols - 1) * GAP)) / 2);
    var heights = [];
    for (var c = 0; c < cols; c++) heights.push(0);

    items.forEach(function (n, i) {
      var col = heights.indexOf(Math.min.apply(null, heights));
      var jitterX = ((i * 37) % 21) - 10;
      var jitterY = ((i * 53) % 17) - 8;
      n.classList.toggle("tidy", !!tidy);
      n.style.left = Math.max(0, left0 + col * (ITEM_W + GAP) + jitterX) + "px";
      n.style.top = Math.max(0, heights[col] + jitterY) + "px";
      n.style.transform = "rotate(" + n.dataset.rot + "deg)";
      n.style.zIndex = String(i + 1);
      heights[col] += n.offsetHeight + GAP;
    });
    board.style.height = Math.max.apply(null, heights) + 40 + "px";
    if (tidy) setTimeout(function () { items.forEach(function (n) { n.classList.remove("tidy"); }); }, 600);
  }

  /* ---------- moving items ---------- */

  function clampTo(n, x, y) {
    var maxX = Math.max(0, board.clientWidth - n.offsetWidth);
    var maxY = Math.max(0, board.clientHeight - n.offsetHeight);
    n.style.left = Math.min(Math.max(0, x), maxX) + "px";
    n.style.top = Math.min(Math.max(0, y), maxY) + "px";
  }

  function makeMovable(n) {
    var startX, startY, originX, originY, active = false;

    n.addEventListener("pointerdown", function (e) {
      if (stacked() || e.button > 0 || e.target.closest("a, button, input, textarea")) return;
      active = true;
      n.setPointerCapture(e.pointerId);
      n.classList.add("dragging");
      startX = e.clientX; startY = e.clientY;
      originX = n.offsetLeft; originY = n.offsetTop;
      n.style.zIndex = String(++topZ);
      n.style.transform = "rotate(0deg) scale(1.03)";
    });
    n.addEventListener("pointermove", function (e) {
      if (!active) return;
      clampTo(n, originX + e.clientX - startX, originY + e.clientY - startY);
    });
    function end() {
      if (!active) return;
      active = false;
      n.classList.remove("dragging");
      n.style.transform = "rotate(" + n.dataset.rot + "deg)";
    }
    n.addEventListener("pointerup", end);
    n.addEventListener("pointercancel", end);

    // Keyboard: arrow keys move the focused item; Shift moves further.
    n.addEventListener("keydown", function (e) {
      if (stacked() || e.target !== n) return;
      var step = e.shiftKey ? 80 : 20, dx = 0, dy = 0;
      if (e.key === "ArrowLeft") dx = -step;
      else if (e.key === "ArrowRight") dx = step;
      else if (e.key === "ArrowUp") dy = -step;
      else if (e.key === "ArrowDown") dy = step;
      else return;
      e.preventDefault();
      n.style.zIndex = String(++topZ);
      clampTo(n, n.offsetLeft + dx, n.offsetTop + dy);
    });
  }

  /* ---------- mount ---------- */

  function mount(root) {
    root.textContent = "";

    var title = el("div", "desk-title");
    var h1 = el("h1");
    h1.appendChild(document.createTextNode("Hey,"));
    h1.appendChild(document.createElement("br"));
    h1.appendChild(document.createTextNode("I'm "));
    h1.appendChild(el("span", null, site.shortName + "."));
    title.appendChild(h1);
    title.appendChild(el("p", null, site.tagline + " " + site.intro + " This is my desk. Pick things up, move them around, read what's on them."));
    root.appendChild(title);

    var tools = el("div", "desk-tools");
    var tidyBtn = el("button", null, "Tidy up");
    tidyBtn.type = "button";
    tidyBtn.addEventListener("click", function () { layout(true); });
    tools.appendChild(tidyBtn);
    tools.appendChild(el("span", null, "Drag anything. Keyboard: focus a note, then use the arrow keys."));
    root.appendChild(tools);

    board = el("div", "desk-board");
    root.appendChild(board);

    var r = 0;
    register(polaroid(), "Portrait of " + site.shortName, r++);
    register(wordsNote(), "Three words that describe me", r++);
    site.experience.forEach(function (x, i) {
      register(experienceNote(x, COLORS[(i + 1) % COLORS.length]), x.role + " at " + x.org + ", " + years(x), r++);
    });
    var accents = ["#111", "#ff4d2e", "#2b59ff"];
    site.expertise.forEach(function (x, i) {
      register(expertiseTicket(x, accents[i % accents.length]), "Skill: " + x.title, r++);
    });
    register(toolsNote(), "Tools I work with", r++);
    register(contactNote(), "Contact details", r++);
    if (site.sticker) register(sticker(), site.sticker, r++);

    items.forEach(makeMovable);

    layout();
    window.addEventListener("load", function () { layout(); });
    window.addEventListener("resize", function () {
      if (board.clientWidth !== lastWidth) layout();
    });
  }

  window.Desk = { mount: mount, layout: function () { layout(); } };
})();
