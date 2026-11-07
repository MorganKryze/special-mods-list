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
| Plugins | 224 active: 76 full, 148 light |
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

### Still to do

- Object LOD: FOLIP and the LOD resources are installed, but xLODGen has not been run yet.
- Community Shaders: features still to switch on and tune one at a time, with Boston fps checked.

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
