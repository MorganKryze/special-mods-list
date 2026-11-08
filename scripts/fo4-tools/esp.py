"""Minimal Fallout 4 plugin reader, for the checks the install plan gives to FO4Edit.

  python3 -I esp.py masters PLUGIN
  python3 -I esp.py overlap PLUGIN_A PLUGIN_B        records both plugins override
  python3 -I esp.py diff PATCH BASE                  for records PATCH overrides that BASE also
                                                     has: which subrecord types differ
Records are keyed by (origin plugin, object id) so FormIDs compare across load orders.
"""
import struct, sys, zlib, os
from collections import Counter


def read(path):
    data = open(path, "rb").read()
    assert data[:4] == b"TES4", path
    size = struct.unpack_from("<I", data, 4)[0]
    masters, i, hdr = [], 0, data[24:24 + size]
    while i < len(hdr):
        t, s = hdr[i:i + 4], struct.unpack_from("<H", hdr, i + 4)[0]
        if t == b"MAST":
            masters.append(hdr[i + 6:i + 6 + s - 1].decode("cp1252"))
        i += 6 + s
    me = os.path.basename(path)
    recs = {}

    def walk(off, end):
        while off < end:
            typ = data[off:off + 4]
            size = struct.unpack_from("<I", data, off + 4)[0]
            if typ == b"GRUP":
                walk(off + 24, off + size)
                off += size
                continue
            flags, fid = struct.unpack_from("<II", data, off + 8)
            body = data[off + 24:off + 24 + size]
            idx = fid >> 24
            origin = masters[idx] if idx < len(masters) else me
            recs[(origin.lower(), fid & 0xFFFFFF)] = (typ.decode(), flags, body)
            off += 24 + size

    walk(24 + size, len(data))
    return masters, recs


def subrecords(flags, body):
    if flags & 0x40000:
        body = zlib.decompress(body[4:])
    out, i = [], 0
    while i + 6 <= len(body):
        t, s = body[i:i + 4], struct.unpack_from("<H", body, i + 4)[0]
        out.append((t.decode("latin1"), body[i + 6:i + 6 + s]))
        i += 6 + s
    return out


def overrides(path):
    masters, recs = read(path)
    me = os.path.basename(path).lower()
    return {k: v for k, v in recs.items() if k[0] != me}


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "masters":
        print("\n".join(read(sys.argv[2])[0]))
    elif cmd == "overlap":
        a, b = overrides(sys.argv[2]), read(sys.argv[3])[1]
        both = sorted(set(a) & set(b))
        print(f"{len(both)} shared records:", dict(Counter(a[k][0] for k in both)))
        for k in both[:40]:
            print(f"  {a[k][0]} {k[0]}:{k[1]:06X}")
    elif cmd == "diff":
        patch, base = overrides(sys.argv[2]), read(sys.argv[3])[1]
        shared = [k for k in patch if k in base]
        same, changed = 0, Counter()
        for k in shared:
            p = subrecords(patch[k][1], patch[k][2])
            b = subrecords(base[k][1], base[k][2])
            if p == b:
                same += 1
                continue
            pd, bd = dict(p), dict(b)  # ponytail: repeated subrecords collapse to the last one
            for t in set(pd) | set(bd):
                if pd.get(t) != bd.get(t):
                    changed[(patch[k][0], t)] += 1
        print(f"{len(shared)} records shared, {same} identical")
        for (rt, st), n in changed.most_common(40):
            print(f"  {rt}.{st}: {n}")
