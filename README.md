# Special Mods List

A curated, machine-readable catalogue of about 1,000 Fallout 4 mods checked for runtime 1.11.240, and an interactive site to build a list from it. Each mod is rated on what decides whether it belongs in a stable list: support for 1.11.240, F4SE DLLs, effect on precombines (PRP), performance cost, compatibility with Lunar Fallout Overhaul and Sim Settlements 2, faction-ending locks, requirements, patches and conflicts, with sources.

**Status: work in progress.** The catalogue and the site come from [fallout4-macos-modding](https://github.com/MorganKryze/fallout4-macos-modding), now frozen. The site offers two ready-made playthroughs and a S.P.E.C.I.A.L. sheet: four questions about your machine, your faction and what you care about, and it builds a list from the catalogue's own ratings, the same way every time. Costs are rated on a base Apple M3 Mac; the gaming PC ratings cover the PC playthrough's mods and are not measured yet.

## Choose your mods

| | |
| --- | --- |
| **[Interactive catalogue](https://morgankryze.github.io/special-mods-list/site/)** | Start from a playthrough or fill your S.P.E.C.I.A.L. sheet, filter by faction, tier and cost for your machine, build a list that adds its own requirements and patches, see conflicts, export it |
| [Catalogue pages](docs/catalog/README.md) | The same data as readable pages, one per area |
| [Playthroughs](data/playthroughs.json) | Ready-made lists: the [macOS playthrough](https://github.com/MorganKryze/fallout4-macos-modding/blob/main/docs/reference-playthrough.md), played on a base M3, and the [gaming PC playthrough](docs/playthroughs/pc-minutemen-bos.md), planned |
| [data/mods.csv](data/mods.csv) | The raw data, documented in [data/README.md](data/README.md). AI assistants: start from [llms.txt](llms.txt) |

## Set up the game

| Platform | Guide |
| --- | --- |
| macOS (Apple Silicon) | [fallout4-macos-modding](https://github.com/MorganKryze/fallout4-macos-modding): Not Proton, CrossOver, MO2 and F4SE, with measured performance |

## Maintaining the catalogue

Edit `data/mods.csv`, then run `python3 scripts/nexus_sync.py` (refreshes Nexus metadata) and `python3 scripts/build_catalog.py` (regenerates the pages). Both use the Python standard library only.

## License

[MIT](LICENSE). Mod names, images and descriptions shown by the catalogue belong to their authors on Nexus Mods.
