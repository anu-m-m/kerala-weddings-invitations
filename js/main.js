/* =====================================================================
   Arjun & Meera — invitation behaviour
   Reads all content from window.WEDDING (js/config.js).
   ===================================================================== */
(() => {
  "use strict";

  const W = window.WEDDING;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Images via Netlify Image CDN (falls back to originals) ---------- */
  const useCdn = location.protocol.startsWith("http");
  function imgSrc(src, width) {
    if (!useCdn || /^https?:/.test(src)) return src;
    const path = "/" + src.replace(/^\.?\//, "");
    return `/.netlify/images?url=${encodeURIComponent(path)}&w=${width}&fm=webp&q=78`;
  }
  function setImg(img, src, width, alt = "") {
    img.alt = alt;
    img.decoding = "async";
    img.src = imgSrc(src, width);
    img.addEventListener("error", () => { if (img.src !== new URL(src, location.href).href) img.src = src; }, { once: true });
  }

  /* ---------- Date helpers ---------- */
  const TZ = "Asia/Kolkata";
  const fmtDay = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ });
  const fmtShort = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });
  const fmtTime = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ });
  const toCalStamp = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  /* ---------- Text bindings ---------- */
  const bindings = {
    groom: W.couple.groom,
    bride: W.couple.bride,
    initials: W.couple.initials,
    hashtag: W.couple.hashtag,
    tagline: W.couple.tagline,
    displayDate: W.displayDate,
    city: W.city,
    rsvpDeadline: W.rsvp.deadline,
  };
  $$("[data-bind]").forEach((el) => {
    const v = bindings[el.dataset.bind];
    if (v != null) el.textContent = v;
  });
  document.title = `${W.couple.groom} & ${W.couple.bride} · Wedding Invitation`;

  /* =====================================================================
     FX: gold dust, falling petals, confetti (one canvas)
     ===================================================================== */
  const fx = (() => {
    const canvas = $("#fx");
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1, raf = 0, running = false, ambient = false;
    const dust = [], petals = [], confetti = [];
    const golds = ["#f6e4b0", "#e3c27c", "#c39a52", "#fff3d1"];
    const petalColors = ["#f3c5bd", "#f7d8d0", "#e9a79e", "#fbe6dc", "#f4b860"];
    const confettiColors = ["#c39a52", "#f2dfaa", "#8c2532", "#e9a79e", "#fff3d1", "#d9a21b"];
    const rand = (a, b) => a + Math.random() * (b - a);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seedAmbient() {
      dust.length = 0; petals.length = 0;
      const area = (w * h) / 100000;
      const nDust = Math.round(Math.min(60, 12 + area * 3));
      const nPetals = Math.round(Math.min(18, 5 + area));
      for (let i = 0; i < nDust; i++) dust.push(newDust(true));
      for (let i = 0; i < nPetals; i++) petals.push(newPetal(true));
    }
    const newDust = (anywhere) => ({
      x: rand(0, w), y: anywhere ? rand(0, h) : h + 10, r: rand(.6, 2.2),
      vy: rand(-.35, -.1), vx: rand(-.15, .15), tw: rand(0, Math.PI * 2), c: golds[(Math.random() * golds.length) | 0],
    });
    const newPetal = (anywhere) => ({
      x: rand(0, w), y: anywhere ? rand(-h, h) : rand(-60, -20), s: rand(7, 13),
      vy: rand(.4, 1.1), vx: rand(-.3, .3), rot: rand(0, Math.PI * 2), vr: rand(-.02, .02),
      sway: rand(0, Math.PI * 2), c: petalColors[(Math.random() * petalColors.length) | 0],
    });

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.abs(Math.cos(p.sway)) * .6 + .4);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = .82;
      ctx.beginPath();
      ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s * .9, -p.s * .6, p.s * .6, p.s * .6, 0, p.s);
      ctx.bezierCurveTo(-p.s * .6, p.s * .6, -p.s * .9, -p.s * .6, 0, -p.s);
      ctx.fill();
      ctx.restore();
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      if (ambient) {
        for (const d of dust) {
          d.x += d.vx; d.y += d.vy; d.tw += .04;
          if (d.y < -10) Object.assign(d, newDust(false));
          ctx.globalAlpha = .35 + Math.sin(d.tw) * .3;
          ctx.fillStyle = d.c;
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        }
        for (const p of petals) {
          p.sway += .02; p.x += p.vx + Math.sin(p.sway) * .5; p.y += p.vy; p.rot += p.vr;
          if (p.y > h + 30) Object.assign(p, newPetal(false));
          drawPetal(p);
        }
      }
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.vy += .12; c.vx *= .99; c.x += c.vx; c.y += c.vy; c.rot += c.vr; c.life -= 1;
        if (c.life <= 0 || c.y > h + 40) { confetti.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.min(1, c.life / 40);
        ctx.translate(c.x, c.y); ctx.rotate(c.rot);
        ctx.fillStyle = c.c;
        if (c.shape === "petal") drawPetal({ x: 0, y: 0, s: c.s, rot: 0, sway: c.rot, c: c.c });
        else if (c.shape === "dot") { ctx.beginPath(); ctx.arc(0, 0, c.s / 2, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-c.s / 2, -c.s / 4, c.s, c.s / 2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (ambient || confetti.length) raf = requestAnimationFrame(frame);
      else running = false;
    }
    function start() { if (!running && !document.hidden) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { cancelAnimationFrame(raf); running = false; }

    function burst(x = w / 2, y = h / 2, count = 140) {
      if (reduceMotion.matches) return;
      const shapes = ["rect", "rect", "dot", "petal"];
      for (let i = 0; i < count; i++) {
        const a = rand(0, Math.PI * 2), sp = rand(3, 10);
        confetti.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - rand(3, 6), s: rand(6, 11),
          rot: rand(0, 6), vr: rand(-.25, .25), life: rand(110, 170),
          c: confettiColors[(Math.random() * confettiColors.length) | 0], shape: shapes[(Math.random() * shapes.length) | 0],
        });
      }
      start();
    }
    function setAmbient(on) {
      ambient = on && !reduceMotion.matches;
      if (ambient) { if (!dust.length) seedAmbient(); start(); }
    }

    resize();
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (ambient) seedAmbient(); }, 150); });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    reduceMotion.addEventListener?.("change", () => setAmbient(document.body.classList.contains("is-locked") ? false : true));
    return { burst, setAmbient };
  })();

  /* =====================================================================
     SOUND: one shared AudioContext, unlocked on the first tap
     ===================================================================== */
  const sfx = (() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    let ctx = null, out = null;
    function context() {
      if (!AC) return null;
      if (!ctx) {
        ctx = new AC();
        out = ctx.createGain(); out.gain.value = .9; out.connect(ctx.destination);
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }
    function noise(len) {
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf;
      return src;
    }
    function env(node, t, peak, attack, decay) {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + attack);
      g.gain.exponentialRampToValueAtTime(.0001, t + attack + decay);
      node.connect(g).connect(out);
      return g;
    }
    // Wax cracking: a bright snap over a soft thump
    function crack() {
      if (!context()) return;
      const t = ctx.currentTime + .01;
      const n = noise(.25), hp = ctx.createBiquadFilter();
      hp.type = "highpass"; hp.frequency.value = 1800;
      n.connect(hp); env(hp, t, .5, .002, .12); n.start(t); n.stop(t + .25);
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(60, t + .18);
      env(o, t, .35, .005, .22); o.start(t); o.stop(t + .3);
    }
    // Paper flap: a filtered noise swoosh
    function rustle(delay = 0, dur = .7) {
      if (!context()) return;
      const t = ctx.currentTime + delay;
      const n = noise(dur + .1), bp = ctx.createBiquadFilter();
      bp.type = "bandpass"; bp.Q.value = .8;
      bp.frequency.setValueAtTime(700, t); bp.frequency.exponentialRampToValueAtTime(3200, t + dur);
      n.connect(bp); env(bp, t, .22, dur * .35, dur * .65); n.start(t); n.stop(t + dur + .1);
    }
    // Temple-bell shimmer: a rising pentatonic glissando of soft bells
    function chime(delay = 0) {
      if (!context()) return;
      const base = ctx.currentTime + delay;
      [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2].forEach((r, i) => {
        const t = base + i * .085, f = 660 * r;
        [[1, .09], [2.76, .025], [5.4, .01]].forEach(([m, v]) => {
          const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f * m;
          env(o, t, v, .004, 2.2 - i * .1); o.start(t); o.stop(t + 2.4);
        });
      });
    }
    return { context, crack, rustle, chime };
  })();

  /* =====================================================================
     ENVELOPE
     ===================================================================== */
  const intro = $("#intro");
  const stage = $("#intro-stage");
  const envelope = $("#envelope");
  const seal = $("#seal");
  let opened = false;
  const behind = [$("#main"), $(".footer"), $("#music-btn")];
  const setBehindInert = (on) => behind.forEach((el) => (el.inert = on));

  // Gentle 3D tilt that follows the pointer before opening
  if (!reduceMotion.matches && matchMedia("(hover: hover)").matches) {
    intro.addEventListener("pointermove", (e) => {
      if (opened) return;
      const rx = (e.clientY / innerHeight - .5) * -6, ry = (e.clientX / innerWidth - .5) * 8;
      stage.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
  }

  function openInvitation() {
    if (opened) return;
    opened = true;
    const quick = reduceMotion.matches;
    const at = (ms, fn) => setTimeout(fn, quick ? 0 : ms);
    stage.style.transform = "";
    intro.classList.add("is-opening");

    // Start audio inside the tap so mobile browsers allow it
    sfx.crack();
    sfx.rustle(.32, .8);
    sfx.chime(1.15);
    if (W.music.enabled && W.music.playOnOpen) music.play();

    envelope.classList.add("is-press");
    at(300, () => {
      envelope.classList.add("is-seal");
      const r = seal.getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.top + r.height / 2, 160);
    });
    at(650, () => envelope.classList.add("is-open"));
    at(1250, () => envelope.classList.add("is-rise"));
    at(2300, () => envelope.classList.add("is-drop"));
    at(3100, () => intro.classList.add("is-exit"));
    at(3600, () => {
      intro.classList.add("is-gone");
      document.body.classList.remove("is-locked");
      setBehindInert(false);
      fx.setAmbient(true);
      $("#hero-names").setAttribute("tabindex", "-1");
      $("#hero-names").focus({ preventScroll: true });
      revealVisible();
    });
    at(4800, () => intro.remove());
  }
  seal.addEventListener("click", openInvitation);
  intro.addEventListener("keydown", (e) => { if (e.key === "Escape") openInvitation(); });
  // Visitors arriving on a deep link (e.g. #rsvp) can skip straight in
  if (location.hash && location.hash !== "#home" && $(location.hash)) {
    opened = true; intro.remove(); document.body.classList.remove("is-locked");
    requestAnimationFrame(() => fx.setAmbient(true));
  } else {
    setBehindInert(true);
    seal.focus({ preventScroll: true });
  }

  /* =====================================================================
     HERO + COUNTDOWN
     ===================================================================== */
  setImg($("#hero-img"), W.heroPhoto, 800, "");

  const target = new Date(W.weddingDateTime).getTime();
  const cd = Object.fromEntries($$("[data-cd]").map((el) => [el.dataset.cd, el]));
  let cdTimer;
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      $("#countdown").hidden = true;
      $("#countdown-done").hidden = false;
      clearInterval(cdTimer);
      return;
    }
    const vals = {
      days: Math.floor(diff / 864e5),
      hours: Math.floor((diff / 36e5) % 24),
      minutes: Math.floor((diff / 6e4) % 60),
      seconds: Math.floor((diff / 1e3) % 60),
    };
    for (const k in vals) {
      const v = String(vals[k]).padStart(2, "0");
      if (cd[k].textContent !== v) {
        cd[k].textContent = v;
        cd[k].classList.remove("tick"); void cd[k].offsetWidth; cd[k].classList.add("tick");
      }
    }
  }
  tick();
  cdTimer = setInterval(tick, 1000);
  $("#countdown").setAttribute("aria-label", `Countdown to the wedding on ${W.displayDate}`);

  /* =====================================================================
     FAMILIES
     ===================================================================== */
  const famCard = (f) => `
    <article class="family reveal">
      <div class="family__photo"><img data-src="${esc(f.photo)}" alt="${esc(f.name)}" loading="lazy" width="168" height="168" /></div>
      <p class="family__role">${esc(f.title)}</p>
      <h3 class="family__name">${esc(f.name)}</h3>
      <p class="family__relation">${esc(f.relation)}</p>
      <p class="family__parents">${esc(f.parents)}</p>
      ${f.grandparents ? `<p class="family__grand">${esc(f.grandparents)}</p>` : ""}
      ${f.home ? `<p class="family__home">${esc(f.home)}</p>` : ""}
    </article>`;
  $("#families").innerHTML = famCard(W.families.groom) + `<div class="families__amp" aria-hidden="true">&amp;</div>` + famCard(W.families.bride);
  $$("#families img").forEach((img) => setImg(img, img.dataset.src, 360, img.alt));

  /* =====================================================================
     STORY CAROUSEL
     ===================================================================== */
  (() => {
    const track = $("#carousel-track");
    const dots = $("#carousel-dots");
    const live = $("#carousel-live");
    const autoBtn = $("#carousel-auto");
    const slides = W.story;
    let index = 0, timer = null, autoplay = !reduceMotion.matches;

    track.innerHTML = slides.map((s, i) => `
      <li class="slide${i === 0 ? " is-active" : ""}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${slides.length}: ${esc(s.title)}" ${i ? 'aria-hidden="true"' : ""}>
        <div class="slide__media"><img data-src="${esc(s.photo)}" alt="${esc(s.title)} — ${esc(s.caption)}" loading="${i ? "lazy" : "eager"}" width="1408" height="768" /></div>
        <div class="slide__body">
          <p class="slide__date">${esc(s.date)}</p>
          <h3 class="slide__title">${esc(s.title)}</h3>
          <p class="slide__caption">${esc(s.caption)}</p>
        </div>
      </li>`).join("");
    $$("img", track).forEach((img) => setImg(img, img.dataset.src, 1100, img.alt));
    dots.innerHTML = slides.map((s, i) => `<button type="button" class="carousel__dot" aria-label="Show story ${i + 1}: ${esc(s.title)}" ${i === 0 ? 'aria-current="true"' : ""}></button>`).join("");

    const slideEls = $$(".slide", track);
    const dotEls = $$(".carousel__dot", dots);

    function go(i, announce = true) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(${-index * 100}%)`;
      slideEls.forEach((el, n) => {
        const on = n === index;
        el.classList.toggle("is-active", on);
        el.setAttribute("aria-hidden", String(!on));
        el.inert = !on;
      });
      dotEls.forEach((d, n) => d.setAttribute("aria-current", String(n === index)));
      if (announce) live.textContent = `Story ${index + 1} of ${slides.length}: ${slides[index].title}`;
    }
    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    function schedule() {
      clearInterval(timer);
      if (autoplay) timer = setInterval(() => go(index + 1, false), 6000);
    }
    function setAuto(on) {
      autoplay = on;
      autoBtn.setAttribute("aria-pressed", String(on));
      autoBtn.setAttribute("aria-label", on ? "Pause automatic slideshow" : "Play automatic slideshow");
      schedule();
    }

    $("#carousel-next").addEventListener("click", () => { next(); schedule(); });
    $("#carousel-prev").addEventListener("click", () => { prev(); schedule(); });
    dotEls.forEach((d, n) => d.addEventListener("click", () => { go(n); schedule(); }));
    autoBtn.addEventListener("click", () => setAuto(!autoplay));

    const root = $("#carousel");
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { next(); schedule(); }
      if (e.key === "ArrowLeft") { prev(); schedule(); }
    });
    // Pause while the visitor is interacting
    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", schedule);
    root.addEventListener("focusin", () => clearInterval(timer));
    root.addEventListener("focusout", schedule);

    // Swipe
    let sx = 0, sy = 0, swiping = false;
    const vp = $(".carousel__viewport", root);
    vp.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = true; clearInterval(timer); }, { passive: true });
    vp.addEventListener("touchend", (e) => {
      if (!swiping) return; swiping = false;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
      schedule();
    });

    go(0, false);
    setAuto(autoplay);
  })();

  /* =====================================================================
     CALENDAR + MAPS HELPERS
     ===================================================================== */
  const venueOf = (key) => W.venues[key] || W.venues[W.mainVenueKey];
  const mapsDir = (v) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(v.mapQuery || v.address)}`;
  const coupleName = `${W.couple.groom} & ${W.couple.bride}`;

  function gcalLink(ev) {
    const v = venueOf(ev.venueKey);
    const p = new URLSearchParams({
      action: "TEMPLATE",
      text: `${ev.name} · ${coupleName}`,
      dates: `${toCalStamp(ev.start)}/${toCalStamp(ev.end)}`,
      details: `${ev.description}\nDress code: ${ev.dressCode}\n\n${location.origin !== "null" ? location.href.split("#")[0] : ""}`,
      location: `${v.name}, ${v.address}`,
    });
    return `https://calendar.google.com/calendar/render?${p}`;
  }

  const icsEscape = (s) => String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
  function downloadIcs(events, filename) {
    const now = toCalStamp(new Date());
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    events.forEach((ev) => {
      const v = venueOf(ev.venueKey);
      lines.push(
        "BEGIN:VEVENT",
        `UID:${ev.id}-${toCalStamp(ev.start)}@${(W.couple.hashtag || "wedding").replace(/\W/g, "").toLowerCase()}`,
        `DTSTAMP:${now}`,
        `DTSTART:${toCalStamp(ev.start)}`,
        `DTEND:${toCalStamp(ev.end)}`,
        `SUMMARY:${icsEscape(`${ev.name} · ${coupleName}`)}`,
        `DESCRIPTION:${icsEscape(`${ev.description}\nDress code: ${ev.dressCode}`)}`,
        `LOCATION:${icsEscape(`${v.name}, ${v.address}`)}`,
        "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${icsEscape(ev.name + " tomorrow")}`, "END:VALARM",
        "END:VEVENT"
      );
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast("Calendar file downloaded — open it to add the event.");
  }

  /* =====================================================================
     EVENTS
     ===================================================================== */
  const icons = {
    mehendi: '<svg viewBox="0 0 64 64"><path d="M22 58V34c0-3 4-3 4 0V18c0-3 4-3 4 0v-4c0-3 4-3 4 0v4c0-3 4-3 4 0v6c0-3 4-3 4 0v18c0 9-6 16-14 16h-6z"/><circle cx="34" cy="38" r="5"/><path d="M34 33v-3M34 46v-3M29 38h-3M42 38h-3"/><circle cx="34" cy="38" r="1.5"/></svg>',
    haldi: '<svg viewBox="0 0 64 64"><path d="M14 30h36c0 12-8 20-18 20s-18-8-18-20z"/><path d="M10 30h44"/><path d="M24 50l-2 6h20l-2-6"/><path d="M26 22c0-4 4-4 4-8M34 22c0-4 4-4 4-8"/><circle cx="32" cy="38" r="3"/></svg>',
    wedding: '<svg viewBox="0 0 64 64"><path d="M32 54c-8-6-16-12-16-22 0-6 4-10 9-10 3 0 5 1 7 4 2-3 4-4 7-4 5 0 9 4 9 10 0 10-8 16-16 22z"/><path d="M32 10c3 3 3 7 0 10-3-3-3-7 0-10z"/><path d="M20 14c3 1 4 4 3 7M44 14c-3 1-4 4-3 7"/></svg>',
    reception: '<svg viewBox="0 0 64 64"><path d="M20 10h12l-1 14a5 5 0 0 1-10 0z"/><path d="M26 29v20M20 49h12"/><path d="M38 14h12l-1 14a5 5 0 0 1-10 0z"/><path d="M44 33v18M38 51h12"/><path d="M30 8l2-4M44 10l3-4M36 6l1 3"/></svg>',
  };
  const events = W.events;
  $("#events-grid").innerHTML = events.map((ev, i) => {
    const v = venueOf(ev.venueKey);
    return `
      <article class="event event--${esc(ev.theme)} reveal" style="transition-delay:${i * 90}ms" aria-labelledby="ev-${esc(ev.id)}">
        <div class="event__icon" aria-hidden="true">${icons[ev.theme] || icons.wedding}</div>
        <h3 class="event__name" id="ev-${esc(ev.id)}">${esc(ev.name)}</h3>
        <p class="event__when"><time datetime="${esc(ev.start)}">${fmtDay.format(new Date(ev.start))}</time></p>
        <p class="event__time">${fmtTime.format(new Date(ev.start))} onwards</p>
        <p class="event__venue">${esc(v.name)}</p>
        <p class="event__desc">${esc(ev.description)}</p>
        ${ev.dressCode ? `<p class="event__dress">Dress code · ${esc(ev.dressCode)}</p>` : ""}
        <div class="event__actions">
          <a class="btn btn--gold" href="${mapsDir(v)}" target="_blank" rel="noopener" aria-label="Directions to ${esc(ev.name)} at ${esc(v.name)} (opens Google Maps)">Directions</a>
          <div class="event__cal">
            <a class="btn btn--ghost" href="${gcalLink(ev)}" target="_blank" rel="noopener" aria-label="Add ${esc(ev.name)} to Google Calendar">Google</a>
            <button class="btn btn--ghost" type="button" data-ics="${esc(ev.id)}" aria-label="Download ${esc(ev.name)} calendar file for Apple or Outlook">iCal</button>
          </div>
        </div>
      </article>`;
  }).join("");
  $("#events-grid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-ics]");
    if (!b) return;
    const ev = events.find((x) => x.id === b.dataset.ics);
    downloadIcs([ev], `${ev.id}-${W.couple.groom}-${W.couple.bride}.ics`.toLowerCase());
  });

  /* =====================================================================
     VENUE
     ===================================================================== */
  (() => {
    const v = venueOf(W.mainVenueKey);
    const main = events.find((e) => e.venueKey === W.mainVenueKey) || events[0];
    $("#venue-name").textContent = v.name;
    $("#venue-address").textContent = v.address;
    $("#venue-map").src = `https://www.google.com/maps?q=${encodeURIComponent(v.mapQuery || v.address)}&output=embed`;
    $("#venue-directions").href = mapsDir(v);
    $("#venue-gcal").href = gcalLink(main);
    $("#venue-gcal").textContent = `Add ${main.name} to Google Calendar`;
    $("#venue-ics").textContent = "All events · Apple / Outlook";
    $("#venue-ics").addEventListener("click", () => downloadIcs(events, `${W.couple.groom}-${W.couple.bride}-wedding.ics`.toLowerCase()));
    $("#venue-notes").innerHTML = (W.travelNotes || []).map((n) => `<div><dt>${esc(n.label)}</dt><dd>${esc(n.value)}</dd></div>`).join("");
  })();

  /* =====================================================================
     RSVP → WhatsApp
     ===================================================================== */
  (() => {
    const form = $("#rsvp-form");
    const attendingBlock = $("#rsvp-attending");
    const out = $("#guests-value");
    const minus = $("#guests-minus"), plus = $("#guests-plus");
    const max = W.rsvp.maxGuests || 10;
    let guests = 1;

    $("#rsvp-events").innerHTML = events.map((ev) => `
      <label class="pill"><input type="checkbox" name="events" value="${esc(ev.name)}" checked />
        <span>${esc(ev.name)} <small>· ${fmtShort.format(new Date(ev.start))}</small></span></label>`).join("");

    function setGuests(n) {
      guests = Math.max(1, Math.min(max, n));
      out.textContent = guests;
      minus.disabled = guests <= 1;
      plus.disabled = guests >= max;
    }
    minus.addEventListener("click", () => setGuests(guests - 1));
    plus.addEventListener("click", () => setGuests(guests + 1));
    setGuests(1);

    form.addEventListener("change", (e) => {
      if (e.target.name === "attending") attendingBlock.hidden = e.target.value !== "yes";
      if (e.target.name === "events") $("#err-events").textContent = "";
    });
    $("#rsvp-name").addEventListener("input", (e) => { e.target.removeAttribute("aria-invalid"); $("#err-name").textContent = ""; });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").trim();
      const attending = data.get("attending") === "yes";
      const chosen = data.getAll("events");
      let ok = true;

      if (name.length < 2) {
        $("#rsvp-name").setAttribute("aria-invalid", "true");
        $("#err-name").textContent = "Please tell us your name.";
        $("#rsvp-name").focus();
        ok = false;
      }
      if (attending && !chosen.length) {
        $("#err-events").textContent = "Please choose at least one event.";
        if (ok) $("#rsvp-events input").focus();
        ok = false;
      }
      if (!ok) return;

      const phone = (data.get("phone") || "").trim();
      const note = (data.get("message") || "").trim();
      const lines = [`🌸 *RSVP · ${coupleName}'s Wedding* 🌸`, "", `*Name:* ${name}`];
      if (phone) lines.push(`*Phone:* ${phone}`);
      lines.push(`*Attending:* ${attending ? "Yes, joyfully accepting! 🎉" : "Regretfully unable to attend"}`);
      if (attending) lines.push(`*Guests:* ${guests}`, `*Events:* ${chosen.join(", ")}`, `*Dietary:* ${data.get("diet")}`);
      if (note) lines.push("", `*Message:* ${note}`);
      const text = lines.join("\n");
      const url = `https://wa.me/${String(W.rsvp.whatsappNumber).replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

      const win = window.open(url, "_blank");
      if (win) win.opener = null;
      else location.href = url; // pop-up blocked (common in in-app browsers)

      const btn = form.querySelector('[type="submit"]');
      const r = btn.getBoundingClientRect();
      if (attending) fx.burst(r.left + r.width / 2, r.top, 120);
      $("#rsvp-status").textContent = attending
        ? `Thank you, ${name}! WhatsApp is opening with your RSVP — just tap send.`
        : `Thank you for letting us know, ${name}. WhatsApp is opening — just tap send.`;
    });
  })();

  /* =====================================================================
     MUSIC (MP3 from config, with a built-in gentle melody fallback)
     ===================================================================== */
  const music = (() => {
    const btn = $("#music-btn");
    const audio = $("#bg-audio");
    let playing = false, synth = null, useSynth = false;

    if (!W.music.enabled) return { play() {} };
    btn.hidden = false;
    audio.src = W.music.src;
    audio.volume = .55;
    audio.addEventListener("error", () => { useSynth = true; if (playing) { synth = synth || makeSynth(); synth.start(); } });

    function render() {
      btn.setAttribute("aria-pressed", String(playing));
      btn.setAttribute("aria-label", playing ? "Pause background music" : "Play background music");
    }
    async function play() {
      playing = true; render();
      if (!useSynth) {
        try { await audio.play(); return; } catch (err) { if (err.name === "NotAllowedError") { playing = false; render(); return; } useSynth = true; }
      }
      synth = synth || makeSynth();
      synth.start();
    }
    function pause() {
      playing = false; render();
      audio.pause();
      synth?.stop();
    }
    btn.addEventListener("click", () => (playing ? pause() : play()));
    document.addEventListener("visibilitychange", () => { if (document.hidden && playing) { audio.pause(); synth?.stop(); playing = false; render(); } });
    return { play };

    /* A soft tanpura drone with a slow Raag Bhupali-style melody */
    function makeSynth() {
      const ctx = sfx.context();
      const master = ctx.createGain(); master.gain.value = 0;
      const delay = ctx.createDelay(); delay.delayTime.value = .38;
      const fb = ctx.createGain(); fb.gain.value = .35;
      const wet = ctx.createGain(); wet.gain.value = .3;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600;
      delay.connect(fb).connect(delay); delay.connect(wet).connect(lp);
      master.connect(lp); master.connect(delay); lp.connect(ctx.destination);

      const SA = 220; // A3
      const ratio = { S: 1, R: 9 / 8, G: 5 / 4, P: 3 / 2, D: 5 / 3, "S'": 2, "R'": 9 / 4, "d,": 5 / 6, "p,": 3 / 4 };
      const phrase = ["S", "R", "G", "-", "P", "G", "R", "-", "G", "P", "D", "S'", "D", "P", "G", "-",
        "R", "G", "P", "-", "G", "R", "S", "-", "d,", "S", "R", "G", "R", "S", "-", "-"];
      let timer = null, step = 0, nextT = 0, droneNodes = [];

      function pluck(freq, t, dur, vol, type = "triangle") {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + .02);
        g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g).connect(master); o.start(t); o.stop(t + dur + .05);
      }
      function startDrone() {
        [SA / 2, (SA * 3) / 4, SA / 2 * 1.002].forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = "sine"; o.frequency.value = f; g.gain.value = i === 1 ? .05 : .07;
          o.connect(g).connect(master); o.start();
          droneNodes.push(o);
        });
      }
      function schedule() {
        while (nextT < ctx.currentTime + .6) {
          const n = phrase[step % phrase.length];
          if (n !== "-") pluck(SA * ratio[n], nextT, 1.6, .16);
          if (step % 8 === 0) pluck(SA / 2, nextT, 2.4, .08, "sine");
          nextT += .5; step++;
        }
      }
      return {
        start() {
          sfx.context();
          if (!droneNodes.length) startDrone();
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.linearRampToValueAtTime(.8, ctx.currentTime + 1.5);
          nextT = ctx.currentTime + .1;
          clearInterval(timer); timer = setInterval(schedule, 200); schedule();
        },
        stop() {
          clearInterval(timer);
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
          master.gain.linearRampToValueAtTime(0, ctx.currentTime + .6);
        },
      };
    }
  })();

  /* =====================================================================
     REVEAL ON SCROLL + TOAST
     ===================================================================== */
  const revealObs = "IntersectionObserver" in window && !reduceMotion.matches
    ? new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); revealObs.unobserve(en.target); }
      }), { threshold: .12, rootMargin: "0px 0px -40px 0px" })
    : null;
  function revealVisible() {
    $$(".reveal:not(.is-visible)").forEach((el) => (revealObs ? revealObs.observe(el) : el.classList.add("is-visible")));
  }
  revealVisible();

  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("is-shown");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("is-shown"), 3600);
  }
})();
