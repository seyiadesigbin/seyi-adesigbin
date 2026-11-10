/*
 * Gives the drawn desk objects thickness and a shadow, drops them onto the desk, and moves the lamplight and
 * shadows a little with the pointer. Decoration only: it never touches the notes. Plain script (not a module).
 *
 * Each ".o3" holds a flat drawing (the first <img>). Copies of it are stacked a few pixels apart in depth, darker
 * the lower they are, so the object looks like a solid slab or cylinder under the perspective tilt. The top copy
 * keeps its colours. An optional blurred black copy underneath is the shadow (opt out with data-noshadow).
 */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STEP = 2;   // px between stacked copies

  var objects = document.querySelectorAll(".o3");
  objects.forEach(function (o, index) {
    var top = o.querySelector(":scope > img");
    var depth = parseInt(o.getAttribute("data-depth"), 10) || 0;
    var inner = document.createElement("div");
    inner.className = "o3__in";
    inner.style.setProperty("--i", String(index));
    while (o.firstChild) inner.appendChild(o.firstChild);
    o.appendChild(inner);
    if (!top) return;

    if (!o.hasAttribute("data-noshadow")) {
      var shadow = top.cloneNode();
      shadow.className = "o3__shadow";
      inner.insertBefore(shadow, top);
    }
    for (var z = 0; z < depth; z += STEP) {
      var side = top.cloneNode();
      side.className = "o3__side";
      side.style.transform = "translateZ(" + z + "px)";
      inner.insertBefore(side, top);
    }
    top.style.transform = "translateZ(" + depth + "px)";
  });

  if (reduced) return;
  document.body.classList.add("has-drop");

  // Lamplight and shadows follow the pointer a little (-1 to 1 across the window).
  var queued = false, lx = 0, ly = 0;
  window.addEventListener("pointermove", function (e) {
    lx = (e.clientX / window.innerWidth - .5) * 2;
    ly = (e.clientY / window.innerHeight - .5) * 2;
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      var root = document.body.style;
      root.setProperty("--lx", lx.toFixed(3));
      root.setProperty("--ly", ly.toFixed(3));
      root.setProperty("--gx", (12 + lx * 8).toFixed(1) + "%");
    });
  });
})();
