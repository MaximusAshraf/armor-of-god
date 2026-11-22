# Cuts a Gemini parts sheet into separate transparent PNG parts.
#   python3 segment.py <sheet.jpeg> <outdir> [--label]   -> parts/NN.png + labeled preview
import sys, os, json
import numpy as np, cv2
from scipy import ndimage as ndi

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
img = cv2.imread(src, cv2.IMREAD_COLOR)            # BGR
h, w = img.shape[:2]
rgb = img[:, :, ::-1].astype(np.int16)
white = np.array([253, 253, 253])
dist = np.abs(rgb - white).max(axis=2)
fg = dist > 22                                      # anything clearly not background
# fill tiny holes in the foreground so thin glows do not split parts
fg = ndi.binary_closing(fg, iterations=2)
# group pieces that belong together (outline + highlights + motion lines): dilate to label, then use the exact mask
grp = ndi.binary_dilation(fg, iterations=int(sys.argv[3]) if len(sys.argv) > 3 else 14)
lab, n = ndi.label(grp)
objs = ndi.find_objects(lab)
parts = []
for i, sl in enumerate(objs, 1):
    area = (fg[sl] & (lab[sl] == i)).sum()
    if area < 150: continue                          # specks
    parts.append((i, sl, int(area)))
# order: top-to-bottom rows then left-to-right
parts.sort(key=lambda p: (round((p[1][0].start + p[1][0].stop) / 2 / 220), (p[1][1].start + p[1][1].stop) / 2))

# alpha: background = near-white pixels connected to the border; interior whites (eyeballs etc.) stay opaque
bgmask = dist <= 22
bl, bn = ndi.label(bgmask)
border = set(np.unique(np.concatenate([bl[0], bl[-1], bl[:, 0], bl[:, -1]]))) - {0}
isbg = np.isin(bl, list(border))
alpha_full = (~isbg).astype(np.uint8) * 255
alpha_full = cv2.GaussianBlur(alpha_full, (0, 0), 0.8)
# drop the white halo: pull alpha in by ~1px where the pixel is light and at the edge
er = cv2.erode((~isbg).astype(np.uint8), np.ones((3, 3), np.uint8))
edge = (~isbg) & (er == 0)
light = rgb.min(axis=2) > 200
alpha_full[edge & light] = 0

meta = []
prev = img.copy()
for k, (i, sl, area) in enumerate(parts):
    pad = 6
    y0, y1 = max(sl[0].start - pad, 0), min(sl[0].stop + pad, h)
    x0, x1 = max(sl[1].start - pad, 0), min(sl[1].stop + pad, w)
    m = (lab[y0:y1, x0:x1] == i)
    m = ndi.binary_dilation(m, iterations=pad)          # keep the anti-aliased rim of this part only
    a = alpha_full[y0:y1, x0:x1] * m
    crop = np.dstack([img[y0:y1, x0:x1], a]).astype(np.uint8)
    # trim empty margins
    ys, xs = np.where(a > 10)
    if len(ys) == 0: continue
    crop = crop[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    cv2.imwrite(os.path.join(out, f'{k:02d}.png'), crop)
    cx, cy = (x0 + xs.min() + x0 + xs.max()) // 2, (y0 + ys.min() + y0 + ys.max()) // 2
    meta.append({'id': k, 'w': int(crop.shape[1]), 'h': int(crop.shape[0]), 'cx': int(cx), 'cy': int(cy), 'area': area})
    cv2.rectangle(prev, (x0 + xs.min(), y0 + ys.min()), (x0 + xs.max(), y0 + ys.max()), (0, 0, 255), 3)
    cv2.putText(prev, str(k), (x0 + xs.min() + 6, y0 + ys.min() + 70), cv2.FONT_HERSHEY_SIMPLEX, 2.6, (255, 0, 255), 6)
json.dump(meta, open(os.path.join(out, 'parts.json'), 'w'))
cv2.imwrite(os.path.join(out, '_labels.jpg'), cv2.resize(prev, (1100, 1100)))
print(src, len(meta), 'parts')
