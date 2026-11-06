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
    if (soundOn) sound("press");
    if (!quiet) say(`Sound ${soundOn ? "on" : "off"}.`);
  }
  const radio = (name, v, label, on) => `<label class="opt radio"><input type="radio" name="${name}" value="${v}"${on ? " checked" : ""}><span>${label}</span></label>`;
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

  /* ---------- Sound: Web Audio, off by default ---------- */
  let ctx = null;
  function audio() {
    if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(a, freq, dur, type, gain, at = 0) {
    const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .02);
  }
  function noise(a, dur, gain, freq) {
    const n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
    f.type = "bandpass"; f.frequency.value = freq; f.Q.value = .8;
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.buffer = buf; s.connect(f).connect(g).connect(a.destination); s.start(t);
  }
  function sound(kind) {
    if (!soundOn) return;
    const a = audio(); if (!a) return;
    if (kind === "tab") { tone(a, 1600, .03, "square", .018); tone(a, 2200, .035, "square", .014, .035); }
    else if (kind === "row") tone(a, 2600, .014, "triangle", .03);
    else if (kind === "press") { tone(a, 740, .05, "square", .016); tone(a, 370, .06, "triangle", .02, .008); }
    else if (kind === "tape") { noise(a, .45, .05, 900); tone(a, 220, .12, "triangle", .03, .3); }
  }
  // Clicks on the controls the game itself makes noise for.
  document.addEventListener("click", e => {
    if (!soundOn) return;
    const t = e.target;
    if (t.closest(".tab, .subtab")) sound("tab");
    else if (t.closest(".row, .attr, .opt")) sound("row");
    else if (t.closest(".btn:not(.preset), .lnk, .linkid, .seg button, #picked .rm")) sound("press");
  }, true);

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
    const next = () => { if (ended) return; box.insertAdjacentHTML("beforeend", lines[i++]()); if (i < lines.length) timers.push(setTimeout(next, 115)); else timers.push(setTimeout(end, 220)); };
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

  return { level, moving, live, setLevel, setSound, setupSettings, refresh, shift, roll, bar, loadTape, sound, boot, setBootData };
})();
FX.boot();
