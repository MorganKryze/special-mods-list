"use strict";
const MODULES = {
  base: "Base", stability: "Stability and performance", interface: "Interface", gameplay: "Gameplay and enemies",
  brotherhood: "Brotherhood of Steel", minutemen: "Minutemen", institute: "The Institute", railroad: "The Railroad",
  raiders: "Raiders and hostile factions", factions: "Factions, endings and starts", settlements: "Settlements",
  dlc: "DLC", quests: "Quests and locations", "weapons-armor": "Weapons and armor", immersion: "Immersion and quality of life",
  companions: "Companions", visuals: "Visuals: textures, lighting, shaders, LOD",
};
const MOD_KEYS = Object.keys(MODULES);
const secNo = k => String(MOD_KEYS.indexOf(k) + 1).padStart(2, "0");
const TIERS = ["core", "recommended", "optional", "avoid"];
const TIER_LABEL = { core: "Core", recommended: "Recommended", optional: "Optional", avoid: "Avoid" };
const PERF = ["low", "med", "high"];
const PERF_OPT = { low: "Low only", med: "Up to medium", high: "Any" };
const PROFILES = ["bos", "minutemen", "institute", "railroad", "raider", "neutral"];
const PROFILE_LABEL = { all: "Any playthrough", bos: "Brotherhood", minutemen: "Minutemen", institute: "Institute", railroad: "Railroad", raider: "Raider", neutral: "Neutral" };
const FACTION = { bos: "Brotherhood", minutemen: "Minutemen", institute: "Institute", railroad: "Railroad" };
const LOAD_GROUPS = { "0": "No plugin: F4SE and DLL mods", "10": "Unofficial patch and frameworks", "20": "Overhauls", "30": "Large content frameworks", "40": "Content", "50": "Gear, weapons and armor", "60": "Tweaks and immersion", "80": "Compatibility patches", "90": "Precombine and previs patches", "99": "Load last", "": "Load group not recorded" };
const LBL = {
  perf: { low: "Low", med: "Medium", high: "High", "": "Not rated" },
  rt: { yes: "Yes", "plugin-only": "Works", no: "No", unknown: "Unchecked", "": "Unchecked" },
  rtLong: { yes: "Supported (the author says so)", "plugin-only": "Works: plugin only, no DLL", no: "Not supported", unknown: "Not checked yet", "": "Not checked yet" },
  dll: { yes: "Needs an F4SE DLL", no: "No DLL", "": "Not checked yet" },
  dllShort: { yes: "Needed", no: "None", "": "Unchecked" },
  pc: { safe: "Safe", breaks: "Breaks precombines", "prp-patch": "Needs the PRP patch (added for you)", "": "Not checked yet" },
  compat: { ok: "Works", patch: "Patch", conflict: "Conflict", "n/a": "Unrelated", "": "Unchecked" },
  compatLong: { ok: "Works", patch: "Needs a patch (added for you)", conflict: "Conflicts", "n/a": "Unrelated", "": "Unchecked" },
  scripts: { none: "No scripts", light: "Light scripts", heavy: "Script-heavy", "": "Not checked yet" },
  npcs: { none: "No NPCs", few: "A few NPCs", many: "Many NPCs", "": "Not checked yet" },
};
const lab = (map, v) => map[v ?? ""] ?? map[""] ?? v;
const endingLabel = v => !v || v === "none" ? "Leaves every ending open" : `Locks the ${FACTION[v] || v} ending`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function fmtDate(s, long) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ""); if (!m) return "";
  return long ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : `${MONTHS[+m[2] - 1]} ${m[1]}`;
}
const num = n => Number(n).toLocaleString("en");
const plural = (n, one, many) => `${num(n)} ${n === 1 ? one : (many || one + "s")}`;
const joinAnd = a => a.length <= 1 ? (a[0] || "") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];

// "perf" was rated on a base M3 Mac, "perf_pc" on a gaming PC (still being rated: empty means not rated).
const MACHINES = {
  mac: { label: "Apple Silicon Mac", short: "M3", col: "perf", on: "on a base M3 Mac" },
  pc: { label: "Gaming PC", short: "PC", col: "perf_pc", on: "on a gaming PC" },
};
const costOf = (m, mach = state.machine) => m[MACHINES[mach].col] || "";
const costLong = (v, mach = state.machine) => v ? `${LBL.perf[v]} cost ${MACHINES[mach].on}` : "Not rated yet";
// The old "our pick" mark and the old "pick" preset both meant this playthrough.
const LEGACY_PT = "mac-m3-minutemen";

const DEFAULT_TIERS = ["core", "recommended", "optional"];
const state = { q: "", section: "", sort: "section", profiles: new Set(), tiers: new Set(DEFAULT_TIERS), perf: "high", runtime: false, nodll: false, noend: false, pt: "", lunar: false, ss2: false, inlist: false, unrated: false, machine: "mac", chosen: new Set() };
const CHECKS = ["runtime", "lunar", "ss2", "nodll", "noend", "inlist"];
let MODS = [], BY = {}, NX = {}, PT = [], PTBY = {}, R = null, shown = [], loaded = false;
let effCache = new Map();
let openId = null;
const $ = id => document.getElementById(id);

function parseCSV(text) {
  const rows = []; let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const head = rows.shift();
  return rows.filter(r => r.length === head.length).map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}
const list = s => (s || "").split(";").filter(Boolean);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nexusUrl = m => m.nexus_id ? `https://www.nexusmods.com/fallout4/mods/${m.nexus_id}` : "";
const sizeOf = m => (NX[m.nexus_id]?.main_files?.[0]?.size_bytes) || 0;
const fmtSize = b => b >= 1e9 ? (b / 1e9).toFixed(1) + " GB" : b >= 1e6 ? Math.round(b / 1e6) + " MB" : b ? Math.round(b / 1e3) + " KB" : "";

/* ---------- Resolver ---------- */
function resolve(chosenSet = state.chosen) {
  const chosen = new Set(chosenSet), auto = new Set();
  const addReq = id => list(BY[id]?.requires).forEach(r => { if (BY[r] && !chosen.has(r) && !auto.has(r)) { auto.add(r); addReq(r); } });
  [...chosen].forEach(addReq);
  const all = new Set([...chosen, ...auto]);
  const patches = new Set();
  all.forEach(id => list(BY[id]?.patches).forEach(p => {
    const pm = BY[p]; if (!pm || all.has(p)) return;
    // A patch row is useful when every mod it requires is in the list.
    if (list(pm.requires).every(r => all.has(r))) patches.add(p);
  }));
  patches.forEach(p => all.add(p));
  // Conflicts are reported once per pair, whichever side declares them.
  const conflicts = [], seen = new Set();
  all.forEach(id => list(BY[id]?.conflicts).forEach(c => {
    if (!all.has(c) || c === id) return;
    const [a, b] = id < c ? [id, c] : [c, id], k = a + "|" + b;
    if (!seen.has(k)) { seen.add(k); conflicts.push([a, b]); }
  }));
  return { chosen, auto, patches, all, conflicts };
}
const stOf = id => R.chosen.has(id) ? "on" : R.all.has(id) ? "auto" : "off";
function reqClosure(id) {
  const out = new Set();
  const walk = x => list(BY[x]?.requires).forEach(r => { if (BY[r] && !out.has(r)) { out.add(r); walk(r); } });
  walk(id); return out;
}
function neededBy(id) { return [...R.all].filter(x => list(BY[x]?.requires).includes(id)); }
function whyAuto(id) {
  if (R.patches.has(id)) { const masters = list(BY[id].requires).filter(x => BY[x]); return { kind: "patch", names: masters.map(x => BY[x].name) }; }
  return { kind: "req", names: neededBy(id).map(x => BY[x].name) };
}
function effectOf(id) {
  if (effCache.has(id)) return effCache.get(id);
  let out = { html: "", sr: "" };
  if (!R.all.has(id)) {
    const nr = resolve(new Set([...state.chosen, id]));
    const reqs = [], pats = [];
    nr.all.forEach(x => { if (x !== id && !R.all.has(x)) (nr.patches.has(x) ? pats : reqs).push(x); });
    const confl = [];
    nr.conflicts.forEach(([a, b]) => {
      const aIn = R.all.has(a), bIn = R.all.has(b);
      if (aIn !== bIn) { const other = aIn ? a : b; if (!confl.includes(other)) confl.push(other); }
    });
    const items = [];
    if (reqs.length && reqs.length <= 2) items.push(...reqs.map(x => BY[x].name));
    else if (reqs.length) items.push(plural(reqs.length, "requirement"));
    if (pats.length) items.push(plural(pats.length, "patch", "patches"));
    const brings = items.length ? `Adding it brings ${esc(joinAnd(items))}.` : "";
    const names = confl.map(x => BY[x].name);
    const cText = confl.length ? `Conflicts with ${joinAnd(names)}, which ${confl.length > 1 ? "are" : "is"} in your list.` : "";
    out = {
      html: (cText ? `<span class="bad">${esc(cText)}</span>` : "") + (cText && brings ? " " : "") + brings,
      sr: [items.length ? `Brings ${joinAnd(items)}.` : "", cText].filter(Boolean).join(" "),
      brings: items.length ? `Brings ${joinAnd(items)}.` : "",
    };
  }
  effCache.set(id, out); return out;
}

/* ---------- Filtering ---------- */
function passes(m, skip = "") {
  if (skip !== "tier" && !state.tiers.has(m.tier)) return false;
  if (state.profiles.size && !m.prof.some(p => p === "all" || state.profiles.has(p))) return false;
  if (state.perf !== "high") {
    const c = costOf(m);
    if (c) { if (PERF.indexOf(c) > PERF.indexOf(state.perf)) return false; }
    else if (skip !== "unrated" && !state.unrated) return false;
  }
  if (state.runtime && !["yes", "plugin-only"].includes(m.runtime_1_11_240)) return false;
  if (state.lunar && m.lunar === "conflict") return false;
  if (state.ss2 && m.ss2 === "conflict") return false;
  if (state.nodll && m.f4se_dll === "yes") return false;
  if (state.noend && m.ending_lock && m.ending_lock !== "none") return false;
  if (state.pt && !m.pts.includes(state.pt)) return false;
  if (state.inlist && !R.all.has(m.id)) return false;
  if (state.section && m.module !== state.section) return false;
  if (state.q && !m.hay.includes(state.q)) return false;
  return true;
}
function filterCount() {
  let n = 0;
  if (state.profiles.size) n++;
  if (state.tiers.size !== DEFAULT_TIERS.length || DEFAULT_TIERS.some(t => !state.tiers.has(t))) n++;
  if (state.perf !== "high") n++;
  if (state.pt) n++;
  if (state.section) n++;
  CHECKS.forEach(k => { if (state[k]) n++; });
  return n;
}

function plugShape(m) {
  if (m.load_group === "0") return "No plugin";
  if (m.plugins_full === "") return '<i class="hatchsw" aria-hidden="true"></i>Plugins not counted';
  const f = +m.plugins_full || 0, l = +m.plugins_light || 0;
  if (!f && !l) return "No plugin";
  const p = [];
  if (f) p.push(plural(f, "plugin"));
  if (l) p.push(plural(l, "light plugin"));
  return p.join(", ");
}
function avoidWhy(m) {
  const c = list(m.notes).map(s => s.trim()).find(s => !/^(v?\d|\(|unknown|frozen|abandoned)/i.test(s));
  return c ? c.replace(/\.$/, "") : "";
}
function watchItems(m) {
  const w = [];
  if (m.f4se_dll === "yes") w.push(["needs an F4SE DLL", false]);
  if (m.precombines === "breaks") w.push(["breaks precombines", true]);
  if (m.precombines === "prp-patch") w.push(["PRP patch added for you", false]);
  if (m.ending_lock && m.ending_lock !== "none") w.push([`locks the ${FACTION[m.ending_lock] || m.ending_lock} ending`, true]);
  if (m.scripts === "heavy") w.push(["script-heavy", true]);
  return w;
}

const ORD = { perf: { low: 0, med: 1, high: 2 }, rt: { yes: 0, "plugin-only": 1, no: 2 }, dll: { no: 0, yes: 1 } };
function sortVal(m, k) {
  switch (k) {
    case "name": return m.name.toLowerCase();
    case "module": return m.mi;
    case "tier": return m.ti;
    case "perf": return ORD.perf[costOf(m)] ?? 9;
    case "rt": return ORD.rt[m.runtime_1_11_240] ?? 9;
    case "dll": return ORD.dll[m.f4se_dll] ?? 9;
    case "plugins": return m.load_group === "0" ? 0 : m.plugins_full === "" ? 999 : +m.plugins_full;
    case "updated": return NX[m.nexus_id]?.updated || "";
  }
  return "";
}

// Sort by the same key the load order groups by; unrecorded groups go last, in one block.
const groupRank = m => (m.load_group !== "" && m.load_group in LOAD_GROUPS) ? +m.load_group : 1000;
const groupLabel = g => LOAD_GROUPS[g] || (g ? "Group " + g : LOAD_GROUPS[""]);
function ordered(mods) { return [...mods].sort((a, b) => groupRank(a) - groupRank(b) || a.load_group.localeCompare(b.load_group) || a.name.localeCompare(b.name)); }

function canDrop(id) {
  if (state.chosen.has(id)) return true;
  return [...state.chosen].some(c => reqClosure(c).has(id));
}
function dropFor(id) {
  if (state.chosen.has(id)) return { drop: [id] };
  return { drop: [...state.chosen].filter(c => reqClosure(c).has(id)) };
}

// Presets: "pt:<playthrough id>", "core" or "clear". The old "pick" preset maps to the Mac playthrough.
const ptOf = p => p === "pick" ? LEGACY_PT : String(p).startsWith("pt:") ? p.slice(3) : "";
const ptIds = id => MODS.filter(m => m.pts.includes(id)).map(m => m.id);
const presetIds = p => { const pt = ptOf(p); return pt ? ptIds(pt) : p === "core" ? MODS.filter(m => m.tier === "core").map(m => m.id) : []; };

function toggle(id) {
  const m = BY[id]; if (!m) return;
  if (state.chosen.has(id)) {
    state.chosen.delete(id); listChanged();
    announce(`${m.name} removed.${R.all.has(id) ? " It stays in your list because another mod needs it." : ""}`);
  } else {
    const wasAuto = R.all.has(id), eff = effectOf(id);
    state.chosen.add(id); listChanged();
    announce(wasAuto ? `${m.name} kept in your list.` : `${m.name} added.${eff.sr ? " " + eff.sr : ""}`);
  }
}
let undoSet = null, noticeTimer = 0;
function setChosen(ids, msg, extra) {
  undoSet = new Set(state.chosen);
  state.chosen = new Set(ids);
  listChanged(true);
  showNotice(typeof msg === "function" ? msg() : msg, extra);
}

let noticeExtra = {};
function showNotice(text, extra = {}) {
  noticeExtra = extra;
  $("notice-text").textContent = text;
  noticeBtns(extra);
  $("notice").hidden = false;
  announce(text);
  armNoticeTimer();
}
function noticeBtns(extra = {}) {
  const onList = ui.tab === "mods" && ui.sub === "list";
  $("notice-btns").innerHTML = (undoSet ? `<button class="lnk" data-notice="undo">Undo</button>` : "") + (extra.showList && !onList ? `<button class="lnk" data-notice="view">View my list</button>` : "") + `<button class="lnk" data-notice="close">Dismiss</button>`;
}
function armNoticeTimer() {
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { if ($("notice").contains(document.activeElement)) armNoticeTimer(); else hideNotice(); }, 12000);
}
function hideNotice() {
  const n = $("notice"); if (n.hidden) return;
  const hadFocus = n.contains(document.activeElement);
  n.hidden = true; clearTimeout(noticeTimer);
  if (hadFocus) $("panel-" + ui.tab).focus({ preventScroll: true });
}
function applyPreset(p) {
  if (p === "clear") {
    const k = R.all.size;
    setChosen([], k ? `Cleared ${plural(k, "mod")} from your list.` : "Your list is empty. Tick mods to add them.");
    if (!k) { undoSet = null; noticeBtns(); }
    return;
  }
  const ptId = ptOf(p), pt = PTBY[ptId];
  if (ptId && !pt) { showNotice(`The playthrough "${ptId}" is not in the catalogue any more.`); return; }
  if (pt && !pt.n) { showNotice(`${pt.title} is ${pt.status === "planned" ? "planned: no mods are listed for it yet" : "empty for now"}. Your list was not changed.`); return; }
  setChosen(presetIds(p), () => {
    const added = R.all.size - R.chosen.size, more = added ? `, plus ${num(added)} added for you` : "";
    return pt ? `Loaded ${pt.title}: ${plural(R.chosen.size, "mod")}${more}.${pt.status === "planned" ? " This playthrough is planned, not played yet: its list may still change." : ""}`
      : `Loaded the ${num(R.chosen.size)} core fixes${more}.`;
  }, { showList: !!pt });
}
function keepConflict(keep, drop) {
  const { drop: ids } = dropFor(drop);
  if (!ids.length) return;
  const names = ids.map(x => BY[x].name);
  const msg = ids.length === 1 && ids[0] === drop ? `Removed ${BY[drop].name} from your list.` : `Removed ${joinAnd(names)} from your list, because ${ids.length > 1 ? "they need" : "it needs"} ${BY[drop].name}.`;
  setChosen([...state.chosen].filter(x => !ids.includes(x)), msg);
}

function srcLabel(u, m) {
  let url; try { url = new URL(u); } catch { return u; }
  const host = url.hostname.replace(/^www\./, ""), parts = url.pathname.split("/").filter(Boolean);
  const words = s => decodeURIComponent(s).replace(/\.(md|html?)$/i, "").replace(/[-_]+/g, " ");
  if (host === "nexusmods.com") {
    const tab = url.searchParams.get("tab");
    if (parts[1] === "mods" && parts[2]) {
      if (tab) return `Nexus: ${tab}`;
      if (parts[2] === m.nexus_id) return "Nexus: mod page";
      const other = MODS.find(x => x.nexus_id === parts[2]);
      return other ? `Nexus: ${other.name}` : `Nexus: mod ${parts[2]}`;
    }
    if (parts[1] === "articles") return `Nexus: article ${parts[2] || ""}`.trim();
    return "Nexus: " + (parts.slice(1).join("/") || "home");
  }
  if (host === "reddit.com") return parts[0] === "r" && parts[1] ? `reddit.com/r/${parts[1]}` : "reddit.com";
  if (host === "github.com") {
    const i = parts.indexOf("issues"), p = parts.indexOf("pull");
    if (i > 0 && parts[i + 1]) return `GitHub: issue ${parts[i + 1]}`;
    if (p > 0 && parts[p + 1]) return `GitHub: pull request ${parts[p + 1]}`;
    return `GitHub: ${parts[1] || parts[0] || ""}${parts.length > 2 ? ", " + words(parts[parts.length - 1]) : ""}`;
  }
  if (host === "raw.githubusercontent.com" && parts[0] === "wabbajack-tools") { const r = parts.indexOf("reports"); return `Wabbajack: ${words(parts[r + 2] || parts[r + 1] || "report")} report`; }
  if (host === "wiki.simsettlements2.com") return `Sim Settlements 2 wiki: ${words(parts[parts.length - 1] || "home")}`;
  if (host === "stepmodifications.org") return `STEP: ${words(parts[parts.length - 1] || "wiki").replace(/^Fallout4:/, "")}`;
  return parts.length ? `${host}: ${words(parts[parts.length - 1])}` : host;
}

function detailEffect(id) {
  const st = stOf(id), m = BY[id];
  if (st === "on") { const nb = neededBy(id).filter(x => x !== id); return nb.length ? `In your list. ${esc(joinAnd(nb.map(x => BY[x].name)))} also ${nb.length > 1 ? "need" : "needs"} it.` : "In your list, picked by you."; }
  if (st === "auto") { const w = whyAuto(id); return w.names.length ? `Added for you ${w.kind === "patch" ? "as a patch for" : "because"} ${esc(joinAnd(w.names))}${w.kind === "patch" ? "" : (w.names.length > 1 ? " need it" : " needs it")}.` : "Added for you."; }
  const e = effectOf(id);
  return (e.html.includes("bad") ? e.html.replace("Adding it brings", "It brings") : e.html.replace("Adding it brings", "Brings")) || `${esc(m.name)} brings nothing else with it.`;
}
function ptDetail(m) {
  const ps = m.pts.map(id => PTBY[id]).filter(Boolean);
  if (!ps.length) return `<p class="d-nx">Not in any of our playthroughs.</p>`;
  return `<ul class="d-pt">${ps.map(p => `<li>${p.doc ? `<a href="${esc(p.doc)}" rel="noopener">${esc(p.title)}</a>` : `<b>${esc(p.title)}</b>`}<small>${p.status === "planned" ? "Planned, not played yet" : "Played"}. ${esc(p.machine)}</small></li>`).join("")}</ul>`;
}
const isStamp = s => /^(v?\d[\w.]*(\s*\(\d{4}(-\d{2}){0,2}\))?|\d{4}(-\d{2}){1,2})(\s*$|[,:]\s*)/i.test(s);

const parseList = v => (v || "").split(",").map(x => x.trim()).filter(Boolean);
const missingNote = ids => `${plural(ids.length, "mod")} from this link ${ids.length > 1 ? "are" : "is"} no longer in the catalogue: ${ids.join(", ")}.`;
// Old links: "#preset=pick", "#start=pick" or "#list=pick" loaded our playthrough; "#pick" or "#filter=pick" filtered on it.
function hashPreset(hp) {
  const v = hp.get("preset") || hp.get("start") || (parseList(hp.get("list")).join(",") === "pick" && !BY.pick ? "pick" : "");
  return v === "pick" || v === "core" || v === "clear" ? v : PTBY[v] ? "pt:" + v : String(v).startsWith("pt:") && PTBY[v.slice(3)] ? v : "";
}
function hashFilter(hp) {
  if (hp.has("pick") && !/^(0|no|false)$/i.test(hp.get("pick"))) return LEGACY_PT;
  if (hp.get("filter") === "pick" || hp.get("only") === "pick") return LEGACY_PT;
  const pt = hp.get("pt") || hp.get("playthrough");
  return PTBY[pt] ? pt : "";
}

function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function flash(btn, text) {
  const orig = btn.dataset.label || (btn.dataset.label = btn.textContent);
  btn.textContent = text; clearTimeout(btn._t);
  btn._t = setTimeout(() => btn.textContent = orig, 2000);
}
const shareUrl = () => location.origin + location.pathname + location.search + (state.chosen.size || state.machine !== "mac" ? "#" + [state.machine !== "mac" ? "machine=" + state.machine : "", state.chosen.size ? "list=" + [...state.chosen].join(",") : ""].filter(Boolean).join("&") : "");

/* ---------- S.P.E.C.I.A.L. sheet ---------- */
// Deterministic: the same answers always give the same list, built from the catalogue's own columns.
const SS2_ID = "sim-settlements-2", LUNAR_ID = "lunar";
const SP_MACHINES = {
  "mac-base": { title: "Base Apple Silicon Mac", text: "M1, M2 or M3 with the base chip, like the MacBook Air the catalogue was rated on. Low-cost mods only.", col: "perf", max: "low", site: "mac" },
  "mac-pro": { title: "Mac with a Pro or Max chip, or a newer generation", text: "Low and medium-cost mods, judged from the base M3 ratings.", col: "perf", max: "med", site: "mac" },
  "pc-mid": { title: "Mid-range gaming PC", text: "Low and medium-cost mods. PC costs are still being rated, and mods not rated for a PC yet are left out.", col: "perf_pc", max: "med", site: "pc" },
  "pc-high": { title: "High-end gaming PC", text: "Close to the PC the ratings are made on (Ryzen 7 9800X3D, RTX 5070 Ti). Any cost. Mods not rated for a PC yet are included and counted.", col: "perf_pc", max: "high", site: "pc", unrated: true },
};
const SP_ENDINGS = {
  open: ["Keep every ending open", "Leaves out every mod that forces or assumes an ending. Mods for every faction are welcome; raider mods only if you tick the box below."],
  minutemen: ["Minutemen", "Mods for the Minutemen and for any playthrough. Leaves out mods that lock another faction's ending."],
  bos: ["Brotherhood of Steel", "Mods for the Brotherhood and for any playthrough. Leaves out mods that lock another faction's ending."],
  railroad: ["Railroad", "Mods for the Railroad and for any playthrough. Leaves out mods that lock another faction's ending."],
  institute: ["Institute", "Mods for the Institute and for any playthrough. Leaves out mods that lock another faction's ending."],
};
const SPECIAL = [
  { k: "S", name: "Strength", title: "Combat and gear", modules: ["gameplay", "weapons-armor"], text: "Weapons, armor, enemies and how fights play out." },
  { k: "P", name: "Perception", title: "Visuals", modules: ["visuals"], text: "Textures, lighting, shaders and distant detail. The mods that cost your machine the most." },
  { k: "E", name: "Endurance", title: "Immersion", modules: ["immersion", "interface"], text: "Survival needs, small touches of realism and a cleaner interface." },
  { k: "C", name: "Charisma", title: "Factions", modules: ["minutemen", "brotherhood", "institute", "railroad", "factions", "raiders"], text: "More quests, troops and depth for the factions your ending welcomes." },
  { k: "I", name: "Intelligence", title: "Settlements", modules: ["settlements"], text: "Building, settlers and running towns." },
  { k: "A", name: "Agility", title: "Exploration and quests", modules: ["quests", "dlc"], text: "New places to explore, new quests and more from the DLC." },
  { k: "L", name: "Luck", title: "Companions", modules: ["companions"], text: "Who walks the wasteland with you, and how they behave." },
];
const SP_BUDGET = 35, SP_MIN = 1, SP_MAX = 10;
// Base and stability belong to no interest: they always get the medium level (core plus recommended fixes).
const SP_FOUNDATION = ["base", "stability"];
const SP_STEPS = ["Machine", "Ending", "Frameworks", "S.P.E.C.I.A.L.", "Your list"];
const spDefault = () => ({ machine: state.machine === "pc" ? "pc-mid" : "mac-base", ending: "open", raiders: false, lunar: true, ss2: true, pts: Object.fromEntries(SPECIAL.map(a => [a.k, 4])) });
let SP = spDefault(), spStep = 0, spResult = null;
const spSpent = a => SPECIAL.reduce((s, x) => s + a.pts[x.k], 0);

// Hash form: sheet=pc-high.minutemen.lunar.no-ss2.raiders.S6P8E5C5I6A3L2
function encodeSheet(a) {
  return [a.machine, a.ending, a.lunar ? "lunar" : "no-lunar", a.ss2 ? "ss2" : "no-ss2", a.raiders ? "raiders" : "", SPECIAL.map(x => x.k + a.pts[x.k]).join("")].filter(Boolean).join(".");
}
function decodeSheet(str) {
  const a = spDefault(); let ok = true;
  String(str || "").split(/[.,]/).forEach(t => {
    if (SP_MACHINES[t]) a.machine = t;
    else if (SP_ENDINGS[t]) a.ending = t;
    else if (t === "lunar" || t === "no-lunar") a.lunar = t === "lunar";
    else if (t === "ss2" || t === "no-ss2") a.ss2 = t === "ss2";
    else if (t === "raiders") a.raiders = true;
    else if (/^([SPECIAL]\d{1,2})+$/.test(t)) t.replace(/([SPECIAL])(\d{1,2})/g, (_, k, v) => { a.pts[k] = Math.min(SP_MAX, Math.max(SP_MIN, +v)); });
  });
  if (spSpent(a) > SP_BUDGET) { a.pts = spDefault().pts; ok = false; }
  return { ans: a, ok };
}

// Why a mod was left out, as [one, many] so the verb agrees with the count.
const SP_LEFT = {
  runtime: () => ["does not run on 1.11.240", "do not run on 1.11.240"],
  ending: () => ["locks a faction ending you did not choose", "lock a faction ending you did not choose"],
  profile: a => a.ending === "open" ? ["is made for a raider playthrough (tick the raider box to welcome it)", "are made for a raider playthrough (tick the raider box to welcome them)"] : ["is made for another faction's playthrough", "are made for another faction's playthrough"],
  lunar: () => ["conflicts with Lunar", "conflict with Lunar"],
  nolunar: () => ["needs Lunar", "need Lunar"],
  ss2: () => ["conflicts with Sim Settlements 2", "conflict with Sim Settlements 2"],
  noss2: () => ["needs Sim Settlements 2", "need Sim Settlements 2"],
  cost: () => ["costs more than your machine allows", "cost more than your machine allows"],
  unrated: () => ["has no cost rating for your machine yet", "have no cost rating for your machine yet"],
  requirement: () => ["needs a mod your answers leave out", "need a mod your answers leave out"],
};
const endorse = id => NX[BY[id]?.nexus_id]?.endorsements || 0;
const inPt = m => m.pts.some(id => PTBY[id]);
// Which mod of a conflicting pair stays: the one the list must have, then the higher tier, then playthrough membership, then Nexus endorsements.
function rankPair(x, y, forced) {
  const A = BY[x], B = BY[y], keep = (w, l, why) => [w, l, why];
  if (forced.has(x) !== forced.has(y)) { const w = forced.has(x) ? x : y; return keep(w, w === x ? y : x, BY[w].tier === "core" ? "it is a core fix" : "you asked for it"); }
  if (A.ti !== B.ti) { const w = A.ti < B.ti ? x : y, l = w === x ? y : x; return keep(w, l, `it has the higher tier (${TIER_LABEL[BY[w].tier].toLowerCase()} against ${TIER_LABEL[BY[l].tier].toLowerCase()})`); }
  if (inPt(A) !== inPt(B)) { const w = inPt(A) ? x : y; return keep(w, w === x ? y : x, "it is in a ready-made playthrough"); }
  const ea = endorse(x), eb = endorse(y);
  if (ea !== eb) { const w = ea > eb ? x : y; return keep(w, w === x ? y : x, `it has more endorsements on Nexus (${num(Math.max(ea, eb))} against ${num(Math.min(ea, eb))})`); }
  return x < y ? keep(x, y, "it is a tie, settled by name") : keep(y, x, "it is a tie, settled by name");
}
function buildSheet(a, quick) {
  const mc = SP_MACHINES[a.machine] || SP_MACHINES["mac-base"], maxI = PERF.indexOf(mc.max);
  const welcome = new Set(["all"]);
  if (a.ending === "open") ["bos", "minutemen", "institute", "railroad", "neutral"].forEach(p => welcome.add(p)); else welcome.add(a.ending);
  if (a.raiders) welcome.add("raider");
  // Forced: every core row, plus Lunar and SS2 when asked for. Their own requirements are allowed whatever they cost.
  const forced = new Set(MODS.filter(m => m.tier === "core").map(m => m.id));
  if (a.lunar && BY[LUNAR_ID]) forced.add(LUNAR_ID);
  if (a.ss2 && BY[SS2_ID]) forced.add(SS2_ID);
  const safe = new Set(forced); forced.forEach(id => reqClosure(id).forEach(x => safe.add(x)));
  const memo = new Map();
  const rule = m => {
    if (memo.has(m.id)) return memo.get(m.id);
    memo.set(m.id, "");
    const needs = reqClosure(m.id), lock = m.ending_lock && m.ending_lock !== "none" ? m.ending_lock : "";
    let why = "";
    if (m.tier === "avoid") why = "avoid";
    else if (m.runtime_1_11_240 === "no") why = "runtime";
    else if (lock && (a.ending === "open" || lock !== a.ending)) why = "ending";
    else if (!(m.prof.length ? m.prof : ["all"]).some(p => welcome.has(p))) why = "profile";
    else if (a.lunar && m.lunar === "conflict") why = "lunar";
    else if (!a.lunar && (m.id === LUNAR_ID || needs.has(LUNAR_ID))) why = "nolunar";
    else if (a.ss2 && m.ss2 === "conflict") why = "ss2";
    else if (!a.ss2 && (m.id === SS2_ID || needs.has(SS2_ID))) why = "noss2";
    else { const c = m[mc.col]; if (!c) { if (!mc.unrated) why = "unrated"; } else if (PERF.indexOf(c) > maxI) why = "cost"; }
    if (!why && [...needs].some(x => BY[x] && !safe.has(x) && rule(BY[x]))) why = "requirement";
    memo.set(m.id, why); return why;
  };
  const level = {}, attrOf = {};
  SPECIAL.forEach(s => s.modules.forEach(k => { level[k] = a.pts[s.k]; attrOf[k] = s.k; }));
  SP_FOUNDATION.forEach(k => level[k] = 5);
  const wants = m => { const v = level[m.module] || 0; return m.tier === "recommended" ? v >= 4 : m.tier === "optional" ? v >= 7 && inPt(m) : false; };
  const chosen = new Set(forced), left = {}, perAttr = {};
  MODS.forEach(m => {
    if (forced.has(m.id) || !wants(m)) return;
    const why = rule(m);
    if (why) (left[why] = left[why] || []).push(m.id);
    else { chosen.add(m.id); const k = attrOf[m.module]; if (k) perAttr[k] = (perAttr[k] || 0) + 1; }
  });
  if (quick) return { perAttr };
  // Conflicts: drop the losing side (or the picks that bring it in) until none is left.
  const dropped = [], stuck = [], skip = new Set();
  const bring = id => chosen.has(id) ? [id] : [...chosen].filter(c => reqClosure(c).has(id));
  let r = resolve(chosen);
  for (let guard = 0; guard < 1000; guard++) {
    const pair = [...r.conflicts].sort((p, q) => (p[0] + "|" + p[1]).localeCompare(q[0] + "|" + q[1])).find(p => !skip.has(p.join("|")));
    if (!pair) break;
    let [win, lose, why] = rankPair(pair[0], pair[1], forced);
    let ids = bring(lose).filter(x => !forced.has(x));
    if (!ids.length) { ids = bring(win).filter(x => !forced.has(x)); if (ids.length) { [win, lose] = [lose, win]; why = "the other one could not be taken out"; } }
    if (!ids.length) { skip.add(pair.join("|")); stuck.push(pair); continue; }
    ids.forEach(x => chosen.delete(x));
    dropped.push({ ids, lose, win, why });
    r = resolve(chosen);
  }
  const mods = [...r.all].map(id => BY[id]).filter(Boolean);
  const est = mods.filter(m => m.plugins_full === "" && m.load_group !== "0").length;
  const near = PT.filter(p => p.n).map(p => {
    const all = resolve(new Set(ptIds(p.id))).all; let o = 0; all.forEach(id => { if (r.all.has(id)) o++; });
    return { p, o, size: all.size };
  }).sort((u, v) => v.o - u.o)[0] || null;
  return {
    answers: a, mc, forced, chosen, r, dropped, stuck: stuck.filter(([x, y]) => r.all.has(x) && r.all.has(y)), left, perAttr, near,
    full: mods.reduce((s, m) => s + (+m.plugins_full || 0), 0), light: mods.reduce((s, m) => s + (+m.plugins_light || 0), 0), est,
    unknownRt: mods.filter(m => !m.runtime_1_11_240 || m.runtime_1_11_240 === "unknown").length,
    breaks: mods.filter(m => m.precombines === "breaks").length,
    unrated: mods.filter(m => !m[mc.col]).length,
    over: mods.filter(m => m[mc.col] && PERF.indexOf(m[mc.col]) > maxI).map(m => m.id),
  };
}

function spBand(x, counts) {
  const v = SP.pts[x.k];
  if (!MODS.some(m => x.modules.includes(m.module) && m.tier !== "avoid" && m.tier !== "core")) return "No mods in these sections of the catalogue yet.";
  if (v <= 3) return "Adds nothing beyond the core fixes.";
  const n = counts[x.k] || 0;
  if (!n) return "Nothing here fits your other answers.";
  return v <= 6 ? `Adds ${plural(n, "recommended mod")}.` : `Adds ${plural(n, "mod")}: recommended, plus optional ones from our playthroughs.`;
}

function setupPlaythroughs(raw) {
  PT = (Array.isArray(raw) ? raw : []).filter(p => p && p.id).map(p => ({ id: String(p.id), title: p.title || p.id, machine: p.machine || "", summary: p.summary || "", doc: p.doc || "", status: p.status === "planned" ? "planned" : "played" }));
  // Ids used in the CSV but missing from playthroughs.json still get a mark.
  const known = new Set(PT.map(p => p.id));
  MODS.forEach(m => m.pts.forEach(id => { if (!known.has(id)) { known.add(id); PT.push({ id, title: id, machine: "", summary: "", doc: "", status: "played" }); } }));
  PTBY = Object.fromEntries(PT.map(p => [p.id, p]));
  PT.forEach(p => { p.kind = /\b(mac|apple|m[1-9])\b/i.test(p.machine + " " + p.id) ? "Mac" : "PC"; p.n = ptIds(p.id).length; });
  PT.forEach(p => { p.short = PT.filter(q => q.kind === p.kind).length === 1 ? `${p.kind} playthrough` : p.title; });
}


/* =====================================================================
   The Pip-Boy shell: tabs, inventory, holotapes, status bar.
   Everything above this line is the catalogue's own logic.
   ===================================================================== */
const ui = { tab: "stat", sub: "cat", sel: null };
const TABS = ["stat", "mods", "tapes", "about"];
const mqMob = matchMedia("(max-width: 759px)");
// Scroll a horizontal strip (tabs, steps) so the current item is centred, without moving anything else.
// The strip starts on a whole item (32 px in, clear of the edge fade) and the current item is fully shown.
function revealInline(el, strip) {
  if (!el || !strip) return;
  if (strip.scrollWidth > strip.clientWidth) {
    const c = strip.getBoundingClientRect(), pos = x => x.getBoundingClientRect().left - c.left + strip.scrollLeft;
    const aRight = pos(el) + el.offsetWidth, items = [...el.parentElement.children].filter(x => x.offsetWidth);
    const start = items.map(pos).find(x => x >= aRight + 32 - strip.clientWidth) ?? pos(el);
    strip.scrollLeft = Math.max(0, Math.min(start, pos(el)) - 32);
  }
  updateFades();
}
// Fades show that a strip or a panel has more to scroll to.
function updateFades() {
  document.querySelectorAll(".scroll, .subtabs, .tabbar").forEach(el => {
    if (!el.offsetParent) return;
    const v = el.scrollHeight - el.clientHeight > 4, h = el.scrollWidth - el.clientWidth > 4;
    el.classList.toggle("fade-b", v && el.scrollTop + el.clientHeight < el.scrollHeight - 4);
    el.classList.toggle("fade-l", h && el.scrollLeft > 4);
    el.classList.toggle("fade-r", h && el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  });
}
let fadeRaf = 0;
const queueFades = () => { cancelAnimationFrame(fadeRaf); fadeRaf = requestAnimationFrame(updateFades); };
document.addEventListener("scroll", queueFades, true);
window.addEventListener("resize", queueFades);
new MutationObserver(queueFades).observe(document.getElementById("screen"), { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "class"] });
const svg = d => `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">${d}</svg>`;
const ICON = { x: svg('<path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/>'), back: svg('<path d="M10 3L5 8l5 5"/>'), ext: svg('<path d="M6 3h7v7M13 3L4 12"/>') };
function announce(t) { const s = $("sr-status"); s.textContent = ""; requestAnimationFrame(() => s.textContent = t); }
const storedTab = () => { try { const v = localStorage.getItem("sml-tab"); return ["stat", "mods", "list", "tapes", "about"].includes(v) ? v : "stat"; } catch { return "stat"; } };

/* ---------- Phosphor colour ---------- */
const PHOS = { green: ["Green", "#1bff80", "#03140a"], amber: ["Amber", "#ffb642", "#140c02"], blue: ["Blue", "#5ec8ff", "#020c14"], white: ["White", "#f2f2f2", "#0b0c0c"] };
function setPhosphor(v, quiet) {
  if (!PHOS[v]) v = "green";
  document.documentElement.dataset.phosphor = v;
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = PHOS[v][2];
  try { localStorage.setItem("sml-phosphor", v); } catch {}
  if (!quiet) announce(`Screen colour: ${PHOS[v][0].toLowerCase()}.`);
}
function setupPhosphor() {
  const cur = PHOS[document.documentElement.dataset.phosphor] ? document.documentElement.dataset.phosphor : "green";
  $("phosphor").innerHTML = `<legend class="lbl">Colour</legend>` + Object.entries(PHOS).map(([k, [n, ink]]) => `<label class="opt radio"><input type="radio" name="phosphor" value="${k}"${k === cur ? " checked" : ""}><span class="sw" style="background:${ink};border-color:${ink}" aria-hidden="true"></span><span>${n}${k === "green" ? " (default)" : ""}</span></label>`).join("");
  $("phosphor").addEventListener("change", e => { if (e.target.name === "phosphor") setPhosphor(e.target.value); });
}

/* ---------- Tabs ---------- */
function setTab(t, o = {}) {
  if (!TABS.includes(t)) t = "stat";
  const changed = t !== ui.tab;
  ui.tab = t;
  TABS.forEach(k => { const on = k === t, b = $("tab-" + k); b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; $("panel-" + k).hidden = !on; });
  if (o.sub) setSub(o.sub, { silent: true });
  if (t !== "mods") closePanel(false);
  revealInline($("tab-" + t), document.querySelector(".tabbar"));
  if (changed) { FX.refresh(); placeTabline(); if (mqMob.matches) hideNotice(); }
  // The strip was hidden until now: it appears in place, it slides only between its own items.
  centreStrip(t === "stat" ? $("sp-steps") : t === "mods" ? $("subtabs") : null, true);
  if (t === "mods" && ui.sub === "cat") requestAnimationFrame(() => FX.bar($("inv"), selRow(), true));
  if (t === "stat") requestAnimationFrame(() => FX.bar($("sp-attrs"), $("sp-r-" + spSel), true));
  rememberTab(); syncStatus(); writeHash();
  if (!$("notice").hidden) noticeBtns(noticeExtra);
  if (o.focus) focusIn(t);
}
function setSub(s, o = {}) {
  const changed = (s === "list" ? "list" : "cat") !== ui.sub;
  ui.sub = s === "list" ? "list" : "cat";
  [["cat", "subtab-cat", "sub-cat"], ["list", "subtab-list", "sub-list"]].forEach(([k, b, p]) => { const on = k === ui.sub; $(b).setAttribute("aria-selected", on); $(b).tabIndex = on ? 0 : -1; $(p).hidden = !on; });
  if (ui.sub === "list") closePanel(false);
  centreStrip($("subtabs"), !changed || o.silent);
  if (ui.sub === "cat") requestAnimationFrame(() => FX.bar($("inv"), selRow(), true));
  if (changed && !o.silent) { FX.refresh(); if (mqMob.matches) hideNotice(); }
  if (!o.silent) { rememberTab(); syncStatus(); writeHash(); if (!$("notice").hidden) noticeBtns(noticeExtra); }
}
// The outline around the current tab and the line under the others: five thin pieces, transform only.
function placeTabline(instant) {
  const line = $("tabline"), a = document.querySelector('.tab[aria-selected="true"]');
  if (!line || !a || !line.offsetWidth) return;
  const L = line.getBoundingClientRect(), r = a.getBoundingClientRect(), W = L.width;
  const x0 = Math.round(r.left - L.left), x1 = Math.round(r.right - L.left);
  const jump = instant || !FX.moving();
  line.classList.toggle("instant", jump);
  const set = (c, t) => { line.querySelector(c).style.transform = t; };
  set(".tl-a", `scaleX(${x0 / W})`);
  set(".tl-b", `scaleX(${(W - x1) / W})`);
  set(".br-l", `translateX(${x0}px)`);
  set(".br-r", `translateX(${x1 - 2}px)`);
  set(".br-t", `translateX(${x0}px) scaleX(${(x1 - x0) / 100})`);
  if (jump) { void line.offsetWidth; line.classList.remove("instant"); }
}
// Sub-tabs slide so the current one sits in the centre, as in the game. A focused item is brought in view too.
function centreStrip(strip, instant, on) {
  if (!strip || !strip.offsetWidth) return;
  const track = strip.querySelector(".subtrack"), a = on || strip.querySelector('[aria-current="step"], [aria-selected="true"]');
  if (!track || !a) return;
  const jump = instant || !FX.moving();
  track.classList.toggle("instant", jump);
  track.style.transform = `translateX(${Math.round(strip.clientWidth / 2 - (a.offsetLeft + a.offsetWidth / 2))}px)`;
  if (jump) { void track.offsetWidth; track.classList.remove("instant"); }
}
["sp-steps", "subtabs"].forEach(id => {
  const strip = $(id);
  strip.addEventListener("focusin", e => { if (e.target.closest(".subtab")) centreStrip(strip, false, e.target.closest(".subtab")); });
  strip.addEventListener("focusout", () => setTimeout(() => { if (!strip.contains(document.activeElement)) centreStrip(strip); }));
});
function relayout() { placeTabline(true); centreStrip($("sp-steps"), true); centreStrip($("subtabs"), true); FX.bar($("inv"), selRow(), true); FX.bar($("sp-attrs"), $("sp-r-" + spSel), true); }
window.addEventListener("resize", () => { cancelAnimationFrame(relayout.raf); relayout.raf = requestAnimationFrame(relayout); });
window.addEventListener("fxchange", relayout);
if (document.fonts) document.fonts.ready.then(relayout);
function rememberTab() { try { localStorage.setItem("sml-tab", ui.tab === "mods" ? (ui.sub === "list" ? "list" : "mods") : ui.tab); } catch {} }
function focusIn(t) {
  const target = t === "stat" ? $("sp-h") : t === "mods" ? (ui.sub === "list" ? $("lo-h") : $("q")) : t === "tapes" ? $("tapes-h") : $("about-h");
  (target || $("panel-" + t)).focus({ preventScroll: true });
}
function goTo(g) {
  if (g === "list") setTab("mods", { sub: "list", focus: true });
  else if (g === "mods") setTab("mods", { sub: "cat", focus: true });
  else setTab(g, { focus: true });
}
// Arrow keys move between tabs and select them (automatic activation).
function tablistKeys(el, activate) {
  el.addEventListener("keydown", e => {
    const items = [...el.querySelectorAll('[role="tab"]')], i = items.indexOf(document.activeElement);
    if (i < 0) return;
    const n = items.length, j = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (j === undefined) return;
    e.preventDefault(); items[j].focus(); activate(items[j]);
  });
  el.addEventListener("click", e => { const b = e.target.closest('[role="tab"]'); if (b) activate(b); });
}

/* ---------- Hash ---------- */
let lastWrittenHash = null, spTouched = false;
function writeHash() {
  if (!loaded) return;
  const p = [];
  if (state.machine !== "mac") p.push("machine=" + state.machine);
  if (state.chosen.size) p.push("list=" + [...state.chosen].join(","));
  if (ui.tab === "stat") {
    if (spTouched || encodeSheet(SP) !== encodeSheet(spDefault())) { p.push("sheet=" + encodeSheet(SP)); if (spStep < SP_STEPS.length - 1) p.push("step=" + spStep); }
  } else if (ui.tab === "mods" && ui.sub === "cat" && openId) p.push("mod=" + openId);
  else p.push("tab=" + (ui.tab === "mods" ? (ui.sub === "list" ? "list" : "mods") : ui.tab === "tapes" ? "playthroughs" : ui.tab));
  history.replaceState(null, "", p.length ? "#" + p.join("&") : location.pathname + location.search);
  lastWrittenHash = location.hash;
}
const TAB_PARAM = { stat: ["stat"], mods: ["mods", "cat"], list: ["mods", "list"], playthroughs: ["tapes"], tapes: ["tapes"], about: ["about"] };
// On first load, machine, filter and list are already applied (see load); this handles the rest.
function readHash(hp, first, missing = []) {
  if (!first) {
    const mach = hp.get("machine") || "mac";
    if (MACHINES[mach]) setMachine(mach, true);
    const f = hashFilter(hp);
    if (f && f !== state.pt) { state.pt = f; syncFilterUI(); render({ quiet: true }); }
  }
  let dest = null;
  const preset = hashPreset(hp);
  if (preset) { applyPreset(preset); dest = ["mods", "list"]; }
  else if (first) { if (missing.length) showNotice(missingNote(missing)); if (state.chosen.size) dest = ["mods", "list"]; }
  else if (hp.has("list")) {
    const raw = parseList(hp.get("list")), ids = raw.filter(id => BY[id]), miss = raw.filter(id => !BY[id]);
    const same = ids.length === state.chosen.size && ids.every(id => state.chosen.has(id));
    if (!same) setChosen(ids, `Loaded the list from the link: ${plural(ids.length, "mod")}.${miss.length ? " " + missingNote(miss) : ""}`);
    dest = ["mods", "list"];
  }
  if (hashFilter(hp)) dest = ["mods", "cat"];
  if (TAB_PARAM[hp.get("tab")]) dest = TAB_PARAM[hp.get("tab")];
  if (hp.has("sheet")) {
    const { ans, ok } = decodeSheet(hp.get("sheet"));
    SP = ans; spTouched = true; spResult = null;
    const st = hp.get("step");
    spStep = !ok ? 3 : /^[0-4]$/.test(st || "") ? +st : SP_STEPS.length - 1;
    setTab("stat"); spRender({ focus: !first });
    if (!ok) announce(`The points in this sheet add up to more than ${SP_BUDGET}, so they were reset.`);
    return;
  }
  const m = hp.get("mod");
  if (m && BY[m]) { setTab("mods", { sub: "cat" }); selectMod(m, { panel: true, focusDetail: !first }); return; }
  if (!dest && first) { const s = storedTab(); dest = TAB_PARAM[s === "tapes" ? "playthroughs" : s] || ["stat"]; }
  if (dest) setTab(dest[0], { sub: dest[1] }); else writeHash();
}
window.addEventListener("hashchange", () => {
  if (!loaded || location.hash === lastWrittenHash) return;
  readHash(new URLSearchParams(location.hash.slice(1)), false);
});

/* ---------- Status bar ---------- */
function listNumbers(r = R) {
  const mods = [...r.all].map(id => BY[id]).filter(Boolean);
  const full = mods.reduce((s, m) => s + (+m.plugins_full || 0), 0);
  const est = mods.filter(m => m.plugins_full === "" && m.load_group !== "0").length;
  return { mods, n: mods.length, full, est, over: full + est > 254 };
}
function statusAction() {
  const n = R.all.size;
  if (!loaded) return { id: "", label: "" };
  if (ui.tab === "stat") return spStep < 3 ? { id: "next", label: `Next: ${SP_STEPS[spStep + 1]}`, short: "Next" } : spStep === 3 ? { id: "next", label: "Build my list", short: "Build" } : { id: "use", label: "Use this list", short: "Use list" };
  if (ui.tab === "mods" && ui.sub === "list" && n) return { id: "csv", label: "Download CSV", short: "CSV" };
  return { id: "", label: "" };
}
function syncStatus() {
  // On STAT's last step the bar previews the proposed list until "Use this list" loads it.
  const pv = ui.tab === "stat" && spStep === SP_STEPS.length - 1 && spResult;
  const { n, full, est, over } = pv ? { n: pv.r.all.size, full: pv.full, est: pv.est, over: pv.full + pv.est > 254 } : listNumbers(), c = pv ? pv.stuck.length : R.conflicts.length;
  $("st-mods").classList.toggle("preview", !!pv);
  FX.roll($("st-n"), num(n));
  $("st-nl").textContent = pv ? "preview" : n === 1 ? "mod" : "mods";
  $("st-nl").nextElementSibling.textContent = pv ? " in the proposed list, not loaded yet" : " in your list";
  $("st-conf").hidden = !c; $("st-conf").textContent = c ? plural(c, "conflict") : "";
  FX.roll($("st-full"), num(full) + (est ? "+" : ""));
  $("st-bar").style.transform = `scaleX(${Math.min(1, (full + est) / 254)})`;
  $("st-plug").classList.toggle("bad", over);
  $("st-plug").setAttribute("aria-label", `Full plugins: ${num(full)}${est ? ` plus ${est} not counted` : ""} of 254${over ? ", over the limit" : ""}`);
  const a = statusAction(), b = $("st-action");
  b.innerHTML = a.id ? `<span class="lg">${esc(a.label)}</span><span class="sh" aria-hidden="true">${esc(a.short || a.label)}</span>` : "";
  b.dataset.act = a.id; b.disabled = !a.id; b.classList.toggle("vacant", !a.id); b.setAttribute("aria-hidden", String(!a.id));
  document.querySelector(".status").classList.toggle("has-action", !!a.id);
  $("sub-n").textContent = n ? `(${num(n)})` : "";
}
function runAction(id) {
  if (id === "next") spGo(spStep + 1);
  else if (id === "use") spUse();
  else if (id === "csv") exportCSV();
  else if (id) goTo(id);
}

/* ---------- Machine ---------- */
function syncMachineUI() {
  const mc = MACHINES[state.machine];
  document.querySelectorAll("[data-machine]").forEach(x => x.setAttribute("aria-pressed", x.dataset.machine === state.machine));
  $("perf-legend").textContent = `Cost ${mc.on}`;
  $("s-high-l").textContent = `High cost (${mc.short})`;
  const rated = MODS.filter(m => costOf(m)).length;
  $("perf-hint").textContent = state.machine === "pc"
    ? `Gaming PC costs are estimated, not measured yet: ${num(rated)} of ${num(MODS.length)} mods so far. Mods rated low on the M3 count as low here.`
    : `Measured on a base M3 MacBook Air (16 GB, under Wine): ${num(rated)} of ${num(MODS.length)} mods.`;
}
function setMachine(v, quiet) {
  if (!MACHINES[v] || v === state.machine) return;
  state.machine = v; syncMachineUI();
  if (!loaded) return;
  render({ quiet: true }); renderDetail(true); renderReq(); writeHash();
  if (!quiet) { const n = MODS.filter(m => !costOf(m)).length; announce(`Costs now shown ${MACHINES[v].on}.${n ? ` ${plural(n, "mod")} not rated for it yet.` : ""}`); }
}

/* ---------- MODS: filters ---------- */
function tierKey() {
  const t = state.tiers;
  if (t.size === DEFAULT_TIERS.length && DEFAULT_TIERS.every(x => t.has(x))) return "default";
  if (t.size === TIERS.length) return "all";
  if (t.size === 1) return [...t][0];
  return "custom";
}
function setTierKey(v) { if (v === "custom") return; state.tiers = new Set(v === "default" ? DEFAULT_TIERS : v === "all" ? TIERS : [v]); }
const MORE = ["runtime", "lunar", "ss2", "nodll", "noend"];
function moreCount() { return (state.profiles.size ? 1 : 0) + (state.perf !== "high" ? 1 : 0) + (state.sort !== "section" ? 1 : 0) + MORE.filter(k => state[k]).length; }
function syncFilterUI() {
  $("f-section").value = MODULES[state.section] ? state.section : "";
  const tk = tierKey(); $("f-tier").querySelector('[value="custom"]').hidden = tk !== "custom"; $("f-tier").value = tk;
  $("f-pt").value = PTBY[state.pt] ? state.pt : "";
  $("f-profile").value = [...state.profiles][0] || "";
  $("f-perf").value = state.perf; $("f-sort").value = state.sort;
  $("f-fits").checked = state.perf !== "high";
  CHECKS.forEach(k => $("f-" + k).checked = state[k]);
  $("q").value = state.q;
}
function resetFilters(clearSearch) {
  state.profiles = new Set(); state.tiers = new Set(DEFAULT_TIERS); state.perf = "high"; state.unrated = false; state.pt = ""; state.section = ""; state.sort = "section";
  CHECKS.forEach(k => state[k] = false);
  if (clearSearch) state.q = "";
  syncFilterUI(); render();
}
function setupFilters() {
  $("f-section").innerHTML = `<option value="">Every section</option>` + MOD_KEYS.map(k => `<option value="${k}">${esc(MODULES[k])}</option>`).join("");
  $("f-profile").innerHTML = `<option value="">Any faction</option>` + PROFILES.map(p => `<option value="${p}">${esc(PROFILE_LABEL[p])}</option>`).join("");
  $("f-pt").innerHTML = `<option value="">Any mod</option>` + PT.map(p => `<option value="${esc(p.id)}">${esc(p.short)} (${p.n ? plural(p.n, "mod") : "no mods yet"}${p.status === "planned" ? ", planned" : ""})</option>`).join("");
  $("f-pt-row").hidden = !PT.length;
  const on = (id, fn) => $(id).addEventListener("change", e => { fn(e.target); render(); });
  on("f-section", t => state.section = t.value);
  on("f-tier", t => setTierKey(t.value));
  on("f-pt", t => state.pt = t.value);
  on("f-profile", t => state.profiles = new Set(t.value ? [t.value] : []));
  on("f-perf", t => { state.perf = t.value; state.unrated = false; $("f-fits").checked = state.perf !== "high"; });
  on("f-sort", t => state.sort = t.value);
  on("f-fits", t => { state.perf = t.checked ? "med" : "high"; state.unrated = false; $("f-perf").value = state.perf; });
  CHECKS.forEach(k => on("f-" + k, t => state[k] = t.checked));
  let qt = 0;
  $("q").addEventListener("input", e => {
    clearTimeout(qt);
    qt = setTimeout(() => { const v = e.target.value.trim().toLowerCase(); if (v !== state.q) { state.q = v; render(); } }, 120);
  });
  $("q").addEventListener("keydown", e => {
    if (e.key === "Escape" && e.target.value) { e.preventDefault(); e.stopPropagation(); e.target.value = ""; clearTimeout(qt); state.q = ""; render(); }
    else if (e.key === "ArrowDown") { const r = selRow() || $("inv").querySelector(".row"); if (r) { e.preventDefault(); r.focus(); } }
  });
  $("filters-btn").addEventListener("click", () => {
    const open = !$("toolbar").classList.contains("fopen");
    $("toolbar").classList.toggle("fopen", open); $("filters-btn").setAttribute("aria-expanded", open);
  });
}
function updateBars() {
  $("result-count").innerHTML = `<b>${num(shown.length)}</b> of ${num(MODS.length)} mods`;
  const notes = [];
  if (!state.tiers.has("avoid")) {
    const n = MODS.filter(m => m.tier === "avoid" && passes(m, "tier")).length;
    if (n) notes.push(`${num(n)} marked avoid hidden. <button class="lnk" data-show="avoid">Show them</button>`);
  }
  if (state.perf !== "high" && !state.unrated) {
    const n = MODS.filter(m => !costOf(m) && passes(m, "unrated")).length;
    if (n) notes.push(`${num(n)} not rated ${MACHINES[state.machine].on} hidden. <button class="lnk" data-show="unrated">Show them</button>`);
  }
  const fc = filterCount();
  if (fc) notes.push(`<button class="lnk" data-reset>Reset filters</button>`);
  $("hidden-note").innerHTML = notes.join(" · ");
  $("filters-btn").textContent = fc ? `Filters (${fc})` : "Filters";
  const mc = moreCount(); $("more-sum").textContent = mc ? `More filters (${mc})` : "More filters";
}

/* ---------- MODS: inventory list ---------- */
const COST_SHORT = { low: "Low", med: "Med", high: "High" };
const STSR = { on: ", in your list", auto: ", added for you", off: "" };
function sortedShown() {
  const arr = MODS.filter(m => passes(m));
  const byName = (a, b) => a.name.localeCompare(b.name);
  if (state.sort === "name") return arr.sort(byName);
  if (state.sort === "cost") return arr.sort((a, b) => sortVal(a, "perf") - sortVal(b, "perf") || byName(a, b));
  if (state.sort === "updated") return arr.sort((a, b) => String(sortVal(b, "updated")).localeCompare(String(sortVal(a, "updated"))) || byName(a, b));
  return arr.sort((a, b) => a.mi - b.mi || a.ti - b.ti || a.ci - b.ci);
}
function rowHTML(m) {
  const st = stOf(m.id), c = costOf(m);
  const right = m.tier === "avoid" ? "Avoid" : c ? COST_SHORT[c] : "—";
  const rsr = m.tier === "avoid" ? ", marked avoid" : c ? `, ${LBL.perf[c].toLowerCase()} cost` : ", cost not rated";
  return `<li><button class="row" id="r-${esc(m.id)}" data-pick="${esc(m.id)}" data-st="${st}" tabindex="-1"><span class="mk" aria-hidden="true"></span><span class="nm">${esc(m.name)}</span><span class="vh"><span class="ss">${STSR[st]}</span>${rsr}</span><span class="rc" aria-hidden="true">${right}</span></button></li>`;
}
function emptyListHTML() {
  const fc = filterCount(), ep = state.pt && PTBY[state.pt] && !PTBY[state.pt].n ? PTBY[state.pt] : null;
  const box = (h, p, btns) => `<div class="empty"><p class="eh">${h}</p><p>${p}</p><div class="row-btns">${btns}</div></div>`;
  if (ep) return box("No mods on this tape yet", `${esc(ep.title)} is ${ep.status === "planned" ? "planned, and its list is still being written" : "not filled in yet"}. Pick another playthrough, or clear the filter.`, `<button class="btn" data-reset="all">Reset filters</button>`);
  if (state.inlist && !R.all.size) return box("Your list is empty", "Nothing to show with “In my list” ticked. Untick it, or load a holotape first.", `<button class="btn" data-reset="inlist">Untick “In my list”</button><button class="lnk" data-go="tapes">Pick a holotape</button>`);
  if (state.q) return box(`No match for “${esc(state.q)}”`, `Try one word from the name, a shorter word, or the author's name.${fc ? " Your filters may be hiding it too." : ""}`, `<button class="btn" data-reset="search">Clear the search</button>${fc ? `<button class="lnk" data-reset="all">Reset filters too</button>` : ""}`);
  return box("Nothing fits these filters", "Widen the tier or the cost limit, or pick another section.", `<button class="btn" data-reset="all">Reset filters</button>`);
}
let countTimer = 0;
function render(opts = {}) {
  if (!loaded) return;
  const inv = $("inv"), hadFocus = inv.contains(document.activeElement);
  shown = sortedShown();
  updateBars();
  if (!shown.length) inv.innerHTML = emptyListHTML();
  else if (state.sort === "section") {
    const groups = [];
    shown.forEach(m => { const g = groups[groups.length - 1]; if (!g || g.k !== m.module) groups.push({ k: m.module, items: [m] }); else g.items.push(m); });
    inv.innerHTML = `<ul>${groups.map(g => `<li class="grp"><h3 class="gh"><span>${esc(MODULES[g.k] || g.k)}</span><span>${num(g.items.length)}</span></h3><ul>${g.items.map(rowHTML).join("")}</ul></li>`).join("")}</ul>`;
  } else inv.innerHTML = `<ul>${shown.map(rowHTML).join("")}</ul>`;
  // The selection follows the list: a mod the filters hide gives way to the first one shown.
  if (!opts.keepSel && !shown.some(m => m.id === ui.sel)) { ui.sel = shown[0]?.id || null; openId = null; }
  instantBar = true; markSel(); instantBar = false; renderDetail(); writeHash();
  if (hadFocus) { const r = selRow() || inv.querySelector(".row"); (r || $("q")).focus({ preventScroll: true }); }
  if (!opts.quiet) { clearTimeout(countTimer); countTimer = setTimeout(() => announce(shown.length ? `${plural(shown.length, "mod")} shown` : $("inv").querySelector(".eh")?.textContent || "No mod shown"), 400); }
}
const selRow = () => ui.sel ? document.getElementById("r-" + ui.sel) : null;
function markSel() {
  $("inv").querySelectorAll('.row[aria-current], .row[tabindex="0"]').forEach(r => { r.removeAttribute("aria-current"); r.tabIndex = -1; });
  const r = selRow() || $("inv").querySelector(".row");
  if (r) { r.tabIndex = 0; if (r.dataset.pick === ui.sel) r.setAttribute("aria-current", "true"); }
  FX.bar($("inv"), r && r.dataset.pick === ui.sel ? r : null, instantBar);
}
let instantBar = false;
function selectMod(id, o = {}) {
  if (!BY[id]) return;
  ui.sel = id; openId = id;
  markSel(); renderDetail();
  const r = selRow();
  if (r && o.scroll !== false) r.scrollIntoView({ block: "nearest" });
  if (o.focusRow && r) r.focus({ preventScroll: true });
  if (o.panel && mqMob.matches) openPanel();
  else if (o.focusDetail) $("d-title")?.focus({ preventScroll: true });
  writeHash();
}
// From anywhere: a link to a mod opens it in the catalogue.
function openMod(id) {
  if (!BY[id]) return;
  if (ui.tab !== "mods" || ui.sub !== "cat") setTab("mods", { sub: "cat" });
  selectMod(id, { panel: true, focusDetail: true });
}
let detRaf = 0;
$("inv").addEventListener("keydown", e => {
  const r = e.target.closest && e.target.closest(".row"); if (!r) return;
  const rows = [...$("inv").querySelectorAll(".row")], i = rows.indexOf(r);
  const j = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: rows.length - 1, PageDown: i + 10, PageUp: i - 10 }[e.key];
  if (j === undefined) return;
  e.preventDefault();
  if (j < 0 && e.key === "ArrowUp") { $("q").focus(); return; }
  const n = rows[Math.max(0, Math.min(rows.length - 1, j))];
  ui.sel = n.dataset.pick; openId = ui.sel;
  n.scrollIntoView({ block: "nearest" }); markSel(); n.focus({ preventScroll: true }); FX.sound("row");
  cancelAnimationFrame(detRaf); detRaf = requestAnimationFrame(() => { renderDetail(); writeHash(); });
});

/* ---------- MODS: detail ---------- */
let detailId = null, detailMach = null;
function goesInner(m) {
  const row = (ids, never) => {
    const items = list(ids);
    if (!items.length) return "Nothing";
    return items.map(x => {
      if (!BY[x]) return `<span class="it">${esc(x)}</span>`;
      const st = stOf(x);
      // The same marks as the list rows: filled = in your list, outline = added for you.
      const mark = `<i class="mk ${st}" aria-hidden="true"></i>`, sr = st === "on" ? ", in your list" : st === "auto" ? ", added for you" : "";
      return `<span class="it${never && st !== "off" ? " bad" : ""}">${mark}<button class="linkid" data-open="${esc(x)}">${esc(BY[x].name)}<span class="vh">${sr}</span></button></span>`;
    }).join("");
  };
  return `<div><dt>Needs</dt><dd>${row(m.requires)}</dd></div><div><dt>Patches, added when both are in</dt><dd>${row(m.patches)}</dd></div><div><dt>Never with</dt><dd>${row(m.conflicts, true)}</dd></div>`;
}
function detailHTML(m) {
  const n = NX[m.nexus_id] || {};
  const risks = [];
  if (m.f4se_dll === "yes") risks.push(["Needs an F4SE DLL built for 1.11.240", true]);
  if (m.runtime_1_11_240 === "no") risks.push(["Not supported on 1.11.240", true]);
  if (m.precombines === "breaks") risks.push(["Breaks precombines: lower fps in its area", true]);
  if (m.precombines === "prp-patch") risks.push(["Needs the PRP patch (added for you)", true]);
  if (m.lunar === "conflict") risks.push(["Conflicts with Lunar", true]);
  if (m.ss2 === "conflict") risks.push(["Conflicts with Sim Settlements 2", true]);
  if (m.ending_lock && m.ending_lock !== "none") risks.push([endingLabel(m.ending_lock), true]);
  if (m.scripts === "heavy") risks.push(["Script-heavy", true]);
  // Notes that start with a version or date stamp go to "Version checked", the rest are things to watch.
  const metaNotes = [];
  list(m.notes).map(s => s.trim()).filter(Boolean).forEach(s => (isStamp(s) ? metaNotes : risks).push(isStamp(s) ? s : [s.replace(/^./, c => c.toUpperCase()), false]));
  if (m.file) risks.push([`Take this file on the Files tab: ${m.file}`, false]);
  const watch = risks.length ? `<ul class="risks">${risks.map(([t, bad]) => `<li${bad ? ' class="bad"' : ""}>${esc(t)}</li>`).join("")}</ul>` : `<p class="dim">Nothing to watch: safe on 1.11.240 in our tests.</p>`;
  const plugins = m.load_group === "0" ? "No plugin" : m.plugins_full === "" ? "Not counted yet" : `${+m.plugins_full || 0} full, ${+m.plugins_light || 0} light`;
  const dd = (label, val, bad) => `<div><dt>${label}</dt><dd${bad ? ' class="bad"' : ""}>${esc(val)}</dd></div>`;
  let nxs = (n.summary || "").trim(); if (nxs && !/[.!?…]$/.test(nxs)) nxs += "…";
  const by = [n.author && "by " + n.author, n.version && "version " + n.version, n.updated && "updated " + fmtDate(n.updated, true), n.endorsements != null && num(n.endorsements) + " endorsements", fmtSize(sizeOf(m)) && fmtSize(sizeOf(m))].filter(Boolean).join(" · ");
  const src = list(m.evidence), why = m.tier === "avoid" ? avoidWhy(m) : "";
  const machines = state.machine === "pc" ? ["pc", "mac"] : ["mac", "pc"];
  return `<div class="d-back"><button class="lnk" data-back>${ICON.back}Back to the list</button></div>
<p class="d-where"><span>${esc(MODULES[m.module] || m.module)}</span><span class="tier">${TIER_LABEL[m.tier] || esc(m.tier)}</span></p>
<h2 class="d-title" id="d-title" tabindex="-1">${esc(m.name)}</h2>
${by ? `<p class="d-by">${esc(by)}</p>` : ""}
${m.tier === "avoid" ? `<p class="d-lead bad">Avoid${why ? ": " + esc(why) : ""}.</p>` : ""}
<p class="d-lead">${esc(m.summary)}</p>
<div class="d-act"><button class="btn dtoggle" data-toggle="${esc(m.id)}" data-st="">Add to list</button>${nexusUrl(m) ? `<a class="lnk" href="${nexusUrl(m)}" rel="noopener">Open on Nexus Mods${ICON.ext}</a>` : ""}<p class="d-eff" id="d-eff" aria-live="polite"></p></div>
<h3 class="h3">Stats</h3>
<dl class="stats">
  ${dd("Runtime 1.11.240", lab(LBL.rtLong, m.runtime_1_11_240), m.runtime_1_11_240 === "no")}
  ${machines.map(k => dd(`Cost ${MACHINES[k].on}${k === state.machine ? " (yours)" : ""}`, costOf(m, k) ? lab(LBL.perf, costOf(m, k)) : k === "pc" ? "Not rated yet" : "Not rated", costOf(m, k) === "high")).join("")}
  ${dd("Plugins", plugins)}
  ${metaNotes.length ? `<div><dt>Version checked</dt><dd>${metaNotes.map(t => `<span class="it">${esc(t)}</span>`).join("")}</dd></div>` : ""}
  ${dd("F4SE DLL", lab(LBL.dll, m.f4se_dll))}
  ${dd("Precombines", lab(LBL.pc, m.precombines), m.precombines === "breaks")}
  ${dd("With Lunar", lab(LBL.compatLong, m.lunar), m.lunar === "conflict")}
  ${dd("With Sim Settlements 2", lab(LBL.compatLong, m.ss2), m.ss2 === "conflict")}
  ${dd("Faction ending", endingLabel(m.ending_lock), m.ending_lock && m.ending_lock !== "none")}
  ${dd("Scripts", lab(LBL.scripts, m.scripts), m.scripts === "heavy")}
  ${dd("NPCs", lab(LBL.npcs, m.npcs))}
  ${dd("Load group", LOAD_GROUPS[m.load_group] || (m.load_group ? "Group " + m.load_group : "Not recorded"))}
  ${dd("Playing as", list(m.profiles).map(p => PROFILE_LABEL[p] || p).join(", ") || "Not recorded")}
</dl>
<h3 class="h3">What to watch</h3>${watch}
<h3 class="h3">Goes with</h3><p class="gw-key" aria-hidden="true"><span><i class="mk on"></i>In your list</span><span><i class="mk auto"></i>Added for you</span></p><dl class="stats gw" id="d-goes">${goesInner(m)}</dl>
${PT.length ? `<h3 class="h3">Playthroughs</h3>${ptDetail(m)}` : ""}
${nxs ? `<h3 class="h3">From the Nexus page</h3><p class="prose">${esc(nxs)}</p>` : ""}
<h3 class="h3">Sources</h3>${src.length ? `<ol class="d-src">${src.map(u => `<li><a href="${esc(u)}" rel="noopener">${esc(srcLabel(u, m))}</a></li>`).join("")}</ol>` : `<p class="dim">No sources recorded.</p>`}
${m.checked_on ? `<p class="d-foot">Checked on ${fmtDate(m.checked_on, true)}.</p>` : ""}`;
}
function renderDetail(force) {
  const d = $("detail"), id = ui.sel && BY[ui.sel] ? ui.sel : null;
  if (!force && id === detailId && detailMach === state.machine) { updateDetail(); return; }
  detailId = id; detailMach = state.machine;
  d.innerHTML = id ? detailHTML(BY[id])
    : `<div class="d-back"><button class="lnk" data-back>${ICON.back}Back to the list</button></div><div class="empty"><p class="eh">No mod selected</p><p>${shown.length ? "Pick a mod on the left to see what it does." : "The list is empty, so there is nothing to show here."}</p></div>`;
  d.scrollTop = 0;
  if (id) updateDetail();
}
function updateDetail() {
  if (!detailId) return;
  const g = $("d-goes"); if (g) g.innerHTML = goesInner(BY[detailId]);
  const e = $("d-eff"); if (e) e.innerHTML = detailEffect(detailId);
  syncToggles();
}
let panelReturn = null;
function openPanel() {
  const c = $("sub-cat");
  if (!c.classList.contains("panel-open")) { panelReturn = selRow(); c.classList.add("panel-open"); $("inv").inert = true; $("toolbar").inert = true; $("detail").scrollTop = 0; }
  $("d-title")?.focus({ preventScroll: true });
}
function closePanel(restore = true) {
  const c = $("sub-cat"); if (!c.classList.contains("panel-open")) return;
  c.classList.remove("panel-open"); $("inv").inert = false; $("toolbar").inert = false;
  openId = null; writeHash();
  if (restore) { const r = selRow() || panelReturn; (r && document.contains(r) ? r : $("q")).focus({ preventScroll: false }); }
}
mqMob.addEventListener("change", () => closePanel(false));

/* In-place updates after a list change */
function syncToggles() {
  document.querySelectorAll("button.dtoggle[data-toggle]").forEach(b => {
    const st = stOf(b.dataset.toggle); if (b.dataset.st === st) return;
    b.dataset.st = st;
    b.textContent = st === "on" ? "Remove from list" : st === "auto" ? "Keep in my list" : "Add to list";
    b.classList.toggle("primary", st !== "on");
  });
  document.querySelectorAll("#inv .row").forEach(r => {
    const st = stOf(r.dataset.pick); if (r.dataset.st === st) return;
    r.dataset.st = st; r.querySelector(".ss").textContent = STSR[st];
  });
}

/* ---------- MY LIST ---------- */
function renderReq() {
  const r = R, { mods, n, full, est, over } = listNumbers(r), nAuto = r.auto.size + r.patches.size;
  const light = mods.reduce((s, m) => s + (+m.plugins_light || 0), 0);
  const size = mods.reduce((s, m) => s + sizeOf(m), 0);
  FX.roll($("ml-n"), num(n));
  $("ml-sub").textContent = n === 1 ? "mod" : "mods";
  const parts = [r.auto.size && plural(r.auto.size, "requirement"), r.patches.size && plural(r.patches.size, "patch", "patches")].filter(Boolean);
  $("ml-who").textContent = n ? `${num(r.chosen.size)} picked by you${nAuto ? `, plus ${joinAnd(parts)} added for you` : ""}.` : "Your list is empty.";
  FX.roll($("ml-full"), num(full));
  $("ml-full-of").textContent = over ? "of 254: over the limit" : "of 254";
  $("ml-full-of").classList.toggle("bad", over);
  const cw = Math.min(100, full / 254 * 100), ew = Math.max(0, Math.min(100 - cw, est / 254 * 100));
  const bar = $("ml-bar"); bar.querySelector(".cnt").style.width = cw + "%";
  const e = bar.querySelector(".est"); e.style.left = `calc(${cw}% + 2px)`; e.style.width = ew + "%";
  bar.setAttribute("aria-label", `${full} of 254 full plugin slots counted${est ? `, plus ${est} mods not counted yet` : ""}`);
  $("ml-slots").innerHTML = over ? `<span class="bad">Over the limit by ${num(full + est - 254)}${est ? ", counting each uncounted mod as one slot" : ""}.</span>`
    : est ? `Plus ${plural(est, "mod")} whose plugins are not counted yet, drawn as one slot each.` : n ? "Every plugin in your list is counted." : "";
  const c = { low: 0, med: 0, high: 0, "": 0 }; mods.forEach(m => c[costOf(m) in c ? costOf(m) : ""]++);
  $("mix").textContent = n ? `Cost ${MACHINES[state.machine].on}: ${c.low} low, ${c.med} medium, ${c.high} high, ${c[""]} not rated.` : "";
  $("s-light").textContent = num(light);
  $("s-size").textContent = fmtSize(size) || "0 GB";
  $("s-dll").textContent = num(mods.filter(m => m.f4se_dll === "yes").length);
  const heavy = mods.filter(m => m.scripts === "heavy").length, high = mods.filter(m => costOf(m) === "high").length;
  $("s-heavy").textContent = num(heavy); $("s-heavy").classList.toggle("bad", heavy > 2);
  $("s-high").textContent = num(high); $("s-high").classList.toggle("bad", high > 2);
  $("s-conf").textContent = num(r.conflicts.length); $("s-conf").classList.toggle("bad", r.conflicts.length > 0);
  const alerts = [];
  r.conflicts.forEach(([a, b]) => {
    const keep = (k, d) => canDrop(d) ? `<button class="lnk" data-keep="${esc(k)}" data-drop="${esc(d)}">Keep ${esc(BY[k].name)}</button>` : "";
    alerts.push(`<div class="alert"><span class="bad">Conflict:</span> ${esc(BY[a].name)} and ${esc(BY[b].name)} can't share a save. Keep one:<span class="keeps">${keep(a, b)}${keep(b, a)}</span></div>`);
  });
  mods.filter(m => m.runtime_1_11_240 === "no").forEach(m => alerts.push(`<div class="alert"><span class="bad">${esc(m.name)}</span> does not support 1.11.240.</div>`));
  mods.filter(m => m.precombines === "breaks").forEach(m => alerts.push(`<div class="alert"><span class="bad">${esc(m.name)}</span> breaks precombines: lower fps in its area.</div>`));
  mods.filter(m => m.ending_lock && m.ending_lock !== "none").forEach(m => alerts.push(`<div class="alert"><span class="bad">${esc(m.name)}</span> ${esc(endingLabel(m.ending_lock).toLowerCase().replace(/brotherhood|minutemen|institute|railroad/, w => w[0].toUpperCase() + w.slice(1)))}.</div>`));
  if (est) alerts.push(`<div class="alert info">Plugins not counted yet for ${plural(est, "mod")}, so the slot count is a minimum.</div>`);
  $("alerts").innerHTML = alerts.join("");
  $("notes-sec").hidden = !alerts.length;
  const ord = ordered(mods);
  $("lo-hint").hidden = !ord.length;
  if (!ord.length) {
    $("picked").innerHTML = `<li class="empty"><p class="eh">Your list is empty</p><p>Load a holotape, fill the S.P.E.C.I.A.L. sheet, or add mods from All mods.</p><div class="row-btns"><button class="btn primary" data-go="tapes">Pick a holotape</button><button class="lnk" data-go="stat">Fill the sheet</button><button class="lnk" data-go="mods">Browse all mods</button></div></li>`;
  } else {
    let i = 0; const groups = [];
    ord.forEach(m => { const g = m.load_group; const last = groups[groups.length - 1]; if (!last || last.g !== g) groups.push({ g, items: [m] }); else last.items.push(m); });
    $("picked").innerHTML = groups.map(({ g, items }) => `<li><h3 class="lo-group">${esc(groupLabel(g))}</h3><ol start="${i + 1}">${items.map(m => {
      i++;
      let why = "";
      if (!r.chosen.has(m.id)) { const w = whyAuto(m.id); why = w.names.length ? `<small>${w.kind === "patch" ? "Patch for " : "Needed by "}${esc(joinAnd(w.names))}</small>` : `<small>Added for you</small>`; }
      return `<li class="m"><span class="no" aria-hidden="true">${i}</span><span><button class="lo-name" data-open="${esc(m.id)}">${esc(m.name)}</button>${why}</span>${r.chosen.has(m.id) ? `<button class="rm" data-toggle="${esc(m.id)}" aria-label="Remove ${esc(m.name)}">${ICON.x}</button>` : "<span></span>"}</li>`;
    }).join("")}</ol></li>`).join("");
  }
  ["x-csv", "x-txt", "x-link", "x-clear"].forEach(id => $(id).disabled = !n);
  syncStatus();
  return ord;
}
function listChanged(keepNotice) {
  R = resolve(); effCache = new Map();
  if (!keepNotice) hideNotice();
  // Keep focus in the load order when its button is rebuilt.
  const f = document.activeElement, picked = $("picked");
  const pIdx = picked.contains(f) ? [...picked.querySelectorAll("button")].indexOf(f) : -1;
  renderReq();
  if (pIdx >= 0) { const bs = picked.querySelectorAll("button"); (bs[Math.min(pIdx, bs.length - 1)] || $("lo-h")).focus(); }
  syncPresets();
  if (state.inlist) render({ quiet: true }); else updateBars();
  syncToggles(); updateDetail(); writeHash();
}
function syncPresets() {
  const eq = ids => ids.length === state.chosen.size && ids.every(id => state.chosen.has(id));
  document.querySelectorAll(".preset[data-preset]").forEach(b => {
    const p = b.dataset.preset;
    b.setAttribute("aria-pressed", p === "clear" ? "false" : String(state.chosen.size > 0 && eq(presetIds(p))));
  });
  document.querySelectorAll(".tcard[data-pt]").forEach(c => c.classList.toggle("loaded", c.querySelector(".preset")?.getAttribute("aria-pressed") === "true"));
}


/* ---------- PLAYTHROUGHS ---------- */
const REELS = `<div class="reels" aria-hidden="true"><span class="reel"></span><span class="reel"></span></div>`;
function renderTapes() {
  $("tapes").innerHTML = PT.map(p => {
    const planned = p.status === "planned", id = esc(p.id);
    return `<article class="tcard${planned ? " planned" : ""}" data-pt="${id}" aria-labelledby="tt-${id}">
<div class="tape"><div class="tlabel"><span class="tt" id="tt-${id}">${esc(p.title)}</span><span class="tm">${esc(p.kind)} · ${p.n ? plural(p.n, "mod") : "no mods yet"}${planned ? `<span class="tag">Planned</span>` : ""}</span><span class="ld" aria-hidden="true"><i class="mk on"></i>Loaded in your list</span><span class="lq" aria-hidden="true">Loading <i></i><i></i><i></i></span></div>${REELS}</div>
<div class="tinfo"><p class="ts">${planned ? `Planned, not played yet${p.n ? ": the list may still change" : ""}` : "Played"}</p>
<div class="row-btns"><button class="btn primary preset" data-preset="pt:${id}" aria-pressed="false"${p.n ? "" : ' aria-disabled="true"'}>${p.n ? "Load this tape" : "Nothing to load yet"}<span class="vh">: ${esc(p.title)}</span></button>${p.doc ? `<a class="lnk" href="${esc(p.doc)}" rel="noopener">Read the write-up<span class="vh">: ${esc(p.title)}</span></a>` : ""}</div>
<div class="tdesc">${p.machine ? `<p class="sm">Built for ${esc(p.machine)}.</p>` : ""}${p.summary ? `<p class="sm">${esc(p.summary)}</p>` : ""}</div></div></article>`;
  }).join("") + `<article class="tcard blank" aria-labelledby="tt-blank">
<div class="tape"><div class="tlabel"><span class="tt" id="tt-blank">Blank tape</span><span class="tm">Your own list</span><span class="tm">Answer four questions</span></div>${REELS}</div>
<div class="tinfo"><p class="ts">Built from your answers</p>
<div class="row-btns"><button class="btn" data-go="stat">Fill the sheet</button></div>
<div class="tdesc"><p class="sm">Your machine, your ending, two frameworks and what you care about. The list is built from the catalogue's own ratings, the same way every time.</p></div></div></article>`;
  syncPresets();
}
function spinTape(id) {
  FX.loadTape(document.querySelector(`.tcard[data-pt="${CSS.escape(id)}"]`));
}

/* ---------- STAT: the sheet UI ---------- */
const ABBR = { S: "STR", P: "PER", E: "END", C: "CHA", I: "INT", A: "AGI", L: "LCK" };
const LUNAR_TXT = { yes: "Reworks combat, loot and enemies. Leaves out mods that conflict with it.", no: "Keeps the game's own balance. Leaves out every mod that needs Lunar." };
const ss2Txt = v => {
  const ss2 = BY[SS2_ID], c = ss2 && ss2.perf ? ` Rated ${lab(LBL.perf, ss2.perf).toLowerCase()} cost on a base M3; kept even above your machine's limit when you say yes.` : "";
  return v === "yes" ? `Settlers build their own homes, with a long questline.${c}` : "Leaves out every mod that needs it.";
};
const descFor = (name, v) => name === "sp-machine" ? SP_MACHINES[v]?.text : name === "sp-ending" ? SP_ENDINGS[v]?.[1] : name === "sp-lunar" ? LUNAR_TXT[v] : name === "sp-ss2" ? ss2Txt(v) : "";
let spSel = "S";
const choice = (name, value, title, checked) => `<label class="opt radio"><input type="radio" name="${name}" value="${esc(value)}"${checked ? " checked" : ""}><span class="bx" aria-hidden="true"></span><span>${esc(title)}<span class="vh">. ${esc(descFor(name, value))}</span></span></label>`;
const titleFor = (name, v) => name === "sp-machine" ? SP_MACHINES[v]?.title : name === "sp-ending" ? SP_ENDINGS[v]?.[0] : name === "sp-lunar" ? (v === "yes" ? "Yes, use Lunar" : "No Lunar") : (v === "yes" ? "Yes, use Sim Settlements 2" : "No Sim Settlements 2");
// The card repeats what the radio labels already say to a screen reader, so it is hidden from it.
const qcard = (name, v, label) => `<div class="qc" aria-hidden="true"><p class="lbl">${esc(label)}</p><h3 id="qt-${name}">${esc(titleFor(name, v))}</h3><p id="qd-${name}">${esc(descFor(name, v))}</p></div>`;
const qHead = (i, h) => `<p class="qno">Step ${i + 1} of ${SP_STEPS.length}</p><h2 class="qh" id="sp-h" tabindex="-1">${h}</h2>`;
function spStepHTML() {
  if (spStep === 0) return `<div class="special qstep"><div>${qHead(0, "What will you play on?")}
<fieldset class="opts"><legend class="vh">Your machine</legend>${Object.entries(SP_MACHINES).map(([k, o]) => choice("sp-machine", k, o.title, SP.machine === k)).join("")}</fieldset>
<div class="row-btns"><button class="lnk" data-go="tapes">Skip the questions: pick a ready-made playthrough</button></div></div>
<section class="sp-right">${qcard("sp-machine", SP.machine, "Your machine")}<p class="small dim">Costs were measured on a base M3 Mac. Gaming PC costs are estimated, not measured yet: ${num(MODS.filter(m => m.perf_pc).length)} of ${num(MODS.length)} mods so far.</p></section></div>`;
  if (spStep === 1) return `<div class="special qstep"><div>${qHead(1, "Which ending are you playing for?")}
<fieldset class="opts"><legend class="vh">Your faction ending</legend>${Object.entries(SP_ENDINGS).map(([k, [t]]) => choice("sp-ending", k, t, SP.ending === k)).join("")}</fieldset>
<label class="opt check"><input type="checkbox" id="sp-raiders"${SP.raiders ? " checked" : ""}><span class="bx" aria-hidden="true"></span><span>Welcome raider mods too<span class="vh">. Mods made for a raider playthrough, such as the Nuka-World gangs.</span></span></label>
<div class="row-btns"><button class="lnk" data-sp="back">${ICON.back}Back</button></div></div>
<section class="sp-right">${qcard("sp-ending", SP.ending, "Your ending")}<p class="small dim">Raider mods are made for a raider playthrough, such as the Nuka-World gangs.</p></section></div>`;
  if (spStep === 2) return `<div class="special qstep"><div class="fw-l">${qHead(2, "Do you want the two big frameworks?")}
<fieldset class="opts"><legend>Lunar Fallout Overhaul</legend>${choice("sp-lunar", "yes", "Yes, use Lunar", SP.lunar)}${choice("sp-lunar", "no", "No", !SP.lunar)}</fieldset>
<fieldset class="opts"><legend>Sim Settlements 2</legend>${choice("sp-ss2", "yes", "Yes, use SS2", SP.ss2)}${choice("sp-ss2", "no", "No", !SP.ss2)}</fieldset>
<div class="row-btns"><button class="lnk" data-sp="back">${ICON.back}Back</button></div></div>
<section class="sp-right"><p class="small dim">Many mods are built for, or against, these two. Yes adds them with their patches. No leaves out every mod that needs them.</p>${qcard("sp-lunar", SP.lunar ? "yes" : "no", "Lunar Fallout Overhaul")}${qcard("sp-ss2", SP.ss2 ? "yes" : "no", "Sim Settlements 2")}</section></div>`;
  if (spStep === 3) {
    const counts = buildSheet(SP, true).perAttr, left = SP_BUDGET - spSpent(SP);
    return `<div class="special"><div>${qHead(3, `Spread ${SP_BUDGET} points over what you care about`)}
<ul class="attrs" id="sp-attrs" aria-label="Interests">${SPECIAL.map(x => `<li><button class="attr" data-sp="pick" data-k="${x.k}" id="sp-r-${x.k}"${x.k === spSel ? ' aria-current="true"' : ""} tabindex="${x.k === spSel ? 0 : -1}"><span class="lt" aria-hidden="true">${x.k}</span><span class="an">${x.name}<span class="dim">${esc(x.title)}</span></span><span class="av roll" id="sp-v-${x.k}">${SP.pts[x.k]}</span><span class="vh"> points</span></button></li>`).join("")}</ul>
<p class="keys" aria-hidden="true">Up and down: choose an interest. Left and right: change its points.</p>
<div class="row-btns"><button class="lnk" data-sp="back">${ICON.back}Back</button></div></div>
<section class="sp-right" aria-labelledby="sp-a-h" data-k="${spSel}">${spRightHTML(counts, left)}</section></div>`;
  }
  return spResultHTML(spResult = buildSheet(SP));
}
function spRightHTML(counts, left) {
  const x = SPECIAL.find(s => s.k === spSel), v = SP.pts[x.k];
  return `<p class="big" id="sp-big" aria-hidden="true"><span class="ab">${ABBR[x.k]}</span><span class="bn roll">${v}</span></p>
<h3 id="sp-a-h">${x.name}: ${esc(x.title.toLowerCase())}</h3>
<p class="sp-text">${esc(x.text)}</p>
<p class="band" id="sp-band">${esc(spBand(x, counts))}</p>
<div class="pips" aria-hidden="true">${Array.from({ length: SP_MAX }, (_, i) => `<i class="${i < v ? "on" : ""}${i === 3 || i === 6 ? " cut" : ""}"></i>`).join("")}</div>
<p class="small dim sp-legend">1 to 3: core fixes only. 4 to 6: adds the mods we recommend. 7 to 10: adds the optional mods from our playthroughs too.</p>
<div class="ctrl"><button class="btn sq" data-sp="dec" data-k="${x.k}" aria-label="Lower ${x.name}"${v <= SP_MIN ? ' aria-disabled="true"' : ""}>−</button><button class="btn sq" data-sp="inc" data-k="${x.k}" aria-label="Raise ${x.name}"${v >= SP_MAX || left <= 0 ? ' aria-disabled="true"' : ""}>+</button><p class="pool" id="sp-pool">Points left <b class="roll" id="sp-left">${num(left)}</b> of ${SP_BUDGET}</p></div>`;
}
function spSyncPoints() {
  SPECIAL.forEach(x => FX.roll($("sp-v-" + x.k), SP.pts[x.k]));
  const r = document.querySelector(".sp-right"); if (!r) return;
  const counts = buildSheet(SP, true).perAttr, left = SP_BUDGET - spSpent(SP), x = SPECIAL.find(s => s.k === spSel), v = SP.pts[spSel];
  if (r.dataset.k === spSel) {
    // Same interest: update in place so the numbers roll and focus stays put.
    FX.roll(r.querySelector(".bn"), v); FX.roll($("sp-left"), num(left));
    $("sp-band").textContent = spBand(x, counts);
    r.querySelectorAll(".pips i").forEach((p, i) => p.classList.toggle("on", i < v));
    r.querySelector('[data-sp="dec"]').setAttribute("aria-disabled", String(v <= SP_MIN));
    r.querySelector('[data-sp="inc"]').setAttribute("aria-disabled", String(v >= SP_MAX || left <= 0));
    return;
  }
  r.dataset.k = spSel;
  r.innerHTML = spRightHTML(counts, left);
  FX.shift(r, 0);
}
function spPickAttr(k, focus) {
  spSel = k;
  document.querySelectorAll("#sp-attrs .attr").forEach(b => { const on = b.dataset.k === k; b.tabIndex = on ? 0 : -1; if (on) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
  spSyncPoints();
  FX.bar($("sp-attrs"), $("sp-r-" + k));
  if (focus) { $("sp-r-" + k).focus(); FX.sound("row"); }
}
function spResultHTML(res) {
  const r = res.r, n = r.all.size, a = res.answers, added = n - res.chosen.size, overSlots = res.full + res.est > 254;
  const row = (label, val, bad, note) => `<div><dt>${label}${note ? `<small>${note}</small>` : ""}</dt><dd${bad ? ' class="bad"' : ""}>${val}</dd></div>`;
  const alerts = [];
  if (overSlots) alerts.push(`<div class="alert"><span class="bad">Over the 254 full plugin limit</span> by ${num(res.full + res.est - 254)}${res.est ? ", counting each uncounted mod as one slot" : ""}. Lower an interest, or take mods out once the list is loaded.</div>`);
  res.stuck.forEach(([x, y]) => alerts.push(`<div class="alert"><span class="bad">Conflict left for you:</span> ${esc(BY[x].name)} and ${esc(BY[y].name)} can't share a save, and neither could be taken out here. Keep one in your list.</div>`));
  if (res.over.length) alerts.push(`<div class="alert info">${plural(res.over.length, "mod")} cost${res.over.length === 1 ? "s" : ""} more than your machine allows, kept because you asked for ${res.over.length === 1 ? "it" : "them"} or another mod needs ${res.over.length === 1 ? "it" : "them"}: ${esc(joinAnd(res.over.map(id => BY[id].name)))}.</div>`);
  // Grouped by the reason the other mod was kept, so each reason is said once.
  const whys = [...new Set(res.dropped.map(d => d.why))];
  const drops = whys.map(why => `<p class="small dim why">Kept the other mod because ${esc(why)}:</p><ul class="plist">${res.dropped.filter(d => d.why === why).map(d => d.ids.length === 1 && d.ids[0] === d.lose
    ? `<li>${esc(BY[d.lose].name)} <small>conflicts with ${esc(BY[d.win].name)}</small></li>`
    : `<li>${esc(joinAnd(d.ids.map(id => BY[id].name)))} <small>${d.ids.length > 1 ? "need" : "needs"} ${esc(BY[d.lose].name)}, which conflicts with ${esc(BY[d.win].name)}</small></li>`).join("")}</ul>`);
  const lefts = Object.keys(SP_LEFT).filter(k => res.left[k]?.length).map(k => `<li>${plural(res.left[k].length, "mod")} ${esc(SP_LEFT[k](a)[res.left[k].length === 1 ? 0 : 1])}</li>`);
  const near = res.near && res.near.o ? res.near : null;
  return `<div class="result"><div>
<p class="qno">Step 5 of 5</p><h2 class="qh" id="sp-h" tabindex="-1">${plural(n, "mod")}, ready to load</h2>
<p>${num(res.chosen.size)} from your answers${added ? `, ${num(added)} requirements and patches added for you` : ""}. Costs are ${esc(res.mc.col === "perf" ? "the base M3 Mac ratings" : "the gaming PC ratings, estimated so far")}.</p>
<dl class="tally">
${row("Mods", num(n))}
${row("Full plugin slots", `${num(res.full)}${res.est ? "+" : ""}<small> / 254</small>`, overSlots, res.est ? `Plus ${plural(res.est, "mod")} not counted yet` : "")}
${row("Light plugins", num(res.light), false, "Out of 4,096")}
${row("Not checked on 1.11.240", num(res.unknownRt), false, "May or may not work on this game version")}
${row("Break precombines", num(res.breaks), res.breaks > 0, "Lower fps in their area")}
${row("Cost not rated for you", num(res.unrated), res.unrated > 0 && !!res.mc.unrated, res.mc.unrated ? "Allowed on a high-end PC: watch your fps" : "Only ones another mod needs")}
</dl>
<div class="row-btns"><button class="btn" data-sp="back">Change answers</button><button class="btn" data-sp="copy">Copy sheet link</button></div>
<p class="small dim" style="margin-top:16px">Use this list replaces your current list. You can undo it.</p>
</div><div>
${alerts.length ? `<h3 class="h3">Warnings and notes</h3><div class="alerts">${alerts.join("")}</div>` : ""}
${near ? `<h3 class="h3">Closest ready-made playthrough</h3><div class="near"><p>${esc(near.p.title)}${near.p.status === "planned" ? " (planned, not played yet)" : ""}: ${num(near.o)} of its ${plural(near.size, "mod")} are in your list.</p><button class="btn" data-sp="near" data-pt="${esc(near.p.id)}">Load this playthrough instead</button></div>` : ""}
${drops.length ? `<h3 class="h3">Taken out to avoid conflicts</h3>${drops.join("")}` : ""}
${lefts.length ? `<h3 class="h3">Left out by your answers</h3><ul class="plist">${lefts.join("")}</ul><p class="small dim" style="margin-top:16px">Mods marked avoid are never added.</p>` : ""}
</div></div>`;
}
function spRender(o = {}) {
  if (!loaded) return;
  const strip = $("sp-steps");
  if (!strip.querySelector(".subtrack")) strip.innerHTML = `<div class="subtrack">${SP_STEPS.map((t, i) => `<button class="subtab" data-sp="step" data-i="${i}">${esc(t)}<span class="vh">, step ${i + 1} of ${SP_STEPS.length}</span></button>`).join("")}</div>`;
  strip.querySelectorAll(".subtab").forEach(b => { if (+b.dataset.i === spStep) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
  const box = $("sp");
  box.innerHTML = spStepHTML();
  centreStrip(strip, !o.anim);
  if (o.anim) FX.shift(box, o.dir || 1);
  requestAnimationFrame(() => FX.bar($("sp-attrs"), $("sp-r-" + spSel), true));
  $("sp-scroll").scrollTop = 0;
  if (o.focus) $("sp-h").focus({ preventScroll: true });
  syncStatus();
}
function spGo(i) {
  const prev = spStep;
  spStep = Math.max(0, Math.min(SP_STEPS.length - 1, i)); spTouched = true;
  if (ui.tab !== "stat") setTab("stat");
  spRender({ focus: true, anim: prev !== spStep, dir: spStep >= prev ? 1 : -1 }); writeHash();
  if (prev !== spStep) FX.sound("tab");
}
function spPoint(k, delta) {
  const x = SPECIAL.find(s => s.k === k), v = SP.pts[k], left = SP_BUDGET - spSpent(SP);
  if (delta > 0 && v >= SP_MAX) return announce(`${x.name} is at ${SP_MAX}, the maximum.`);
  if (delta > 0 && left <= 0) return announce("No points left. Lower another interest first.");
  if (delta < 0 && v <= SP_MIN) return announce(`${x.name} is at ${SP_MIN}, the minimum.`);
  SP.pts[k] = v + delta; spTouched = true; spSyncPoints(); writeHash(); FX.sound("row");
  announce(`${x.name} ${SP.pts[k]}. ${plural(SP_BUDGET - spSpent(SP), "point")} left.`);
}
function spUse() {
  const res = spResult || buildSheet(SP), mach = res.mc.site;
  if (mach !== state.machine) setMachine(mach, true);
  setTab("mods", { sub: "list" });
  setChosen([...res.chosen], () => `Loaded the list from your S.P.E.C.I.A.L. sheet: ${plural(R.all.size, "mod")}${R.all.size > R.chosen.size ? `, ${num(R.all.size - R.chosen.size)} of them requirements and patches added for you` : ""}.${mach === "pc" ? " Costs now shown for a gaming PC." : ""}`);
  $("lo-h").focus({ preventScroll: true });
}
$("panel-stat").addEventListener("click", e => {
  const b = e.target.closest("[data-sp]"); if (!b) return;
  const ds = b.dataset;
  if (ds.sp === "step") spGo(+ds.i);
  else if (ds.sp === "back") spGo(spStep - 1);
  else if (ds.sp === "inc" || ds.sp === "dec") spPoint(ds.k, ds.sp === "inc" ? 1 : -1);
  else if (ds.sp === "pick") spPickAttr(ds.k, false);
  else if (ds.sp === "near") { applyPreset("pt:" + ds.pt); setTab("mods", { sub: "list", focus: true }); noticeBtns({}); }
  else if (ds.sp === "copy") {
    const url = location.origin + location.pathname + location.search + "#sheet=" + encodeSheet(SP);
    navigator.clipboard.writeText(url).then(() => { flash(b, "Copied"); announce("Sheet link copied."); }, () => window.prompt("Copy this link", url));
  }
});
$("sp").addEventListener("keydown", e => {
  const b = e.target.closest && e.target.closest(".attr"); if (!b) return;
  const ks = SPECIAL.map(s => s.k), i = ks.indexOf(b.dataset.k);
  if (["ArrowRight", "+", "="].includes(e.key)) { e.preventDefault(); spPoint(b.dataset.k, 1); return; }
  if (["ArrowLeft", "-"].includes(e.key)) { e.preventDefault(); spPoint(b.dataset.k, -1); return; }
  const j = { ArrowDown: Math.min(ks.length - 1, i + 1), ArrowUp: Math.max(0, i - 1), Home: 0, End: ks.length - 1 }[e.key];
  if (j === undefined) return;
  e.preventDefault(); spPickAttr(ks[j], true);
});
$("sp").addEventListener("change", e => {
  const t = e.target;
  if (t.name === "sp-machine") SP.machine = t.value;
  else if (t.name === "sp-ending") SP.ending = t.value;
  else if (t.name === "sp-lunar") SP.lunar = t.value === "yes";
  else if (t.name === "sp-ss2") SP.ss2 = t.value === "yes";
  else if (t.id === "sp-raiders") SP.raiders = t.checked;
  else return;
  spTouched = true;
  const d = $("qd-" + t.name); if (d) { d.textContent = descFor(t.name, t.value); $("qt-" + t.name).textContent = titleFor(t.name, t.value); FX.shift(d.closest(".qc"), 0); }
  writeHash();
});

/* ---------- Events ---------- */
document.addEventListener("click", e => {
  const pre = e.target.closest(".preset[data-preset]");
  if (pre) {
    if (!loaded) return;
    applyPreset(pre.dataset.preset);
    const pt = ptOf(pre.dataset.preset);
    if (pt && PTBY[pt]?.n) spinTape(pt);
    return;
  }
  const go = e.target.closest("[data-go]");
  if (go) { goTo(go.dataset.go); return; }
  if (e.target.closest("[data-retry]")) { load(); return; }
  const t = e.target.closest("[data-toggle],[data-open],[data-pick],[data-back],[data-reset],[data-show],[data-notice],[data-keep],[data-machine]");
  if (!t) return;
  const ds = t.dataset;
  if (ds.toggle) toggle(ds.toggle);
  else if (ds.open) { e.preventDefault(); openMod(ds.open); }
  else if (ds.pick) selectMod(ds.pick, { panel: true, scroll: false });
  else if (ds.back !== undefined) closePanel();
  else if (ds.machine) setMachine(ds.machine);
  else if (ds.reset === "search") { state.q = ""; $("q").value = ""; render(); $("q").focus(); }
  else if (ds.reset === "inlist") { state.inlist = false; syncFilterUI(); render(); $("f-inlist").focus(); }
  else if (ds.reset !== undefined) { resetFilters(ds.reset === "all"); $("q").focus(); }
  else if (ds.show === "avoid") { state.tiers.add("avoid"); syncFilterUI(); render(); }
  else if (ds.show === "unrated") { state.unrated = true; render(); }
  else if (ds.notice === "undo") {
    if (!undoSet) return;
    const prev = undoSet; undoSet = null; state.chosen = new Set(prev); listChanged(); announce("Undone. Your list is back.");
  }
  else if (ds.notice === "close") hideNotice();
  else if (ds.notice === "view") { hideNotice(); setTab("mods", { sub: "list", focus: true }); }
  else if (ds.keep) keepConflict(ds.keep, ds.drop);
});
tablistKeys($("tabs"), b => setTab(b.id.slice(4)));
tablistKeys($("subtabs"), b => setSub(b.id.slice(7)));
$("st-action").addEventListener("click", () => runAction($("st-action").dataset.act));
$("skip").addEventListener("click", e => { e.preventDefault(); focusIn(ui.tab); });
$("rec-avoid-btn").addEventListener("click", () => {
  if (!loaded) return;
  setTierKey("avoid"); syncFilterUI(); render({ quiet: true });
  setTab("mods", { sub: "cat" }); $("inv").querySelector(".row")?.focus();
  announce(`${plural(shown.length, "mod")} marked avoid shown, each with the reason.`);
});
// While the keyboard drives, the mouse hover tint is switched off, so only one row looks selected.
const NAV_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown", "Tab"];
document.addEventListener("keydown", e => { if (NAV_KEYS.includes(e.key)) document.documentElement.classList.add("kbnav"); }, true);
document.addEventListener("mousemove", () => document.documentElement.classList.remove("kbnav"), { passive: true });
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && $("sub-cat").classList.contains("panel-open")) { e.preventDefault(); closePanel(); return; }
  // Left and right switch tabs, up and down move through the list, unless a field or a list already uses the key.
  if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.altKey && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
    const a = document.activeElement;
    const owned = a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.closest('[role="tablist"], #sp-attrs, #inv, .opts, .seg, details'));
    if (!owned && loaded) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const i = TABS.indexOf(ui.tab), t = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
        setTab(t); FX.sound("tab"); return;
      }
      if (ui.tab === "mods" && ui.sub === "cat") { const r = selRow() || $("inv").querySelector(".row"); if (r) { e.preventDefault(); r.focus(); } return; }
      if (ui.tab === "stat" && $("sp-attrs")) { e.preventDefault(); $("sp-r-" + spSel).focus(); return; }
    }
  }
  if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const a = document.activeElement;
    if (a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) return;
    e.preventDefault(); setTab("mods", { sub: "cat" }); closePanel(false); $("q").focus();
  }
});
$("notice").addEventListener("focusout", () => armNoticeTimer());
// A Nexus image that fails to load leaves no broken frame behind.
document.addEventListener("error", e => {
  const i = e.target; if (!i || i.tagName !== "IMG") return;
  i.closest(".d-pic")?.remove();
}, true);

/* ---------- Exports ---------- */
function exportCSV() {
  const mods = ordered([...R.all].map(id => BY[id]).filter(Boolean)), cols = ["load_group", "name", "nexus_id", "file", "module", "tier", "notes"];
  const q = s => `"${String(s ?? "").replace(/"/g, '""')}"`;
  download("fallout4-mod-list.csv", [cols.join(","), ...mods.map(m => cols.map(c => q(c === "nexus_id" && m.nexus_id ? nexusUrl(m) : m[c])).join(","))].join("\n"), "text/csv");
  flash($("x-csv"), "Downloaded");
  announce("CSV downloaded.");
}
$("x-csv").onclick = exportCSV;
$("x-txt").onclick = async () => {
  const text = ordered([...R.all].map(id => BY[id]).filter(Boolean)).map((m, i) => `${i + 1}. ${m.name}${m.file ? " (" + m.file + ")" : ""}${m.nexus_id ? " " + nexusUrl(m) : ""}`).join("\n");
  try { await navigator.clipboard.writeText(text); flash($("x-txt"), "Copied"); announce("Load order copied."); }
  catch { download("fallout4-load-order.txt", text, "text/plain"); flash($("x-txt"), "Saved as a file"); announce("Load order saved as a file."); }
};
$("x-link").onclick = async () => {
  const url = shareUrl();
  try { await navigator.clipboard.writeText(url); flash($("x-link"), "Copied"); announce("Share link copied."); }
  catch { window.prompt("Copy this link", url); }
};
$("x-clear").onclick = () => applyPreset("clear");

/* ---------- Load ---------- */
function fillStatic() {
  const maxOf = arr => arr.filter(Boolean).sort().pop() || "";
  const checked = maxOf(MODS.map(m => m.checked_on)), synced = maxOf(Object.values(NX).map(n => n.synced_on));
  document.querySelectorAll(".n-total").forEach(e => e.textContent = num(MODS.length));
  FX.setBootData({ mods: plural(MODS.length, "mod"), tapes: plural(PT.length, "tape"), date: fmtDate(checked, true) || "not recorded" });
  $("rec-total").textContent = num(MODS.length);
  $("rec-pick").textContent = num(MODS.filter(inPt).length);
  $("rec-avoid").textContent = num(MODS.filter(m => m.tier === "avoid").length);
  const pc = num(MODS.filter(m => m.perf_pc).length);
  $("rec-pc").textContent = pc; $("ab-pc").textContent = pc;
  $("rec-date").textContent = fmtDate(checked, true) || "Not recorded";
  $("hud-date").textContent = `Runtime 1.11.240 · last check ${fmtDate(checked, true) || "not recorded"}`;
  $("foot-dates").textContent = `Data checked up to ${fmtDate(checked, true) || "an unknown date"}${synced ? `, Nexus details synced on ${fmtDate(synced, true)}` : ""}.`;
  $("core-btn").textContent = `Load only the ${num(MODS.filter(m => m.tier === "core").length)} core fixes`;
  renderTapes();
}
let setupDone = false;
async function load() {
  $("inv").innerHTML = '<p class="loading">Loading the catalogue…</p>';
  $("sp").innerHTML = '<p class="loading">Loading the catalogue…</p>';
  try {
    const [csv, nx, pts] = await Promise.all([
      fetch("../data/mods.csv").then(r => { if (!r.ok) throw new Error("mods.csv " + r.status); return r.text(); }),
      fetch("../data/nexus.json").then(r => r.ok ? r.json() : {}).catch(() => ({})),
      fetch("../data/playthroughs.json").then(r => r.ok ? r.json() : []).catch(() => []),
    ]);
    MODS = parseCSV(csv); NX = nx && typeof nx === "object" && !Array.isArray(nx) ? nx : {}; BY = Object.fromEntries(MODS.map(m => [m.id, m]));
    MODS.forEach((m, i) => {
      const n = NX[m.nexus_id] || {};
      m.hay = (m.name + " " + m.summary + " " + (n.name || "") + " " + (n.author || "")).toLowerCase();
      m.mi = MOD_KEYS.indexOf(m.module); m.ti = TIERS.indexOf(m.tier); m.prof = list(m.profiles); m.ci = i;
      // Older data had a yes/no "our_pick" column instead of "playthroughs".
      m.pts = m.playthroughs !== undefined ? list(m.playthroughs) : m.our_pick === "yes" ? [LEGACY_PT] : [];
    });
    setupPlaythroughs(pts);
    const hp = new URLSearchParams(location.hash.slice(1));
    if (MACHINES[hp.get("machine")]) state.machine = hp.get("machine");
    SP = spDefault();
    state.pt = hashFilter(hp);
    const raw = hashPreset(hp) ? [] : parseList(hp.get("list")), missing = raw.filter(id => !BY[id]);
    if (raw.length) state.chosen = new Set(raw.filter(id => BY[id]));
    R = resolve(); loaded = true;
    if (!setupDone) { setupFilters(); setupDone = true; }
    syncMachineUI(); syncFilterUI(); fillStatic(); renderReq(); syncPresets(); render({ quiet: true }); spRender();
    readHash(hp, true, missing);
  } catch (err) {
    const box = `<div class="empty"><p class="eh">Data feed lost</p><p>The catalogue could not be loaded (${esc(err.message)}). Open this page from the published site or a local web server, not as a file.</p><div class="row-btns"><button class="btn primary" data-retry>Try again</button></div></div>`;
    $("inv").innerHTML = box; $("sp").innerHTML = box;
    $("result-count").textContent = "No data";
    ["x-csv", "x-txt", "x-link", "x-clear"].forEach(id => $(id).disabled = true);
  }
}
R = resolve(new Set());
setupPhosphor();
FX.setupSettings();
syncStatus();
load();
