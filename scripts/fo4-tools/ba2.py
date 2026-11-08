import struct
def names(path):
    with open(path, 'rb') as fh:
        h = fh.read(24)
        if h[:4] != b'BTDX' or h[8:12] != b'GNRL':
            return []
        n, off = struct.unpack_from('<IQ', h, 12)
        fh.seek(off); tab = fh.read()
    out, i = [], 0
    for _ in range(n):
        ln = struct.unpack_from('<H', tab, i)[0]
        out.append(tab[i + 2:i + 2 + ln].decode('cp1252').replace('\\', '/').lower()); i += 2 + ln
    return out
