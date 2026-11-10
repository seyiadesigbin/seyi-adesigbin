/*
 * Review notes: a private tool for the site owner. Loaded only when the
 * address has ?review (see the small loader in index.html).
 *
 * Switch on "Add note", click anything, type a note, and a numbered pin stays
 * on that element. Notes live in this browser's localStorage. "Export" copies
 * them as text with the page, view, screen width and element name.
 * Pins follow their element, so they survive Desk drags and re-layout.
 * No server, no database.
 */
(function () {
  var KEY = "seyi-review-notes";
  var notes = load();
  var adding = false;
  var ui = {};
  var pins = {}; // note id -> pin button

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) { /* ignore */ }
  }

  function el(tag, text, className) {
    var n = document.createElement(tag);
    if (text != null) n.textContent = text;
    if (className) n.className = className;
    return n;
  }
  function inUI(node) { return !!(node && node.closest && node.closest(".rv-ui")); }

  // ---- finding an element again later -------------------------------
  function pathOf(node) {
    var parts = [];
    while (node && node !== document.body && node.nodeType === 1) {
      if (node.id) { parts.unshift("#" + node.id); break; }
      var idx = Array.prototype.indexOf.call(node.parentNode.children, node) + 1;
      parts.unshift(node.tagName.toLowerCase() + ":nth-child(" + idx + ")");
      node = node.parentNode;
    }
    return parts.join(" > ");
  }
  function find(path) {
    try { return document.querySelector(path.charAt(0) === "#" ? path : "body > " + path); } catch (e) { return null; }
  }
  function nameOf(node) {
    var s = node.tagName.toLowerCase();
    if (node.id) s += "#" + node.id;
    if (typeof node.className === "string" && node.className.trim()) {
      s += "." + node.className.trim().split(/\s+/).slice(0, 2).join(".");
    }
    var label = node.getAttribute("aria-label") || (node.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return label ? s + ' ("' + label + '")' : s;
  }
  function visible(node) {
    var r = node.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  // ---- pins ------------------------------------------------------------
  function placePin(n) {
    var pin = pins[n.id];
    var target = find(n.path);
    if (!pin || !target || !visible(target)) { if (pin) pin.hidden = true; return; }
    var r = target.getBoundingClientRect();
    pin.hidden = false;
    pin.style.left = window.scrollX + r.left + n.fx * r.width + "px";
    pin.style.top = window.scrollY + r.top + n.fy * r.height + "px";
  }
  function placeAll() { notes.forEach(placePin); }

  function renderPins() {
    Object.keys(pins).forEach(function (id) { pins[id].remove(); });
    pins = {};
    notes.forEach(function (n, i) {
      var pin = el("button", String(i + 1), "rv-ui rv-pin");
      pin.type = "button";
      pin.setAttribute("aria-label", "Review note " + (i + 1) + ": " + n.text);
      pin.addEventListener("click", function (e) { e.stopPropagation(); openEditor(n, null); });
      document.body.appendChild(pin);
      pins[n.id] = pin;
    });
    placeAll();
    ui.count.textContent = String(notes.length);
    ui.listCount.textContent = String(notes.length);
    renderList();
  }

  // ---- notes list ----------------------------------------------------------
  function renderList() {
    if (!ui.list) return;
    ui.list.textContent = "";
    if (!notes.length) { ui.list.appendChild(el("p", "No notes yet.", "rv-ui rv-empty")); return; }
    notes.forEach(function (n, i) {
      var item = el("button", null, "rv-ui rv-item");
      item.type = "button";
      item.appendChild(el("strong", (i + 1) + ". " + n.text));
      item.appendChild(el("small", n.view + " · " + n.element));
      item.setAttribute("aria-label", "Go to note " + (i + 1) + ": " + n.text);
      item.addEventListener("click", function () { goTo(n); });
      ui.list.appendChild(item);
    });
  }
  function goTo(n) {
    if (document.body.getAttribute("data-view") !== n.view) location.hash = "#" + n.view;
    setTimeout(function () {
      var target = find(n.path);
      if (target && visible(target)) target.scrollIntoView({ block: "center", behavior: "auto" });
      setTimeout(function () {
        placeAll();
        var pin = pins[n.id];
        if (pin && !pin.hidden) {
          pin.classList.add("rv-flash");
          setTimeout(function () { pin.classList.remove("rv-flash"); }, 1500);
        }
      }, 150);
    }, 150);
  }
  function resetSiteData() {
    if (!window.confirm("Reset site data? This clears the saved view choice and the one-time pop-up, so the page behaves like a first visit. Your review notes are kept.")) return;
    try {
      Object.keys(localStorage).forEach(function (k) { if (k !== KEY) localStorage.removeItem(k); });
    } catch (e) { /* ignore */ }
    location.reload();
  }

  // ---- note editor -----------------------------------------------------
  function closeEditor() {
    if (ui.editor) { ui.editor.remove(); ui.editor = null; }
  }
  function openEditor(note, draft) {
    closeEditor();
    var box = el("div", null, "rv-ui rv-editor");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Review note");
    var ta = el("textarea");
    ta.rows = 4;
    ta.setAttribute("aria-label", "Note text");
    ta.value = note ? note.text : "";
    var row = el("div", null, "rv-row");
    var ok = el("button", "Save");
    ok.type = "button";
    var cancel = el("button", "Cancel");
    cancel.type = "button";
    row.appendChild(ok);
    row.appendChild(cancel);
    if (note) {
      var del = el("button", "Delete");
      del.type = "button";
      del.addEventListener("click", function () {
        notes = notes.filter(function (x) { return x.id !== note.id; });
        save(); closeEditor(); renderPins();
      });
      row.appendChild(del);
    }
    box.appendChild(ta);
    box.appendChild(row);
    document.body.appendChild(box);
    ui.editor = box;
    var x = note ? parseFloat(pins[note.id].style.left) - window.scrollX : draft.clientX;
    var y = note ? parseFloat(pins[note.id].style.top) - window.scrollY : draft.clientY;
    box.style.left = Math.max(8, Math.min(x + 12, window.innerWidth - 280)) + "px";
    box.style.top = Math.max(8, Math.min(y + 12, window.innerHeight - 180)) + "px";
    ta.focus();

    cancel.addEventListener("click", closeEditor);
    ok.addEventListener("click", function () {
      var text = ta.value.trim();
      if (!text) { closeEditor(); return; }
      if (note) note.text = text;
      else notes.push(draft.note(text));
      save(); closeEditor(); renderPins();
    });
    box.addEventListener("keydown", function (e) { if (e.key === "Escape") closeEditor(); });
  }

  // ---- adding ------------------------------------------------------------
  function setAdding(on) {
    adding = on;
    ui.add.setAttribute("aria-pressed", String(on));
    ui.add.textContent = on ? "Click an element… (Esc to stop)" : "Add note";
    document.body.classList.toggle("rv-adding", on);
  }

  function onCapture(e) {
    if (!adding || inUI(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type !== "click") return; // swallow pointerdown/mousedown so the Desk does not start a drag
    var target = e.target;
    var r = target.getBoundingClientRect();
    setAdding(false);
    openEditor(null, {
      clientX: e.clientX,
      clientY: e.clientY,
      note: function (text) {
        return {
          id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
          text: text,
          path: pathOf(target),
          element: nameOf(target),
          fx: r.width ? (e.clientX - r.left) / r.width : 0,
          fy: r.height ? (e.clientY - r.top) / r.height : 0,
          page: location.pathname.split("/").pop() || "index.html",
          view: document.body.getAttribute("data-view"),
          width: window.innerWidth,
          when: new Date().toISOString()
        };
      }
    });
  }

  // ---- export --------------------------------------------------------------
  function exportText() {
    if (!notes.length) return "No review notes.";
    return notes.map(function (n, i) {
      return (i + 1) + ". " + n.text + "\n   Page: " + n.page + " | View: " + n.view +
        " | Screen width: " + n.width + "px\n   Element: " + n.element + "\n   Path: " + n.path +
        "\n   Time: " + n.when;
    }).join("\n\n");
  }
  function doExport() {
    var text = exportText();
    var done = function () { flash("Copied " + notes.length + " note(s)"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() { // file:// pages may refuse the clipboard API
      var ta = el("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { /* ignore */ }
      ta.remove();
      flash(ok ? "Copied " + notes.length + " note(s)" : "Copy failed");
    }
  }
  function flash(msg) {
    ui.status.textContent = msg;
    setTimeout(function () { ui.status.textContent = ""; }, 2500);
  }

  // ---- panel -----------------------------------------------------------------
  function build() {
    var css = el("style");
    css.textContent =
      ".rv-ui{font:14px/1.3 system-ui,sans-serif;box-sizing:border-box}" +
      ".rv-panel{position:fixed;right:12px;bottom:12px;z-index:100000;display:flex;gap:6px;align-items:center;" +
      "background:#111;color:#fff;padding:8px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.4)}" +
      ".rv-panel button,.rv-editor button{font:inherit;padding:6px 10px;border-radius:6px;border:0;cursor:pointer;background:#ffd84d;color:#111}" +
      ".rv-panel button[aria-pressed=true]{background:#ff4d2e;color:#fff}" +
      ".rv-pin{position:absolute;z-index:99999;width:26px;height:26px;margin:-13px 0 0 -13px;padding:0;border-radius:50%;" +
      "border:2px solid #fff;background:#ff4d2e;color:#fff;font-weight:700;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.5)}" +
      ".rv-editor{position:fixed;z-index:100001;width:268px;background:#fff;color:#111;padding:10px;border-radius:10px;" +
      "box-shadow:0 6px 24px rgba(0,0,0,.45)}" +
      ".rv-editor textarea{width:100%;font:inherit;padding:6px;margin-bottom:8px;resize:vertical}" +
      ".rv-row{display:flex;gap:6px}" +
      ".rv-list{position:fixed;right:12px;bottom:64px;z-index:100000;width:300px;max-height:50vh;overflow:auto;" +
      "background:#fff;color:#111;border-radius:10px;padding:6px;box-shadow:0 6px 24px rgba(0,0,0,.45)}" +
      ".rv-item{display:block;width:100%;text-align:left;border:0;background:none;padding:8px;border-radius:6px;cursor:pointer;font:inherit;color:inherit}" +
      ".rv-item:hover,.rv-item:focus-visible{background:#ffe9a8}" +
      ".rv-item small{display:block;color:#555;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".rv-empty{margin:8px;color:#555}" +
      ".rv-flash{animation:rv-flash .5s ease-in-out 3}" +
      "@keyframes rv-flash{50%{transform:scale(1.7)}}" +
      ".rv-panel{flex-wrap:wrap;max-width:calc(100vw - 24px);justify-content:flex-end}" +
      "body.rv-adding,body.rv-adding *{cursor:crosshair!important}" +
      "body.rv-adding .rv-ui,body.rv-adding .rv-ui *{cursor:auto!important}";
    document.head.appendChild(css);

    var panel = el("div", null, "rv-ui rv-panel");
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", "Review tools");
    ui.add = el("button", "Add note");
    ui.add.type = "button";
    ui.add.setAttribute("aria-pressed", "false");
    ui.add.addEventListener("click", function () { closeEditor(); setAdding(!adding); });
    var exp = el("button");
    exp.type = "button";
    exp.appendChild(document.createTextNode("Export ("));
    ui.count = el("span", String(notes.length));
    exp.appendChild(ui.count);
    exp.appendChild(document.createTextNode(")"));
    exp.addEventListener("click", doExport);
    var lst = el("button");
    lst.type = "button";
    lst.setAttribute("aria-expanded", "false");
    lst.appendChild(document.createTextNode("Notes ("));
    ui.listCount = el("span", String(notes.length));
    lst.appendChild(ui.listCount);
    lst.appendChild(document.createTextNode(")"));
    ui.list = el("div", null, "rv-ui rv-list");
    ui.list.hidden = true;
    ui.list.setAttribute("role", "region");
    ui.list.setAttribute("aria-label", "Review notes list");
    lst.addEventListener("click", function () {
      ui.list.hidden = !ui.list.hidden;
      lst.setAttribute("aria-expanded", String(!ui.list.hidden));
    });
    var rst = el("button", "Reset site data");
    rst.type = "button";
    rst.addEventListener("click", resetSiteData);
    var clr = el("button", "Clear all");
    clr.type = "button";
    clr.addEventListener("click", function () {
      if (notes.length && window.confirm("Delete all " + notes.length + " review notes?")) {
        notes = []; save(); renderPins();
      }
    });
    ui.status = el("span", "");
    ui.status.setAttribute("aria-live", "polite");
    panel.appendChild(ui.add);
    panel.appendChild(lst);
    panel.appendChild(exp);
    panel.appendChild(rst);
    panel.appendChild(clr);
    panel.appendChild(ui.status);
    document.body.appendChild(panel);
    document.body.appendChild(ui.list);
  }

  function init() {
    build();
    renderPins();
    ["pointerdown", "mousedown", "click"].forEach(function (t) {
      document.addEventListener(t, onCapture, true);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && adding) setAdding(false); });
    window.addEventListener("resize", placeAll);
    window.addEventListener("hashchange", function () { setTimeout(placeAll, 50); });
    setInterval(placeAll, 250); // follows dragged / re-laid-out elements and view switches
  }

  init();
})();
