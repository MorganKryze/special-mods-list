"use strict";
/* Screen life, motion and sound for the Pip-Boy shell.
   Every animation here moves transform or opacity, on small elements or on overlay layers,
   so text is never repainted frame by frame. Three levels, set on <html data-fx>:
   full (everything), reduced (no movement, short fades only), off (nothing). */
const FX = (() => {
  const root = document.documentElement;
  const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
  const LEVELS = { full: "Full", reduced: "Reduced", off: "Off" };
  const level = () => LEVELS[root.dataset.fx] ? root.dataset.fx : "full";
  const moving = () => level() === "full";
  const live = () => level() !== "off";
  const q = s => document.querySelector(s);
  const say = t => { if (typeof announce === "function") announce(t); };

  /* ---------- Settings ---------- */
  function setLevel(v, quiet) {
    if (!LEVELS[v]) v = "full";
    root.dataset.fx = v;
    // Off means off now: stop any refresh, shift or roll still playing.
    if (v === "off") document.getAnimations().forEach(x => { if (!(x instanceof CSSAnimation) && !(x instanceof CSSTransition)) x.cancel(); });
    try { localStorage.setItem("sml-fx", v); } catch {}
    syncSettings();
    window.dispatchEvent(new Event("fxchange"));
    if (!quiet) say(`Effects: ${LEVELS[v].toLowerCase()}.`);
  }
  let soundOn = false;
  try { soundOn = localStorage.getItem("sml-sound") === "on"; } catch {}
  function setSound(on, quiet) {
    soundOn = !!on;
    try { localStorage.setItem("sml-sound", soundOn ? "on" : "off"); } catch {}
    syncSettings();
    if (soundOn) { sound("boot"); humOn(true); } else humOn(false);
    if (!quiet) say(`Sound ${soundOn ? "on" : "off"}.`);
  }
  const radio = (name, v, label, on) => `<label class="opt radio"><input type="radio" name="${name}" value="${v}"${on ? " checked" : ""}><span class="bx" aria-hidden="true"></span><span>${label}</span></label>`;
  function setupSettings() {
    const fx = q("#fx-set"), snd = q("#snd-set");
    fx.insertAdjacentHTML("beforeend", Object.entries(LEVELS).map(([k, l]) => radio("fx", k, l, k === level())).join(""));
    snd.insertAdjacentHTML("beforeend", radio("sound", "off", "Off", !soundOn) + radio("sound", "on", "On", soundOn));
    fx.addEventListener("change", e => setLevel(e.target.value));
    snd.addEventListener("change", e => setSound(e.target.value === "on"));
    q("#hud-fx").addEventListener("click", () => { const ks = Object.keys(LEVELS); setLevel(ks[(ks.indexOf(level()) + 1) % ks.length]); });
    q("#hud-snd").addEventListener("click", () => setSound(!soundOn));
    syncSettings();
  }
  function syncSettings() {
    const f = q("#hud-fx"), s = q("#hud-snd");
    if (f) f.innerHTML = `Effects <b>${LEVELS[level()]}</b>`;
    if (s) { s.innerHTML = `Sound <b>${soundOn ? "On" : "Off"}</b>`; s.setAttribute("aria-pressed", soundOn); }
    document.querySelectorAll('input[name="fx"]').forEach(i => i.checked = i.value === level());
    document.querySelectorAll('input[name="sound"]').forEach(i => i.checked = (i.value === "on") === soundOn);
  }

  /* ---------- The tube's curve: full effects only ----------
     A real terminal's picture bows: straight lines bulge outward, a little near the middle and more
     towards the edges and corners. Resampling the whole page to bend it (an SVG displacement filter)
     was tried: browsers sample it without smoothing, so every thin rule near the edges broke into
     one-pixel stairs, and clicks no longer matched what is seen. So the bend is drawn instead, on the
     screen's own lines: the scanlines, the line under the tabs and the edges of the status bar follow
     the same barrel curve, anti-aliased. Nothing moves; the curve is redrawn only when the screen
     changes size. Text and controls are never resampled: sharp, and clicked where they are seen. */
  // How far a horizontal line at height v (-1 top, 1 bottom) has its middle pushed out, in px.
  const BOW = h => Math.max(2.5, Math.min(5, h * .0045));
  const bowAt = (v, h) => BOW(h) * v;
  function crtDraw() {
    const scr = q("#screen"); if (!scr) return;
    const W = scr.clientWidth, H = scr.clientHeight; if (!W || !H) return;
    // Scanlines: one dark line every 3 px, each a quadratic curve whose middle bulges outward.
    let d = "";
    for (let y = 1.5; y < H; y += 3) { const m = bowAt(y / H * 2 - 1, H); d += `M0 ${y.toFixed(1)}Q${W / 2} ${(y + 2 * m).toFixed(1)} ${W} ${y.toFixed(1)}`; }
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'><path d='${d}' stroke='black' stroke-opacity='.22' stroke-width='1' fill='none'/></svg>`;
    scr.style.setProperty("--scan", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
    // The status bar's top and bottom edges bow down, as lines below the middle do.
    const st = q(".status");
    if (st) {
      const r = st.getBoundingClientRect(), s0 = scr.getBoundingClientRect(), w = r.width, h = r.height;
      const vt = (r.top - s0.top) / H * 2 - 1, vb = (r.bottom - s0.top) / H * 2 - 1, mt = bowAt(vt, H), mb = bowAt(vb, H);
      // Top edge: ends at 0, middle lowered by its bow. Bottom edge: middle at the box, ends raised by theirs.
      st.style.setProperty("--status-bow", `path("M0 0 Q${w / 2} ${2 * mt} ${w} 0 L${w} ${h - mb} Q${w / 2} ${h + mb} 0 ${h - mb} Z")`);
    }
    crtTabline();
  }
  // The line under the tabs, as one curve with a gap where the current tab's outline is.
  function crtTabline(x0, x1) {
    const line = q("#tabline"), scr = q("#screen"); if (!line || !scr) return;
    const svg = line.querySelector(".tl-curve"), W = line.offsetWidth, h = line.offsetHeight; if (!W || !h) return;
    const H = scr.clientHeight, v = (line.getBoundingClientRect().bottom - scr.getBoundingClientRect().top) / H * 2 - 1, m = bowAt(v, H);
    // Ends sit on the line's bottom; the middle rises by the bow. The tab outline meets it in the middle.
    svg.setAttribute("viewBox", `0 0 ${W} ${h}`);
    svg.querySelector("path").setAttribute("d", `M0 ${h - 1} Q${W / 2} ${h - 1 + 2 * m} ${W} ${h - 1}`);
    if (x0 !== undefined) {
      const g1 = svg.querySelector(".g1"), g2 = svg.querySelector(".g2");
      g1.style.x = "-2px"; g1.style.width = (x0 + 2) + "px"; g2.style.x = x1 + "px"; g2.style.width = (W - x1 + 2) + "px";
    }
    line.style.setProperty("--tl-lift", `${m}px`);
  }
  let crtRaf = 0;
  const crtQueue = () => { cancelAnimationFrame(crtRaf); crtRaf = requestAnimationFrame(crtDraw); };
  if (window.ResizeObserver) new ResizeObserver(crtQueue).observe(document.getElementById("screen") || document.body);
  window.addEventListener("fxchange", crtQueue);

  /* ---------- Motion that answers an action ---------- */
  // Screen change: a brightness dip and a band sweeping down, under 200 ms.
  function refresh() {
    if (!live()) return;
    const dip = q(".fx-refresh"), sweep = q(".fx-sweep");
    dip.getAnimations().forEach(a => a.cancel());
    dip.animate([{ opacity: 0 }, { opacity: moving() ? .32 : .2, offset: .25 }, { opacity: 0 }], { duration: moving() ? 180 : 120, easing: "ease-out" });
    if (moving()) {
      sweep.getAnimations().forEach(a => a.cancel());
      sweep.animate([{ transform: "translateY(-100%)", opacity: 1 }, { transform: "translateY(560%)", opacity: .4 }], { duration: 190, easing: EASE });
    }
  }
  // Content shift for a step change: slides in from the side it came from.
  function shift(el, dir) {
    if (!el || !live()) return;
    el.getAnimations().forEach(a => a.cancel());
    if (moving()) el.animate([{ transform: `translateX(${dir * 24}px)`, opacity: .2 }, { transform: "none", opacity: 1 }], { duration: 190, easing: EASE });
    else el.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 120, easing: "ease-out" });
  }
  // A number rolls to its new value: up when it grows, down when it shrinks.
  function roll(el, text) {
    if (!el) return;
    text = String(text);
    const old = el.textContent;
    if (old === text) return;
    el.textContent = text;
    if (!moving() || !old) return;
    const a = parseFloat(old.replace(/[^\d.-]/g, "")), b = parseFloat(text.replace(/[^\d.-]/g, ""));
    const dir = isNaN(a) || isNaN(b) || b >= a ? 1 : -1;
    el.getAnimations().forEach(x => x.cancel());
    el.animate([{ transform: `translateY(${dir * 45}%)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 170, easing: EASE });
  }
  // One highlight bar per list, moved with transform to the selected row.
  function bar(container, row, instant) {
    if (!container) return;
    let hl = container.querySelector(":scope > .hl");
    if (!hl) {
      hl = document.createElement(container.tagName === "UL" || container.tagName === "OL" ? "li" : "i");
      hl.className = "hl"; hl.setAttribute("aria-hidden", "true");
      container.prepend(hl);
    }
    if (!row || !row.offsetParent) { hl.classList.remove("on"); return; }
    const c = container.getBoundingClientRect(), r = row.getBoundingClientRect();
    const x = r.left - c.left + container.scrollLeft, y = r.top - c.top + container.scrollTop;
    // The bar snaps to the new row, as in the game: no slide, so no frame where both rows are half lit.
    hl.style.width = r.width + "px"; hl.style.height = r.height + "px";
    hl.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    hl.classList.add("on");
  }
  // Holotape: the reels turn and three cells fill, then the label reads Loaded.
  function loadTape(card, done) {
    if (!card || level() === "off") { done && done(); return; }
    const cells = card.querySelectorAll(".lq i");
    card.classList.add("loading");
    cells.forEach(c => c.classList.remove("f"));
    sound("tape");
    const step = level() === "full" ? 170 : 110;
    cells.forEach((c, i) => setTimeout(() => c.classList.add("f"), step * (i + 1)));
    setTimeout(() => { card.classList.remove("loading"); done && done(); }, step * (cells.length + 1));
  }

  /* ---------- Sound: Web Audio, off by default ----------
     Everything is synthesised here; no audio file is used. The voices aim at the character of the
     Pip-Boy and terminal sounds: a small speaker (band-limited, a presence peak near 2.2 kHz),
     mechanical clicks made of filtered noise over a low thump, short square-wave chirps, a little
     static, and a quiet mains hum from the tube while sound is on. */
  let ctx = null, out = null, noiseBuf = null, hum = null;
  function audio() {
    if (!ctx) {
      const A = window.AudioContext || window.webkitAudioContext; if (!A) return null;
      ctx = new A();
      // The speaker: everything goes through a gentle band-pass with a presence peak.
      const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 90;
      const pk = ctx.createBiquadFilter(); pk.type = "peaking"; pk.frequency.value = 2200; pk.Q.value = .9; pk.gain.value = 5;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 9000;
      out = ctx.createGain(); out.gain.value = 1;
      out.connect(hp).connect(pk).connect(lp).connect(ctx.destination);
      const n = ctx.sampleRate; noiseBuf = ctx.createBuffer(1, n, n); const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  const env = (g, t, peak, dur, attack = .002) => { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur); };
  // Filtered noise burst: the body of a click, a key or static.
  function burst(at, freq, q, dur, gain, type = "bandpass") {
    const a = ctx, t = a.currentTime + at, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q; env(g, t, gain, dur, .001);
    s.connect(f).connect(g).connect(out); s.start(t, Math.random() * .8, dur + .05);
  }
  // A tone with an optional glide: chirps, thumps and whines.
  function tone(at, f0, f1, dur, type, gain, attack = .002) {
    const a = ctx, t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, gain, dur, attack); o.connect(g).connect(out); o.start(t); o.stop(t + dur + .05);
  }
  const r = (a, b) => a + Math.random() * (b - a);
  const VOICES = {
    // Tab change: the dial's mechanical click, a low thump under it, a breath of static.
    tab: () => { tone(0, 95, 48, .07, "sine", .11); burst(0, 1800, 1.2, .03, .16); burst(.008, 4600, 2, .014, .06); burst(.01, 3000, .7, .08, .025); },
    // List move: a short relay tick.
    row: () => { burst(0, r(2600, 3000), 3, .012, .08); tone(0, 1900, 1900, .008, "triangle", .012); },
    // Select or confirm: a click and a rising two-step chirp.
    press: () => { burst(0, 2200, 1.5, .016, .1); tone(.006, 1046, 1318, .045, "square", .016); tone(.05, 1568, 1568, .03, "square", .011); },
    // Back or cancel: a duller click and a falling chirp.
    back: () => { burst(0, 1500, 1.5, .016, .09); tone(.006, 784, 523, .07, "square", .015); },
    // A terminal key: plastic clack with a random pitch, a light thump under it.
    type: () => { burst(0, r(900, 1500), 4, .02, .11); burst(.002, 3600, 2, .007, .04); tone(0, 190, 120, .022, "sine", .03); },
    // Text printing on the terminal: a faint high tick per line.
    char: () => { tone(0, r(3100, 3600), r(3100, 3600), .007, "triangle", .01); },
    // Holotape in: two clunks, the tape motor, then the data chirps.
    tape: () => { tone(0, 62, 40, .12, "sine", .13); burst(0, 600, 1, .06, .12); tone(.17, 70, 45, .09, "sine", .1); burst(.17, 900, 1, .04, .1);
      const a = ctx, t = a.currentTime + .22, o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain(), v = a.createOscillator(), vg = a.createGain();
      o.type = "sawtooth"; o.frequency.value = 72; v.frequency.value = 9; vg.gain.value = 6; v.connect(vg).connect(o.frequency);
      f.type = "lowpass"; f.frequency.value = 520; env(g, t, .035, .32, .03); o.connect(f).connect(g).connect(out); o.start(t); v.start(t); o.stop(t + .4); v.stop(t + .4);
      [.56, .61, .66, .74].forEach(d => tone(d, r(1200, 2400), r(1200, 2400), .025, "square", .009)); },
    // Power on: the relay, static, and the tube's whine rising as it warms.
    boot: () => { tone(0, 52, 34, .16, "sine", .16); burst(0, 420, 1, .08, .12); burst(.02, 2500, .5, .36, .045); tone(.06, 1800, 7600, .45, "sine", .006, .05); },
  };
  function sound(kind) {
    if (!soundOn) return;
    if (!audio() || !VOICES[kind]) return;
    VOICES[kind]();
  }
  // The tube's hum while sound is on: mains harmonics and a very faint whine.
  function humOn(on) {
    if (on && !hum && ctx && ctx.state !== "closed") {
      const t = ctx.currentTime, g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(1, t + .6); g.connect(out);
      const parts = [[60, "sine", .010], [120, "sine", .005], [180, "triangle", .002], [7800, "sine", .0005]].map(([f, type, v]) => {
        const o = ctx.createOscillator(), og = ctx.createGain(); o.type = type; o.frequency.value = f; og.gain.value = v; o.connect(og).connect(g); o.start(); return o; });
      hum = { g, parts };
    } else if (!on && hum) {
      const h = hum, t = ctx.currentTime; hum = null; h.g.gain.cancelScheduledValues(t); h.g.gain.setValueAtTime(h.g.gain.value, t); h.g.gain.exponentialRampToValueAtTime(.0001, t + .25);
      setTimeout(() => h.parts.forEach(o => o.stop()), 300);
    }
  }
  // The audio context may only start after a gesture: the hum waits for the first one.
  const wake = () => { if (soundOn && !document.hidden) { audio(); humOn(true); } };
  ["pointerdown", "keydown"].forEach(e => document.addEventListener(e, wake, { capture: true, passive: true }));
  document.addEventListener("visibilitychange", () => { if (!ctx) return; if (document.hidden) humOn(false); else wake(); });
  // Clicks on the controls the game itself makes noise for.
  document.addEventListener("click", e => {
    if (!soundOn) return;
    const t = e.target;
    if (t.closest(".preset")) return; // the holotape plays its own sound
    if (t.closest('[data-sp="back"], [data-back], [data-sec=""], [data-clearq], .rm, [data-notice="close"], [data-notice="undo"]')) sound("back");
    else if (t.closest(".tab, .subtab")) sound("tab");
    else if (t.closest(".add, .dtoggle, .btn.primary, .door, .sec")) sound("press");
    else if (t.closest(".row, .opt, .attr")) sound("row");
    else if (t.closest(".btn, .lnk, .linkid, .seg button, .tcol, details > summary")) sound("press");
  }, true);
  // Typing in the search field clacks like a terminal keyboard.
  document.addEventListener("input", e => { if (soundOn && e.target.matches && e.target.matches('input[type="search"]')) sound("type"); }, true);

  /* ---------- Boot: once per session, full effects only ---------- */
  let bootData = null, bootTick = null;
  function setBootData(d) { bootData = d; if (bootTick) bootTick(); }
  function boot() {
    const el = q("#boot");
    let first = true;
    try { first = !sessionStorage.getItem("sml-booted"); sessionStorage.setItem("sml-booted", "1"); } catch {}
    if (!first || level() !== "full" || matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]noboot\b/.test(location.search)) return;
    const box = q("#boot-text"), timers = [];
    const row = (label, value, cls = "") => `<p class="${cls}">${label}${value !== undefined ? ` <span class="dots"></span> ${value}` : ""}</p>`;
    const val = k => bootData ? bootData[k] : "…";
    const lines = [
      () => row("SPECIAL MODS LIST OS  v2.0"),
      () => row("Unofficial fan project. Not affiliated with Bethesda Softworks.", undefined, "dim"),
      () => row("Reading catalogue", `<span data-k="mods">${val("mods")}</span>`),
      () => row("Runtime", "1.11.240"),
      () => row("Holotapes", `<span data-k="tapes">${val("tapes")}</span>`),
      () => row("Last check", `<span data-k="date">${val("date")}</span>`),
      () => `<p>Ready <span class="cur"></span></p>`,
    ];
    bootTick = () => box.querySelectorAll("[data-k]").forEach(s => s.textContent = val(s.dataset.k));
    el.hidden = false;
    let i = 0, ended = false;
    const canPlay = soundOn && navigator.userActivation && navigator.userActivation.hasBeenActive;
    if (canPlay) sound("boot");
    const next = () => { if (ended) return; box.insertAdjacentHTML("beforeend", lines[i++]()); if (canPlay) sound("char"); if (i < lines.length) timers.push(setTimeout(next, 115)); else timers.push(setTimeout(end, 220)); };
    const end = fast => {
      if (ended) return; ended = true;
      const k = fast ? .5 : 1;
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skip, true); el.removeEventListener("pointerdown", skip);
      box.style.visibility = "hidden"; el.querySelector(".skiphint").style.visibility = "hidden";
      // Power on: a thin translucent line draws across, then the screen ramps up from dark.
      const line = el.querySelector(".boot-line");
      line.animate([{ opacity: .55, transform: "scaleX(0)" }, { opacity: .55, transform: "scaleX(1)", offset: .5 }, { opacity: 0, transform: "scaleX(1)" }], { duration: 240 * k, easing: "ease-out" });
      el.animate([{ opacity: 1 }, { opacity: 1, offset: .35 }, { opacity: 0 }], { duration: 300 * k, easing: "ease-out" }).onfinish = () => { el.hidden = true; bootTick = null; };
      q(".fx-refresh").animate([{ opacity: .45 }, { opacity: 0 }], { duration: 420 * k, delay: 100 * k, easing: "ease-out", fill: "backwards" });
    };
    const skip = e => { if (e.type === "keydown" && ["Shift", "Control", "Alt", "Meta"].includes(e.key)) return; e.preventDefault(); e.stopPropagation(); end(true); };
    window.addEventListener("keydown", skip, true); el.addEventListener("pointerdown", skip);
    next();
  }

  return { level, moving, live, setLevel, setSound, setupSettings, refresh, shift, roll, bar, loadTape, sound, boot, setBootData, crtTabline, crtDraw: () => crtQueue() };
})();
FX.boot();
