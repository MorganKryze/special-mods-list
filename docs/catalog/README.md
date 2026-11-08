# Mod catalogue

Fallout 4 mods evaluated for runtime 1.11.240, one page per module. Each page opens with a short hand-written guide: what the module covers and its main risk, the mutually exclusive choices ("Pick one"), suggested stacks for a few player profiles, and what the macOS reference playthrough takes ("Our choice"). Below that, a table generated from [`data/mods.csv`](../../data/mods.csv) and Nexus Mods metadata lists every mod in the module, grouped by tier.

## How to read a page

- **Tiers.** `core`: every list needs it. `recommended`: worth taking in most lists. `optional`: depends on taste, machine or faction. `avoid`: listed so you know why not; the italic note under the summary gives the reason.
- **Fit column.** The tier, then 1.11.240 support: `yes` means the author states support, `plugin only` means no DLL and version-independent in practice, `unknown` is a risk to check. It also flags an F4SE DLL, a faction ending the mod locks, and a needed patch or a conflict with Lunar Fallout Overhaul or Sim Settlements 2.
- **Cost column.** Performance on a base Apple M3 Mac (16 GB, under Wine) and on a gaming PC (Ryzen 7 9800X3D, RTX 5070 Ti, 3440×1440); `?` means not rated. Then Papyrus script load, NPCs added, plugin slots used (full and light), and whether the mod breaks precombines.
- **Links column and graph.** What the mod needs, the patches to add when both mods are present, and what it conflicts with.
- **Playthroughs.** The `playthroughs` column in `mods.csv` names the ready-made playthroughs that include a mod; [`data/playthroughs.json`](../../data/playthroughs.json) describes them. Each page's "Our choice" section explains the picks of the [macOS playthrough](https://github.com/MorganKryze/fallout4-macos-modding/blob/main/docs/reference-playthrough.md). A playthrough is one road through the catalogue, not a requirement.

Column definitions and allowed values: [data/README.md](../../data/README.md). If an AI assistant is building a list for you, point it at [llms.txt](../../llms.txt).

<!-- BEGIN GENERATED: do not edit, run scripts/build_catalog.py -->
| Module | Mods | Core | Recommended |
| --- | --- | --- | --- |
| [Base: script extender and unofficial patch](base.md) | 7 | 3 | 0 |
| [Stability and performance](stability.md) | 99 | 4 | 28 |
| [Interface](interface.md) | 48 | 1 | 18 |
| [Gameplay overhaul and enemies](gameplay.md) | 112 | 0 | 12 |
| [Brotherhood of Steel](brotherhood.md) | 72 | 0 | 11 |
| [Minutemen](minutemen.md) | 58 | 0 | 14 |
| [The Institute](institute.md) | 44 | 0 | 5 |
| [The Railroad](railroad.md) | 56 | 0 | 12 |
| [Raiders and hostile factions](raiders.md) | 32 | 0 | 3 |
| [Factions, endings and starts](factions.md) | 33 | 0 | 4 |
| [Settlements](settlements.md) | 91 | 0 | 20 |
| [DLC](dlc.md) | 65 | 0 | 12 |
| [Quests and locations](quests.md) | 142 | 0 | 44 |
| [Weapons and armor](weapons-armor.md) | 110 | 0 | 22 |
| [Immersion and quality of life](immersion.md) | 96 | 0 | 30 |
| [Companions](companions.md) | 46 | 0 | 6 |
| [Visuals: textures, lighting, shaders, LOD](visuals.md) | 37 | 0 | 18 |
<!-- END GENERATED -->
