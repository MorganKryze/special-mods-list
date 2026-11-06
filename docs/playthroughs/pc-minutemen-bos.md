# Playthrough: Minutemen and Brotherhood, full immersion on a gaming PC

**Status: planned.** The list is researched and decided; it has not been installed or played yet. Every claim about frame rate on this machine is a target, not a measurement. In `data/mods.csv`, this playthrough is the rows whose `playthroughs` cell contains `pc-minutemen-bos`.

## The game it aims for

- The Minutemen and your settlements at the centre: you build, recruit and defend with Sim Settlements 2.
- The Brotherhood of Steel as a second career, for its atmosphere: the Prydwen, the Cambridge police station, patrols and vertibirds.
- Exploration from time to time, with a few quests and two new companions.
- An open ending, leaning towards a Minutemen victory that keeps the Brotherhood alive.
- Survival-lite: Very Hard difficulty outside Survival mode, hunger, thirst and sleep, free saving.

Machine: Ryzen 7 9800X3D, RTX 5070 Ti 16 GB, 32 GB, 3440×1440 up to 180 Hz, Mod Organizer 2 under Proton.

## What changes from the macOS playthrough

| Area | [macOS playthrough](https://github.com/MorganKryze/fallout4-macos-modding/blob/main/docs/reference-playthrough.md) | This playthrough |
| --- | --- | --- |
| Visuals | None, half-resolution render | Fallout 4 Community Shaders (features enabled one at a time), Lightweight Lighting, 2K textures, water, glass and particles, regenerated object LOD, native 3440×1440 |
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
| RobCo Patcher, SPID, the Improved faction series | **In, behind a test gate** | The best Minutemen and Brotherhood overhauls, but their DLL layer is weeks old on 1.11.240 and they cannot be removed mid-game | If the gate fails, drop them before the real game |
| Starts Dead Alive | **Test pick** | Worth it on this CPU, but it is the first mod to drop if scripts lag | |
| We Are The Minutemen | **Not used** | Frozen since 2022, conflicts with Lunar, overlaps Improved Minutemen | |

## Install batches

| Batch | Contents | Test after it |
| --- | --- | --- |
| 1 | The base of the macOS list (engine fixes, PRP, interface), Community Shaders with no feature on | Clean `f4se.log`, baseline fps at Sanctuary, Concord, Diamond City and Goodneighbor |
| 2 | Visuals: textures, lighting, water, glass, particles | Fps in Boston at 3440×1440, video memory under 12 GB (`DXVK_HUD=memory`) |
| 3 | Lunar, Lunar Fallout Arsenal, gunplay, sound | Arsenal's masters checked in FO4Edit; a fight at Concord |
| 4 | Sim Settlements 2, settlement life, Minutemen | Sanctuary with plots; script lag |
| 5 | Brotherhood, RobCo Patcher, SPID, the Improved series | **The test gate:** a throwaway save, clean logs, the same save reloaded five times |
| 6 | World life, locations, quests, companions, needs | An hour through Sanctuary, Concord and Boston |
| 7 | Patches and PRP patches, then object LOD generated with xLODGen last | No missing walls or flicker |

## Open questions

- Community Shaders' menu, DLSS and frame generation under Proton.
- Workshop Framework 2.6.1, SS2 Settlers UI, Hydra and SPID do not name 1.11.240: read `f4se.log` at first launch.
- The location mods' PRP patches were built on PRP 81.5x: check them against PRP Full for 1.11.240.
- Lunar Fallout Arsenal against Lunar 114's masters; Sons of Steel against Lunar's Brotherhood armour lists.
- What triggers Improved Minutemen's Minutemen-versus-Brotherhood assault: it must not close the open ending.
- The total of full plugin slots, to count at install (limit 254).
