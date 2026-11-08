"""Merge music: keep BASE's MUSC records (priority, fades) and add EXTRA's tracks (TNAM).

  python3 -I merge_musc.py BASE.esp EXTRA.esp OUT.esp

OUT is a light plugin (ESL flag) whose masters are BASE's masters, BASE, then EXTRA.
Only MUSC records both plugins override are written.
"""
import os, struct, sys, zlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import esp

BASE, EXTRA, OUT = sys.argv[1:4]
bm, brecs = esp.read(BASE)
em, erecs = esp.read(EXTRA)
bname, ename = os.path.basename(BASE), os.path.basename(EXTRA)
masters = bm + [bname, ename]
idx = {m.lower(): i for i, m in enumerate(masters)}


def raw(path):
    """(origin, id) -> (flags, formid, header tail, body) straight from the file"""
    data = open(path, 'rb').read()
    ms, _ = esp.read(path)
    me = os.path.basename(path)
    out = {}
    def walk(off, end):
        while off < end:
            typ = data[off:off + 4]; sz = struct.unpack_from('<I', data, off + 4)[0]
            if typ == b'GRUP':
                walk(off + 24, off + sz); off += sz; continue
            fl, fid = struct.unpack_from('<II', data, off + 8)
            if typ == b'MUSC':
                o = ms[fid >> 24] if (fid >> 24) < len(ms) else me
                out[(o.lower(), fid & 0xFFFFFF)] = (fl, fid, data[off + 16:off + 24], data[off + 24:off + 24 + sz])
            off += 24 + sz
    walk(24 + struct.unpack_from('<I', data, 4)[0], len(data))
    return out


def remap(fid, src_masters, src_name):
    i = fid >> 24
    origin = src_masters[i] if i < len(src_masters) else src_name
    return (idx[origin.lower()] << 24) | (fid & 0xFFFFFF)


def subs(fl, body):
    return esp.subrecords(fl, body)


braw, eraw = raw(BASE), raw(EXTRA)
records = []
for k, (fl, fid, tail, body) in braw.items():
    if k not in eraw or k[0] == bname.lower():
        continue
    efl, _, _, ebody = eraw[k]
    etn = dict(subs(efl, ebody)).get('TNAM', b'')
    extra = [remap(x, em, ename) for x in struct.unpack(f'<{len(etn)//4}I', etn)]
    out = b''
    for s, v in subs(fl, body):
        if s == 'TNAM':
            mine = list(struct.unpack(f'<{len(v)//4}I', v))
            mine += [x for x in extra if x not in mine]
            v = struct.pack(f'<{len(mine)}I', *mine)
        out += s.encode() + struct.pack('<H', len(v)) + v
    if 'TNAM' not in dict(subs(fl, body)) and extra:
        v = struct.pack(f'<{len(extra)}I', *extra)
        out += b'TNAM' + struct.pack('<H', len(v)) + v
    hdr = b'MUSC' + struct.pack('<III', len(out), fl & ~0x40000, fid) + tail
    records.append(hdr + out)

grup_body = b''.join(records)
grup = b'GRUP' + struct.pack('<I', 24 + len(grup_body)) + b'MUSC' + struct.pack('<iII', 0, 0, 0) + grup_body
h = b'HEDR' + struct.pack('<H', 12) + struct.pack('<fII', 1.0, len(records) + 1, 0x800)
h += b'CNAM' + struct.pack('<H', 10) + b'sanctuary\0'
for m in masters:
    mb = m.encode('cp1252') + b'\0'
    h += b'MAST' + struct.pack('<H', len(mb)) + mb + b'DATA' + struct.pack('<H', 8) + b'\0' * 8
tes4 = b'TES4' + struct.pack('<III', len(h), 0x200, 0) + struct.pack('<IHH', 0, 131, 0) + h
open(OUT, 'wb').write(tes4 + grup)
print(f'{len(records)} MUSC records merged into {OUT}; masters {masters}')
