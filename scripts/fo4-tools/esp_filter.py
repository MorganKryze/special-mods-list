"""Copy a Fallout 4 plugin, removing (or keeping only) some CELL records with their children.

  python3 -I esp_filter.py IN OUT remove|keep ORIGIN:HEXID [ORIGIN:HEXID ...]

ORIGIN is the plugin that defines the cell (e.g. fallout4.esm:48646). A removed CELL takes
its child GRUP (type 6, holding types 8/9/10) with it. Block / sub-block groups (types 2-5)
left empty are dropped. Every enclosing GRUP size is recomputed; everything else is copied
byte for byte. HEDR's record count is lowered by the number of records and groups removed.
'keep' removes every CELL not listed. An empty list with 'remove' gives an identical file.
"""
import os, struct, sys

def main():
    src, dst, mode = sys.argv[1:4]
    wanted = set()
    for a in sys.argv[4:]:
        o, h = a.rsplit(':', 1)
        wanted.add((o.lower(), int(h, 16)))
    data = open(src, 'rb').read()
    assert data[:4] == b'TES4'
    hsize = struct.unpack_from('<I', data, 4)[0]
    hdr_end = 24 + hsize
    # masters from the header
    masters, i, h = [], 0, data[24:hdr_end]
    while i < len(h):
        t, s = h[i:i + 4], struct.unpack_from('<H', h, i + 4)[0]
        if t == b'MAST':
            masters.append(h[i + 6:i + 6 + s - 1].decode('cp1252').lower())
        i += 6 + s
    me = os.path.basename(src).lower()
    key = lambda f: (masters[f >> 24] if (f >> 24) < len(masters) else me, f & 0xFFFFFF)

    def drop(fid):
        k = key(fid)
        return (k in wanted) if mode == 'remove' else (k not in wanted)

    stats = {'records': 0, 'groups': 0, 'cells': []}

    def count(off, end):
        """records and groups inside [off, end)"""
        n = 0
        while off < end:
            sz = struct.unpack_from('<I', data, off + 4)[0]
            if data[off:off + 4] == b'GRUP':
                n += 1 + count(off + 24, off + sz)
                off += sz
            else:
                n += 1
                off += 24 + sz
        return n

    def rebuild(off, end):
        out = bytearray()
        skip_children_of = None
        while off < end:
            typ = data[off:off + 4]
            sz = struct.unpack_from('<I', data, off + 4)[0]
            if typ == b'GRUP':
                label, gt = struct.unpack_from('<Ii', data, off + 8)
                if gt == 6 and skip_children_of == label:
                    stats['groups'] += 1
                    n = count(off + 24, off + sz)
                    stats['records'] += n
                    skip_children_of = None
                    off += sz
                    continue
                skip_children_of = None
                body = rebuild(off + 24, off + sz)
                if not body and gt in (2, 3, 4, 5, 6, 7, 8, 9, 10) and sz > 24:
                    stats['groups'] += 1   # became empty: drop it
                else:
                    out += data[off:off + 4] + struct.pack('<I', 24 + len(body)) + data[off + 8:off + 24] + body
                off += sz
                continue
            fid = struct.unpack_from('<I', data, off + 12)[0]
            if typ == b'CELL' and drop(fid):
                stats['records'] += 1
                stats['cells'].append('%s:%06X' % key(fid))
                skip_children_of = fid
            else:
                skip_children_of = None
                out += data[off:off + 24 + sz]
            off += 24 + sz
        return bytes(out)

    body = rebuild(hdr_end, len(data))
    header = bytearray(data[:hdr_end])
    # HEDR: float version, int32 numRecords, uint32 nextObjectId
    j = 24
    removed = stats['records'] + stats['groups']
    while j < hdr_end:
        t, s = header[j:j + 4], struct.unpack_from('<H', header, j + 4)[0]
        if t == b'HEDR':
            n = struct.unpack_from('<i', header, j + 10)[0]
            struct.pack_into('<i', header, j + 10, n - removed)
            break
        j += 6 + s
    open(dst, 'wb').write(bytes(header) + body)
    print(f"cells removed: {len(stats['cells'])}; other records+nested groups removed: {stats['records'] - len(stats['cells'])};"
          f" child/emptied groups removed: {stats['groups']}; HEDR count -{removed} (HEDR counts records + groups)")
    if len(stats['cells']) <= 20:
        print('  ' + ' '.join(stats['cells']))

if __name__ == '__main__':
    main()
