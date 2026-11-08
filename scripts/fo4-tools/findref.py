"""Find the parent cell (and worldspace/grid) of reference form ids in a plugin.
  python3 -I findref.py PLUGIN HEXID [HEXID...]"""
import os, struct, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import esp
path = sys.argv[1]; want = {int(x, 16) for x in sys.argv[2:]}
data = open(path, 'rb').read()
cells = {}
def walk(off, end, ws, cell):
    while off < end:
        typ = data[off:off + 4]; sz = struct.unpack_from('<I', data, off + 4)[0]
        if typ == b'GRUP':
            label, gt = struct.unpack_from('<Ii', data, off + 8)
            walk(off + 24, off + sz, label if gt == 1 else ws, label if gt in (6, 8, 9, 10) else cell)
            off += sz; continue
        fl, fid = struct.unpack_from('<II', data, off + 8)
        if typ == b'CELL':
            sub = dict(esp.subrecords(fl, data[off + 24:off + 24 + sz]))
            cells[fid] = (ws, sub.get('EDID', b'').rstrip(b'\0').decode('cp1252', 'replace'),
                          struct.unpack_from('<ii', sub['XCLC']) if 'XCLC' in sub else 'interior')
        elif fid in want:
            print(f'{typ.decode()} {fid:08X} in cell {cell:08X} {cells.get(cell)} worldspace {ws and hex(ws)}')
        off += 24 + sz
walk(24 + struct.unpack_from('<I', data, 4)[0], len(data), None, None)
