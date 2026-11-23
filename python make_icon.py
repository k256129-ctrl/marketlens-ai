import struct, zlib

def create_marketlens_ico(filename="marketlens.ico", size=64):
    # Generates a crisp Navy (#081220) + Cyan (#2BA6CB) Lens & Analytics Bar .ico file
    pixels = bytearray(size * size * 4)

    def set_px(x, y, r, g, b, a=255):
        if 0 <= x < size and 0 <= y < size:
            idx = (y * size + x) * 4
            pixels[idx:idx+4] = bytes([r, g, b, a])

    cx, cy = 28, 28
    for y in range(size):
        for x in range(size):
            # Rounded square background (#081220) with Cyan border (#2BA6CB)
            dx = max(0, abs(x - 31.5) - 21.5)
            dy = max(0, abs(y - 31.5) - 21.5)
            dist_corner = (dx*dx + dy*dy) ** 0.5
            if dist_corner > 8.0:
                continue
            elif dist_corner > 6.2:
                set_px(x, y, 43, 166, 203, 255)  # Cyan Border
            else:
                set_px(x, y, 8, 18, 32, 255)     # Deep Navy Background

            # Magnifying Lens Ring
            r_lens = ((x - cx)**2 + (y - cy)**2) ** 0.5
            if 13.0 <= r_lens <= 17.2:
                set_px(x, y, 43, 166, 203, 255)

            # Lens Handle
            if 39 <= x <= 53 and 39 <= y <= 53 and abs(x - y) <= 3:
                set_px(x, y, 92, 225, 230, 255)

    # 3 Rising Analytics Bars inside the Lens
    for y in range(29, 36):
        for x in range(20, 24): set_px(x, y, 255, 255, 255)
    for y in range(24, 36):
        for x in range(26, 30): set_px(x, y, 92, 225, 230)
    for y in range(19, 36):
        for x in range(32, 36): set_px(x, y, 43, 166, 203)

    # Encode PNG inside ICO container (Vista+ standard)
    raw = b"".join(b"\x00" + bytes(pixels[y*size*4:(y+1)*size*4]) for y in range(size))
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff)

    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    ico = struct.pack("<HHH", 0, 1, 1) + struct.pack("<BBBBHHII", size, size, 0, 0, 1, 32, len(png), 22) + png
    with open(filename, "wb") as f:
        f.write(ico)
    print(f"Created {filename} successfully!")

if __name__ == "__main__":
    create_marketlens_ico()