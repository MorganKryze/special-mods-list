# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Mod catalogue, catalogue pages, interactive site and their scripts, imported from fallout4-macos-modding v1.0.0.
- Ready-made playthroughs in `data/playthroughs.json`, and a `playthroughs` column replacing `our_pick`.
- The planned gaming PC playthrough: 89 new mods (visuals, life, gunplay, Brotherhood, survival-lite, quests) and 193 rows updated, with the write-up in `docs/playthroughs/`.
- `perf_pc` column: cost on a gaming PC. New `visuals` module.
- Data checks in `build_catalog.py`: allowed values, duplicate ids, links to missing ids.
- Site: playthrough presets, a machine toggle for costs, and the S.P.E.C.I.A.L. sheet questionnaire.
- The gaming PC playthrough as installed and tested on 2026-11-07: 11 new rows (No Bethesda and S.P.E.C.I.A.L Intro, FOV Slider and Player Height, powerofthree's Photo Mode, Vivid Fallout - All in One, Vivid Fallout LOD, Better Landscape Grass, Multiple Ammo Use, RL Recruit Framework, Gunner Outfit Pack, Project Reality Footsteps FO4, the Prydwen Extras update file), and LooksMenu and the SS2 eXoPatch joined it.
- Quality-of-life additions to the gaming PC playthrough (2026-11-07): 25 mods, 5 of them new rows (Animated Coffee Drinking, Explosion VFX Pack, Tumbajamba's RobCo Combat Armor and Battle Suit, Improved Map with Visible Roads, Enhanced Blood Textures) and 20 existing rows joined it; installed, first in-game session not yet checked.
- Twelve mods evaluated from a video list for the gaming PC playthrough (2026-11-08): More Vines, Faded Glory, Clickerfied Ghouls, Commonwealth Warfare - Explosions, Not Great Not Terrible, FTO Stars, West Tek Tactical Gloves and Infinite Companion Ammo joined it; Hollywood Bullet Tracers and Plenty 'o' Exploration are `avoid`, Darker Nights and Blood Mist Overhaul are listed with their conflicts.
- `scripts/fo4-tools`: plugin and BA2 readers and the whole load order checks (precombined meshes, previs files, objects outside the previs), a symlink game copy builder and a music merge patch writer.
- Guide `docs/guides/linux-previs.md`: building one previs patch for a full MO2 load order on NixOS with Proton (setup steps; generation steps to follow).
- Spoiler-free field guide for the gaming PC playthrough (`docs/playthroughs/pc-minutemen-bos-field-guide.md`), with the settlement cleanup check: Clean My Settlement REDUX and MS Raze my Settlement not added (measured cell edits; SUP F4SE predates 1.11.240).
- Object LOD for the gaming PC playthrough, generated on Linux on 2026-11-08 and 11-09: FOLIP patch, TexGen under Wine stable (its Texconv check fails under Proton, and without it 1,630 LOD textures were missing), xLODGen objects for 10 worldspaces. `FOLIP - Patch.esp` loads before the previs patch, with the measured reason. Checked in game: no purple or missing buildings in the distance.
- Verdant Wasteland joined the gaming PC playthrough; Verdant Wasteland LITE and Luxor's Greenery 2k listed with their measured overlaps.
- `scripts/fo4-tools`: `esp_filter.py`, `findref.py`, `ba2pack.py`, `ba2compress.py`, and `previs/` with the scripts that run the Creation Kit and FO4Edit unattended under Proton.

### Changed

- The Linux previs guide now holds the full procedure of the first whole load order build (2026-11-08): every step with its command, duration and result, the crash isolated to FensParkviewApartments02, the fixes for loose previs files, sleep and memory, the archive compression, install rules and the audits and in-game check after install. The gaming PC playthrough records the `SanctuaryPrevis` patch (confirmed in game), marks the PRP patch overlaps and the Diamond City holes as resolved, and has 244 active plugins.
- The gaming PC playthrough on 2026-11-08: Hunkered Down and paHUD removed, Nina's pipe guns fixed as Lunar Fallout Arsenal asks, the Lexington PRP patch reordered (confirmed in game), friendly compass markers turned off, the two non-PRP Diamond City previs plugins disabled, and the whole load order audit that led to the full previs build; 242 active plugins.
- The gaming PC playthrough is installed and tested, and in progress: measured performance, plugin and DLL counts, the test gate result, Proton fixes and the changes from the plan in its write-up. TMR Pre Generated Terrain LOD left it for Vivid Fallout LOD. Requirements found at install are now in `requires` (At A Minute's Notice, That's Gunner Life, Project Reality Footsteps - Expansion, the Prydwen Extras PRP patch, Lunar Fallout Arsenal), and install notes were added to Baka Framework, Hydra, SS2 Settlers UI, RobCo Patcher, SPID, the Improved series, High FPS Physics Fix and Community Shaders.
- The gaming PC write-up gains a quality-of-life section: 242 active plugins, the deferred FallUI Item Sorter trio, the mods considered and not taken, and the Steam launch straight into F4SE. Hit Those Explosives now requires Hit Those Objects, and Reduce Grenade Spam is noted as standalone.
- The gaming PC playthrough after its first launch (2026-11-07): MCM Booster is now `avoid` and `no` on 1.11.240 after a main-menu crash (its `Interface/MainMenu.swf`, from the Addictol crash log) and left the playthrough with Classic Holstered Weapons and Unused Map Markers, duplicates of Visible Favorites and Cartographers Map Markers; 241 active plugins. The write-up and the Stability page gain the rule that plugins with CELL overrides load before PRP (Better Landscape Grass loaded after it removed the Sanctuary bridge), and the write-up lists the overlapping PRP patches (Hunkered Down, The Rooftops, Subway Runner - Revival, TftC, Lexington, Diamond City) as a known issue, also noted on their rows.
- Site rebuilt as a Pip-Boy: STAT (the S.P.E.C.I.A.L. sheet, one step per screen), MODS (list and details, with My list), PLAYTHROUGHS (holotapes) and ABOUT tabs, a status bar, and four screen colours.
- Pip-Boy atmosphere and readability: Roboto Condensed (the game's Pip-Boy font), a rolling scan band, grain and glow kept off small text, a sliding tab outline, centred sub-tabs, rolling counters, a short boot screen, optional generated UI sounds, and an Effects setting (full, reduced, off).
- A Pip-Boy casing drawn around the screen on wide windows, a START screen that explains the site with three ways in, and each step's action placed right under its options.
- The casing is now a drawn Fallout 4 terminal. S.P.E.C.I.A.L. rows use arrows beside each value. MODS opens on a section overview, shows essentials first with folded options, and adds mod pictures (phosphor duotone, original colours on request) and one-line summaries.
- Worn terminal paint and two Vault-Tec style stickers drawn for the site, redrawn holotapes and a clearer PLAYTHROUGHS page, a barrel curve on the screen's lines, and synthesised sounds closer to the game's terminal. Sub-tab clicks now always open their page.
- Sounds reduced to a soft tick and a soft click; heavier weathering and aged stickers; a more convex glass; the cost view moved from the status bar to the Filters panel; Back now sits left of Next.
- The casing is now built from textures generated for this site, with baked weathering (grime, rust runs, dust, chipped paint) and stickers printed on aged paper.
