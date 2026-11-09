# Playthrough: Minutemen and Brotherhood, full immersion on a gaming PC

**Status: in progress.** The list was installed and tested on 2026-11-07, and the real playthrough is starting. Frame rates below are measured on this machine with the base list; the visual layer is installed but not yet measured or tuned. In `data/mods.csv`, this playthrough is the rows whose `playthroughs` cell contains `pc-minutemen-bos` (`status` is `played` in `data/playthroughs.json`, the schema's value for a list that is being played).

Player sheet, spoiler-free: [field guide](pc-minutemen-bos-field-guide.md).

## The game it aims for

- The Minutemen and your settlements at the centre: you build, recruit and defend with Sim Settlements 2.
- The Brotherhood of Steel as a second career, for its atmosphere: the Prydwen, the Cambridge police station, patrols and vertibirds.
- Exploration from time to time, with a few quests and two new companions.
- An open ending, leaning towards a Minutemen victory that keeps the Brotherhood alive.
- Survival-lite: Very Hard difficulty outside Survival mode, hunger, thirst and sleep, free saving.

Machine: Ryzen 7 9800X3D, RTX 5070 Ti 16 GB, 32 GB, 3440×1440 up to 180 Hz with VRR, NixOS, Mod Organizer 2 under Proton.

## Installed and tested (2026-11-07)

| | |
| --- | --- |
| System | NixOS, Proton 11.0-2 |
| Game | 1.11.240 (Steam build 24564252), F4SE 0.7.9 |
| Mod Organizer 2 profile | "Partie PC" |
| Plugins | 224 active at the test: 76 full, 148 light (242 after the [quality-of-life additions](#quality-of-life-additions-2026-11-07), 241 after the [first-launch fixes](#after-the-first-launch-2026-11-07)) |
| F4SE DLLs | 29, all "loaded correctly" in `f4se.log` |
| Crash logs | None |

### Performance

Measured with the macOS base list, before any visual mod, at 3440×1440:

| Place | Uncapped |
| --- | --- |
| Outdoors | 200-300 fps |
| Concord interiors | 500-600 fps |

The game is capped at 120 fps by High FPS Physics Fix (`InGameFPS=120`), so the frame rate stays inside the VRR range. Frame rates with the textures, grass and Community Shaders features are not measured yet.

### The test gate

Passed, so RobCo Patcher, SPID, Improved Minutemen and Improved Brotherhood of Steel stay in.

| Check | Result |
| --- | --- |
| New game, save, reload 4 times | No crash |
| `po3_SpellPerkItemDistributorF4.log` | Clean |
| `RobCo_Patcher.log` | 47 warnings, 0 errors: Improved Minutemen's "level multiplier out of range" for a few Vanguard NPCs (RobCo skips those entries), and "failed to get next record info" once per load |

### Proton and setup notes

| Problem or need | Fix |
| --- | --- |
| No music | Microsoft XAudio2 64-bit: `protontricks 377160 xact_x64`, then launch with `WINEDLLOVERRIDES="xaudio2_7,x3daudio1_7=n,b"` |
| Community Shaders | `d3dcompiler_47` in the prefix; its menu opens with End. ENB is not used |
| AZERTY keyboard | Remap keys in the game's Controls menu: a hand-written `ControlMap_Custom.txt` crashed the game |
| Lunar Fallout Arsenal | Bundles `MultipleAmmoUse.dll` 1.1.2, which F4SE disables as incompatible on 1.11.240: install Multiple Ammo Use 2.0.3 so it wins over Arsenal in MO2 (it adds `MultipleAmmoUse.esm`) |
| Baka Framework with Hydra | Set `bEnableLoadingEditorIDs=0` in `BakaFramework.ini`: Hydra supersedes it and warns otherwise |
| SS2 Settlers UI | In the FOMOD, pick "Fallout 4 v1.11.240 (New-new-new-Gen) and later" |
| LooksMenu 1.7.0.4 | The file text says 1.11.221, but `f4ee.dll` loads correctly on 1.11.240 |

### Changes from the plan

| Change | Mods | Why |
| --- | --- | --- |
| Added | No Bethesda and S.P.E.C.I.A.L Intro, FOV Slider and Player Height, powerofthree's Photo Mode, LooksMenu | Start-up, 21:9 field of view, screenshots and character editing |
| Added | Vivid Fallout - All in One 2K, Vivid Fallout LOD (Commonwealth LOD for 2K), Better Landscape Grass | The nature layer |
| Added | Multiple Ammo Use 2.0.3 | Required by Lunar Fallout Arsenal on 1.11.240 (see above) |
| Added | RL Recruit Framework, Gunner Outfit Pack, Project Reality Footsteps FO4, the Prydwen Extras update file of A Sensible Prydwen Overhaul | Requirements found missing at install, of At A Minute's Notice, That's Gunner Life, Project Reality Footsteps - Expansion and the Prydwen Extras PRP patch |
| Added | Sim Settlements 2 - eXoPatch | Required while RobCo Patcher is used |
| Removed | TMR Pre Generated Terrain LOD | Vivid Fallout changes landscape textures, so Vivid Fallout LOD replaces it |
| Removed | Heather Casdin and its patch | Left out of this playthrough |

### Quality-of-life additions (2026-11-07)

Added after the test, the same day: 25 mods, which bring the profile to 242 active plugins. They are installed in "Partie PC" and the playthrough starts with them, but no log has been read since and no in-game session has been checked yet. Four are F4SE DLLs (Classic Holstered Weapons, Crafting Highlight Fix, Rename Anything, Friendly NPCs On Compass), not yet checked in `f4se.log`.

| Area | Mods | Install notes |
| --- | --- | --- |
| Interface | Get Out Of My Face, Faster Terminal Displays, Crafting Highlight Fix, MCM Booster, Power Armor HUD - paHUD, Cartographers Map Markers, Improved Map with Visible Roads, Rename Anything, QuickTrade Redux, Friendly NPCs On Compass | Faster Terminal Displays 20x; Get Out Of My Face main file, not AIO; Improved Map 2.0 Default (texture only); Cartographers Map Markers loaded before PRP |
| Visuals | Explosion VFX Pack, Enhanced Blood Textures | Explosion VFX Pack 9.0.0, FOMOD defaults (Standard for every explosion), ESL-flagged; EBT_Basic 1.01 |
| Immersion | Animated Coffee Drinking, Classic Holstered Weapons, Automatically Lowered Weapons, Commonwealth Small Wildlife, Publick Occurrences Expanded, Protected Unique Brahmin, Caravan AI Tweak | Animated Coffee Drinking is an ESL and, its author says, touches no vanilla records; Publick Occurrences Expanded DLC version, Anniversary Edition |
| Gameplay | Hit Those Explosives, Longer Area Respawn, Legendaries They Can Use, Reduce Grenade Spam | Hit Those Explosives needs Hit Those Objects, already in; Legendaries They Can Use replaces `LegendaryItemQuestScript`, and no other installed mod, Lunar included, ships that script loose or in its main BA2; Reduce Grenade Spam is a standalone plugin whose only master is `Fallout4.esm`, despite the "Combat AI Empowered" name |
| Gear | Tumbajamba's RobCo Combat Armor and Battle Suit | 1.0 (archived); FOMOD without the "Armor Availability" leveled-list option, to leave Lunar's leveled lists alone: crafting only |
| Settlements | Longer Power Lines | 3x |

Two overlaps the catalogue already flags were both installed: Classic Holstered Weapons with Visible Favorites, and Cartographers Map Markers with Unused Map Markers. Both duplicates were removed after the first launch (below).

| Decision | Mods | Why |
| --- | --- | --- |
| Chosen, deferred | FIS - FallUI Item Sorter, FallUI - Icon Library, SS2 FallUI Icons | They need the Complex Item Sorter xEdit run, scheduled with xLODGen |
| Considered, not taken | SS2 Settlement Management Terminal | Redundant with SS2 Settlers UI |
| Considered, not taken | Move that Workbench | Little use with Place Everywhere |
| Considered, not taken | Salvage Beacons, SAICC | The player's choice |

Launch: the Steam shortcut now starts the game through Mod Organizer 2 straight into F4SE, with the launch options `mo2.sh %command% -p "Partie PC" "moshortcut://:F4SE"`. The DXVK HUD is off by default.

### After the first launch (2026-11-07)

The first launch of the playthrough, the same day, led to these changes. The profile now has 241 active plugins.

| Change | Mods | Why |
| --- | --- | --- |
| Removed | MCM Booster | Crashed the game at the main menu. The Addictol crash log shows `EXCEPTION_ACCESS_VIOLATION` in `Scaleform::GFx::Value::ObjectInterface::GetMember` with `MainMenu` on the stack, looking for `BackgroundAndBracketsInstalledContentTopic_mc.InstalledContentPanelBackground_mc`. MCM Booster ships `Interface/MainMenu.swf`, the only mod in the list to do so. The catalogue now marks it `avoid` and `no` on 1.11.240 |
| Removed | Classic Holstered Weapons | Duplicate of Visible Favorites |
| Removed | Unused Map Markers | Duplicate of Cartographers Map Markers. No plugin depends on it, so removing it from an ongoing save only triggers the missing plugin warning |
| Moved before `prp.esp` | Better Landscape Grass, Vivid Fallout - All in One 2K, Vivid Fallout LOD, Valius 2K, Lightweight Lighting, Fallout 4 Particle Patch, Gloomy Glass, Base Face, This Made My Spline Stiff, Terrain Freckles Be Gone, Targeted Textures | See the load-order rule below |
| Removed (2026-11-08) | Hunkered Down - Commonwealth Overhaul and its PRP patch | Its PRP patch rewrote 480 cells and overlapped The Rooftops (90 cells), Subway Runner - Revival (18, 9 of them in Concord), 3DNPC ExoEm (19) and Immersive Lexington (9). The mod only dresses 30+ locations (shelters, insulation, fewer unattended fires), no scripts or quests, so it left the ongoing save without trouble |
| Removed (2026-11-08) | Power Armor HUD - paHUD | In power armor the HUD showed only its red elements (gauges, damaged parts) next to FallUI HUD and Immersive HUD. Display only, so it left the save without trouble |
| Fixed (2026-11-08) | Nina's Proper Pipe Guns Replacer and Revisited | Lunar Fallout Arsenal's install notes ask to move each mod's `Meshes/Weapons` into `Meshes/nina_old` and `Meshes/nina_redux` and to delete their textures; skipped at install, the .45 pipe pistol was invisible. Done by hand |
| Reordered (2026-11-08) | ImmersiveLexington_PRP_Patch.esp now loads after TheRooftops_PRP_Patch.esp | Objects disappeared in Lexington. In the 9 shared cells (grid -10..-8, 8..10) Immersive Lexington edits 238 references and adds 136, The Rooftops adds 24, so Lexington's previs is the one to keep there. Confirmed in game on 2026-11-08: nothing disappears in Lexington any more |
| Turned off (2026-11-08) | Friendly NPCs On Compass: `bFriendlyNPCMarkers=0` | Friendly NPCs and Dogmeat appeared with the same red marker as enemies; the mod has no colour option. Confirmed in game: the compass is back to vanilla |
| Disabled (2026-11-08) | DiamondCity-PreVis.esp and DiamondCity-PreVis-Ambience.esp (from Diamond City Expansion - eXoPatch) | Holes around Fens Street: both previs plugins are built without PRP and loaded after DiamondCityExpansion_PRP_Patch.esp in the same 18 cells (grid -1..4, -1..1); the PRP patch alone now owns them. Not enough: walls and whole buildings still disappeared on the way to Diamond City. Resolved by the whole load order previs patch below, confirmed in game on 2026-11-08 |
| Added (2026-11-08) | SanctuaryPrevis (built for this profile) | One precombine and previs patch for the whole load order, built with PJM's scripts and the Creation Kit under Proton: 383 precombined cells, 342 previs clusters, 79 masters, loaded last. Procedure, durations and checks in [the guide](../guides/linux-previs.md). After installing it the player went back to the Diamond City outskirts, Fens Street, Lexington and Concord: nothing vanishes any more |
| Changed (2026-11-08) | `SanctuaryPrevis - Main.ba2` compressed | Rewritten with zlib entries like the vanilla archives: 837 MB on disk down to 359 MB, every entry byte-identical after decompression |

#### Whole load order audit (2026-11-08)

Fixing PRP patch overlaps one town at a time did not stop the holes, so every Commonwealth cell was checked at once with the scripts in [`scripts/fo4-tools`](../../scripts/fo4-tools/README.md):

| Check | Script | Result |
| --- | --- | --- |
| Every precombined mesh named by the winning CELL record exists in a loaded archive or loose file | `previs_audit.py` | Nothing missing in the Commonwealth (3 far cells only) |
| The `vis/*.uvd` file of each previs block comes from the plugin whose CELL record wins | `vis_audit.py` | 4,804 exterior cells consistent; the rest are map-edge cells without previs data and 11 cells far from Boston |
| Objects placed or edited in previs cells by plugins that are not the previs owner or one of its masters | `ref_audit.py` | At least 45 plugins (the listing stops at 45). Largest: You And What Army 2 (5,286 new references), SS2 Chapter 2 (4,558), America Rising 2 (1,913), the People Live In mods (about 6,000 together), Boston Airport Redux (755 edits). Around Diamond City: America Rising 2 (185), Goodneighbor Expanded (190), You And What Army 2 (126), SS2 (16) |

The previs patches themselves are consistent; what breaks is that dozens of mods change cells whose visibility was computed without them, and no downloadable patch covers this combination. The fix is one previs patch built for the whole load order: [Previs for the whole load order on Linux](../guides/linux-previs.md). After installing it, `ref_audit.py` finds 1,965 such references from 24 plugins, nearly all new objects (map markers, workshop and clutter objects), and `vis_audit.py` 4,805 consistent cells.

#### Load-order rule: cell overrides go before PRP

Plugins that only change textures, lighting, grass or particles can still carry CELL overrides. They must load **before** `prp.esp`, so that PRP's previs data wins in those cells. With Better Landscape Grass loaded after PRP, 4 Sanctuary cells got their vanilla previs data back, and the Sanctuary bridge and walls vanished along with their collision: the player fell through. Moving the plugins in the table above before PRP fixed it.

Checked afterwards in the plugins themselves: only Better Landscape Grass (1,980 CELL and 1,980 LAND overrides) and Fallout 4 Particle Patch (12 CELL, 57 REFR) carry cell data. The nine others have no CELL, LAND or REFR record, so their position around PRP does not matter; they were moved together for simplicity.

Flutter Flicker Fixer For Foliage is the exception: its file is itself a PRP file, so it stays after PRP.

#### Overlapping PRP patches (resolved 2026-11-08)

The whole load order patch `SanctuaryPrevis` is built over all of them (they are among its masters) and loads after them. The table is kept as the record of what was found.

The PRP patches that load after PRP were each built for one mod. Where two of them edit the same cell, the last one loaded wins there, and the other mod's previs is lost in that cell. Overlaps found in this profile:

| Patches | Shared cells |
| --- | --- |
| Hunkered Down and The Rooftops | 90 |
| Hunkered Down and Tales From The Commonwealth (3DNPC) ExoEm | 19 |
| Hunkered Down and Subway Runner - Revival | 18: 9 in Concord (grid -16..-14, 17..19), 9 in Boston (around -4..-2, -10..-8) |
| The Rooftops and Tales From The Commonwealth (3DNPC) ExoEm | 18 |
| Diamond City Expansion PRP patch, `DiamondCity-PreVis` and `DiamondCity-PreVis-Ambience` | 18-19 (the two eXoPatch previs plugins were disabled on 2026-11-08) |
| Hunkered Down and Immersive And Extended Lexington | 9 |
| Immersive And Extended Lexington and The Rooftops | 9 |
| Subway Runner - Revival and The Rooftops | 9 |

In Concord, objects disappeared depending on the view angle. The lead was the overlap between the Hunkered Down and Subway Runner - Revival patches; Hunkered Down was removed on 2026-11-08, after which no PRP patch overlap is left in Concord (re-checked with the plugin reader). Confirmed in game by the player on 2026-11-08: nothing disappears in Concord any more. Overlaps still present: Diamond City (Diamond City Expansion PRP patch, DiamondCity-PreVis and DiamondCity-PreVis-Ambience, 18-19 cells) and The Rooftops with Immersive Lexington (9), Subway Runner (9) and 3DNPC ExoEm (18).

### Additions from a video list (2026-11-08)

The player picked mods from a YouTube list built for Xbox. Rule applied: a mod goes in when it adds something and is compatible; it stays out when it stops the game or harms gameplay. Performance cost alone is not a reason to leave a mod out. Each mod was checked against the profile with the plugin reader (records overridden by other plugins) and a file comparison (loose files and BA2 contents).

| Mod | Decision | Measured |
| --- | --- | --- |
| More Vines | Added | 2 plugins, about 4,850 new vines; loaded right after the unofficial patch, as its author asks. They sit in previs cells, so they are part of the whole load order previs build |
| Faded Glory | Added, with a merge patch | 23 of its 29 music records are also changed by LOST Audio Tweaks (LAT: priority, Faded Glory: tracks). No patch exists, so `LAT - Faded Glory Patch.esp` (ESL, made with `merge_musc.py`) keeps the LAT records and adds the Faded Glory tracks. Loads after both |
| Clickerfied Ghouls - Idle Sounds | Added | 17 sound records, no overlap |
| Commonwealth Warfare - Explosions | Added | 17 loose sounds, no overlap |
| Not Great Not Terrible | Added | 32 loose sounds, no overlap |
| FTO Stars 4K | Added | One texture, no overlap |
| West Tek Tactical Gloves | Added | New records only |
| Infinite Companion Ammo | Added | SPID ini only |
| Hollywood Bullet Tracers | Left out | 15 projectiles and 6 weapons also changed by Lunar Fallout Overhaul |
| Darker Nights | Left out | 19 weathers also changed by Lightweight Lighting; both rewrite the ambient colours |
| Plenty 'o' Exploration | Left out | Discontinued with issues its author never fixed; its navmesh info map is overridden by UFO4P, PRP and SS2 |
| Blood Mist Overhaul | Left out | Its two meshes replace those of Enhanced Blood Textures and Fallout 4 Particle Patch |
| Campsite (Simple Camping) | Already installed | |
| Green in the Commonwealth, Crowded Commonwealth, Project Apocalyptic Commonwealth, American Dream Radio Seasons, Atomicolor - Minutemen | Not available | Not found on Nexus Mods (searched by name on 2026-11-08). The only Nexus page that cites Project Apocalyptic Commonwealth, a modlist (mod 54871), is hidden |
| Modern weapon replacers (12), See Through Scopes, Building Budget Extender, Start Me Up Redux, Enter The Brotherhood, Interiors Enhanced, NAC X | Left out, not checked | Not downloaded. The weapon replacers and scopes would swap vanilla weapons that Lunar Fallout Arsenal already reworks; SS2 already raises the build limit; the start mod only matters for a new game; Enter The Brotherhood changes how you join the Brotherhood, and this path is already under way; Interiors Enhanced and NAC X are lighting and weather overhauls next to Lightweight Lighting |

The profile now has 242 active plugins.

### Greenery after the patch (2026-11-08)

| Mod | Decision | Measured |
| --- | --- | --- |
| Verdant Wasteland (full) | Added | Textures and materials in two BA2 archives, and `VW_VerdantWasteland.esp`: overrides 10 climates (CLMT), the GameDay, GameHour and GameMonth globals and 2 undergrowth statics, adds 2 material swaps. No CELL or REFR record, so the previs patch stands. Files shared with installed mods: 13 with Vivid Fallout - All in One 2K and 9 with Targeted Textures, which Verdant replaces (its plugin loads after theirs); 1 with PRP, `meshes/landscape/trees/treehero01.nif`, which PRP keeps (`VW_VerdantWasteland.esp` loads before `prp.esp`) |
| Verdant Wasteland LITE | Not taken | The tree part of the full version only; 6 files shared with Vivid Fallout, 1 with PRP |
| Luxor's Greenery 2k | Not taken | Plant textures; the full Verdant Wasteland already retextures the plants. 6 files shared with Vivid Fallout, 6 with Targeted Textures |

The profile now has 244 active plugins.

### Object LOD (2026-11-08 and 11-09)

Generated on Linux, after the whole load order previs patch, following the TMR order: FOLIP patch, TexGen, xLODGen objects.

| Step | Result |
| --- | --- |
| FO4LODGen Resources | The mod folder was empty (failed install); refilled with `FO4LODGen.esp` and `FO4LODGen - Main.ba2`, the FOMOD option TMR recommends. Loaded before `Far Harbor 3d Tree LODs.esp`: its only record shared with other plugins (one STAT) is already won by `FOLIP - New LODs.esp` |
| FOLIP xEdit script 8.1 | Run unattended in FO4Edit (Simple Records off, ForceLOD8 on, other settings default). Wrote `FOLIP - Master.esm` (overrides 4,797 REFR, 3,691 STAT, 1,237 CELL, 593 MSWP) and `FOLIP - Patch.esp` (174 REFR, 155 STAT, 37 CELL, 4 WRLD) |
| `FOLIP - Patch.esp` placement | Loaded **before** `SanctuaryPrevis.esp`, not last as TMR advises: it shares 34 CELL and 3 WRLD records with the previs patch, with identical previs data except one Cambridge cell where 5 `CPD_redux.esp` physics refs become null (CPD_redux is not one of its masters). Set in both `plugins.txt` and `loadorder.txt`: MO2 rewrites `plugins.txt` from `loadorder.txt` at launch, which had undone a change made in `plugins.txt` alone |
| TexGen (DynDOLOD 3 Alpha-218) | **Required:** an xLODGen run without it left 1,630 of 1,633 non-atlas textures missing (`textures/lod/...`), purple on distant façades in game. Under Proton it stops at its Texconv check ("Executing Texconvx64.exe returned error code FFFFFFFF"). Under Wine 11.0 stable without staging patches (`nixpkgs#wineWow64Packages.stable`, own prefix) it ran: base size 256, "TexGen completed successfully", 4,038 files, 168 MB, installed as MO2 mod `TexGen Output` |
| xLODGen beta 132, objects only | Run under Proton after TexGen: 10 worldspaces, every LODGen run ended with code 0 (Texconv launches are retried, logged as warnings); 1,052 files, 1.9 GB. Atlas 8192, max texture 1024, diffuse BC7, normal and specular BC5; trees, terrain and occlusion off (Vivid Fallout LOD provides the terrain). Three textures were still missing, the LOD copies of `diamondclothplain02`: added to `TexGen Output` from the vanilla files that `DiamondClothPlain02Alpha.bgsm` uses (`diamondclothplain02_d`, `diamondcloth02_n`, `diamondcloth02_s`). Final check: every texture the LOD meshes reference exists in a loaded archive or loose file |
| Install | MO2 mods `FO4LODGen Output` then `TexGen Output`, top priority. Misery Island left out: LODGen could not find 10 of its LOD materials (17,097 log lines, all in Misery Island), so that worldspace keeps the object LOD shipped in its own BA2. No other mod has loose object LOD files; the BA2 ones (UFO4P, Vivid Fallout LOD, America Rising 2) are overridden |

Distant trees are drawn by the 3D tree LOD meshes of Optimized Vanilla Tree LODs and Far Harbor 3d Tree LODs. Whether they match Verdant Wasteland's look has not been checked in game.

### Still to do

- Dialogue subtitles: off in the profile's `fallout4prefs.ini` (`bDialogueSubtitles=0`, `bGeneralSubtitles=0`); to switch back on and check in dialogue.
- Community Shaders: features still to switch on and tune one at a time, with Boston fps checked.
- Character appearance, in two steps:
  - Faces, eyes and hair: PROJECT BEAUTY (FACEGEN), The Eyes of Beauty - Remastered, Facial Expression and Eyetracking Engine Fixes, hairstyle packs; each to check on 1.11.240 and against the mods that add NPCs.
  - Bodies, chosen level: realistic nudity only when a character is undressed, varied NPC bodies, no added sexual content and no fanservice outfits. Candidate stack: BodySlide and Outfit Studio 6.1.0 (2026-11-04), CBBE 2.7.2 (2025-12-22) with its vanilla outfit BodySlide files, LooksMenu BodyGen with BodyConvert and Real Body Randomizer, the Gunner Outfit Pack CBBE files (74450), vanilla male body. To check: BodySlide under Proton, conversions for the Minutemen and raider outfit mods, the CBBE build for 1.11.240 content.
  - Classy Chassis Outfits: its four packs describe themselves as "sexy remodels" of vanilla outfits (Nexus summaries, 2026-11-10), outside the chosen level.
- The quality-of-life additions: `f4se.log` for their three remaining DLLs (Crafting Highlight Fix, Rename Anything, Friendly NPCs On Compass) and a checked in-game session.

- FIS - FallUI Item Sorter and its icon mods, with the Complex Item Sorter xEdit run at the same time as xLODGen.

## What changes from the macOS playthrough

| Area | [macOS playthrough](https://github.com/MorganKryze/fallout4-macos-modding/blob/main/docs/reference-playthrough.md) | This playthrough |
| --- | --- | --- |
| Visuals | None, half-resolution render | Fallout 4 Community Shaders (features enabled one at a time), Lightweight Lighting, Vivid Fallout 2K landscapes and its terrain LOD, denser grass, 2K textures, water, glass and particles, regenerated object LOD, native 3440×1440 |
| Weapons | Lunar's rebalance only | Lunar Fallout Arsenal (by Lunar's author), Tactical Reload, reload animations, impacts and sounds |
| Life | Busier roads | Travelling NPCs, settlers with names, faces and conversations, Minutemen and Brotherhood patrols, an inhabited Concord |
| Brotherhood | Fort Strong, David Hunter | Also the Prydwen, the Cambridge police station and the airport reworked, Improved Brotherhood of Steel |
| Minutemen | Who's The General, You And What Army 2, Watchtowers | The same backbone, plus Improved Minutemen and Minutemen Captives |
| Immersion | A readable interface | A visible body in first person, ambient sound, weapon inertia, needs |
| Story | America Rising 2, Tales from the Commonwealth | Also Misery Island, Shady Motives, Trunk's Malfunction, and the companions It's Molly and Gone Feral |

## Decisions and their alternatives

| Question | Our choice | Why | If you think differently |
| --- | --- | --- | --- |
| Gameplay overhaul | **Lunar Fallout Overhaul** | Designed for non-Survival play, works with Sim Settlements 2 | Horizon conflicts with SS2; Better Locational Damage and True Damage fight Lunar |
| Post-processing | **Community Shaders, no ENB** | ENB's Fallout 4 build breaks water and fog on this runtime and crashes while compiling shaders under Proton 10 and 11 | ReShade works under Proton, but adds little over lighting plus Community Shaders |
| Upscaling and frame generation | **Off at first** | No report yet of Community Shaders' DLSS or frame generation under Proton on an Nvidia card | Test them once the game is stable |
| RobCo Patcher, SPID, the Improved faction series | **In: the test gate passed** | The best Minutemen and Brotherhood overhauls, but their DLL layer is weeks old on 1.11.240 and they cannot be removed mid-game | If they misbehave later, there is no clean way out mid-game |
| Starts Dead Alive | **Test pick** | Worth it on this CPU, but it is the first mod to drop if scripts lag | |
| We Are The Minutemen | **Not used** | Frozen since 2022, conflicts with Lunar, overlaps Improved Minutemen | |

## Install batches

| Batch | Contents | Test after it | State (2026-11-07) |
| --- | --- | --- | --- |
| 1 | The base of the macOS list (engine fixes, PRP, interface), Community Shaders with no feature on | Clean `f4se.log`, baseline fps at Sanctuary, Concord, Diamond City and Goodneighbor | Installed; baseline fps measured (above) |
| 2 | Visuals: textures, landscapes and grass, lighting, water, glass, particles | Fps in Boston at 3440×1440, video memory under 12 GB (`DXVK_HUD=memory`) | Installed; fps and video memory not measured yet |
| 3 | Lunar, Lunar Fallout Arsenal, gunplay, sound | Arsenal's masters checked in FO4Edit; a fight at Concord | Installed |
| 4 | Sim Settlements 2, settlement life, Minutemen | Sanctuary with plots; script lag | Installed |
| 5 | Brotherhood, RobCo Patcher, SPID, the Improved series | **The test gate:** a throwaway save, clean logs, the same save reloaded five times | Installed; gate passed with 4 reloads |
| 6 | World life, locations, quests, companions, needs | An hour through Sanctuary, Concord and Boston | Installed |
| 7 | Patches and PRP patches, then object LOD generated with xLODGen last | No missing walls or flicker | Patches installed; object LOD generated with TexGen 2026-11-09, checked in game: no purple or missing buildings |

## Open questions

- Community Shaders' DLSS and frame generation under Proton.
- Frame rate and video memory with the visual layer and Community Shaders features on, in Boston at 3440×1440.
- The location mods' PRP patches were built on PRP 81.5x: check them against PRP Full for 1.11.240.
- Lunar Fallout Arsenal against Lunar 114's masters; Sons of Steel against Lunar's Brotherhood armour lists.
- What triggers Improved Minutemen's Minutemen-versus-Brotherhood assault: it must not close the open ending.

Answered at install: all 29 F4SE DLLs in the profile, SPID, Hydra and SS2 Settlers UI among them, loaded correctly on 1.11.240; Community Shaders' menu opens with End under Proton, and the profile uses 76 of 254 full plugin slots.
