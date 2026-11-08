"""What each enabled plugin places in a set of exterior cells.
  python3 -I cells.py <mods dir> <plugins.txt> <grid x0> <x1> <y0> <y1>"""
import os, struct, sys
from collections import Counter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import esp
M, PL = sys.argv[1:3]
x0, x1, y0, y1 = map(int, sys.argv[3:7])
paths = {}
for mod in os.listdir(M):
    d = os.path.join(M, mod)
    if os.path.isdir(d):
        for f in os.listdir(d):
            if f.lower().endswith(('.esp', '.esm', '.esl')):
                paths[f.lower()] = os.path.join(d, f)
enabled = [l[1:].strip() for l in open(PL) if l.startswith('*')]

def scan(path):
    data = open(path, 'rb').read()
    size = struct.unpack_from('<I', data, 4)[0]
    masters, recs = esp.read(path)
    me = os.path.basename(path).lower()
    def key(fid):
        i = fid >> 24
        return ((masters[i] if i < len(masters) else me).lower(), fid & 0xFFFFFF)
    # cell record -> grid (only exterior cells carry XCLC)
    grid = {}
    for k, (t, fl, body) in recs.items():
        if t == 'CELL':
            for s, v in esp.subrecords(fl, body):
                if s == 'XCLC':
                    grid[k] = struct.unpack_from('<ii', v)
    out = Counter()
    def walk(off, end, cell):
        while off < end:
            typ = data[off:off + 4]
            sz = struct.unpack_from('<I', data, off + 4)[0]
            if typ == b'GRUP':
                label, gt = struct.unpack_from('<Ii', data, off + 8)
                walk(off + 24, off + sz, key(label) if gt in (6, 8, 9, 10) else cell)
                off += sz
                continue
            fid = struct.unpack_from('<I', data, off + 12)[0]
            if typ in (b'REFR', b'ACHR', b'PGRE', b'PMIS', b'PHZD') and cell is not None:
                new = key(fid)[0] == me
                out[(cell, 'new' if new else 'edit', typ.decode())] += 1
            off += 24 + sz
    walk(24 + size, len(data), None)
    return out, grid

# grid of vanilla cells comes from any plugin that overrides them; PRP covers the world
_, grid = scan(paths['prp.esp'])
wanted = {k for k, (x, y) in grid.items() if x0 <= x <= x1 and y0 <= y <= y1}
print('cells in range known to PRP:', len(wanted))
for p in enabled:
    if p.lower() not in paths or p.lower() == 'prp.esp':
        continue
    out, g = scan(paths[p.lower()])
    wanted2 = wanted | {k for k, (x, y) in g.items() if x0 <= x <= x1 and y0 <= y <= y1}
    c = Counter()
    for (cell, kind, typ), n in out.items():
        if cell in wanted2:
            c[f'{kind} {typ}'] += n
    if c:
        print(p, dict(c))
