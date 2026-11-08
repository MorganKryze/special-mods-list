# Fallout 4 load order tools

Small Python scripts (standard library only) used on the PC playthrough to check a Mod Organizer 2 profile without FO4Edit, and to prepare the previs build. Run them with `python3 -I`. They read plugins and BA2 archives; only `farm.py` and `merge_musc.py` write anything.

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

`<mods>` is MO2's `mods` folder, `<profile dir>` a profile folder holding `modlist.txt` and `plugins.txt`. MO2 writes these files with CRLF line endings; the scripts accept both.

Results obtained with them on the PC playthrough: [whole load order audit](../../docs/playthroughs/pc-minutemen-bos.md#whole-load-order-audit-2026-11-08).
