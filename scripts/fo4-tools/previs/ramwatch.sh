#!/bin/sh
# ramwatch.sh: while GeneratePreVisData runs, log MemAvailable+SwapFree every minute;
# below 4 GB, stop the Creation Kit of the build prefix and leave a STOP flag.
. "$(dirname "$0")/env.sh"
touch "$BUILD/ramwatch.started"
while :; do
  a=$(awk '/MemAvailable/{print $2}' /proc/meminfo); s=$(awk '/SwapFree/{print $2}' /proc/meminfo)
  t=$(( (a + s) / 1024 ))
  echo "$(date +%T) avail+swapfree=${t}MB avail=$((a/1024))MB swapfree=$((s/1024))MB" >> "$BUILD/ramwatch.log"
  if [ "$t" -lt 4096 ]; then
    echo "$(date +%T) LOW MEMORY STOP" >> "$BUILD/ramwatch.log"; touch "$BUILD/ramwatch.STOP"
    for p in $(pgrep -f "^\./CreationKit\.exe -GeneratePreVisData"); do
      tr "\0" "\n" < /proc/$p/environ | grep -q "STEAM_COMPAT_DATA_PATH=$BUILD/prefix" && kill "$p"
    done
    break
  fi
  pgrep -f "^\./CreationKit\.exe -GeneratePreVisData" >/dev/null || break
  sleep 60
done
