# Previs for the whole load order on Linux

How the PC playthrough builds one precombine and previs patch for its full MO2 load order on NixOS with Proton, using PJM's scripts and the Creation Kit. Each step below was run on the machine of the [PC playthrough](../playthroughs/pc-minutemen-bos.md) and is documented with what it produced.

**Status (2026-11-08):** steps 1 to 4 done and checked. The generation itself (FO4Edit check, precombines, previs, archive) is running; its steps are added here once the first full build has finished and been checked in game.

## Why

Single-mod PRP patches each cover one mod. With many location mods the [whole load order audit](../playthroughs/pc-minutemen-bos.md#whole-load-order-audit-2026-11-08) found 45 plugins changing objects in cells whose visibility was computed without them, and walls and buildings disappeared depending on the view. A patch built from the full load order covers all of them at once.

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

The runner used:

```sh
#!/bin/sh
LIB="$HOME/.local/share/Steam"
export STEAM_COMPAT_DATA_PATH="$HOME/Games/previs-build/prefix"
export STEAM_COMPAT_CLIENT_INSTALL_PATH="$LIB"
export STEAM_COMPAT_INSTALL_PATH="$HOME/Games/previs-build/Fallout 4"
export STEAM_COMPAT_LIBRARY_PATHS="$LIB/steamapps"
export SteamAppId=1946160 SteamGameId=1946160
export WINEDLLOVERRIDES="winhttp=n,b"   # CKPE's loader
mkdir -p "$STEAM_COMPAT_DATA_PATH"
exec steam-run "$LIB/steamapps/common/Proton 11.0/proton" waitforexitandrun "$@"
```

Steam must be running. In the prefix, `AppData/Local/Fallout4/plugins.txt` is a copy of the profile's `plugins.txt`, and the profile INIs go to `Documents/My Games/Fallout4`.

## 4. Running PJM's steps by hand

`GeneratePrevisibines.bat` presses keys in FO4Edit through PowerShell, which does not work under Wine. Its steps are run one by one with the same commands. FO4Edit has a batch mode that needs no clicks: `-autoload` skips module selection, and `FO4Check_PreVisbines.pas` reads its options from the command line (`-Fix` builds the seed plugin that fixes every reported problem, `-Log` keeps a log).

The rest of the procedure is added after the first full build.
