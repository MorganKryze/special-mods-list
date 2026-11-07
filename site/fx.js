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
    if (soundOn) sound("click");
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
  const BOW = h => Math.max(8, Math.min(14, h * .0165));
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
      // The bar's edges bow less than the lines, so the curve never cuts into its labels.
      const vt = (r.top - s0.top) / H * 2 - 1, vb = (r.bottom - s0.top) / H * 2 - 1, mt = Math.min(6, bowAt(vt, H)), mb = Math.min(6, bowAt(vb, H));
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
    // Half the bow lifts the middle, half lowers the ends, so the line stays clear of the tab labels.
    svg.querySelector("path").setAttribute("d", `M0 ${h - 1 - m / 2} Q${W / 2} ${h - 1 + 1.5 * m} ${W} ${h - 1 - m / 2}`);
    if (x0 !== undefined) {
      const g1 = svg.querySelector(".g1"), g2 = svg.querySelector(".g2");
      g1.style.x = "-2px"; g1.style.width = (x0 + 2) + "px"; g2.style.x = x1 + "px"; g2.style.width = (W - x1 + 2) + "px";
    }
    line.style.setProperty("--tl-lift", `${m / 2}px`);
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

  /* ---------- Sound: off by default, two quiet clicks ----------
     Only filtered noise, no tone: a tick of about 6 ms for moving through lists and changing tabs, and
     a slightly fuller click of about 18 ms for confirming. Everything passes a 1.2 kHz high-pass and a
     7.5 kHz low-pass, and peaks near -24 dBFS. Nothing plays longer than 40 ms.
     To drop sound entirely: delete this block and the Sound setting; FX.sound() then does nothing. */
  let ctx = null, out = null, noiseBuf = null;
  function audio() {
    if (!ctx) {
      const A = window.AudioContext || window.webkitAudioContext; if (!A) return null;
      ctx = new A();
      const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1200; hp.Q.value = .7;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 7500; lp.Q.value = .7;
      out = ctx.createGain(); out.gain.value = .095; // the click peaks near -24 dBFS, the tick near -27
      out.connect(hp).connect(lp).connect(ctx.destination);
      const n = Math.round(ctx.sampleRate * .05); noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate); const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  // A burst of noise through a band-pass, with a fast attack and an exponential decay.
  function burst(freq, q, dur, level) {
    const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(level, t + .001); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f).connect(g).connect(out); s.start(t, 0, dur + .005);
  }
  const VOICES = {
    tick: () => burst(4200, 1.2, .006, .8),
    click: () => burst(2600, .9, .018, 1),
  };
  // Older names used by the rest of the site map onto the two voices.
  const ALIAS = { tab: "tick", row: "tick", back: "tick", press: "click", tape: "click" };
  function sound(kind) {
    if (!soundOn) return;
    const v = VOICES[ALIAS[kind] || kind]; if (!v || !audio()) return;
    v();
  }
  document.addEventListener("click", e => {
    if (!soundOn) return;
    const t = e.target;
    if (t.closest(".preset")) return; // the holotape plays its own click
    if (t.closest(".tab, .subtab, .row, .opt, .attr, [data-sp=\"back\"], [data-back], [data-sec=\"\"]")) sound("tick");
    else if (t.closest(".btn, .add, .door, .sec, .lnk, .linkid, .seg button, .tcol, .rm, details > summary")) sound("click");
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

  return { level, moving, live, setLevel, setSound, setupSettings, refresh, shift, roll, bar, loadTape, sound, boot, setBootData, crtTabline, crtDraw: () => crtQueue() };
})();
FX.boot();
