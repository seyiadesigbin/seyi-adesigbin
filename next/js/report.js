/*
 * Report view: the same content as the Desk, laid out like an annual report.
 * Everything is built from window.SITE. Public API: window.Report.mount(root).
 */
(function () {
  var site = window.SITE;

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
  function reducedMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function format(stat, n) { return n.toLocaleString() + (stat.plus ? "+" : "") + (stat.suffix || ""); }

  function section(id, tag, heading) {
    var s = el("section", "fig");
    s.id = id;
    s.setAttribute("aria-labelledby", id + "-h");
    s.appendChild(el("span", "mono fig-tag", tag));
    var h = el("h2", null, heading);
    h.id = id + "-h";
    s.appendChild(h);
    return s;
  }

  /* ---------- hero ---------- */
  function hero() {
    var s = el("section", "r-hero");
    var left = el("div");
    left.appendChild(el("div", "mono", "Executive summary"));
    var h1 = el("h1");
    site.reportHeadline.forEach(function (line, i) {
      var l = el("span");
      l.appendChild(i === 1 ? el("em", null, line) : document.createTextNode(line));
      h1.appendChild(l);
    });
    left.appendChild(h1);
    var p = el("p", "r-lead");
    p.appendChild(document.createTextNode(site.tagline + " " + site.intro + " Guided by "));
    site.threeWords.forEach(function (w, i) {
      p.appendChild(el("strong", null, w));
      var n = site.threeWords.length;
      p.appendChild(document.createTextNode(i < n - 2 ? ", " : i === n - 2 ? " and " : "."));
    });
    left.appendChild(p);
    s.appendChild(left);

    var fig = el("div", "r-portrait");
    var img = el("img");
    img.src = "assets/portrait.png"; img.width = 600; img.height = 600;
    img.alt = "Portrait of " + site.shortName;
    fig.appendChild(img);
    (site.heroTags || []).forEach(function (t, i) { fig.appendChild(el("span", "mono r-tag r-tag-" + (i + 1), t)); });
    s.appendChild(fig);
    return s;
  }

  /* ---------- key figures ---------- */
  function figures() {
    var s = section("figures", "Fig. 1 / Key figures", "The work, in numbers.");
    var grid = el("div", "stats");
    var counters = [];
    site.stats.forEach(function (st) {
      var box = el("div", "stat");
      var b = el("b", null, format(st, st.value)); // final value in the HTML; animation is an extra
      box.appendChild(b);
      box.appendChild(el("span", null, st.label));
      grid.appendChild(box);
      counters.push({ node: b, stat: st });
    });
    s.appendChild(grid);

    if (!reducedMotion() && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          var c = counters.filter(function (x) { return x.node === e.target; })[0];
          var t0 = performance.now();
          (function tick(t) {
            var p = Math.min((t - t0) / 1200, 1);
            c.node.textContent = format(c.stat, Math.round(c.stat.value * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick); else c.node.textContent = format(c.stat, c.stat.value);
          })(t0);
        });
      });
      counters.forEach(function (c) { io.observe(c.node); });
    }
    return s;
  }

  /* ---------- timeline ---------- */
  function timeline() {
    var first = Math.min.apply(null, site.experience.map(function (x) { return x.start; }));
    var last = Math.max.apply(null, site.experience.map(function (x) { return x.end; }));
    var n = last - first + 1;
    var s = section("timeline", "Fig. 2 / Career timeline", site.experience.length + " roles since " + first + ". Select a bar to read more.");

    var chart = el("div", "gantt");
    chart.style.setProperty("--years", String(n));
    var axis = el("div", "axis mono");
    axis.appendChild(el("span"));
    for (var y = first; y <= last; y++) axis.appendChild(el("span", null, String(y)));
    chart.appendChild(axis);

    site.experience.forEach(function (x, i) {
      var row = el("div", "rowg");
      var btn = el("button", "rowg-btn");
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      var detailId = "role-" + i;
      btn.setAttribute("aria-controls", detailId);

      var who = el("span", "who");
      who.appendChild(el("b", null, x.org));
      who.appendChild(el("small", null, x.role));
      btn.appendChild(who);

      var track = el("span", "track");
      var bar = el("span", "bar");
      bar.style.left = ((x.start - first) / n * 100) + "%";
      bar.style.width = ((x.end - x.start + 1) / n * 100) + "%";
      track.appendChild(bar);
      btn.appendChild(track);
      row.appendChild(btn);

      var detail = el("div", "detail");
      detail.id = detailId;
      detail.appendChild(el("p", null, (x.start === x.end ? x.start : x.start + " - " + x.end) + ". " + x.text));
      row.appendChild(detail);

      btn.addEventListener("click", function () {
        var open = row.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      });
      chart.appendChild(row);
    });
    s.appendChild(chart);
    return s;
  }

  /* ---------- expertise ---------- */
  function expertise() {
    var s = section("expertise", "Fig. 3 / Areas of expertise", "What I do.");
    var grid = el("div", "areas");
    site.expertise.forEach(function (x) {
      var card = el("div", "area");
      card.appendChild(el("h3", null, x.title));
      card.appendChild(el("p", null, x.text));
      grid.appendChild(card);
    });
    s.appendChild(grid);
    return s;
  }

  /* ---------- toolkit ---------- */
  function toolkit() {
    var s = section("toolkit", "Fig. 4 / Toolkit", "The toolkit.");
    var wrap = el("ul", "bubbles");
    site.tools.forEach(function (t) {
      var li = el("li", "b b-" + (t.weight || 1), t.name);
      wrap.appendChild(li);
    });
    s.appendChild(wrap);
    return s;
  }

  /* ---------- contact ---------- */
  function contact() {
    var c = site.contact;
    var s = section("contact", "Appendix / Contact", "Have a report that needs a human?");
    var ul = el("ul", "contact-list");

    // One row = a small label plus a value; the value groups its text and links so the grid keeps two columns.
    function row(label) {
      var li = el("li");
      li.appendChild(el("span", "mono", label));
      var value = el("span", "contact-value");
      li.appendChild(value);
      ul.appendChild(li);
      return value;
    }

    row("Email").appendChild(link("mailto:" + c.email, c.email));

    (c.phones || []).forEach(function (ph) {
      var v = row(ph.label);
      v.appendChild(document.createTextNode(ph.display + " "));
      if (ph.call) { v.appendChild(link("tel:" + ph.e164, "Call")); v.appendChild(document.createTextNode(" ")); }
      if (ph.whatsapp) v.appendChild(link("https://wa.me/" + ph.e164.replace("+", ""), "WhatsApp", true));
    });

    var soc = row("Elsewhere");
    soc.appendChild(link(c.linkedin, "LinkedIn", true));
    soc.appendChild(document.createTextNode(" / "));
    soc.appendChild(link(c.instagram, "Instagram", true));

    if (c.resume) row("Resume").appendChild(link(c.resume, "Download my resume"));

    s.appendChild(ul);
    var form = window.ContactForm && window.ContactForm.create(site);
    if (form) s.appendChild(form);
    return s;
  }

  function mount(root) {
    root.textContent = "";
    var head = el("header", "r-top mono");
    head.appendChild(el("span", null, site.name + " / Report"));
    var nav = el("nav");
    nav.setAttribute("aria-label", "Report sections");
    [["figures", "Fig.1"], ["timeline", "Fig.2"], ["expertise", "Fig.3"], ["toolkit", "Fig.4"], ["contact", "Contact"]].forEach(function (p) {
      var a = link("#" + p[0], p[1]);
      // Scroll without changing the address, so the URL stays #report.
      a.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById(p[0]).scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
      });
      nav.appendChild(a);
    });
    head.appendChild(nav);
    root.appendChild(head);

    root.appendChild(hero());
    root.appendChild(figures());
    root.appendChild(timeline());
    root.appendChild(expertise());
    root.appendChild(toolkit());
    root.appendChild(contact());
    root.appendChild(el("footer", "mono r-foot", "(c) " + site.name));
  }

  window.Report = { mount: mount };
})();
