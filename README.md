# Special Mods List

A curated, machine-readable catalogue of about 1,000 Fallout 4 mods checked for runtime 1.11.240, and an interactive site to build a list from it. Each mod is rated on what decides whether it belongs in a stable list: support for 1.11.240, F4SE DLLs, effect on precombines (PRP), performance cost, compatibility with Lunar Fallout Overhaul and Sim Settlements 2, faction-ending locks, requirements, patches and conflicts, with sources.

**Status: work in progress.** The catalogue and the site come from [fallout4-macos-modding](https://github.com/MorganKryze/fallout4-macos-modding), now frozen. Coming next: ready-made playthroughs, a questionnaire that builds a list from your tastes and your hardware, and performance ratings for desktop PCs (today's `perf` column was rated on a base Apple M3).

## Choose your mods

| | |
| --- | --- |
| **[Interactive catalogue](https://morgankryze.github.io/special-mods-list/site/)** | Filter by faction, tier and performance cost, build a list that adds its own requirements and patches, see conflicts, export it |
| [Catalogue pages](docs/catalog/README.md) | The same data as readable pages, one per area |
| [data/mods.csv](data/mods.csv) | The raw data, documented in [data/README.md](data/README.md). AI assistants: start from [llms.txt](llms.txt) |

## Set up the game

| Platform | Guide |
| --- | --- |
| macOS (Apple Silicon) | [fallout4-macos-modding](https://github.com/MorganKryze/fallout4-macos-modding): Not Proton, CrossOver, MO2 and F4SE, with measured performance |

## Maintaining the catalogue

Edit `data/mods.csv`, then run `python3 scripts/nexus_sync.py` (refreshes Nexus metadata) and `python3 scripts/build_catalog.py` (regenerates the pages). Both use the Python standard library only.

## License

[MIT](LICENSE). Mod names, images and descriptions shown by the catalogue belong to their authors on Nexus Mods.
