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

### Changed

- Site rebuilt as a Pip-Boy: STAT (the S.P.E.C.I.A.L. sheet, one step per screen), MODS (list and details, with My list), PLAYTHROUGHS (holotapes) and ABOUT tabs, a status bar, and four screen colours.
- Pip-Boy atmosphere and readability: Roboto Condensed (the game's Pip-Boy font), a rolling scan band, grain and glow kept off small text, a sliding tab outline, centred sub-tabs, rolling counters, a short boot screen, optional generated UI sounds, and an Effects setting (full, reduced, off).
- A Pip-Boy casing drawn around the screen on wide windows, a START screen that explains the site with three ways in, and each step's action placed right under its options.
- The casing is now a drawn Fallout 4 terminal. S.P.E.C.I.A.L. rows use arrows beside each value. MODS opens on a section overview, shows essentials first with folded options, and adds mod pictures (phosphor duotone, original colours on request) and one-line summaries.
- Worn terminal paint and two Vault-Tec style stickers drawn for the site, redrawn holotapes and a clearer PLAYTHROUGHS page, a barrel curve on the screen's lines, and synthesised sounds closer to the game's terminal. Sub-tab clicks now always open their page.
