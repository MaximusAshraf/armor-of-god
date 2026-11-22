# Removes the white background of a whole-character image (keeps the 1024x1024 canvas): python3 cutout.py in.jpeg out.png
import sys, numpy as np, cv2
from scipy import ndimage as ndi
img = cv2.imread(sys.argv[1], cv2.IMREAD_COLOR)
rgb = img[:, :, ::-1].astype(np.int16)
dist = np.abs(rgb - np.array([253, 253, 253])).max(axis=2)
bg = dist <= 24
lab, n = ndi.label(bg)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
isbg = np.isin(lab, list(border))
# enclosed white gaps (between legs and tail, under arms...) are background too; tiny ones are highlights/teeth and stay
areas = ndi.sum(bg, lab, index=np.arange(1, n + 1))
for k, a in enumerate(areas, 1):
    if a > 250: isbg |= (lab == k)
fg = (~isbg).astype(np.uint8)
alpha = cv2.GaussianBlur(fg * 255, (0, 0), 0.9)
er = cv2.erode(fg, np.ones((3, 3), np.uint8))
edge = (fg == 1) & (er == 0)
alpha[edge & (rgb.min(axis=2) > 190)] = 0           # drop the white rim left by anti-aliasing
out = np.dstack([img, alpha]).astype(np.uint8)
cv2.imwrite(sys.argv[2], out)
print(sys.argv[2], out.shape)
