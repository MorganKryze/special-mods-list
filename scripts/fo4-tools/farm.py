"""Build a symlink copy of Fallout 4 with the MO2 profile's mods merged into Data,
so the Creation Kit and xEdit see the same files as the game, without MO2's VFS.

  python3 -I farm.py <game dir> <mods dir> <profile dir> <out game dir>

Mods are layered from lowest to highest MO2 priority (modlist.txt is highest first).
Paths are merged case-insensitively; the first spelling seen names a directory.
Root files of the game are linked, except Data which is rebuilt.
"""
import os, sys

GAME, MODS, PROF, OUT = sys.argv[1:5]
mods = [l.rstrip('\r\n')[1:] for l in open(os.path.join(PROF, 'modlist.txt'), encoding='utf-8-sig')
        if l.startswith('+') and not l.rstrip().endswith('_separator')][::-1]
SKIP = {'meta.ini', 'fomod'}

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(GAME):
    if f.lower() != 'data' and not os.path.lexists(os.path.join(OUT, f)):
        os.symlink(os.path.join(GAME, f), os.path.join(OUT, f))

files = {}      # lower rel path -> source
dirname = {}    # lower rel dir -> spelled rel dir
def add(root_dir):
    for root, dirs, fs in os.walk(root_dir):
        rel = os.path.relpath(root, root_dir)
        lrel = '' if rel == '.' else rel.lower()
        if lrel.split(os.sep)[0] in SKIP:
            continue
        if lrel and lrel not in dirname:
            parent = os.path.dirname(lrel)
            dirname[lrel] = os.path.join(dirname.get(parent, ''), os.path.basename(rel)) if parent else rel
        for f in fs:
            if not lrel and f.lower() in SKIP:
                continue
            files[os.path.join(lrel, f.lower()) if lrel else f.lower()] = (os.path.join(root, f), f)

add(os.path.join(GAME, 'Data'))
for m in mods:
    d = os.path.join(MODS, m)
    if os.path.isdir(d):
        add(d)

data = os.path.join(OUT, 'Data')
os.makedirs(data, exist_ok=True)
for ld in sorted(dirname, key=len):
    os.makedirs(os.path.join(data, dirname[ld]), exist_ok=True)
n = 0
for lp, (src, name) in files.items():
    ld = os.path.dirname(lp)
    dst = os.path.join(data, dirname[ld], name) if ld else os.path.join(data, name)
    if os.path.lexists(dst):
        os.remove(dst)
    os.symlink(src, dst)
    n += 1
print(f'{len(mods)} mods, {n} files linked into {data}')
