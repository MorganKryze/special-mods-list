#!/bin/sh
# run.sh <windows exe> [args]: run a program of the previs build in its own Proton prefix
# (never the game's), inside steam-run. VERB=run returns at once instead of waiting.
. "$(dirname "$0")/env.sh"
export STEAM_COMPAT_DATA_PATH="$BUILD/prefix"
export STEAM_COMPAT_CLIENT_INSTALL_PATH="$STEAMLIB"
export STEAM_COMPAT_INSTALL_PATH="$GAMECOPY"
export STEAM_COMPAT_LIBRARY_PATHS="$STEAMLIB/steamapps"
export SteamAppId=1946160 SteamGameId=1946160     # Creation Kit app id
export WINEDLLOVERRIDES="winhttp=n,b"              # CKPE's loader
export PROTON_LOG=0
mkdir -p "$STEAM_COMPAT_DATA_PATH"
# FO4Edit does not start without a 32-bit FreeType: put pkgsi686Linux.freetype and its
# closure on LD_LIBRARY_PATH (computed once into $BUILD/lib32path)
if [ ! -s "$BUILD/lib32path" ]; then
  p=$(nix build --no-link --print-out-paths nixpkgs#pkgsi686Linux.freetype)
  nix-store -qR "$p" | while read -r d; do [ -d "$d/lib" ] && printf '%s/lib:' "$d"; done > "$BUILD/lib32path"
fi
exec steam-run env LD_LIBRARY_PATH="/usr/lib64:/usr/lib32:$(cat "$BUILD/lib32path")" \
  "$PROTON/proton" "${VERB:-waitforexitandrun}" "$@"
