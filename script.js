(function () {
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var clamp = function (v) { return Math.max(0, Math.min(1, v)); };

  /* Marquee (skills repeated twice for a seamless loop) */
  var skills = ["HTML5", "CSS3", "JavaScript", "TypeScript", "Bootstrap", "Git", "GitHub", "Flexbox", "CSS Grid", "Responsive Design"];
  $("#mq").innerHTML = skills.concat(skills).map(function (s) { return "<div>" + s + "</div>"; }).join("");

  /* Hero name: split into letters for the intro animation */
  var d = 0;
  $$("#name .w").forEach(function (w) {
    w.innerHTML = w.textContent.split("").map(function (c) {
      return '<span class="c" style="animation-delay:' + (d++ * 0.07) + 's">' + c + "</span>";
    }).join("");
  });

  /* About text: split into words (normal spaces so it wraps) */
  var rv = $("#rv");
  rv.innerHTML = rv.textContent.trim().split(" ").map(function (w) { return "<span>" + w + "</span>"; }).join(" ");
  var words = $$("#rv span");

  /* Custom cursor + hero spotlight */
  var hero = $(".hero"), cur = $("#cur");
  document.addEventListener("pointermove", function (e) { cur.style.left = e.clientX + "px"; cur.style.top = e.clientY + "px"; });
  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    hero.style.setProperty("--x", (e.clientX - r.left) + "px");
    hero.style.setProperty("--y", (e.clientY - r.top) + "px");
  });
  $$("a,.bx").forEach(function (a) {
    a.addEventListener("mouseenter", function () { cur.classList.add("big"); });
    a.addEventListener("mouseleave", function () { cur.classList.remove("big"); });
  });

  /* 3D tilt + glare on project cards */
  $$(".card3").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.transform = "perspective(900px) rotateY(" + ((x - .5) * 10) + "deg) rotateX(" + ((.5 - y) * 10) + "deg)";
      c.style.setProperty("--gx", x * 100 + "%"); c.style.setProperty("--gy", y * 100 + "%");
    });
    c.addEventListener("pointerleave", function () { c.style.transform = ""; });
  });

  /* Horizontal scroll section: height = viewport + extra distance */
  var hs = $("#work"), track = $("#hst");
  function size() {
    var dist = Math.max(0, track.scrollWidth - window.innerWidth);
    hs.style.height = (window.innerHeight + dist) + "px";
    hs._d = dist;
  }

  /* Bento cards fade in when visible */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: .15 });
  $$(".bx").forEach(function (b, i) { b.style.transitionDelay = (i % 4) * .08 + "s"; io.observe(b); });

  /* Scroll engine (one rAF-throttled handler) */
  var steps = $$(".step"), tli = $$(".tl-i"), csc = $("#csc"), tl = $("#tl"), beam = $("#beam"), bar = $("#bar"),
      stats = $$("[data-n]"), nm = ["01", "02", "03"], tt = ["Frontend", "Responsive", "Workflow"], ticking = false, vh;

  function update() {
    vh = window.innerHeight;

    var max = document.documentElement.scrollHeight - vh;
    bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";

    var r = rv.getBoundingClientRect(), p = clamp((vh * .85 - r.top) / (vh * .5 + r.height * .6));
    words.forEach(function (w, i) { w.style.opacity = p * words.length > i ? 1 : .15; });

    var cr = csc.parentNode.getBoundingClientRect(), cp = clamp((vh * .9 - cr.top) / (vh * .6));
    csc.style.transform = "rotateX(" + (25 * (1 - cp)) + "deg) scale(" + (.88 + .12 * cp) + ")";

    var best = 0, bd = 1e9;
    steps.forEach(function (s, i) {
      var b = s.getBoundingClientRect(), dd = Math.abs(b.top + b.height / 2 - vh * .5);
      if (dd < bd) { bd = dd; best = i; }
    });
    steps.forEach(function (s, i) { s.classList.toggle("on", i === best); });
    $("#stn").textContent = nm[best]; $("#stt").textContent = tt[best];

    var hr = hs.getBoundingClientRect(), hp = clamp(-hr.top / Math.max(1, hr.height - vh));
    track.style.transform = "translateX(" + (-hp * (hs._d || 0)) + "px)";

    var tr = tl.getBoundingClientRect();
    beam.style.transform = "scaleY(" + clamp((vh * .6 - tr.top) / tr.height) + ")";
    tli.forEach(function (i) { i.classList.toggle("on", i.getBoundingClientRect().top < vh * .65); });

    /* Stats count from 1 up to the target as you scroll (and back down when you scroll up) */
    stats.forEach(function (el) {
      var n = +el.dataset.n, top = el.getBoundingClientRect().top;
      var sp = clamp((vh * .95 - top) / (vh * .55));
      el.textContent = Math.round(1 + (n - 1) * sp);
    });

    ticking = false;
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", function () { size(); req(); });
  window.addEventListener("load", function () { size(); update(); });
  size(); update();
})();
