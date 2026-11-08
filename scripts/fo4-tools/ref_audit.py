"""Which plugins change objects inside previs'd Commonwealth cells without being part of
the plugin that owns the cell's previs (the winning CELL record and its masters).
  python3 -I ref_audit.py <mods dir> <Data dir> <profile dir> [x0 x1 y0 y1]"""
import os, struct, sys
from collections import defaultdict, Counter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import esp
M, DATA, PROF = sys.argv[1:4]
box = list(map(int, sys.argv[4:8])) if len(sys.argv) > 4 else None
rd = lambda f: [l.rstrip('\r\n') for l in open(os.path.join(PROF, f), encoding='utf-8-sig')]
enabled = [l[1:].strip() for l in rd('plugins.txt') if l.startswith('*')]
base = ['Fallout4.esm', 'DLCRobot.esm', 'DLCworkshop01.esm', 'DLCCoast.esm', 'DLCworkshop02.esm', 'DLCworkshop03.esm', 'DLCNukaWorld.esm']
order = base + [p for p in enabled if p not in base]
mods = [l[1:] for l in rd('modlist.txt') if l.startswith('+')]
paths = {}
for d in [DATA] + [os.path.join(M, m) for m in mods][::-1]:
    if os.path.isdir(d):
        for f in os.listdir(d):
            if f.lower().endswith(('.esp', '.esm', '.esl')):
                paths[f.lower()] = os.path.join(d, f)
CW = ('fallout4.esm', 0x3c)
cellwin, cellinfo, refwin, masters_of = {}, {}, {}, {}
for p in order:
    path = paths.get(p.lower())
    if not path:
        continue
    data = open(path, 'rb').read(); me = p.lower()
    masters, _ = esp.read(path); masters_of[p] = {m.lower() for m in masters}
    key = lambda f: ((masters[f >> 24] if (f >> 24) < len(masters) else me).lower(), f & 0xFFFFFF)
    def walk(off, end, ws, cell):
        while off < end:
            typ = data[off:off + 4]; sz = struct.unpack_from('<I', data, off + 4)[0]
            if typ == b'GRUP':
                label, gt = struct.unpack_from('<Ii', data, off + 8)
                walk(off + 24, off + sz, key(label) if gt == 1 else ws,
                     key(label) if gt in (6, 8, 9, 10) else cell)
                off += sz; continue
            fl, fid = struct.unpack_from('<II', data, off + 8)
            k = key(fid)
            if typ == b'CELL' and ws == CW:
                sub = dict(esp.subrecords(fl, data[off + 24:off + 24 + sz]))
                if 'XCLC' in sub:
                    cellwin[k] = p
                    cellinfo[k] = (struct.unpack_from('<ii', sub['XCLC']), 'RVIS' in sub or 'PCMB' in sub)
            elif typ in (b'REFR', b'PGRE', b'PMIS') and ws == CW and cell is not None:
                refwin[k] = (p, cell, k[0] == me)
            off += 24 + sz
    walk(24 + struct.unpack_from('<I', data, 4)[0], len(data), None, None)
bad = Counter(); where = defaultdict(set)
for k, (p, cell, new) in refwin.items():
    if cell not in cellinfo or not cellinfo[cell][1]:
        continue
    g = cellinfo[cell][0]
    if box and not (box[0] <= g[0] <= box[1] and box[2] <= g[1] <= box[3]):
        continue
    o = cellwin[cell]
    if p == o or p.lower() in masters_of.get(o, ()):
        continue
    bad[(p, 'new' if new else 'edit')] += 1; where[p].add(o)
for (p, kind), n in bad.most_common(45):
    print(f'{n:6} {kind:4} {p}  (previs owners: {", ".join(sorted(where[p]))[:110]})')
