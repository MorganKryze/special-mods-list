"""Audit precombines for the whole load order, every cell at once.

  python3 -I previs_audit.py <mods dir> <game Data dir> <plugins.txt>

For each cell, the winning CELL record (last enabled plugin overriding it) lists its
precombined meshes in XCRI. A mesh that no loaded archive or loose file provides is drawn
as nothing: walls and whole buildings vanish. Reports missing meshes per winning plugin.
Archives counted: vanilla Data/*.ba2 and '<plugin> - *.ba2' of enabled plugins, plus loose
Meshes/PreCombined files of every enabled MO2 mod.
"""
import os, struct, sys
from collections import defaultdict
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import esp

M, DATA, PL = sys.argv[1:4]
enabled = [l[1:].strip() for l in open(PL) if l.startswith('*')]
masters_fixed = ['Fallout4.esm', 'DLCRobot.esm', 'DLCworkshop01.esm', 'DLCCoast.esm',
                 'DLCworkshop02.esm', 'DLCworkshop03.esm', 'DLCNukaWorld.esm']
order = masters_fixed + [p for p in enabled if p not in masters_fixed]
modlist = os.path.join(os.path.dirname(PL), 'modlist.txt')
active_mods = [l[1:].strip() for l in open(modlist, encoding='utf-8-sig') if l.startswith('+')]

paths, archives = {}, defaultdict(list)
for d0 in [os.path.join(M, m) for m in active_mods] + [DATA]:
    if not os.path.isdir(d0):
        continue
    for f in os.listdir(d0):
        lf = f.lower()
        if lf.endswith(('.esp', '.esm', '.esl')):
            paths.setdefault(lf, os.path.join(d0, f))
        elif lf.endswith('.ba2'):
            archives[lf.split(' - ')[0]].append(os.path.join(d0, f))


def ba2_names(path):
    with open(path, 'rb') as fh:
        h = fh.read(24)
        if h[:4] != b'BTDX' or h[8:12] != b'GNRL':
            return []
        n, off = struct.unpack_from('<IQ', h, 12)
        fh.seek(off)
        tab = fh.read()
    out, i = [], 0
    for _ in range(n):
        ln = struct.unpack_from('<H', tab, i)[0]
        out.append(tab[i + 2:i + 2 + ln].decode('cp1252').replace('\\', '/').lower())
        i += 2 + ln
    return out


have = set()   # basenames of precombined meshes available
loaded = set(p.lower().rsplit('.', 1)[0] for p in order)
for stem, lst in archives.items():
    vanilla = stem.startswith(('fallout4', 'dlc'))
    if stem in loaded or vanilla:
        for a in lst:
            for n in ba2_names(a):
                if '/precombined/' in n:
                    have.add(n.rsplit('/', 1)[1])
for m in active_mods:
    for root, _, files in os.walk(os.path.join(M, m)):
        if 'precombined' in root.lower():
            have.update(f.lower() for f in files)
have_hash = {n.split('_')[1] for n in have if n.count('_') >= 2}
print('precombined meshes available:', len(have))

win = {}  # cell key -> (plugin, flags, body)
for p in order:
    if p.lower() not in paths:
        continue
    for k, (t, fl, body) in esp.read(paths[p.lower()])[1].items():
        if t == 'CELL':
            win[k] = (p, fl, body)

missing = defaultdict(list)
total = defaultdict(int)
for k, (p, fl, body) in win.items():
    sub = dict(esp.subrecords(fl, body))
    x = sub.get('XCRI')
    if not x or len(x) < 8:
        continue
    nm, nr = struct.unpack_from('<II', x)
    hashes = struct.unpack_from(f'<{nm}I', x, 8)
    total[p] += 1
    lost = [h for h in hashes if f'{h:08x}' not in have_hash]
    if lost:
        g = struct.unpack_from('<ii', sub['XCLC']) if 'XCLC' in sub else 'interior'
        missing[p].append((k, g, len(lost), nm))

for p in order:
    if p in missing:
        cells = missing[p]
        print(f'{p}: {len(cells)}/{total[p]} cells with missing meshes, '
              f'{sum(c[2] for c in cells)} meshes; e.g. {[(c[0][0], hex(c[0][1]), c[1]) for c in cells[:4]]}')
