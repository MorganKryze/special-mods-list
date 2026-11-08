"""Write and check Fallout 4 GNRL BA2 archives (uncompressed, version 1).
  python3 -I ba2pack.py verify ARCHIVE          recompute hashes of an existing archive
  python3 -I ba2pack.py pack ROOT OUT.ba2 DIR [DIR...]   pack ROOT/DIR/** (paths stored relative to ROOT)
"""
import os, struct, sys

TABLE = []
for i in range(256):
    c = i
    for _ in range(8):
        c = (c >> 1) ^ 0xEDB88320 if c & 1 else c >> 1
    TABLE.append(c)

def crc(s):
    h = 0
    for b in s.encode('cp1252'):
        h = (h >> 8) ^ TABLE[(h ^ b) & 0xFF]
    return h

def split(path):
    p = path.replace('/', '\\').lower()
    d, _, f = p.rpartition('\\')
    stem, dot, ext = f.rpartition('.')
    if not dot:
        stem, ext = f, ''
    return crc(stem), ext.encode('cp1252')[:4].ljust(4, b'\0'), crc(d)

def verify(path):
    data = open(path, 'rb').read()
    n, off = struct.unpack_from('<IQ', data, 12)
    names, i = [], off
    for _ in range(n):
        ln = struct.unpack_from('<H', data, i)[0]; names.append(data[i + 2:i + 2 + ln].decode('cp1252')); i += 2 + ln
    bad = 0
    for k in range(n):
        h, ext, dh = struct.unpack_from('<I4sI', data, 24 + 36 * k)
        if (h, ext, dh) != split(names[k]):
            bad += 1
    print(f'{n} files, {bad} hash mismatches; flags/align of first: {struct.unpack_from("<III", data, 24 + 12)[0]:#x}')

def pack(root, out, dirs):
    files = []
    for d in dirs:
        for r, _, fs in os.walk(os.path.join(root, d)):
            for f in fs:
                full = os.path.join(r, f)
                files.append((os.path.relpath(full, root).replace('/', '\\'), full))
    files.sort()
    hdr = 24 + 36 * len(files)
    recs, blobs, pos = [], [], hdr
    for rel, full in files:
        b = open(full, 'rb').read()
        h, ext, dh = split(rel)
        recs.append(struct.pack('<I4sIIQIII', h, ext, dh, 0x00100100, pos, 0, len(b), 0xBAADF00D))
        blobs.append(b); pos += len(b)
    names = b''.join(struct.pack('<H', len(rel.encode('cp1252'))) + rel.encode('cp1252') for rel, _ in files)
    with open(out, 'wb') as w:
        w.write(b'BTDX' + struct.pack('<I', 1) + b'GNRL' + struct.pack('<IQ', len(files), pos))
        for r in recs: w.write(r)
        for b in blobs: w.write(b)
        w.write(names)
    print(f'{len(files)} files packed into {out}')

if __name__ == '__main__':
    if sys.argv[1] == 'verify':
        verify(sys.argv[2])
    else:
        pack(sys.argv[2], sys.argv[3], sys.argv[4:])
