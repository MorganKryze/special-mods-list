# Fallout 4 load order tools

Small Python scripts (standard library only) used on the PC playthrough to check a Mod Organizer 2 profile without FO4Edit, and to prepare the previs build. Run them with `python3 -I`. They read plugins and BA2 archives; only `farm.py`, `merge_musc.py`, `esp_filter.py`, `ba2pack.py pack` and `ba2compress.py` write anything.

| Script | What it does | Usage |
| --- | --- | --- |
| `esp.py` | Plugin reader: masters, records keyed by origin plugin and object id, subrecords (handles compressed records). Also a CLI: `masters`, `overlap`, `diff` | `esp.py overlap A.esp B.esp` |
| `ba2.py` | File list of a general (GNRL) BA2 archive | imported by the others |
| `cells.py` | What each enabled plugin places or edits in a range of exterior cells | `cells.py <mods> <plugins.txt> x0 x1 y0 y1` |
| `previs_audit.py` | For every cell, checks that the precombined meshes listed by the winning CELL record exist in a loaded archive or loose file | `previs_audit.py <mods> <game Data> <plugins.txt>` |
| `vis_audit.py` | For every Commonwealth exterior cell, checks that its `vis/*.uvd` previs file comes from the plugin whose CELL record wins | `vis_audit.py <mods> <game Data> <profile dir>` |
| `ref_audit.py` | Lists plugins that place or edit objects in previs cells without being the previs owner or one of its masters, optionally in a grid box | `ref_audit.py <mods> <game Data> <profile dir> [x0 x1 y0 y1]` |
| `farm.py` | Builds a copy of the game folder made of symbolic links, with the profile's enabled mods merged into `Data` in MO2 priority order, so the Creation Kit and FO4Edit see what the game sees without MO2 | `farm.py <game dir> <mods> <profile dir> <out dir>` |
| `merge_musc.py` | Writes a light plugin that keeps one plugin's music records and adds another plugin's tracks | `merge_musc.py BASE.esp EXTRA.esp OUT.esp` |
| `esp_filter.py` | Copies a plugin removing (or keeping only) given CELL records with their child groups; recomputes group sizes and the HEDR count, copies everything else byte for byte. An empty removal list gives an identical file | `esp_filter.py IN.esp OUT.esp remove fallout4.esm:0C8040` |
| `findref.py` | Finds the parent cell, worldspace and grid of reference form ids in a plugin (used to name the cell a Creation Kit log stopped in) | `findref.py PLUGIN.esp 00222942` |
| `ba2pack.py` | Writes an uncompressed GNRL BA2 (version 1) from a folder, and checks the name hashes of an existing archive | `ba2pack.py pack ROOT OUT.ba2 Meshes Vis`, `ba2pack.py verify A.ba2` |
| `ba2compress.py` | Rewrites an uncompressed GNRL BA2 with zlib-compressed entries, as the vanilla archives store them, then decompresses every entry again and compares it with the original | `ba2compress.py IN.ba2 OUT.ba2` |

`<mods>` is MO2's `mods` folder, `<profile dir>` a profile folder holding `modlist.txt` and `plugins.txt`. MO2 writes these files with CRLF line endings; the scripts accept both.

## `previs/`: running the Creation Kit and FO4Edit unattended under Proton

Used for [Previs for the whole load order on Linux](../../docs/guides/linux-previs.md). These are the scripts of the 2026-11-08 build with its paths turned into variables (`env.sh`); the parameterised copies themselves have not been rerun.

| File | What it does |
| --- | --- |
| `env.sh` | Paths: build folder, game copy, Steam library, Proton, xEdit copy, and the Windows form of the copy's `Data` |
| `run.sh` | Runs a Windows program in the build's own prefix through `steam-run`, with a 32-bit FreeType on `LD_LIBRARY_PATH` (FO4Edit needs it) |
| `inject.sh` | Runs a Windows program inside the live `steam-run` container of a process (same wineserver) through `nsenter`, so it can reach that process's windows |
| `clickok.c` | Waits for a window by title and clicks one of its buttons until the window goes away, or closes a window (`__CLOSE__`). Built with `nix shell nixpkgs#pkgsCross.mingwW64.stdenv.cc --command x86_64-w64-mingw32-gcc -municode -O2 -o clickok.exe clickok.c`; the two `libmcfgthread` DLLs of that toolchain go next to the exe |
| `ck.sh` | One Creation Kit phase: answers the *Script Source Extraction* prompt with No, keeps `ckpe.log` and the crash report per attempt, records exit code, duration and the two known error lines |
| `ramwatch.sh` | During `GeneratePreVisData`, logs available memory plus free swap every minute and stops the Creation Kit under 4 GB |
| `step2-check.bat`, `step5-merge-precombines.bat`, `step9-merge-previs.bat` | The three FO4Edit runs; replace `DATA` with the Windows path of the copy's `Data` |

Results obtained with them on the PC playthrough: [whole load order audit](../../docs/playthroughs/pc-minutemen-bos.md#whole-load-order-audit-2026-11-08).
