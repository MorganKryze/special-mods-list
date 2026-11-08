# Playthrough: Minutemen and Brotherhood, full immersion on a gaming PC

**Status: in progress.** The list was installed and tested on 2026-11-07, and the real playthrough is starting. Frame rates below are measured on this machine with the base list; the visual layer is installed but not yet measured or tuned. In `data/mods.csv`, this playthrough is the rows whose `playthroughs` cell contains `pc-minutemen-bos` (`status` is `played` in `data/playthroughs.json`, the schema's value for a list that is being played).

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
| Reordered (2026-11-08) | ImmersiveLexington_PRP_Patch.esp now loads after TheRooftops_PRP_Patch.esp | Objects disappeared in Lexington. In the 9 shared cells (grid -10..-8, 8..10) Immersive Lexington edits 238 references and adds 136, The Rooftops adds 24, so Lexington's previs should win there |
| Turned off (2026-11-08) | Friendly NPCs On Compass: `bFriendlyNPCMarkers=0` | Friendly NPCs and Dogmeat appeared with the same red marker as enemies; the mod has no colour option |
| Disabled (2026-11-08) | DiamondCity-PreVis.esp and DiamondCity-PreVis-Ambience.esp (from Diamond City Expansion - eXoPatch) | Holes around Fens Street: both previs plugins are built without PRP and loaded after DiamondCityExpansion_PRP_Patch.esp in the same 18 cells (grid -1..4, -1..1); the PRP patch alone now owns them |

#### Load-order rule: cell overrides go before PRP

Plugins that only change textures, lighting, grass or particles can still carry CELL overrides. They must load **before** `prp.esp`, so that PRP's previs data wins in those cells. With Better Landscape Grass loaded after PRP, 4 Sanctuary cells got their vanilla previs data back, and the Sanctuary bridge and walls vanished along with their collision: the player fell through. Moving the plugins in the table above before PRP fixed it.

Checked afterwards in the plugins themselves: only Better Landscape Grass (1,980 CELL and 1,980 LAND overrides) and Fallout 4 Particle Patch (12 CELL, 57 REFR) carry cell data. The nine others have no CELL, LAND or REFR record, so their position around PRP does not matter; they were moved together for simplicity.

Flutter Flicker Fixer For Foliage is the exception: its file is itself a PRP file, so it stays after PRP.

#### Known issue: overlapping PRP patches

The PRP patches that load after PRP were each built for one mod. Where two of them edit the same cell, the last one loaded wins there, and the other mod's previs is lost in that cell. Overlaps found in this profile:

| Patches | Shared cells |
| --- | --- |
| Hunkered Down and The Rooftops | 90 |
| Hunkered Down and Tales From The Commonwealth (3DNPC) ExoEm | 19 |
| Hunkered Down and Subway Runner - Revival | 18: 9 in Concord (grid -16..-14, 17..19), 9 in Boston (around -4..-2, -10..-8) |
| The Rooftops and Tales From The Commonwealth (3DNPC) ExoEm | 18 |
| Diamond City Expansion PRP patch, `DiamondCity-PreVis` and `DiamondCity-PreVis-Ambience` | 18-19 |
| Hunkered Down and Immersive And Extended Lexington | 9 |
| Immersive And Extended Lexington and The Rooftops | 9 |
| Subway Runner - Revival and The Rooftops | 9 |

In Concord, objects disappeared depending on the view angle. The lead was the overlap between the Hunkered Down and Subway Runner - Revival patches; Hunkered Down was removed on 2026-11-08, after which no PRP patch overlap is left in Concord (re-checked with the plugin reader). Confirmed in game by the player on 2026-11-08: nothing disappears in Concord any more. Overlaps still present: Diamond City (Diamond City Expansion PRP patch, DiamondCity-PreVis and DiamondCity-PreVis-Ambience, 18-19 cells) and The Rooftops with Immersive Lexington (9), Subway Runner (9) and 3DNPC ExoEm (18).

### Still to do

- Object LOD: FOLIP and the LOD resources are installed, but xLODGen has not been run yet.
- Community Shaders: features still to switch on and tune one at a time, with Boston fps checked.
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
| 7 | Patches and PRP patches, then object LOD generated with xLODGen last | No missing walls or flicker | Patches installed; object LOD not generated yet |

## Open questions

- Community Shaders' DLSS and frame generation under Proton.
- Frame rate and video memory with the visual layer and Community Shaders features on, in Boston at 3440×1440.
- The location mods' PRP patches were built on PRP 81.5x: check them against PRP Full for 1.11.240.
- Lunar Fallout Arsenal against Lunar 114's masters; Sons of Steel against Lunar's Brotherhood armour lists.
- What triggers Improved Minutemen's Minutemen-versus-Brotherhood assault: it must not close the open ending.

Answered at install: all 29 F4SE DLLs in the profile, SPID, Hydra and SS2 Settlers UI among them, loaded correctly on 1.11.240; Community Shaders' menu opens with End under Proton, and the profile uses 76 of 254 full plugin slots.
