"""Previs (vis/*.uvd) consistency for the whole load order.

  python3 -I vis_audit.py <mods dir> <game Data dir> <profile dir>

Each exterior cell points (RVIS) to the cell whose vis/<plugin>/<id>.uvd holds the
visibility of its 3x3 block. The engine takes that file from the last loaded archive (loose
files win). If that archive belongs to another plugin than the one whose CELL record wins,
the visibility was computed for other geometry: buildings vanish depending on the view.
"""
import os, struct, sys
from collections import defaultdict, Counter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import esp, ba2

M, DATA, PROF = sys.argv[1:4]
read = lambda f: [l.rstrip('\r\n') for l in open(os.path.join(PROF, f), encoding='utf-8-sig')]
enabled = [l[1:].strip() for l in read('plugins.txt') if l.startswith('*')]
base = ['Fallout4.esm', 'DLCRobot.esm', 'DLCworkshop01.esm', 'DLCCoast.esm',
        'DLCworkshop02.esm', 'DLCworkshop03.esm', 'DLCNukaWorld.esm']
order = base + [p for p in enabled if p not in base]
mods = [l[1:] for l in read('modlist.txt') if l.startswith('+')][::-1]  # low -> high priority

paths, arch = {}, defaultdict(list)
for d in [DATA] + [os.path.join(M, m) for m in mods]:
    if not os.path.isdir(d):
        continue
    for f in os.listdir(d):
        lf = f.lower()
        if lf.endswith(('.esp', '.esm', '.esl')):
            paths[lf] = os.path.join(d, f)
        elif lf.endswith('.ba2') and ' - ' in lf:
            arch[lf.split(' - ')[0]].append(os.path.join(d, f))

provider = {}
for p in order:  # archives load in plugin order; last wins
    for a in arch.get(p.lower().rsplit('.', 1)[0], []):
        for n in ba2.names(a):
            if n.endswith('.uvd'):
                provider[n] = p
for m in mods:
    for root, _, files in os.walk(os.path.join(M, m)):
        r = root.lower()
        if '/vis/' in r + '/' or r.endswith('/vis'):
            for f in files:
                if f.lower().endswith('.uvd'):
                    rel = os.path.relpath(os.path.join(root, f), os.path.join(M, m)).lower()
                    provider[rel] = f'loose:{m}'

def worldspaces(path, masters):
    data = open(path, 'rb').read(); me = os.path.basename(path).lower()
    key = lambda f: ((masters[f >> 24] if (f >> 24) < len(masters) else me).lower(), f & 0xFFFFFF)
    out = {}
    def walk(off, end, ws):
        while off < end:
            typ = data[off:off + 4]; sz = struct.unpack_from('<I', data, off + 4)[0]
            if typ == b'GRUP':
                label, gt = struct.unpack_from('<Ii', data, off + 8)
                walk(off + 24, off + sz, key(label) if gt == 1 else ws); off += sz; continue
            if typ == b'CELL' and ws:
                out[key(struct.unpack_from('<I', data, off + 12)[0])] = ws
            off += 24 + sz
    walk(24 + struct.unpack_from('<I', data, 4)[0], len(data), None)
    return out
CW = ('fallout4.esm', 0x3c)
wsof = {}
win, mast = {}, {}
for p in order:
    if p.lower() not in paths:
        continue
    masters, recs = esp.read(paths[p.lower()])
    mast[p] = masters
    wsof.update(worldspaces(paths[p.lower()], masters))
    for k, (t, fl, body) in recs.items():
        if t == 'CELL':
            win[k] = (p, fl, body)

bad = Counter(); examples = defaultdict(list); ok = 0
for k, (p, fl, body) in win.items():
    sub = dict(esp.subrecords(fl, body))
    if wsof.get(k) != CW or 'XCLC' not in sub or 'RVIS' not in sub:
        continue
    fid = struct.unpack_from('<I', sub['RVIS'])[0]
    ms = mast[p]
    origin = (ms[fid >> 24] if (fid >> 24) < len(ms) else p).lower()
    uvd = f'vis/{origin}/{fid & 0xFFFFFF:08x}.uvd'
    prov = provider.get(uvd, 'MISSING')
    if prov == p:
        ok += 1
        continue
    bad[(p, prov)] += 1
    examples[(p, prov)].append(struct.unpack_from('<ii', sub['XCLC']))
print('Commonwealth exterior cells consistent:', ok)
for (p, prov), n in bad.most_common():
    print(f'{n:4} cells: CELL won by {p}, uvd from {prov}; e.g. {sorted(examples[(p, prov)])[:6]}')
