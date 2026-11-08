"""Rewrite an uncompressed Fallout 4 GNRL BA2 with zlib-compressed entries, as the vanilla
archives store them (zlib default level, packed size in the record; an entry that does not
shrink is kept raw with packed size 0). Every entry is decompressed again and compared with
the original bytes before the output is kept.

  python3 -I ba2compress.py IN.ba2 OUT.ba2
"""
import struct, sys, zlib

src, out = sys.argv[1:3]
data = open(src, 'rb').read()
assert data[:4] == b'BTDX' and data[8:12] == b'GNRL', 'not a GNRL BA2'
version = struct.unpack_from('<I', data, 4)[0]
n, name_off = struct.unpack_from('<IQ', data, 12)
recs = [list(struct.unpack_from('<I4sIIQIII', data, 24 + 36 * k)) for k in range(n)]
assert all(r[5] == 0 for r in recs), 'input already has compressed entries'
names = data[name_off:]

blobs, pos, raw_total = [], 24 + 36 * n, 0
for r in recs:
    raw = data[r[4]:r[4] + r[6]]
    z = zlib.compress(raw, 6)
    if len(z) < len(raw):
        r[5] = len(z); blob = z
    else:
        r[5] = 0; blob = raw
    r[4] = pos; pos += len(blob); raw_total += len(raw)
    blobs.append(blob)

with open(out, 'wb') as w:
    w.write(b'BTDX' + struct.pack('<I', version) + b'GNRL' + struct.pack('<IQ', n, pos))
    for r in recs:
        w.write(struct.pack('<I4sIIQIII', *r))
    for b in blobs:
        w.write(b)
    w.write(names)

# check: every entry of OUT decompresses to the exact bytes of IN, names identical
o = open(out, 'rb').read()
n2, no2 = struct.unpack_from('<IQ', o, 12)
assert n2 == n and o[no2:] == names
for k in range(n):
    a = struct.unpack_from('<I4sIIQIII', data, 24 + 36 * k)
    b = struct.unpack_from('<I4sIIQIII', o, 24 + 36 * k)
    assert a[:4] == b[:4] and a[6] == b[6] and a[7] == b[7]
    blob = o[b[4]:b[4] + (b[5] or b[6])]
    got = zlib.decompress(blob) if b[5] else blob
    assert got == data[a[4]:a[4] + a[6]], f'entry {k} differs'
print(f'{n} entries, {raw_total/2**20:.0f} MB -> {len(o)/2**20:.0f} MB; all entries verified byte-identical')
