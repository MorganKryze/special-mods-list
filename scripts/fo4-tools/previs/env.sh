# shellcheck shell=sh
# Shared settings for the previs build scripts. Source it; override any variable before.
: "${BUILD:=$HOME/Games/previs-build}"            # build folder (game copy, prefix, logs)
: "${GAMECOPY:=$BUILD/Fallout 4}"                  # symlink copy made by farm.py
: "${STEAMLIB:=$HOME/.local/share/Steam}"
: "${PROTON:=$STEAMLIB/steamapps/common/Proton 11.0}"
: "${XEDIT:=$BUILD/xedit}"                         # copy of FO4Edit with PJM's scripts
# Windows view of the game copy's Data folder, as FO4Edit wants it in -D:
: "${DATA_WIN:=Z:$(printf '%s' "$GAMECOPY/Data" | tr / '\\')\\}"
