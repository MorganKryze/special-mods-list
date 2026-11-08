# Previs for the whole load order on Linux

How the PC playthrough builds one precombine and previs patch for its full MO2 load order on NixOS with Proton, using PJM's scripts and the Creation Kit. Each step below was run on the machine of the [PC playthrough](../playthroughs/pc-minutemen-bos.md) and is documented with what it produced.

**Status (2026-11-08):** built, installed and checked. The patch `SanctuaryPrevis` covers 383 precombined cells and 342 previs clusters of the 243-plugin profile; the player went back to the Diamond City outskirts, Fens Street, Lexington and Concord the same day and reported everything fixed. The [scripts used](../../scripts/fo4-tools/README.md) are in the repository.

## Why

Single-mod PRP patches each cover one mod. With many location mods the [whole load order audit](../playthroughs/pc-minutemen-bos.md#whole-load-order-audit-2026-11-08) found at least 45 plugins (the listing stops at 45) changing objects in cells whose visibility was computed without them, and walls and buildings disappeared depending on the view. A patch built from the full load order covers all of them at once.

## Versions used

| Tool | Version | Source |
| --- | --- | --- |
| Fallout 4 | 1.11.240 | Steam |
| Fallout 4: Creation Kit | 1.11.246 | Steam, *Library* > *Tools* |
| Creation Kit Platform Extended (CKPE) | 0.6-b771, AVX2 build, with the CK Address Library | [Nexus 51165](https://www.nexusmods.com/fallout4/mods/51165) |
| PJM's Precombine - Previs Patching Scripts | 4.9, plus the updated `FO4Check_PreVisbines.pas` 4.9g, `GeneratePrevisibines.bat` 2.99 and `Batch_FO4MergePreVisandCleanRefr.pas` 2.3 | [Nexus 69978](https://www.nexusmods.com/fallout4/mods/69978) |
| FO4Edit | 4.1.5f | xEdit |
| Proton | 11.0 | Steam |

## 1. A game copy made of links

The Creation Kit and FO4Edit must see the same `Data` as the game. Instead of running them through MO2's virtual file system, [`farm.py`](../../scripts/fo4-tools/farm.py) builds a separate game folder: every root file is a link to the real one, and `Data` merges the vanilla files and the profile's enabled mods by MO2 priority, as links.

```sh
python3 -I scripts/fo4-tools/farm.py \
  ~/.local/share/Steam/steamapps/common/"Fallout 4" \
  ~/Games/MO2/mods ~/Games/MO2/profiles/"Partie PC" \
  ~/Games/previs-build/"Fallout 4"
```

Result: 275 mods merged in under a second. Nothing is written to the real game folder or the mods.

## 2. CKPE in the copy

Copy the CKPE files into the root of the copy, its `CKPEBins` folder from the Address Library archive, and `CreationKit - Textures.ba2` into `Data`. Replace the links first: files written over a link would land in the real game folder. In `CreationKitPlatformExtended.toml`:

| Setting | Value | Why |
| --- | --- | --- |
| `bBSPointerHandleExtremly` | `true` | Raises the reference limit; PJM's script warns without it |
| `bThreads` | `false` | Lets the CK use every core |
| `bDisableAssertions` | `true` | No pop-up can stop an unattended run |
| `bUIDarkTheme` | `false` | Plain Wine theme |
| `sOutputFile` | `'ckpe.log'` | PJM's script reads this log |

Add `steam_appid.txt` with `1946160` and a `CreationKitCustom.ini`:

```ini
[General]
bAllowMultipleMasterLoads=1
bAllowMultipleEditors=1
[Archive]
bInvalidateOlderFiles=1
```

## 3. Its own Proton prefix

The build uses a separate prefix, so the game's prefix and saves are never touched and the game can still be played during the build. On NixOS, Proton has to run inside `steam-run`:

| Tried | Result |
| --- | --- |
| `proton run` directly | Wine cannot find FreeType; the CK crashes in `dxgi.dll` |
| Through `SteamLinuxRuntime_4/_v2-entry-point` | Fails before starting: `bwrap: execvp true: No such file or directory` |
| `steam-run proton waitforexitandrun`, DXVK | Works: CKPE 0.6 b771 loads, the CK opens and loads its resources |
| Same with `PROTON_USE_WINED3D=1` | The CK crashes in `CKPE.Common.dll` right after creating the D3D11 device |

The runner is [`scripts/fo4-tools/previs/run.sh`](../../scripts/fo4-tools/previs/run.sh): the build's own prefix in `STEAM_COMPAT_DATA_PATH`, the Creation Kit's app id `1946160`, `WINEDLLOVERRIDES="winhttp=n,b"` for CKPE's loader, and Proton's `waitforexitandrun` inside `steam-run`.

Steam must be running. In the prefix, `AppData/Local/Fallout4/plugins.txt` is a copy of the profile's `plugins.txt`, and the profile INIs go to `Documents/My Games/Fallout4`.

## 4. Running PJM's steps unattended

`GeneratePrevisibines.bat` presses keys in FO4Edit through PowerShell, which does not work under Wine. Its steps are run one by one with the same programs and arguments, from the scripts in [`scripts/fo4-tools/previs`](../../scripts/fo4-tools/README.md#previs-running-the-creation-kit-and-fo4edit-unattended-under-proton).

What it took to run them without anyone at the keyboard:

| Problem | Fix |
| --- | --- |
| FO4Edit does not start in the prefix | It needs a 32-bit FreeType: `run.sh` puts `nixpkgs#pkgsi686Linux.freetype` and its dependencies on `LD_LIBRARY_PATH` |
| `-autoload` does not skip FO4Edit's *Module Selection* window, FO4Edit asks *Save changed files:* on exit, the CK asks about *Script Source Extraction* | `clickok.exe`, a 30-line Win32 program, waits for a window by title and clicks its button. FO4Edit is always closed this way, never killed, so it saves its plugin |
| Each `steam-run` container has its own wineserver, so a second program started with `run.sh` cannot see the CK's windows | `inject.sh` starts `clickok.exe` inside the CK's container with `nsenter`, on the same wineserver |
| Steam's `Archive2.exe` | Not used: every archive was written with `ba2pack.py` (GNRL, version 1), checked by recomputing the name hashes (it matches all 180,822 entries of PRP's own archive) and by comparing every entry with its source file |

Each CK phase goes through `ck.sh`, which keeps `ckpe.log` and any crash report per attempt (the CK overwrites both at every launch) and counts the two error lines PJM's script checks: `OUT OF HANDLE ARRAY ENTRIES` and `visibility task did not complete`.

Before the long phases, sleep is blocked for the whole build and released after packaging:

```sh
systemd-inhibit --what=sleep:idle:handle-lid-switch --who=previs-build \
  --why="Fallout 4 previs build" sleep infinity &
```

Without it, KDE suspended the machine 19 minutes into a precombine run: the CK lost its display connection on resume and the run was lost.

## 5. The steps

The patch is called `SanctuaryPrevis`. Each step was checked on its log before the next one.

| Step | Command | Time | Result |
| --- | --- | --- | --- |
| 2. Check and seed | FO4Edit `-fo4 -autoload -IKnowWhatImDoing -D:<Data> -script:FO4Check_PreVisbines.pas -Fix -Log -autoexit` | 47 min | `Generation Complete`: 66,462 cells read in 13 worldspaces; 1,947 with broken visibility, 72 with wrong precombines, 189 data regressions. Seed `xPrevisPatch.esp`: 3,175 cell overrides, 384 cells to precombine, 338 previs clusters, 79 masters, 7 meshes that cannot be precombined left out |
| 3. Name the patch | Copy `xPrevisPatch.esp` to `SanctuaryPrevis.esp`, add it last and active to the prefix's `plugins.txt`, back up the seed | | |
| 4. Precombines | CK `-GeneratePrecombined:SanctuaryPrevis.esp clean all` | 25 min | 383 cells (377 exterior, 6 interior), 0 handle errors. `CombinedObjects.esp` (935 KB), `SanctuaryPrevis - Geometry.psg` (190 MB), 11,903 meshes |
| 5. Merge precombines | FO4Edit `Batch_FO4MergeCombinedObjectsandCheck.pas` V1.5, with `-P:` listing only the patch and `CombinedObjects.esp`, `-Mod:SanctuaryPrevis.esp -autoexit` | 2 min | `383 Cells merged. 0 Missing Precombine Meshes`, no error |
| 6. Archive precombines | `ba2pack.py pack <Data> "SanctuaryPrevis - Main.ba2" Meshes`, then delete the generated loose meshes | | 11,903 files, 0 hash mismatches, 0 content mismatches |
| 7. Geometry | CK `-CompressPSG:SanctuaryPrevis.esp`, then CK `-BuildCDX:SanctuaryPrevis.esp` | 5 + 5 min | `SanctuaryPrevis - Geometry.csg` (107 MB; the psg is then deleted), `SanctuaryPrevis.cdx` (22 MB) |
| 8. Previs | CK `-GeneratePreVisData:SanctuaryPrevis.esp clean all`, with `ramwatch.sh` running | 73 min | 342 clusters, 0 `visibility task did not complete`. `Previs.esp` and 348 `.uvd` files. Lowest free memory: 63 GB of RAM plus swap, at least 16 GB of it RAM |
| 9. Merge previs | FO4Edit `Batch_FO4MergePreVisandCleanRefr.pas` V2.3, `-P:` with only the patch and `Previs.esp` | 3 min | `Completed: No Errors`: 3,084 cells' VISI copied, 5,983 references removed, 0 uvd missing or unexpected |
| 10. Final archive | Precombines and `Vis` into `SanctuaryPrevis - Main.ba2` with `ba2pack.py` | | 12,251 files (11,903 meshes, 348 uvd), 0 hash or content mismatches |

The patch: `SanctuaryPrevis.esp` (3.9 MB, 3,174 CELL and 4 WRLD overrides, 79 masters, no reference of its own), `SanctuaryPrevis - Main.ba2`, `SanctuaryPrevis - Geometry.csg`, `SanctuaryPrevis.cdx`. It keeps the light (ESL) flag the seed was created with. The successful FO4Edit and CK runs add up to 2 h 40; the build took 6 h 40 from the first check to the packaged patch, the rest going to the problems below.

Pass only the documented arguments: a CompressPSG launch with extra arguments was stopped and rerun with `-CompressPSG:SanctuaryPrevis.esp` alone.

## 6. Problems met and their fixes

### Loose previs files stop the check

The first check (46 minutes) ended with *Generation USELESS*: Caves of the Commonwealth ships 1,248 loose previs files (1,244 precombined meshes, 4 `.uvd`), and the check refuses to work with loose ones. In the game copy only, those files were packed into `Data/CavesOfTheCommonwealth - Main.ba2` (the name the CK loads for that plugin) and their links removed. The archive holds the same bytes as the loose files, so nothing changes in MO2 or in the game.

### A cell crashes the Creation Kit

GeneratePrecombined crashed twice with `EXCEPTION_ACCESS_VIOLATION at CreationKit.exe+2B54169`, after 377 of the 384 cells, with free memory to spare. The crash report holds settings only, no call stack, and the log stops on the cell before the culprit. Running the CK on small test seeds (made with `esp_filter.py ... keep`) found it:

| Test | Cells | Result |
| --- | --- | --- |
| 1 and 6 | The 7 interiors left: RelayTowerInt15A, RelayTowerInt15B, CambridgePD01, FensParkviewApartments02, ListeningPostBravo01, FederalSurvCenter01, USAFSatellite01 | Crash, both times |
| 2 | FederalSurvCenter01 | No crash |
| 3 | CambridgePD01, FederalSurvCenter01 | No crash |
| 4 | USAFSatellite01 | No crash |
| 5 | CambridgePD01, FederalSurvCenter01, USAFSatellite01 | No crash |
| 7 | Test 5 plus RelayTowerInt15A and FensParkviewApartments02 | Crash |
| 8 | Test 5 plus RelayTowerInt15A | No crash |
| 9 | Test 5 plus FensParkviewApartments02 | Crash |
| 10 | FensParkviewApartments02 alone | Crash, before any output |

FensParkviewApartments02 (`Fallout4.esm` `0C8040`) is edited by People Live In - Parkview Apartments (361 new references, 120 edits), which ships its own previs plugin. It was removed from the seed with `esp_filter.py SanctuaryPrevis-seed.esp SanctuaryPrevis.esp remove fallout4.esm:0C8040` (the CELL and its one reference, nothing else; checked by reading the result back), and the cell keeps the coverage of `PLI_ParkviewApartments_Previs.esp`.

### A script edited while it runs

`sh` reads a script as it runs it: editing `ck.sh` during a CK phase made it launch the CK again after the phase ended. Edit a copy, never the running file.

### Memory

PRP's author reports 126.6 GB of RAM plus swap for a full-game build. This machine has 32 GB of RAM and 15 GB of zram; a 32 GB swap file behind zram was added before the previs step:

```nix
swapDevices = [ { device = "/var/lib/swapfile"; size = 32 * 1024; priority = 1; } ];
```

For this patch (342 of the game's 1,377 clusters) the previs step never went below 63 GB free.

## 7. Compress the archive

`ba2pack.py` writes uncompressed archives. `ba2compress.py` rewrites the final one with zlib, as the vanilla archives store their meshes, and checks every entry against the original after decompressing it:

```sh
python3 -I scripts/fo4-tools/ba2compress.py "SanctuaryPrevis - Main.ba2" out/"SanctuaryPrevis - Main.ba2"
```

Result: 12,251 entries, 797 MB of content in 359 MB, all entries byte-identical.

## 8. Install

| Rule | Why |
| --- | --- |
| Install the four files as a mod at the bottom of MO2's list and enable `SanctuaryPrevis.esp` as the very last plugin | Its CELL records must win |
| Keep every PRP and previs patch enabled | Ten of them are masters of the patch: `ppf.esm`, `prp.esp`, the Diamond City Expansion, Parkview Apartments, Subway Runner, The Rooftops, Immersive Lexington, 3DNPC ExoEm, Castle Walls Extended and Fort Strong patches |
| Never rename it, never run FO4Edit's Clean Masters on it | Its archive names follow the plugin name; its masters are all needed |
| Rebuild it after adding or removing a mod that changes cells | Its visibility is computed for the current load order |

## 9. Results

Measured after installing it, with the [load order tools](../../scripts/fo4-tools/README.md):

| Check | Before | After |
| --- | --- | --- |
| `ref_audit.py`: references placed or edited in previs cells by plugins outside the previs owner's masters | More than 30,000, from at least 45 plugins | 1,965 from 24 plugins, nearly all new references (map markers, workshop and clutter objects); the largest are People Live In - Unmarked Raider Camps P2 (533), Minuteman Watchtowers (393) and Lush Ambience (245) |
| `vis_audit.py`: Commonwealth exterior cells whose `.uvd` comes from the plugin that wins the cell | 4,804 | 4,805 |
| Masters of the patch present and enabled | | 79 of 79 |

`vis_audit.py` also lists 10 cells owned by the patch whose `.uvd` file comes from `prp.esp`, for example grid (-27, -10), (-25, 3), (-24, 18), (-24, 19). Not checked in game.

In game, 2026-11-08: the player went back to the Diamond City outskirts, Fens Street, Lexington and Concord, where walls, buildings and objects used to vanish, and reported everything fixed.
