#!/usr/bin/env bash
# inject.sh <pid> <windows exe and args...>: run a Windows program inside the running
# steam-run container of process <pid>, on the same wineserver, so it can see that
# program's windows (each steam-run container has its own wineserver).
. "$(dirname "$0")/env.sh"
P=$1; shift
mapfile -d '' VARS < <(grep -z -v -E '^(WINESERVERSOCKET|WINELOADERNOEXEC|WINEPRELOADRESERVE)=' /proc/$P/environ)
exec nsenter -t "$P" -U -m --preserve-credentials --wd="$XEDIT" \
  env -i "${VARS[@]}" "$PROTON/files/bin/wine" "$@"
